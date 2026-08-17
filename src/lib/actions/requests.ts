'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { canTransition } from '@/lib/status';
import { sendNewRequestEmail } from '@/lib/email/rfq-notification';
import {
  changeStatusSchema,
  completeServiceSchema,
  createRequestSchema,
  internalNoteSchema,
  operatorInfoSchema,
} from '@/lib/validations/request';
import type { ActionResult, RequestStatus } from '@/types';

const clean = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim();
  return s === '' ? null : s;
};
const numOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

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

/**
 * Crea una solicitud. Funciona en dos modos:
 *  - Cliente autenticado: usa su perfil y respeta RLS.
 *  - Invitado: se crea o reutiliza un client_profile por correo y se usa
 *    el cliente de servicio, ya que no hay sesión. Se devuelve el access_token
 *    para que pueda consultar y responder su cotización desde /s/[token].
 */
export async function createServiceRequest(
  input: unknown,
): Promise<ActionResult<{ id: string; request_number: string; access_token: string; is_guest: boolean }>> {
  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fe: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(flat)) if (v) fe[k] = v;
    return { ok: false, error: 'Revisa los datos del formulario.', fieldErrors: fe };
  }

  const d = parsed.data;
  const authed = await createClient();
  const { data: { user } } = await authed.auth.getUser();

  let clientProfileId: string;
  let isGuest = false;
  let db = authed;
  let requester: {
    fullName: string;
    companyName?: string | null;
    email: string;
    phone?: string | null;
  };

  if (user) {
    const { data: profile } = await authed
      .from('client_profiles')
      .select('id, full_name, company_name, email, phone')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!profile) return { ok: false, error: 'No encontramos tu perfil de cliente.' };
    clientProfileId = profile.id;
    requester = {
      fullName: profile.full_name,
      companyName: profile.company_name,
      email: profile.email,
      phone: profile.phone,
    };
  } else {
    // Invitado: sus datos de contacto son obligatorios.
    if (!d.guest_full_name || !d.guest_email || !d.guest_phone) {
      return { ok: false, error: 'Necesitamos tus datos de contacto para registrar la solicitud.' };
    }

    isGuest = true;
    const admin = createAdminClient();
    db = admin as unknown as typeof authed;

    const email = d.guest_email.toLowerCase();
    requester = {
      fullName: d.guest_full_name,
      companyName: d.guest_company || null,
      email,
      phone: d.guest_phone,
    };
    const { data: existing } = await admin
      .from('client_profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      clientProfileId = existing.id;
    } else {
      const { data: created, error } = await admin
        .from('client_profiles')
        .insert({
          full_name: d.guest_full_name,
          company_name: d.guest_company || null,
          email,
          phone: d.guest_phone,
        })
        .select('id')
        .single();
      if (error || !created) return { ok: false, error: 'No pudimos registrar tus datos de contacto.' };
      clientProfileId = created.id;
    }
  }

  const { data: request, error } = await db
    .from('service_requests')
    .insert({
      client_profile_id: clientProfileId,
      created_by_user_id: user?.id ?? null,
      service_type: d.service_type,
      quantity_gal: d.quantity_unknown ? null : d.quantity_gal,
      quantity_unknown: d.quantity_unknown,
      quantity_note: d.quantity_note || null,
      facility_name: d.facility_name,
      facility_type: d.facility_type,
      province: d.province,
      district: d.district || null,
      corregimiento: d.corregimiento || null,
      address_line: d.address_line,
      reference_point: d.reference_point || null,
      access_instructions: d.access_instructions || null,
      tank_capacity_gal: d.tank_capacity_gal ?? null,
      current_level_pct: d.current_level_pct ?? null,
      preferred_date: d.preferred_date,
      preferred_time_slot: d.preferred_time_slot,
      urgency: d.urgency,
      contact_name: d.contact_name,
      contact_phone: d.contact_phone,
      contact_email: d.contact_email || (isGuest ? d.guest_email : null),
      customer_comments: d.customer_comments || null,
      status: 'solicitud_recibida' satisfies RequestStatus,
      terms_accepted_at: new Date().toISOString(),
      is_guest: isGuest,
    })
    .select('id, request_number, access_token, created_at')
    .single();

  if (error || !request) {
    console.error('createServiceRequest', error);
    return { ok: false, error: 'No pudimos registrar tu solicitud. Intenta de nuevo.' };
  }

  // Adjuntos ya cargados al bucket durante el formulario.
  if (d.attachment_paths?.length) {
    await db.from('attachments').insert(
      d.attachment_paths.map((p) => ({
        service_request_id: request.id,
        storage_path: p,
        file_name: p.split('/').pop() ?? 'archivo',
        kind: 'tanque' as const,
        uploaded_by_user_id: user?.id ?? null,
        is_client_visible: true,
      })),
    );
  }

  // Guarda el teléfono en el perfil del cliente para prellenarlo en próximos
  // pedidos (solo si el perfil aún no tiene uno registrado).
  if (user && clientProfileId && d.contact_phone) {
    await db
      .from('client_profiles')
      .update({ phone: d.contact_phone })
      .eq('id', clientProfileId)
      .is('phone', null);
  }

  // Dirección frecuente, si el cliente lo pidio.
  if (user && d.save_address) {
    await authed.from('addresses').insert({
      client_profile_id: clientProfileId,
      label: d.facility_name,
      facility_name: d.facility_name,
      facility_type: d.facility_type,
      province: d.province,
      district: d.district || null,
      corregimiento: d.corregimiento || null,
      address_line: d.address_line,
      reference_point: d.reference_point || null,
      access_instructions: d.access_instructions || null,
      tank_capacity_gal: d.tank_capacity_gal ?? null,
    });
  }

  // Aviso interno para todos los administradores. La solicitud sigue siendo
  // válida aunque una alerta secundaria no pueda crearse.
  try {
    const admin = createAdminClient();
    const { data: admins, error: adminsError } = await admin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (adminsError) {
      console.error('createServiceRequest/adminRecipients', adminsError);
    } else if (admins?.length) {
      const { error: notificationError } = await admin.from('notifications').insert(
        admins.map(({ id }) => ({
          recipient_user_id: id,
          client_profile_id: clientProfileId,
          service_request_id: request.id,
          type: 'nueva_solicitud',
          title: `Nueva RFQ ${request.request_number}`,
          body: `${d.service_type === 'diesel' ? 'Diésel' : 'Agua potable'} · ${d.facility_name} · ${d.province}`,
          link: `/admin/solicitudes/${request.id}`,
        })),
      );
      if (notificationError) console.error('createServiceRequest/adminNotification', notificationError);
    }
  } catch (notificationError) {
    console.error('createServiceRequest/adminNotification', notificationError);
  }

  // El correo incluye todos los campos ingresados. Si el proveedor de correo
  // falla, la RFQ permanece registrada y visible en /admin/solicitudes.
  await sendNewRequestEmail({
    requestId: request.id,
    requestNumber: request.request_number,
    createdAt: request.created_at,
    isGuest,
    requester,
    data: d,
  });

  revalidatePath('/portal');
  revalidatePath('/admin');

  return {
    ok: true,
    data: {
      id: request.id,
      request_number: request.request_number,
      access_token: request.access_token,
      is_guest: isGuest,
    },
  };
}

