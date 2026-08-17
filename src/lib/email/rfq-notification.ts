import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { siteConfig } from '@/config/site';
import type { CreateRequestInput } from '@/lib/validations/request';

interface RequesterIdentity {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
}

export interface NewRequestNotification {
  requestId: string;
  requestNumber: string;
  createdAt: string;
  isGuest: boolean;
  requester: RequesterIdentity;
  data: CreateRequestInput;
}

export type NotificationDelivery =
  | { sent: true; recipients: string[] }
  | { sent: false; reason: 'not_configured' | 'provider_error' };

const NOT_INDICATED = 'No indicado';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function valueOrFallback(value: unknown): string {
  const text = String(value ?? '').trim();
  return text || NOT_INDICATED;
}

function formatGallons(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Por definir';
  return `${new Intl.NumberFormat('es-PA').format(value)} gal`;
}

function formatRequestedDate(value: string): string {
  const date = new Date(`${value}T12:00:00-05:00`);
  if (Number.isNaN(date.getTime())) return valueOrFallback(value);
  return new Intl.DateTimeFormat('es-PA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Panama',
  }).format(date);
}

function attachmentNames(paths: string[] | undefined): string {
  if (!paths?.length) return 'Sin adjuntos';
  return paths
    .map((path) => path.split('/').pop() || 'archivo')
    .join(', ');
}

function recipientsFromEnvironment(): string[] {
  const configured = process.env.RFQ_NOTIFICATION_TO || process.env.NEXT_PUBLIC_CONTACT_EMAIL || siteConfig.email;
  return configured
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

function buildRows(payload: NewRequestNotification): [string, string][] {
  const { data, requester } = payload;
  const location = [data.corregimiento, data.district, data.province].filter(Boolean).join(', ');

  return [
    ['Número de RFQ', payload.requestNumber],
    ['Fecha de registro', new Intl.DateTimeFormat('es-PA', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Panama',
    }).format(new Date(payload.createdAt))],
    ['Tipo de envío', payload.isGuest ? 'Invitado' : 'Cliente con cuenta'],
    ['Solicitante', requester.fullName],
    ['Empresa', valueOrFallback(requester.companyName)],
    ['Correo del solicitante', requester.email],
    ['Teléfono del solicitante', valueOrFallback(requester.phone)],
    ['Servicio solicitado', SERVICE_LABELS[data.service_type]],
    ['Cantidad', data.quantity_unknown ? 'Por definir por el equipo de PES' : formatGallons(data.quantity_gal)],
    ['Nota sobre cantidad', valueOrFallback(data.quantity_note)],
    ['Instalación / empresa', data.facility_name],
    ['Tipo de instalación', FACILITY_LABELS[data.facility_type]],
    ['Provincia / distrito / corregimiento', valueOrFallback(location)],
    ['Dirección completa', data.address_line],
    ['Punto de referencia', valueOrFallback(data.reference_point)],
    ['Instrucciones de acceso', valueOrFallback(data.access_instructions)],
    ['Capacidad del tanque', formatGallons(data.tank_capacity_gal)],
    ['Nivel actual del tanque', data.current_level_pct === null || data.current_level_pct === undefined
      ? NOT_INDICATED
      : `${data.current_level_pct}%`],
    ['Fecha preferida', formatRequestedDate(data.preferred_date)],
    ['Horario preferido', TIME_SLOT_LABELS[data.preferred_time_slot] || data.preferred_time_slot],
    ['Prioridad', data.urgency === 'urgente' ? 'Urgente' : 'Normal'],
    ['Persona que recibe', data.contact_name],
    ['Teléfono de recepción', data.contact_phone],
    ['Correo de recepción', valueOrFallback(data.contact_email)],
    ['Comentarios del cliente', valueOrFallback(data.customer_comments)],
    ['Archivos adjuntos', attachmentNames(data.attachment_paths)],
    ['Condiciones aceptadas', data.terms_accepted ? 'Sí' : 'No'],
    ['Guardar dirección en el perfil', data.save_address ? 'Sí' : 'No'],
  ];
}

/** Construye el contenido completo del correo sin incluir el token privado del invitado. */
export function buildNewRequestEmail(payload: NewRequestNotification) {
  const rows = buildRows(payload);
  const adminUrl = `${siteConfig.url}/admin/solicitudes/${payload.requestId}`;
  const subject = `Nueva RFQ ${payload.requestNumber} · ${SERVICE_LABELS[payload.data.service_type]} · ${payload.requester.companyName || payload.requester.fullName}`;
  const text = [
    `Nueva solicitud de cotización ${payload.requestNumber}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    `Abrir en el panel de PES: ${adminUrl}`,
  ].join('\n');

  const htmlRows = rows
    .map(([label, value]) => `
      <tr>
        <th style="width:36%;padding:11px 14px;text-align:left;vertical-align:top;border-bottom:1px solid #e7ecf3;color:#536780;font-size:12px;font-weight:600;">${escapeHtml(label)}</th>
        <td style="padding:11px 14px;vertical-align:top;border-bottom:1px solid #e7ecf3;color:#0e2140;font-size:13px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(value)}</td>
      </tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#0e2140;">
    <div style="padding:28px 12px;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-top:5px solid #e0a402;box-shadow:0 14px 40px rgba(4,11,29,.10);">
        <div style="padding:26px 28px 20px;background:#040b1d;color:#ffffff;">
          <p style="margin:0 0 8px;color:#e0a402;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Panama Energy Solutions</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">Nueva solicitud de cotización</h1>
          <p style="margin:8px 0 0;color:#d6deeb;font-size:13px;">${escapeHtml(payload.requestNumber)} · registrada desde la página web</p>
        </div>
        <div style="padding:22px 28px 10px;">
          <p style="margin:0 0 18px;color:#536780;font-size:13px;line-height:1.6;">Estos son todos los datos ingresados por el cliente. La solicitud también quedó registrada en el panel administrativo de PES.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e7ecf3;">${htmlRows}</table>
          <div style="padding:24px 0 26px;">
            <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#e0a402;color:#040b1d;padding:12px 18px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Abrir RFQ en el panel</a>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html, adminUrl };
}

/**
 * Envía la alerta por Resend. La RFQ nunca se descarta si el proveedor de
 * correo está temporalmente caído: el registro en Supabase es la fuente de verdad.
 */
export async function sendNewRequestEmail(payload: NewRequestNotification): Promise<NotificationDelivery> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RFQ_FROM_EMAIL?.trim();
  const recipients = recipientsFromEnvironment();

  if (!apiKey || !from || recipients.length === 0) {
    console.warn('RFQ email not sent: RESEND_API_KEY, RFQ_FROM_EMAIL or RFQ_NOTIFICATION_TO is not configured.');
    return { sent: false, reason: 'not_configured' };
  }

  const { subject, text, html } = buildNewRequestEmail(payload);
  const replyTo = payload.data.contact_email || payload.requester.email;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error('RFQ email provider error', { status: response.status });
      return { sent: false, reason: 'provider_error' };
    }

    return { sent: true, recipients };
  } catch (error) {
    console.error('RFQ email request failed', error instanceof Error ? error.message : 'Unknown error');
    return { sent: false, reason: 'provider_error' };
  }
}
