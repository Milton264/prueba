'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult } from '@/types';

/**
 * Acceso de emergencia / configuración inicial.
 *
 * Crea (o repara) una cuenta ya CONFIRMADA con el cliente de servicio y, si se
 * puede, inicia sesión de inmediato. Sirve para desbloquear el primer acceso sin
 * depender de enlaces de correo, tanto para el cliente como para el
 * administrador. Pensada para uso en desarrollo / puesta en marcha.
 */
export async function provisionAccess(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim() || email.split('@')[0];
  const makeAdmin = String(formData.get('role') ?? '') === 'admin';
  const setupKey = String(formData.get('setup_key') ?? '');
  const role = makeAdmin ? 'admin' : 'client';

  // Protección opcional: si se define SETUP_SECRET en el entorno, crear cuentas
  // de administrador exige esa clave. En desarrollo, si no se define, la página
  // funciona sin restricción. En producción, define SETUP_SECRET (o elimina esta
  // página) para que nadie pueda auto-asignarse el rol admin.
  const requiredSecret = process.env.SETUP_SECRET;
  if (makeAdmin && requiredSecret && setupKey !== requiredSecret) {
    return {
      ok: false,
      error: 'La clave de configuración es incorrecta. No se puede crear un administrador sin ella.',
    };
  }

  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Ingresa un correo válido.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Agrégala (Panel de Supabase → Project Settings → API → service_role) y reinicia el servidor.',
    };
  }

  // 1) Intentar crear la cuenta directamente (confirmada).
  let userId: string | null = null;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (created?.user) {
    userId = created.user.id;
  } else if (createError) {
    // Si el correo ya existe, lo localizamos y lo ACTUALIZAMOS (contraseña +
    // confirmación + rol), en vez de fallar. listUsers está paginado, así que
    // recorremos las páginas hasta encontrarlo.
    const msg = createError.message.toLowerCase();
    const alreadyExists =
      msg.includes('already') || msg.includes('registered') || msg.includes('exists');

    if (!alreadyExists) {
      return { ok: false, error: `No se pudo crear la cuenta: ${createError.message}` };
    }

    try {
      let page = 1;
      const perPage = 200;
      // Recorre hasta 20 páginas (4000 usuarios) buscando el correo.
      while (page <= 20 && !userId) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage });
        const found = list?.users?.find((u) => u.email?.toLowerCase() === email);
        if (found) userId = found.id;
        if (!list || list.users.length < perPage) break; // última página
        page += 1;
      }
    } catch (e) {
      return {
        ok: false,
        error: `El correo ya existe pero no se pudo localizar para actualizarlo: ${(e as Error).message}`,
      };
    }

    if (!userId) {
      return {
        ok: false,
        error:
          'Este correo ya está registrado, pero no se pudo localizar para repararlo. Prueba a iniciar sesión con él en /iniciar-sesion, o usa el enlace de recuperar contraseña.',
      };
    }
  }

  // 2) Si la cuenta ya existía, actualizarla: contraseña, confirmación y rol.
  if (userId && !created?.user) {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error) return { ok: false, error: `No se pudo actualizar la cuenta: ${error.message}` };
  }

  // 3) Asegurar la fila en public.users con el rol correcto.
  if (userId) {
    const { error: upErr } = await admin
      .from('users')
      .upsert(
        { id: userId, email, full_name: fullName, role, is_active: true },
        { onConflict: 'id' },
      );
    if (upErr) {
      // No es fatal para el login, pero se informa.
      return {
        ok: true,
        message: `Cuenta lista (${role}), pero no se pudo fijar el rol en la tabla users: ${upErr.message}. Podrás iniciar sesión igualmente.`,
      };
    }
  }

  // 4) Iniciar sesión de inmediato.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return {
      ok: true,
      message: `Cuenta lista (${role}). Ahora inicia sesión en /iniciar-sesion con ese correo y contraseña.`,
    };
  }

  revalidatePath('/', 'layout');
  redirect(role === 'admin' ? '/admin' : '/portal');
}