/** Cambio de estado. Valida la transición salvo que el admin la fuerce explicitamente. */
export async function changeRequestStatus(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = changeStatusSchema.safeParse({
    request_id: String(formData.get('request_id') ?? ''),
    status: String(formData.get('status') ?? ''),
    note: String(formData.get('note') ?? ''),
    force: formData.get('force') === 'true',
  });
  if (!parsed.success) return { ok: false, error: 'Datos invalidos.' };

  const { request_id, status, note, force } = parsed.data;

  const { data: current } = await ctx.supabase
    .from('service_requests')
    .select('status')
    .eq('id', request_id)
    .single();
  if (!current) return { ok: false, error: 'Solicitud no encontrada.' };

  if (current.status === status) return { ok: false, error: 'La solicitud ya tiene ese estado.' };

  if (!force && !canTransition(current.status as RequestStatus, status as RequestStatus)) {
    return {
      ok: false,
      error: 'Esa transición de estado no es válida. Marca la casilla de forzar si es intencional.',
    };
  }

  const { error } = await ctx.supabase
    .from('service_requests')
    .update({ status })
    .eq('id', request_id);
  if (error) return { ok: false, error: 'No pudimos actualizar el estado.' };

  // La nota se adjunta a la fila de historial que acaba de crear el trigger.
  if (note) {
    const { data: lastEntry } = await ctx.supabase
      .from('request_status_history')
      .select('id')
      .eq('service_request_id', request_id)
      .eq('to_status', status)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastEntry) {
      const { error: noteError } = await ctx.supabase
        .from('request_status_history')
        .update({ note })
        .eq('id', lastEntry.id);
      if (noteError) console.error('changeRequestStatus/note', noteError);
    }
  }

  revalidatePath(`/admin/solicitudes/${request_id}`);
  revalidatePath('/admin/solicitudes');
  revalidatePath('/portal');
  return { ok: true, message: 'Estado actualizado.' };
}

