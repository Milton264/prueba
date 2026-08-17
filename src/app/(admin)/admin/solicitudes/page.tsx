import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader, Pagination } from '@/components/ui/misc';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { RequestFilters } from '@/components/request/request-filters';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons, formatRelative } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Solicitudes' };

const PAGE_SIZE = 15;

type SearchParams = {
  page?: string;
  estado?: string;
  servicio?: string;
  desde?: string;
  hasta?: string;
  q?: string;
  urgencia?: string;
};

async function RequestsTable({ params }: { params: SearchParams }) {
  const page = Math.max(1, Number(params.page ?? 1));
  const supabase = await createClient();

  let query = supabase
    .from('service_requests')
    .select(
      'id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, province, district, created_at, client_profiles(full_name, company_name)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (params.estado) query = query.eq('status', params.estado);
  if (params.servicio) query = query.eq('service_type', params.servicio);
  if (params.urgencia) query = query.eq('urgency', params.urgencia);
  if (params.desde) query = query.gte('preferred_date', params.desde);
  if (params.hasta) query = query.lte('preferred_date', params.hasta);
  if (params.q) query = query.ilike('request_number', `%${params.q}%`);

  const { data, count } = await query;
  const list = (data ?? []) as unknown as {
    id: string;
    request_number: string;
    service_type: 'diesel' | 'agua';
    quantity_gal: number | null;
    quantity_unknown: boolean;
    preferred_date: string | null;
    status: Parameters<typeof StatusBadge>[0]['status'];
    urgency: 'normal' | 'urgente';
    province: string;
    created_at: string;
    client_profiles: { full_name: string; company_name: string | null } | null;
  }[];

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const qs = new URLSearchParams(
    Object.entries(params).filter(([k, v]) => k !== 'page' && v) as [string, string][],
  ).toString();

  if (list.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No hay solicitudes con estos filtros"
          description="Ajusta los criterios de busqueda para ver mas resultados."
        />
      </Card>
    );
  }

  return (
    <Card>
      <TableWrapper>
        <Table className="min-w-[900px]">
          <Thead>
            <tr>
              <Th>Número</Th>
              <Th>Cliente</Th>
              <Th>Servicio</Th>
              <Th>Cantidad</Th>
              <Th>Provincia</Th>
              <Th>Fecha solicitada</Th>
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
                <Td>{SERVICE_LABELS[r.service_type]}</Td>
                <Td>{r.quantity_unknown ? 'Por definir' : formatGallons(r.quantity_gal)}</Td>
                <Td className="text-navy-500">{r.province}</Td>
                <Td>{formatDateShort(r.preferred_date)}</Td>
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
      <Pagination page={page} totalPages={totalPages} baseUrl={`/admin/solicitudes${qs ? `?${qs}` : ''}`} />
    </Card>
  );
}

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_user_id', user.id)
      .eq('type', 'nueva_solicitud')
      .is('read_at', null);
  }

  return (
    <div>
      <PageHeader title="Solicitudes" description="Gestiona todas las solicitudes recibidas." />
      <Suspense fallback={null}>
        <RequestFilters />
      </Suspense>
      <Suspense fallback={<Card><TableSkeleton /></Card>}>
        <RequestsTable params={params} />
      </Suspense>
    </div>
  );
}
