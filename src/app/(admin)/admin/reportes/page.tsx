import type { Metadata } from 'next';
import { BarChart3, Droplets, Fuel, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricRow } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/misc';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { ReportFilters } from './report-filters';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { one } from '@/lib/utils';
import type { Quotation, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Reportes' };

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const supabase = await createClient();

  let rq = supabase
    .from('service_requests')
    .select('id, service_type, quantity_gal, final_quantity_gal, status, created_at, client_profile_id');
  if (desde) rq = rq.gte('created_at', `${desde}T00:00:00`);
  if (hasta) rq = rq.lte('created_at', `${hasta}T23:59:59`);

  let qq = supabase.from('quotations').select('id, status, total, created_at, quotation_internal(estimated_profit)');
  if (desde) qq = qq.gte('created_at', `${desde}T00:00:00`);
  if (hasta) qq = qq.lte('created_at', `${hasta}T23:59:59`);

  const [{ data: requests }, { data: quotations }] = await Promise.all([rq, qq]);

  const rs = (requests ?? []) as ServiceRequest[];
  const qs = (quotations ?? []) as unknown as Quotation[];

  const dieselGal = rs.filter((r) => r.service_type === 'diesel')
    .reduce((s, r) => s + (r.final_quantity_gal ?? r.quantity_gal ?? 0), 0);
  const aguaGal = rs.filter((r) => r.service_type === 'agua')
    .reduce((s, r) => s + (r.final_quantity_gal ?? r.quantity_gal ?? 0), 0);

  const approved = qs.filter((q) => q.status === 'approved');
  const rejected = qs.filter((q) => q.status === 'rejected');
  const ventas = approved.reduce((s, q) => s + Number(q.total), 0);
  const ganancia = approved.reduce((s, q) => s + Number(one(q.quotation_internal)?.estimated_profit ?? 0), 0);

  // Solicitudes por mes
  const byMonth = new Map<string, number>();
  for (const r of rs) {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }
  const monthRows = [...byMonth.entries()].sort().map(([key, count]) => {
    const [y, m] = key.split('-');
    return { label: `${MONTHS[Number(m)]} ${y}`, count };
  });
  const maxMonth = Math.max(1, ...monthRows.map((m) => m.count));

  // Clientes recurrentes: mas de una solicitud en el periodo
  const perClient = new Map<string, number>();
  for (const r of rs) perClient.set(r.client_profile_id, (perClient.get(r.client_profile_id) ?? 0) + 1);
  const recurrentes = [...perClient.values()].filter((n) => n > 1).length;

  const dieselCount = rs.filter((r) => r.service_type === 'diesel').length;
  const aguaCount = rs.filter((r) => r.service_type === 'agua').length;

  return (
    <div>
      <PageHeader eyebrow="Panel administrativo" title="Reportes" description="Resumen operativo y comercial de PES." />

      <ReportFilters />

      <MetricRow
        className="mt-6"
        metrics={[
          { label: 'Solicitudes', value: rs.length, hint: 'En el periodo' },
          { label: 'Galones diésel', value: formatNumber(dieselGal) },
          { label: 'Galones agua', value: formatNumber(aguaGal) },
          { label: 'Clientes recurrentes', value: recurrentes, hint: 'Más de una solicitud' },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Solicitudes por mes</CardTitle></CardHeader>
          <CardContent>
            {monthRows.length === 0 ? (
              <p className="text-sm text-navy-500">Sin datos en el periodo seleccionado.</p>
            ) : (
              <ul className="space-y-3">
                {monthRows.map((m) => (
                  <li key={m.label} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-navy-500">{m.label}</span>
                    <span className="h-6 flex-1 overflow-hidden rounded bg-mist">
                      <span
                        className="block h-full rounded bg-navy-700"
                        style={{ width: `${(m.count / maxMonth) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-sm font-semibold text-navy-900">
                      {m.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Solicitudes por servicio</CardTitle></CardHeader>
          <CardContent>
            <TableWrapper>
              <Table className="min-w-0">
                <Thead>
                  <tr>
                    <Th>Servicio</Th>
                    <Th className="text-right">Solicitudes</Th>
                    <Th className="text-right">Galones</Th>
                    <Th className="text-right">Participación</Th>
                  </tr>
                </Thead>
                <tbody>
                  <Tr>
                    <Td>{SERVICE_LABELS.diesel}</Td>
                    <Td className="text-right">{dieselCount}</Td>
                    <Td className="text-right">{formatNumber(dieselGal)}</Td>
                    <Td className="text-right">
                      {rs.length ? `${Math.round((dieselCount / rs.length) * 100)}%` : '0%'}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>{SERVICE_LABELS.agua}</Td>
                    <Td className="text-right">{aguaCount}</Td>
                    <Td className="text-right">{formatNumber(aguaGal)}</Td>
                    <Td className="text-right">
                      {rs.length ? `${Math.round((aguaCount / rs.length) * 100)}%` : '0%'}
                    </Td>
                  </Tr>
                </tbody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      </div>

      <MetricRow
        className="mt-8"
        metrics={[
          { label: 'Cotiz. aprobadas', value: approved.length },
          { label: 'Cotiz. rechazadas', value: rejected.length },
          { label: 'Ventas totales', value: formatCurrency(ventas), hint: 'Cotizaciones aprobadas' },
          { label: 'Ganancia estimada', value: formatCurrency(ganancia), accent: true },
        ]}
      />

      <p className="mt-6 text-xs text-navy-300">
        Las cifras de ventas y ganancia corresponden a cotizaciones aprobadas. En esta versión la
        plataforma no procesa facturación ni pagos.
      </p>
    </div>
  );
}
