'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { SERVICE_LABELS } from '@/lib/constants';
import { buildClientLineItems, calculateQuotation } from '@/lib/pricing';
import {
  approveSchema,
  quotationSchema,
  rejectSchema,
  requestChangesSchema,
} from '@/lib/validations/quotation';
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

/**
 * Crea o actualiza una cotización en borrador.
 * Los totales se recalculan siempre en el servidor: nunca se confia
 * en los montos enviados desde el navegador.
 */
export async function saveQuotation(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fe: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(flat)) if (v) fe[k] = v;
    return { ok: false, error: 'Revisa los datos de la cotización.', fieldErrors: fe };
  }

  const d = parsed.data;

  const { data: request } = await ctx.supabase
    .from('service_requests')
    .select('id, service_type, status')
    .eq('id', d.request_id)
    .single();
  if (!request) return { ok: false, error: 'Solicitud no encontrada.' };

  const calc = calculateQuotation({
    pricingMode: d.pricing_mode,
    quantityGal: d.quantity_gal,
    pricePerGallon: d.price_per_gallon ?? 0,
    fixedAmount: d.fixed_amount ?? 0,
    deliveryCharge: d.delivery_charge,
    urgencySurcharge: d.urgency_surcharge,
    discount: d.discount,
    taxRate: d.tax_rate,
    supplierCost: d.supplier_cost,
    transportCost: d.transport_cost,
    otherCosts: d.other_costs,
    marginPerGallon: d.margin_per_gallon,
    marginFixed: d.margin_fixed,
  });

  // Solo campos publicos: los internos se guardan aparte, en quotation_internal.
  const payload = {
    service_request_id: d.request_id,
    pricing_mode: d.pricing_mode,
    price_per_gallon: d.pricing_mode === 'por_galon' ? (d.price_per_gallon ?? 0) : null,
    quantity_gal: d.quantity_gal,
    product_subtotal: calc.productSubtotal,
    delivery_charge: d.delivery_charge,
    urgency_surcharge: d.urgency_surcharge,
    discount: d.discount,
    tax_rate: d.tax_rate,
    tax_amount: calc.taxAmount,
    total: calc.total,
    proposed_date: d.proposed_date,
    proposed_time_slot: d.proposed_time_slot,
    payment_terms: d.payment_terms,
    valid_until: d.valid_until,
    client_notes: d.client_notes || null,
    created_by_user_id: ctx.userId,
  };

  let quotationId = d.quotation_id;

  if (quotationId) {
    const { error } = await ctx.supabase.from('quotations').update(payload).eq('id', quotationId);
    if (error) return { ok: false, error: 'No pudimos guardar la cotización.' };
  } else {
    const { data: last } = await ctx.supabase
      .from('quotations')
      .select('version')
      .eq('service_request_id', d.request_id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const version = (last?.version ?? 0) + 1;

    const { data: created, error } = await ctx.supabase
      .from('quotations')
      .insert({ ...payload, version, status: 'draft' })
      .select('id')
      .single();
    if (error || !created) return { ok: false, error: 'No pudimos crear la cotización.' };
    quotationId = created.id;
  }

  // Datos internos: tabla separada, inaccesible para clientes por RLS.
  const { error: internalError } = await ctx.supabase.from('quotation_internal').upsert(
    {
      quotation_id: quotationId,
      supplier_cost: d.supplier_cost,
      transport_cost: d.transport_cost,
      other_costs: d.other_costs,
      margin_per_gallon: d.margin_per_gallon,
      margin_fixed: d.margin_fixed,
      estimated_profit: calc.estimatedProfit,
      internal_notes: d.internal_notes || null,
    },
    { onConflict: 'quotation_id' },
  );
  if (internalError) return { ok: false, error: 'No pudimos guardar los datos internos.' };

  // Lineas visibles al cliente: se regeneran en cada guardado.
  await ctx.supabase.from('quotation_items').delete().eq('quotation_id', quotationId);

  const items = buildClientLineItems(
    {
      pricingMode: d.pricing_mode,
      quantityGal: d.quantity_gal,
      pricePerGallon: d.price_per_gallon ?? 0,
      fixedAmount: d.fixed_amount ?? 0,
      deliveryCharge: d.delivery_charge,
      urgencySurcharge: d.urgency_surcharge,
      discount: d.discount,
      taxRate: d.tax_rate,
    },
    SERVICE_LABELS[request.service_type as 'diesel' | 'agua'],
  );

  await ctx.supabase.from('quotation_items').insert(
    items.map((it, i) => ({
      quotation_id: quotationId!,
      sort_order: i,
      concept: it.concept,
      quantity: it.quantity,
      unit: it.unit,
      unit_price: it.unitPrice,
      subtotal: it.subtotal,
      is_taxable: true,
    })),
  );

  revalidatePath(`/admin/solicitudes/${d.request_id}`);
  revalidatePath('/admin/cotizaciones');
  return { ok: true, data: { id: quotationId! }, message: 'Cotización guardada como borrador.' };
}

