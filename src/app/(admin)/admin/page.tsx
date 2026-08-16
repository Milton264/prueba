import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/misc';
import { MetricCardGrid } from '@/components/dashboard/metric-card';
import { ServiceDonut } from '@/components/dashboard/service-donut';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons, formatRelative } from '@/lib/format';
import { countByType, monthlyTrend } from '@/lib/dashboard-stats';
import { createClient } from '@/lib/supabase/server';
import type { ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Todas las solicitudes (admin ve todo por RLS) para métricas y gráficos.
  const { data: allRows } = await supabase
    .from('service_requests')
    .select('id, service_type, status, created_at')
    .order('created_at', { ascending: false });

  const all = (allRows ?? []) as { service_type: string; status: string; created_at: string }[];

  const solicitudesMes = all.filter((r) => sameMonth(r.created_at)).length;
  const programados = all.filter((r) => r.status === 'servicio_programado').length;
  const completadas = all.filter((r) => r.status === 'servicio_completado');
  const completadasMes = completadas.filter((r) => sameMonth(r.created_at)).length;

  const { count: cotPendientes } = await supabase
    .from('quotations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent');

  const porTipo = countByType(all);
  const tendenciaEntregas = monthlyTrend(completadas, 6);

  // Solicitudes recientes con datos del cliente
  const { data: recent } = await supabase
    .from('service_requests')
    .select(
      'id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, address_line, province, created_at, client_profiles(full_name, company_name)',
    )
    .order('created_at', { ascending: false })
    .limit(8);

  const list = (recent ?? []) as unknown as (ServiceRequest & {
    client_profiles: { full_name: string; company_name: string | null } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel administrativo"
        title="Dashboard"
        description="Resumen operativo de Panama Energy Solutions."
      />

      <MetricCardGrid
        metrics={[
          { label: 'Solicitudes', value: solicitudesMes, sublabel: 'Este mes', icon: 'clipboard', tone: 'navy', href: '/admin/solicitudes' },
          { label: 'Cotizaciones', value: cotPendientes ?? 0, sublabel: 'Pendientes', icon: 'receipt', tone: 'gold', href: '/admin/cotizaciones?estado=sent' },
          { label: 'Pedidos confirmados', value: programados, sublabel: 'Programados', icon: 'package', tone: 'sky', href: '/admin/solicitudes?estado=servicio_programado' },
          { label: 'Entregas completadas', value: completadasMes, sublabel: 'Este mes', icon: 'truck', tone: 'green', href: '/admin/solicitudes?estado=servicio_completado' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Solicitudes recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Solicitudes recientes</CardTitle>
            <Link href="/admin/solicitudes" className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-500">
              Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardHeader>

          {list.length === 0 ? (
            <EmptyState title="Sin solicitudes registradas" description="Las nuevas solicitudes aparecerán aquí." />
          ) : (
            <TableWrapper>
              <Table className="min-w-[720px]">
                <Thead>
                  <tr>
                    <Th>Número</Th>
                    <Th>Cliente</Th>
                    <Th>Servicio</Th>
                    <Th>Ubicación</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">Acción</Th>
                  </tr>
                </Thead>
                <tbody>
                  {list.map((r) => (
                    <Tr key={r.id}>
                      <Td className="font-semibold text-navy-900">
                        {r.request_number}
                        {r.urgency === 'urgente' && <span className="ml-2"><UrgencyBadge urgency="urgente" /></span>}
                        <span className="mt-0.5 block text-xs font-normal text-navy-300">
                          {formatRelative(r.created_at)}
                        </span>
                      </Td>
                      <Td>
                        <span className="block font-medium text-navy-900">{r.client_profiles?.full_name ?? '-'}</span>
                        {r.client_profiles?.company_name && (
                          <span className="block text-xs text-navy-500">{r.client_profiles.company_name}</span>
                        )}
                      </Td>
                      <Td>
                        {SERVICE_LABELS[r.service_type]}
                        <span className="block text-xs text-navy-400">
                          {r.quantity_unknown ? 'Por definir' : formatGallons(r.quantity_gal)}
                        </span>
                      </Td>
                      <Td className="max-w-[160px] truncate text-navy-500">{r.province}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td className="text-right">
                        <Link href={`/admin/solicitudes/${r.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                          Gestionar
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </Card>

        {/* Columna derecha */}
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
              <CardTitle>Entregas por mes</CardTitle>
            </CardHeader>
            <div className="px-3 py-5">
              <TrendChart data={tendenciaEntregas} color="#264873" height={170} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function sameMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
