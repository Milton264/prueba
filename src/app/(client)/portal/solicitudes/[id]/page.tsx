import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, FileText, Paperclip } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { DataRow, Notice, PageHeader } from '@/components/ui/misc';
import { RequestTimeline } from '@/components/ui/timeline';
import { QuotationClientView } from '@/components/quotation/quotation-client-view';
import { QuotationActions } from '@/components/quotation/quotation-actions';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime, formatGallons } from '@/lib/format';
import { getSignedUrls } from '@/lib/actions/uploads';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';
import type { Attachment, QuotationItem, QuotationPublic, RequestStatusHistory, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Detalle de solicitud' };

export default async function DetalleSolicitudPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!request) notFound();
  const r = request as ServiceRequest;

  const [{ data: history }, { data: quotations }, { data: attachments }, settings] = await Promise.all([
    supabase
      .from('request_status_history')
      .select('*')
      .eq('service_request_id', id)
      .order('created_at', { ascending: true }),
    // Vista pública: sin costos de proveedor ni margenes de PES.
    supabase
      .from('quotations_public')
      .select('*')
      .eq('service_request_id', id)
      .neq('status', 'superseded')
      .order('version', { ascending: false })
      .limit(1),
    supabase.from('attachments').select('*').eq('service_request_id', id).eq('is_client_visible', true),
    getSettings().catch(() => null),
  ]);

  const quotation = (quotations?.[0] as QuotationPublic | undefined) ?? null;

  const { data: items } = quotation
    ? await supabase.from('quotation_items').select('*').eq('quotation_id', quotation.id).order('sort_order')
    : { data: [] };

  const atts = (attachments ?? []) as Attachment[];
  const urls = await getSignedUrls(atts.map((a) => a.storage_path)).catch(() => ({}) as Record<string, string>);
  const location = [r.corregimiento, r.district, r.province].filter(Boolean).join(', ');

  return (
    <div>
      <PageHeader
        title={`Solicitud ${r.request_number}`}
        description={`Creada el ${formatDateTime(r.created_at)}`}
        backHref="/portal/solicitudes"
      >
        <StatusBadge status={r.status} />
        {r.urgency === 'urgente' && <UrgencyBadge urgency="urgente" />}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {quotation && (
            <>
              <QuotationClientView
                quotation={quotation}
                items={(items ?? []) as QuotationItem[]}
                requestNumber={r.request_number}
                serviceLabel={SERVICE_LABELS[r.service_type]}
              />
              <QuotationActions
                quotationId={quotation.id}
                quotationNumber={quotation.quotation_number}
                status={quotation.status}
                whatsappNumber={settings?.whatsapp_number}
              />
            </>
          )}

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

                {atts.filter((a) => a.kind === 'comprobante').length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
                      Comprobante
                    </h3>
                    <ul className="space-y-2">
                      {atts
                        .filter((a) => a.kind === 'comprobante')
                        .map((a) => (
                          <li key={a.id}>
                            <a
                              href={urls[a.storage_path] ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-navy-100 px-3.5 py-2.5 text-sm font-medium text-navy-700 hover:bg-mist"
                            >
                              <FileText className="h-4 w-4" aria-hidden />
                              {a.file_name}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Datos de la solicitud</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y divide-navy-100">
                <DataRow label="Servicio" value={SERVICE_LABELS[r.service_type]} />
                <DataRow
                  label="Cantidad solicitada"
                  value={r.quantity_unknown ? 'Por definir con PES' : formatGallons(r.quantity_gal)}
                />
                {r.quantity_note && <DataRow label="Nota sobre el tanque" value={r.quantity_note} />}
                <DataRow label="Instalación" value={r.facility_name} />
                <DataRow label="Tipo de instalación" value={FACILITY_LABELS[r.facility_type]} />
                <DataRow label="Dirección" value={r.address_line} />
                <DataRow label="Ubicación" value={location} />
                {r.reference_point && <DataRow label="Punto de referencia" value={r.reference_point} />}
                {r.access_instructions && <DataRow label="Instrucciones de acceso" value={r.access_instructions} />}
                {r.tank_capacity_gal ? <DataRow label="Capacidad del tanque" value={formatGallons(r.tank_capacity_gal)} /> : null}
                {r.current_level_pct !== null ? <DataRow label="Nivel actual" value={`${r.current_level_pct}%`} /> : null}
                <DataRow label="Fecha preferida" value={formatDate(r.preferred_date)} />
                <DataRow
                  label="Horario preferido"
                  value={TIME_SLOT_LABELS[r.preferred_time_slot ?? ''] ?? r.preferred_time_slot}
                />
                <DataRow label="Recibe" value={r.contact_name} />
                <DataRow label="Teléfono" value={r.contact_phone} />
                {r.customer_comments && <DataRow label="Comentarios" value={r.customer_comments} />}
              </dl>
            </CardContent>
          </Card>

          {atts.filter((a) => a.kind !== 'comprobante').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-navy-300" aria-hidden />
                  Fotografías
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {atts
                    .filter((a) => a.kind !== 'comprobante')
                    .map((a) => (
                      <a
                        key={a.id}
                        href={urls[a.storage_path] ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-video overflow-hidden rounded-lg border border-navy-100 bg-mist"
                      >
                        {urls[a.storage_path] && a.mime_type?.startsWith('image/') ? (
                          <Image
                            src={urls[a.storage_path]}
                            alt={a.file_name}
                            fill
                            sizes="200px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="grid h-full place-items-center p-2 text-center text-xs text-navy-500">
                            {a.file_name}
                          </span>
                        )}
                      </a>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Estado de la solicitud</CardTitle></CardHeader>
            <CardContent>
              <RequestTimeline
                history={(history ?? []) as RequestStatusHistory[]}
                currentStatus={r.status}
              />
            </CardContent>
          </Card>

          {!quotation && (
            <Notice tone="gold">
              Tu solicitud está en proceso de verificación. Te avisaremos cuando la cotización este
              lista.
            </Notice>
          )}

          <Card>
            <CardContent className="space-y-3">
              <WhatsAppButton
                message={waMessages.request(r.request_number)}
                number={settings?.whatsapp_number}
                label="Hablar con un asesor"
                fullWidth
              />
              <ButtonLink href="/portal/solicitudes/nueva" variant="secondary" fullWidth size="sm">
                Crear otra solicitud
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
