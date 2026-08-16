import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Copy, FileText } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRow, Notice } from '@/components/ui/misc';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatDate, formatGallons } from '@/lib/format';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';
import type { ServiceRequest } from '@/types';

export const metadata: Metadata = {
  title: 'Solicitud enviada',
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SolicitudEnviadaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  /**
   * Dos vias de acceso, ambas verificadas:
   *  - Invitado: debe presentar el access_token de su solicitud.
   *  - Cliente autenticado: se consulta con su propia sesión, y RLS garantiza
   *    que solo vea las suyas.
   * Un UUID de solicitud por si solo no basta para ver estos datos.
   */
  let request: Record<string, unknown> | null = null;

  if (token && UUID_RE.test(token)) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('service_requests')
      .select('*')
      .eq('id', id)
      .eq('access_token', token)
      .maybeSingle();
    request = data;
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from('service_requests').select('*').eq('id', id).maybeSingle();
    request = data;
  }

  if (!request) notFound();

  const settings = await getSettings().catch(() => null);
  const wa = settings?.whatsapp_number;
  const r = request as unknown as ServiceRequest;
  const location = [r.corregimiento, r.district, r.province].filter(Boolean).join(', ');
  const trackingHref = token ? `/s/${token}` : `/portal/solicitudes/${id}`;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-navy-100 bg-white">
        <div className="pes-container flex h-16 items-center sm:h-[72px]">
          <Logo height={40} />
        </div>
      </header>

      <main className="pes-container py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="pes-eyebrow text-emerald-700">Recibida</p>
            <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">Solicitud recibida</h1>
            <p className="mt-3 text-navy-600">
              Nuestro equipo verificará disponibilidad, precio y horario. Recibirás una notificación
              cuando tu cotización este lista.
            </p>
          </div>

          <div className="mt-8 rounded-card border-2 border-dashed border-gold-300 bg-gold-50 px-6 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">
              Número de solicitud
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-navy-900">
              {r.request_number}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold-800">
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Guarda este número para dar seguimiento
            </p>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumen de tu solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-navy-100">
                <DataRow label="Servicio" value={SERVICE_LABELS[r.service_type as 'diesel' | 'agua']} />
                <DataRow
                  label="Cantidad"
                  value={r.quantity_unknown ? 'Por definir con PES' : formatGallons(r.quantity_gal)}
                />
                <DataRow label="Instalación" value={r.facility_name} />
                <DataRow
                  label="Tipo de instalación"
                  value={FACILITY_LABELS[r.facility_type as keyof typeof FACILITY_LABELS]}
                />
                <DataRow label="Dirección" value={r.address_line} />
                <DataRow label="Ubicación" value={location} />
                <DataRow label="Fecha preferida" value={formatDate(r.preferred_date)} />
                <DataRow
                  label="Horario preferido"
                  value={TIME_SLOT_LABELS[r.preferred_time_slot ?? ''] ?? r.preferred_time_slot}
                />
                <DataRow label="Tipo de solicitud" value={r.urgency === 'urgente' ? 'Urgente' : 'Normal'} />
                <DataRow label="Estado" value="Solicitud recibida" />
              </dl>
            </CardContent>
          </Card>

          {token && (
            <Notice tone="gold" className="mt-6">
              Guarda este enlace para consultar el estado y responder tu cotización sin crear cuenta:{' '}
              <Link href={trackingHref} className="font-semibold underline">
                ver mi solicitud
              </Link>
              . También te lo enviamos a tu correo.
            </Notice>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton
              message={waMessages.request(r.request_number)}
              number={wa}
              label="Hablar con un asesor por WhatsApp"
              size="lg"
              fullWidth
            />
            <ButtonLink href={trackingHref} variant="secondary" size="lg" fullWidth>
              <FileText className="h-4 w-4" aria-hidden />
              Ver mi solicitud
            </ButtonLink>
          </div>

          {token && (
            <p className="mt-8 text-center text-sm text-navy-500">
              Quieres ver todo tu historial en un solo lugar?{' '}
              <Link href="/registro" className="font-semibold text-navy-800 hover:text-navy-600">
                Crea tu cuenta
              </Link>{' '}
              con el mismo correo y vincularemos tus solicitudes anteriores.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
