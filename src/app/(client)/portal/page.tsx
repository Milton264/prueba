import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, PlusCircle } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCardGrid } from '@/components/dashboard/metric-card';
import { ServiceDonut } from '@/components/dashboard/service-donut';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { RequestCard } from '@/components/request/request-card';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons } from '@/lib/format';
import { countByType, monthlyTrend } from '@/lib/dashboard-stats';
import { createClient } from '@/lib/supabase/server';
import { getMyClientProfile } from '@/lib/supabase/queries';
import type { ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Resumen' };

export default async function ClientDashboard() {
  const profile = await getMyClientProfile();
  const supabase = await createClient();

  // Todas las solicitudes del cliente (RLS limita a las suyas) para métricas y gráficos.
  const { data: allRows } = await supabase
    .from('service_requests')
    .select('id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, address_line, created_at')
    .order('created_at', { ascending: false });

  const all = (allRows ?? []) as (ServiceRequest & { created_at: string })[];
  const recientes = all.slice(0, 6);

  // Métricas
  const activas = all.filter((r) =>
    ['solicitud_recibida', 'verificando_disponibilidad', 'cotizacion_enviada', 'cambios_solicitados'].includes(r.status),
  ).length;
  const aprobadas = all.filter((r) => ['cotizacion_aprobada', 'servicio_programado'].includes(r.status)).length;
  const completadas = all.filter((r) => r.status === 'servicio_completado').length;

  const { count: cotizPend } = await supabase
    .from('quotations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent');

  const porTipo = countByType(all);
  const tendencia = monthlyTrend(all, 6);

  return (
    <div className="space-y-6">
      {/* Banda de bienvenida (rescatada del prototipo del portal) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-6 py-7 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-gold-400/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-24 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-eyebrow text-gold-400">Portal del cliente</p>
            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
              Hola, {profile?.full_name?.split(' ')[0] ?? 'bienvenido'}
            </h1>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-navy-200">
              Solicita diésel o agua potable y da seguimiento a tus pedidos, todo desde un solo lugar.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {['Rápido', 'Confiable', 'Seguro'].map((t) => (
                <li key={t} className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-wide2 text-navy-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink href="/portal/solicitudes/nueva">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Solicitar servicio
            </ButtonLink>
            <ButtonLink href="/portal/solicitudes" variant="ghost" className="border border-white/25 text-white hover:bg-white/10 hover:text-white">
              Ver mis pedidos
            </ButtonLink>
          </div>
        </div>
      </div>

      <MetricCardGrid
        metrics={[
          { label: 'Solicitudes activas', value: activas, sublabel: 'En curso', icon: 'clipboard', tone: 'navy', href: '/portal/solicitudes' },
          { label: 'Cotizaciones', value: cotizPend ?? 0, sublabel: 'Pendientes de respuesta', icon: 'receipt', tone: 'gold', href: '/portal/cotizaciones' },
          { label: 'Pedidos aprobados', value: aprobadas, sublabel: 'Programados', icon: 'package', tone: 'sky' },
          { label: 'Entregas completadas', value: completadas, sublabel: 'Total', icon: 'truck', tone: 'green' },
        ]}
      />

      {(cotizPend ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold-200 bg-gold-50 px-5 py-4">
          <p className="text-sm text-gold-900">
            Tienes {cotizPend} {cotizPend === 1 ? 'cotización pendiente' : 'cotizaciones pendientes'} de respuesta.
          </p>
          <ButtonLink href="/portal/cotizaciones" size="sm">Revisar ahora</ButtonLink>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Solicitudes recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Solicitudes recientes</CardTitle>
            <Link href="/portal/solicitudes" className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-500">
              Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardHeader>

          {recientes.length === 0 ? (
            <EmptyState
              title="Aún no tienes solicitudes"
              description="Envía tu primera solicitud de diésel o agua potable y nuestro equipo te responderá con una cotización."
              actionLabel="Crear solicitud"
              actionHref="/portal/solicitudes/nueva"
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {recientes.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/portal/solicitudes/${r.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-mist"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[13px] font-semibold text-navy-900">{r.request_number}</span>
                        <span className="text-[13px] text-navy-500">·</span>
                        <span className="truncate text-[13px] text-navy-600">
                          {r.quantity_unknown ? 'Cantidad por definir' : formatGallons(r.quantity_gal)} de {SERVICE_LABELS[r.service_type]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-navy-400">
                        {r.address_line || 'Sin dirección'} · {formatDateShort(r.preferred_date)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-navy-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Columna derecha: dona + tendencia */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por tipo</CardTitle>
            </CardHeader>
            <div className="px-5 py-6">
              <ServiceDonut diesel={porTipo.diesel} agua={porTipo.agua} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por mes</CardTitle>
            </CardHeader>
            <div className="px-3 py-5">
              <TrendChart data={tendencia} color="#E0A402" height={170} />
            </div>
          </Card>
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  );
}