/** Envía la cotización al cliente y actualiza el estado de la solicitud. */
export async function sendQuotation(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const quotationId = String(formData.get('quotation_id') ?? '');

  const { data: quotation } = await ctx.supabase
    .from('quotations')
    .select('id, service_request_id, status, total')
    .eq('id', quotationId)
    .single();
  if (!quotation) return { ok: false, error: 'Cotización no encontrada.' };
  if (quotation.status !== 'draft') return { ok: false, error: 'Esta cotización ya fue enviada.' };
  if (Number(quotation.total) <= 0) {
    return { ok: false, error: 'El total debe ser mayor que cero antes de enviar.' };
  }

  // Las versiones anteriores quedan marcadas como reemplazadas.
  await ctx.supabase
    .from('quotations')
    .update({ status: 'superseded' })
    .eq('service_request_id', quotation.service_request_id)
    .in('status', ['sent', 'changes_requested'])
    .neq('id', quotationId);

  const { error } = await ctx.supabase
    .from('quotations')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', quotationId);
  if (error) return { ok: false, error: 'No pudimos enviar la cotización.' };
  // El trigger q_sync_request_status pasa la solicitud a "Cotización enviada".

  revalidatePath(`/admin/solicitudes/${quotation.service_request_id}`);
  revalidatePath('/admin/cotizaciones');
  revalidatePath('/portal');
  return { ok: true, message: 'Cotización enviada al cliente.' };
}

/**
 * Respuestas del cliente.
 * Pasan por la funcion respond_to_quotation() en Postgres: el cliente no tiene
 * permiso de UPDATE sobre quotations, así que no puede alterar montos ni fechas.
 * La funcion valida la propiedad y el trigger actualiza el estado de la solicitud.
 */
async function respond(
  quotationId: string,
  action: 'approve' | 'changes' | 'reject',
  message: string | null,
  successMessage: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('respond_to_quotation', {
    p_quotation_id: quotationId,
    p_action: action,
    p_message: message,
  });

  if (error) {
    console.error('respond_to_quotation', error);
    return { ok: false, error: 'No pudimos registrar tu respuesta. Intenta de nuevo.' };
  }

  const result = data as { ok: boolean; error?: string } | null;
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? 'No pudimos registrar tu respuesta.' };
  }

  revalidatePath('/portal', 'layout');
  revalidatePath('/admin', 'layout');
  return { ok: true, message: successMessage };
}

export async function approveQuotation(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = approveSchema.safeParse({ quotation_id: String(formData.get('quotation_id') ?? '') });
  if (!parsed.success) return { ok: false, error: 'Cotización inválida.' };

  return respond(
    parsed.data.quotation_id,
    'approve',
    null,
    'Cotización aprobada. PES programará la entrega y te mantendrá informado.',
  );
}

export async function requestQuotationChanges(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = requestChangesSchema.safeParse({
    quotation_id: String(formData.get('quotation_id') ?? ''),
    message: String(formData.get('message') ?? '').trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Explica qué necesitas modificar (mínimo 10 caracteres).' };
  }

  return respond(
    parsed.data.quotation_id,
    'changes',
    parsed.data.message,
    'Enviamos tu solicitud de cambios al equipo de PES.',
  );
}

export async function rejectQuotation(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse({
    quotation_id: String(formData.get('quotation_id') ?? ''),
    reason: String(formData.get('reason') ?? '').trim(),
  });
  if (!parsed.success) return { ok: false, error: 'Cotización inválida.' };

  return respond(parsed.data.quotation_id, 'reject', parsed.data.reason || null, 'Registramos tu respuesta.');
}
