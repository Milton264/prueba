import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { DataRow, Notice } from '@/components/ui/misc';
import { RequestTimeline } from '@/components/ui/timeline';
import { QuotationClientView } from '@/components/quotation/quotation-client-view';
import { GuestQuotationActions } from './guest-actions';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { createAdminClient } from '@/lib/supabase/admin';
import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime, formatGallons } from '@/lib/format';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';
import type { QuotationItem, QuotationPublic, RequestStatusHistory, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Mi solicitud', robots: { index: false, follow: false } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Acceso del invitado por enlace firmado.
 * Resuelto con la funcion RPC get_request_by_token, que devuelve únicamente
 * los campos publicos: nunca costos de proveedor, margenes ni notas internas.
 */
export default async function GuestRequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_request_by_token', { p_token: token });
  if (error || !data) notFound();

  const payload = data as {
    request: ServiceRequest;
    client: { full_name: string; company_name: string | null; email: string };
    history: RequestStatusHistory[];
    quotation: QuotationPublic | null;
    quotation_items: QuotationItem[];
  };

  const r = payload.request;
  const settings = await getSettings().catch(() => null);
  const location = [r.corregimiento, r.district, r.province].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-navy-100 bg-white">
        <div className="pes-container flex h-16 items-center justify-between sm:h-[72px]">
          <Logo height={40} />
          <Link href="/registro" className="text-sm font-medium text-navy-700 hover:text-navy-500">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="pes-container py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Solicitud {r.request_number}</h1>
              <p className="mt-1 text-sm text-navy-500">
                Enviada el {formatDateTime(r.created_at)} por {payload.client.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              {r.urgency === 'urgente' && <UrgencyBadge urgency="urgente" />}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {payload.quotation ? (
                <>
                  <QuotationClientView
                    quotation={payload.quotation}
                    items={payload.quotation_items ?? []}
                    requestNumber={r.request_number}
                    serviceLabel={SERVICE_LABELS[r.service_type]}
                  />
                  <GuestQuotationActions
                    token={token}
                    quotationId={payload.quotation.id}
                    quotationNumber={payload.quotation.quotation_number}
                    status={payload.quotation.status}
                    whatsappNumber={settings?.whatsapp_number}
                  />
                </>
              ) : (
                <Notice tone="gold">
                  Tu solicitud está en proceso de verificación. Nuestro equipo revisara disponibilidad,
                  precio y horario, y te enviaremos la cotización.
                </Notice>
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
                    <DataRow label="Instalación" value={r.facility_name} />
                    <DataRow label="Tipo de instalación" value={FACILITY_LABELS[r.facility_type]} />
                    <DataRow label="Dirección" value={r.address_line} />
                    <DataRow label="Ubicación" value={location} />
                    <DataRow label="Fecha preferida" value={formatDate(r.preferred_date)} />
                    <DataRow
                      label="Horario preferido"
                      value={TIME_SLOT_LABELS[r.preferred_time_slot ?? ''] ?? r.preferred_time_slot}
                    />
                    <DataRow label="Recibe" value={r.contact_name} />
                    {r.status === 'servicio_completado' && (
                      <>
                        <DataRow label="Cantidad final entregada" value={formatGallons(r.final_quantity_gal)} />
                        <DataRow label="Fecha de entrega" value={formatDateTime(r.completed_at)} />
                      </>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Estado</CardTitle></CardHeader>
                <CardContent>
                  <RequestTimeline history={payload.history ?? []} currentStatus={r.status} />
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <WhatsAppButton
                    message={waMessages.request(r.request_number)}
                    number={settings?.whatsapp_number}
                    label="Hablar con un asesor"
                    fullWidth
                  />
                </CardContent>
              </Card>

              <Notice tone="info">
                Crea una cuenta con el correo {payload.client.email} y vincularemos automáticamente
                todas tus solicitudes anteriores.{' '}
                <Link href="/registro" className="font-semibold underline">Crear cuenta</Link>
              </Notice>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
