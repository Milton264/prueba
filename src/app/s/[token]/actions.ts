'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult } from '@/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUCCESS: Record<string, string> = {
  approve: 'Cotización aprobada. PES programará la entrega y te mantendrá informado.',
  changes: 'Enviamos tu solicitud de cambios al equipo de PES.',
  reject: 'Registramos tu respuesta.',
};

/**
 * Respuesta del invitado a su cotización.
 * Toda la validacion ocurre dentro de respond_to_quotation_by_token() en
 * Postgres: comprueba que la cotización pertenezca a la solicitud del token,
 * que siga vigente y que admita respuesta. El trigger actualiza el estado
 * de la solicitud. Aquí no se escribe nada directamente.
 */
export async function respondToQuotationByToken(input: {
  token: string;
  quotationId: string;
  action: 'approve' | 'changes' | 'reject';
  message?: string;
}): Promise<ActionResult> {
  const { token, quotationId, action, message } = input;

  if (!UUID_RE.test(token) || !UUID_RE.test(quotationId)) {
    return { ok: false, error: 'Enlace inválido.' };
  }
  if (action === 'changes' && (!message || message.trim().length < 10)) {
    return { ok: false, error: 'Explica qué necesitas modificar (mínimo 10 caracteres).' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('respond_to_quotation_by_token', {
    p_token: token,
    p_quotation_id: quotationId,
    p_action: action,
    p_message: message ?? null,
  });

  if (error) {
    console.error('respond_to_quotation_by_token', error);
    return { ok: false, error: 'No pudimos registrar tu respuesta. Intenta de nuevo.' };
  }

  const result = data as { ok: boolean; error?: string } | null;
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? 'No pudimos registrar tu respuesta.' };
  }

  revalidatePath(`/s/${token}`);
  revalidatePath('/admin', 'layout');
  return { ok: true, message: SUCCESS[action] };
}
