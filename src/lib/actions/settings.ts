'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { adminUserSchema, serviceCatalogSchema, settingsSchema } from '@/lib/validations/settings';
import type { ActionResult } from '@/types';

type AdminContext =
  | { ok: false; error: string }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

/** Verifica sesión y rol de administrador antes de cualquier escritura. */
async function requireAdminClient(): Promise<AdminContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' };

  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (data?.role !== 'admin') return { ok: false, error: 'No tienes permiso para esta acción.' };

  return { ok: true, supabase, userId: user.id };
}

export async function updateSettings(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = settingsSchema.safeParse({
    company_name: String(formData.get('company_name') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    logo_path: String(formData.get('logo_path') ?? '').trim(),
    contact_email: String(formData.get('contact_email') ?? '').trim(),
    whatsapp_number: String(formData.get('whatsapp_number') ?? '').replace(/\D/g, ''),
    website_url: String(formData.get('website_url') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    tax_rate: Number(formData.get('tax_rate') ?? 0),
    request_prefix: String(formData.get('request_prefix') ?? 'PES').trim().toUpperCase(),
    quotation_prefix: String(formData.get('quotation_prefix') ?? 'COT').trim().toUpperCase(),
    quotation_terms: String(formData.get('quotation_terms') ?? ''),
    privacy_policy: String(formData.get('privacy_policy') ?? ''),
    terms_conditions: String(formData.get('terms_conditions') ?? ''),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fe: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(flat)) if (v) fe[k] = v;
    return { ok: false, error: 'Revisa los datos de configuración.', fieldErrors: fe };
  }

  const { data: existing } = await ctx.supabase.from('system_settings').select('id').limit(1).maybeSingle();
  const payload = {
    ...parsed.data,
    logo_path: parsed.data.logo_path || null,
    website_url: parsed.data.website_url || null,
    address: parsed.data.address || null,
    quotation_terms: parsed.data.quotation_terms || null,
    privacy_policy: parsed.data.privacy_policy || null,
    terms_conditions: parsed.data.terms_conditions || null,
  };

  const { error } = existing
    ? await ctx.supabase.from('system_settings').update(payload).eq('id', existing.id)
    : await ctx.supabase.from('system_settings').insert(payload);

  if (error) return { ok: false, error: 'No pudimos guardar la configuración.' };

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Configuración actualizada.' };
}

export async function updateCatalogService(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const quantities = String(formData.get('preset_quantities') ?? '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  const referencePriceRaw = String(formData.get('reference_price') ?? '').trim();

  const parsed = serviceCatalogSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    name: String(formData.get('name') ?? '').trim(),
    unit: String(formData.get('unit') ?? 'gal').trim(),
    preset_quantities: quantities,
    reference_price: referencePriceRaw === '' ? null : Number(referencePriceRaw),
    is_active: formData.get('is_active') === 'on',
  });

  if (!parsed.success) return { ok: false, error: 'Revisa los datos del servicio.' };

  const { id, ...rest } = parsed.data;
  const { error } = await ctx.supabase.from('catalog_services').update(rest).eq('id', id);
  if (error) return { ok: false, error: 'No pudimos guardar el servicio.' };

  revalidatePath('/admin/servicios');
  return { ok: true, message: 'Servicio actualizado.' };
}

export async function updateUserRole(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const userId = String(formData.get('user_id') ?? '');
  const parsed = adminUserSchema.pick({ role: true, is_active: true }).safeParse({
    role: String(formData.get('role') ?? 'client'),
    is_active: formData.get('is_active') === 'on',
  });
  if (!parsed.success) return { ok: false, error: 'Datos invalidos.' };

  // Evita que el administrador se quite a si mismo el acceso.
  if (userId === ctx.userId && parsed.data.role !== 'admin') {
    return { ok: false, error: 'No puedes quitarte a ti mismo el rol de administrador.' };
  }

  const { error } = await ctx.supabase
    .from('users')
    .update({ role: parsed.data.role, is_active: parsed.data.is_active })
    .eq('id', userId);
  if (error) return { ok: false, error: 'No pudimos actualizar el usuario.' };

  revalidatePath('/admin/configuración');
  return { ok: true, message: 'Usuario actualizado.' };
}
