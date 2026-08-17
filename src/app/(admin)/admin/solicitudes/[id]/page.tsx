import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, FileText, Mail, Paperclip, Phone, ReceiptText } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, QuotationStatusBadge, StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { DataRow, Notice, PageHeader } from '@/components/ui/misc';
import { RequestTimeline } from '@/components/ui/timeline';
import { StatusChanger } from '@/components/admin/status-changer';
import { InternalNotes } from '@/components/admin/internal-notes';
import { OperatorInfoForm } from '@/components/admin/operator-info-form';
import { CompleteServiceForm } from '@/components/admin/complete-service-form';
import { CancelRequestButton } from '@/components/admin/cancel-request';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, formatDateTime, formatGallons, formatPhone } from '@/lib/format';
import { getSignedUrls } from '@/lib/actions/uploads';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';
import { isTerminal } from '@/lib/status';
import { one } from '@/lib/utils';
import type {
  Attachment,
  ClientProfile,
  InternalNote,
  OperatorInformation,
  Quotation,
  RequestStatusHistory,
  ServiceRequest,
} from '@/types';

export const metadata: Metadata = { title: 'Gestión de solicitud' };

export default async function AdminSolicitudDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from('service_requests')
    .select('*, client_profiles(*)')
    .eq('id', id)
    .maybeSingle();

  if (!request) notFound();

  const r = request as ServiceRequest & { client_profiles: ClientProfile };
  const client = r.client_profiles;

  const [{ data: history }, { data: notes }, { data: operator }, { data: quotations }, { data: attachments }, settings] =
    await Promise.all([
      supabase.from('request_status_history').select('*').eq('service_request_id', id).order('created_at'),
      supabase
        .from('internal_notes')
        .select('*, users(full_name)')
        .eq('service_request_id', id)
        .order('created_at', { ascending: false }),
      supabase.from('internal_operator_information').select('*').eq('service_request_id', id).maybeSingle(),
      supabase
        .from('quotations')
        .select('*, quotation_internal(*)')
        .eq('service_request_id', id)
        .order('version', { ascending: false }),
      supabase.from('attachments').select('*').eq('service_request_id', id),
    getSettings().catch(() => null),
    ]);

  const quotationList = (quotations ?? []) as unknown as Quotation[];
  const activeQuotation = quotationList.find((q) => q.status !== 'superseded') ?? null;
  const atts = (attachments ?? []) as Attachment[];
  const urls = await getSignedUrls(atts.map((a) => a.storage_path)).catch(() => ({}) as Record<string, string>);
  const location = [r.corregimiento, r.district, r.province].filter(Boolean).join(', ');

  const internalNotes = ((notes ?? []) as (InternalNote & { users: { full_name: string } | null })[]).map((x) => ({
    ...x,
    author_name: x.users?.full_name ?? null,
  }));

  return (
    <div>
      <PageHeader
        title={`Solicitud ${r.request_number}`}
        description={`Recibida el ${formatDateTime(r.created_at)}${r.is_guest ? ' · Enviada como invitado' : ''}`}
        backHref="/admin/solicitudes"
      >
        <StatusBadge status={r.status} />
        {r.urgency === 'urgente' && <UrgencyBadge urgency="urgente" />}
        <StatusChanger requestId={r.id} currentStatus={r.status} />
        {r.status === 'servicio_programado' && (
          <CompleteServiceForm requestId={r.id} suggestedQuantity={r.quantity_gal} />
        )}
        {!isTerminal(r.status) && <CancelRequestButton requestId={r.id} requestNumber={r.request_number} />}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Cotizaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-navy-300" aria-hidden />
                Cotizaciones
              </CardTitle>
              <ButtonLink
                href={`/admin/cotizaciones/nueva?requestId=${r.id}`}
                size="sm"
                variant={activeQuotation ? 'secondary' : 'primary'}
              >
                {activeQuotation ? 'Nueva versión' : 'Crear cotización'}
              </ButtonLink>
            </CardHeader>
            <CardContent>
              {quotationList.length === 0 ? (
                <p className="py-2 text-sm text-navy-500">
                  Aún no hay cotizaciones para esta solicitud. Registra primero la información del
                  operador y luego genera la cotización.
                </p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {quotationList.map((q) => (
                    <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-navy-900">
                          {q.quotation_number}
                          <span className="ml-2 text-xs font-normal text-navy-300">v{q.version}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-navy-500">
                          Total {formatCurrency(Number(q.total))} · Ganancia estimada{' '}
                          <span className={Number(one(q.quotation_internal)?.estimated_profit ?? 0) < 0 ? 'text-red-600' : 'text-emerald-600'}>
                            {formatCurrency(Number(one(q.quotation_internal)?.estimated_profit ?? 0))}
                          </span>
                          {q.sent_at && ` · Enviada ${formatDateTime(q.sent_at)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <QuotationStatusBadge status={q.status} />
                        <Link href={`/admin/cotizaciones/${q.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                          Ver
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {activeQuotation?.client_response_message && (
                <Notice tone="warning" className="mt-4">
                  <strong>El cliente solicito cambios:</strong> {activeQuotation.client_response_message}
                </Notice>
              )}
              {activeQuotation?.rejection_reason && (
                <Notice tone="danger" className="mt-4">
                  <strong>Motivo del rechazo:</strong> {activeQuotation.rejection_reason}
                </Notice>
              )}
            </CardContent>
          </Card>

          {/* Información del operador */}
          <OperatorInfoForm
            requestId={r.id}
            info={(operator as OperatorInformation) ?? null}
            request={{
              request_number: r.request_number,
              service_type: r.service_type,
              quantity_gal: r.quantity_gal,
              quantity_unknown: r.quantity_unknown,
              address_line: r.address_line,
              province: r.province,
              district: r.district,
              preferred_date: r.preferred_date,
              preferred_time_slot: r.preferred_time_slot,
            }}
          />

          {/* Datos de la solicitud */}
          <Card>
            <CardHeader><CardTitle>Datos de la solicitud</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y divide-navy-100">
                <DataRow label="Servicio" value={SERVICE_LABELS[r.service_type]} />
                <DataRow
                  label="Cantidad solicitada"
                  value={
                    r.quantity_unknown ? (
                      <Badge tone="warning">Cantidad por definir</Badge>
                    ) : (
                      formatGallons(r.quantity_gal)
                    )
                  }
                />
                {r.quantity_note && <DataRow label="Nota del cliente sobre el tanque" value={r.quantity_note} />}
                <DataRow label="Instalación" value={r.facility_name} />
                <DataRow label="Tipo de instalación" value={FACILITY_LABELS[r.facility_type]} />
                <DataRow label="Dirección" value={r.address_line} />
                <DataRow label="Ubicación" value={location} />
                {r.reference_point && <DataRow label="Punto de referencia" value={r.reference_point} />}
                {r.access_instructions && <DataRow label="Instrucciones de acceso" value={r.access_instructions} />}
                {r.tank_capacity_gal ? <DataRow label="Capacidad del tanque" value={formatGallons(r.tank_capacity_gal)} /> : null}
                {r.current_level_pct !== null ? <DataRow label="Nivel actual" value={`${r.current_level_pct}%`} /> : null}
                <DataRow label="Fecha solicitada" value={formatDate(r.preferred_date)} />
                <DataRow
                  label="Horario"
                  value={TIME_SLOT_LABELS[r.preferred_time_slot ?? ''] ?? r.preferred_time_slot}
                />
                <DataRow label="Tipo de solicitud" value={r.urgency === 'urgente' ? 'Urgente' : 'Normal'} />
                <DataRow label="Recibe" value={r.contact_name} />
                <DataRow label="Teléfono de contacto" value={formatPhone(r.contact_phone)} />
                {r.contact_email && <DataRow label="Correo de contacto" value={r.contact_email} />}
                {r.customer_comments && <DataRow label="Comentarios del cliente" value={r.customer_comments} />}
              </dl>
            </CardContent>
          </Card>

          {/* Servicio completado */}
          {r.status === 'servicio_completado' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                  Servicio completado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-navy-100">
                  <DataRow label="Cantidad final entregada" value={formatGallons(r.final_quantity_gal)} />
                  <DataRow label="Fecha y hora" value={formatDateTime(r.completed_at)} />
                  {r.completion_notes && <DataRow label="Comentarios" value={r.completion_notes} />}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Adjuntos */}
          {atts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-navy-300" aria-hidden />
                  Fotografías y documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {atts.map((a) => (
                    <a
                      key={a.id}
                      href={urls[a.storage_path] ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video overflow-hidden rounded-lg border border-navy-100 bg-mist"
                    >
                      {urls[a.storage_path] && a.mime_type?.startsWith('image/') ? (
                        <Image src={urls[a.storage_path]} alt={a.file_name} fill sizes="200px" className="object-cover" unoptimized />
                      ) : (
                        <span className="grid h-full place-items-center gap-1 p-2 text-center text-xs text-navy-500">
                          <FileText className="mx-auto h-5 w-5" aria-hidden />
                          {a.file_name}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <InternalNotes requestId={r.id} notes={internalNotes} />
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-navy-900">{client?.full_name}</p>
                {client?.company_name && <p className="text-sm text-navy-500">{client.company_name}</p>}
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-navy-600">
                  <Mail className="h-4 w-4 shrink-0 text-navy-300" aria-hidden />
                  <a href={`mailto:${client?.email}`} className="truncate hover:text-navy-700">{client?.email}</a>
                </div>
                <div className="flex items-center gap-2 text-navy-600">
                  <Phone className="h-4 w-4 shrink-0 text-navy-300" aria-hidden />
                  {formatPhone(client?.phone)}
                </div>
              </dl>

              <div className="space-y-2 border-t border-navy-100 pt-4">
                <WhatsAppButton
                  message={waMessages.toClient(client?.full_name?.split(' ')[0] ?? '', r.request_number)}
                  number={r.contact_phone || client?.phone}
                  label="WhatsApp al cliente"
                  size="sm"
                  fullWidth
                />
                <ButtonLink href={`/admin/clientes/${client?.id}`} variant="secondary" size="sm" fullWidth>
                  Ver ficha del cliente
                </ButtonLink>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Historial de estados</CardTitle></CardHeader>
            <CardContent>
              <RequestTimeline history={(history ?? []) as RequestStatusHistory[]} currentStatus={r.status} />
            </CardContent>
          </Card>

          {r.is_guest && (
            <Notice tone="info">
              Solicitud enviada como invitado. El cliente la consulta con un enlace privado; no
              necesita cuenta para aprobar la cotización.
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
}
