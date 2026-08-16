import type { Metadata } from 'next';
import Link from 'next/link';
import { ReceiptText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/misc';
import { QuotationStatusBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { QUOTATION_STATUS_LABELS } from '@/lib/status';
import { createClient } from '@/lib/supabase/server';
import { cn, one } from '@/lib/utils';
import type { Quotation, QuotationStatus } from '@/types';

export const metadata: Metadata = { title: 'Cotizaciones' };

const FILTERS: { key: string; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'draft', label: 'Borradores' },
  { key: 'sent', label: 'Enviadas' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'changes_requested', label: 'Con cambios' },
  { key: 'rejected', label: 'Rechazadas' },
];

export default async function AdminCotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('quotations')
    .select('*, quotation_internal(estimated_profit), service_requests(id, request_number, client_profiles(full_name, company_name))')
    .order('created_at', { ascending: false })
    .limit(100);

  if (estado) query = query.eq('status', estado as QuotationStatus);

  const { data } = await query;
  const list = (data ?? []) as unknown as (Quotation & {
    service_requests: {
      id: string;
      request_number: string;
      client_profiles: { full_name: string; company_name: string | null } | null;
    } | null;
  })[];

  return (
    <div>
      <PageHeader title="Cotizaciones" description="Todas las cotizaciones generadas por PES." />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key || 'todas'}
            href={f.key ? `/admin/cotizaciones?estado=${f.key}` : '/admin/cotizaciones'}
            className={cn(
              'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              (estado ?? '') === f.key
                ? 'bg-navy-800 text-white'
                : 'border border-navy-100 bg-white text-navy-600 hover:bg-mist',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No hay cotizaciones con este filtro"
            description="Genera una cotización desde el detalle de una solicitud."
          />
        ) : (
          <TableWrapper>
            <Table className="min-w-[920px]">
              <Thead>
                <tr>
                  <Th>Cotización</Th>
                  <Th>Solicitud</Th>
                  <Th>Cliente</Th>
                  <Th>Total</Th>
                  <Th>Ganancia PES</Th>
                  <Th>Vigencia</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </Thead>
              <tbody>
                {list.map((q) => (
                  <Tr key={q.id}>
                    <Td className="font-semibold text-navy-900">
                      {q.quotation_number}
                      <span className="ml-2 text-xs font-normal text-navy-300">v{q.version}</span>
                    </Td>
                    <Td>
                      {q.service_requests ? (
                        <Link href={`/admin/solicitudes/${q.service_requests.id}`} className="text-navy-700 hover:text-navy-500">
                          {q.service_requests.request_number}
                        </Link>
                      ) : '-'}
                    </Td>
                    <Td>
                      <span className="block">{q.service_requests?.client_profiles?.full_name ?? '-'}</span>
                      {q.service_requests?.client_profiles?.company_name && (
                        <span className="block text-xs text-navy-500">
                          {q.service_requests.client_profiles.company_name}
                        </span>
                      )}
                    </Td>
                    <Td className="font-medium">{formatCurrency(Number(q.total))}</Td>
                    <Td className={Number(one(q.quotation_internal)?.estimated_profit ?? 0) < 0 ? 'text-red-600' : 'text-emerald-600'}>
                      {formatCurrency(Number(one(q.quotation_internal)?.estimated_profit ?? 0))}
                    </Td>
                    <Td>{formatDateShort(q.valid_until)}</Td>
                    <Td><QuotationStatusBadge status={q.status} /></Td>
                    <Td className="text-right">
                      <Link href={`/admin/cotizaciones/${q.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                        {q.status === 'draft' ? 'Editar' : 'Ver'}
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>

      <p className="mt-4 text-xs text-navy-300">
        Estados: {Object.values(QUOTATION_STATUS_LABELS).join(' · ')}
      </p>
    </div>
  );
}
