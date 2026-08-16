'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { loginSchema, profileSchema, recoverSchema, registerSchema } from '@/lib/validations/auth';
import { siteConfig } from '@/config/site';
import type { ActionResult } from '@/types';

function fieldErrors(e: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = e.flatten().fieldErrors;
  const cleaned: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) if (v) cleaned[k] = v;
  return cleaned;
}

/** Traduce los errores de Supabase Auth al espanol. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  if (m.includes('password')) return 'La contraseña no cumple los requisitos minimos.';
  return 'No pudimos completar la operacion. Intenta de nuevo.';
}

export async function signIn(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();

  // Primer intento de inicio de sesión.
  let { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Si el único problema es que el correo no está confirmado, lo confirmamos
  // automáticamente con el cliente de servicio y reintentamos. Esto elimina la
  // dependencia de los enlaces de correo (que fallan en local por PKCE/SMTP).
  if (error && error.message.toLowerCase().includes('email not confirmed')) {
    try {
      const admin = createAdminClient();
      // Buscar el usuario por correo y marcarlo como confirmado.
      const { data: list } = await admin.auth.admin.listUsers();
      const target = list?.users?.find(
        (u) => u.email?.toLowerCase() === parsed.data.email.toLowerCase(),
      );
      if (target) {
        await admin.auth.admin.updateUserById(target.id, { email_confirm: true });
        // Reintentar el inicio de sesión ya confirmado.
        ({ error } = await supabase.auth.signInWithPassword(parsed.data));
      }
    } catch {
      // Si no hay service role disponible, se cae al manejo de error normal.
    }
  }

  if (error) return { ok: false, error: translateAuthError(error.message) };

  const { data: { user } } = await supabase.auth.getUser();

  // maybeSingle(): si por algún motivo la fila de public.users todavía no existe
  // (p. ej. el trigger no corrió), no se lanza excepción; se asume rol cliente.
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const next = String(formData.get('next') ?? '');
  revalidatePath('/', 'layout');
  redirect(next || (role === 'admin' ? '/admin' : '/portal'));
}

export async function signUp(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    company_name: String(formData.get('company_name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    confirm_password: String(formData.get('confirm_password') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const { email, password, full_name, company_name, phone } = parsed.data;

  // Registro reinventado: en lugar de depender del enlace de confirmación por
  // correo (frágil en local: PKCE cross-device, sin SMTP), se crea la cuenta ya
  // CONFIRMADA con el cliente de servicio y se inicia sesión de inmediato.
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, company_name: company_name || null, phone, role: 'client' },
  });

  if (createError) {
    // Si ya existía, intentamos iniciar sesión directamente (por si el usuario
    // se había registrado antes y quedó sin confirmar).
    const msg = createError.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      const supabase = await createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        return {
          ok: false,
          error:
            'Ya existe una cuenta con este correo. Si es tuya, inicia sesión; si olvidaste la contraseña, usa "Olvidaste tu contraseña".',
        };
      }
      revalidatePath('/', 'layout');
      redirect('/portal');
    }
    return { ok: false, error: translateAuthError(createError.message) };
  }

  // Asegurar la fila en public.users con el rol correcto (por si el trigger
  // corrió sin el metadata o no corrió).
  if (created?.user) {
    await admin
      .from('users')
      .upsert(
        { id: created.user.id, email, full_name, role: 'client', is_active: true },
        { onConflict: 'id' },
      );
  }

  // Iniciar sesión de inmediato con la cuenta ya confirmada.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    // La cuenta quedó creada; si el auto-login fallara, se informa para entrar manual.
    return {
      ok: true,
      message: 'Tu cuenta fue creada. Ya puedes iniciar sesión con tu correo y contraseña.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = recoverSchema.safeParse({ email: String(formData.get('email') ?? '').trim() });
  if (!parsed.success) {
    return { ok: false, error: 'Ingresa un correo valido.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/callback?type=recovery`,
  });

  // Respuesta identica exista o no la cuenta, para no revelar correos registrados.
  return {
    ok: true,
    message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
  };
}

export async function updateProfile(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    company_name: String(formData.get('company_name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' };

  const { full_name, company_name, phone } = parsed.data;

  const [u, c] = await Promise.all([
    supabase.from('users').update({ full_name, phone }).eq('id', user.id),
    supabase
      .from('client_profiles')
      .update({ full_name, company_name: company_name || null, phone })
      .eq('user_id', user.id),
  ]);

  if (u.error || c.error) return { ok: false, error: 'No pudimos guardar los cambios.' };

  revalidatePath('/portal/perfil');
  return { ok: true, message: 'Perfil actualizado correctamente.' };
}