export async function addInternalNote(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = internalNoteSchema.safeParse({
    request_id: String(formData.get('request_id') ?? ''),
    body: String(formData.get('body') ?? '').trim(),
  });
  if (!parsed.success) return { ok: false, error: 'Escribe el contenido de la nota.' };

  const { error } = await ctx.supabase.from('internal_notes').insert({
    service_request_id: parsed.data.request_id,
    author_user_id: ctx.userId,
    body: parsed.data.body,
  });
  if (error) return { ok: false, error: 'No pudimos guardar la nota.' };

  revalidatePath(`/admin/solicitudes/${parsed.data.request_id}`);
  return { ok: true, message: 'Nota interna agregada.' };
}

/** Información del operador. Solo administradores; el cliente nunca la ve. */
export async function saveOperatorInfo(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = operatorInfoSchema.safeParse({
    request_id: String(formData.get('request_id') ?? ''),
    operator_name: String(formData.get('operator_name') ?? ''),
    contact_person: String(formData.get('contact_person') ?? ''),
    contact_phone: String(formData.get('contact_phone') ?? ''),
    availability: String(formData.get('availability') ?? 'pendiente'),
    supplier_cost: numOrNull(formData.get('supplier_cost')),
    transport_cost: numOrNull(formData.get('transport_cost')),
    available_date: String(formData.get('available_date') ?? ''),
    available_time_slot: String(formData.get('available_time_slot') ?? ''),
    internal_observations: String(formData.get('internal_observations') ?? ''),
  });
  if (!parsed.success) return { ok: false, error: 'Revisa los datos del operador.' };

  const d = parsed.data;
  const { error } = await ctx.supabase.from('internal_operator_information').upsert(
    {
      service_request_id: d.request_id,
      operator_name: d.operator_name || null,
      contact_person: d.contact_person || null,
      contact_phone: d.contact_phone || null,
      availability: d.availability,
      supplier_cost: d.supplier_cost,
      transport_cost: d.transport_cost,
      available_date: d.available_date || null,
      available_time_slot: d.available_time_slot || null,
      internal_observations: d.internal_observations || null,
      updated_by_user_id: ctx.userId,
    },
    { onConflict: 'service_request_id' },
  );
  if (error) return { ok: false, error: 'No pudimos guardar la información del operador.' };

  revalidatePath(`/admin/solicitudes/${d.request_id}`);
  return { ok: true, message: 'Información del operador guardada.' };
}

export async function completeService(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = completeServiceSchema.safeParse({
    request_id: String(formData.get('request_id') ?? ''),
    final_quantity_gal: Number(formData.get('final_quantity_gal')),
    completed_at: String(formData.get('completed_at') ?? ''),
    completion_notes: String(formData.get('completion_notes') ?? ''),
    receipt_path: String(formData.get('receipt_path') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa la cantidad final y la fecha de entrega.' };
  }

  const d = parsed.data;
  const { error } = await ctx.supabase
    .from('service_requests')
    .update({
      status: 'servicio_completado',
      final_quantity_gal: d.final_quantity_gal,
      completed_at: new Date(d.completed_at).toISOString(),
      completion_notes: d.completion_notes || null,
    })
    .eq('id', d.request_id);
  if (error) return { ok: false, error: 'No pudimos marcar el servicio como completado.' };

  if (d.receipt_path) {
    await ctx.supabase.from('attachments').insert({
      service_request_id: d.request_id,
      storage_path: d.receipt_path,
      file_name: d.receipt_path.split('/').pop() ?? 'comprobante',
      kind: 'comprobante',
      uploaded_by_user_id: ctx.userId,
      is_client_visible: true,
    });
  }

  revalidatePath(`/admin/solicitudes/${d.request_id}`);
  revalidatePath('/admin');
  revalidatePath('/portal');
  return { ok: true, message: 'Servicio marcado como completado.' };
}

export async function cancelRequest(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const requestId = String(formData.get('request_id') ?? '');
  const reason = clean(formData.get('reason'));

  const { error } = await ctx.supabase
    .from('service_requests')
    .update({ status: 'solicitud_cancelada' })
    .eq('id', requestId);
  if (error) return { ok: false, error: 'No pudimos cancelar la solicitud.' };

  if (reason) {
    await ctx.supabase.from('internal_notes').insert({
      service_request_id: requestId,
      author_user_id: ctx.userId,
      body: `Cancelación: ${reason}`,
    });
  }

  revalidatePath(`/admin/solicitudes/${requestId}`);
  revalidatePath('/admin/solicitudes');
  return { ok: true, message: 'Solicitud cancelada.' };
}
