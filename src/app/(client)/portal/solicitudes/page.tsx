import type { Metadata } from 'next';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader, Pagination } from '@/components/ui/misc';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { RequestCard } from '@/components/request/request-card';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons } from '@/lib/format';
import { REQUEST_STATUS_LABELS } from '@/lib/status';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import type { RequestStatus, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Mis solicitudes' };

const PAGE_SIZE = 10;

const FILTERS: { key: string; label: string; statuses?: RequestStatus[] }[] = [
  { key: 'todas', label: 'Todas' },
  {
    key: 'activas',
    label: 'Activas',
    statuses: ['solicitud_recibida', 'verificando_disponibilidad', 'cotizacion_enviada', 'cambios_solicitados', 'cotizacion_aprobada', 'servicio_programado'],
  },
  { key: 'completadas', label: 'Completadas', statuses: ['servicio_completado'] },
  { key: 'cerradas', label: 'Cerradas', statuses: ['cotizacion_rechazada', 'solicitud_cancelada'] },
];

export default async function MisSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filtro?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const filterKey = params.filtro ?? 'todas';
  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];

  const supabase = await createClient();
  let query = supabase
    .from('service_requests')
    .select(
      'id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, address_line, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (filter.statuses) query = query.in('status', filter.statuses);

  const { data, count } = await query;
  const list = (data ?? []) as ServiceRequest[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Mis solicitudes" description="Historial completo de tus solicitudes con PES.">
        <ButtonLink href="/portal/solicitudes/nueva" size="sm">
          <PlusCircle className="h-4 w-4" aria-hidden />
          Nueva solicitud
        </ButtonLink>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/portal/solicitudes?filtro=${f.key}`}
            className={cn(
              'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              f.key === filterKey
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
            title="No hay solicitudes en esta vista"
            description="Cuando envíes una solicitud aparecerá aquí con su estado actualizado."
            actionLabel="Crear solicitud"
            actionHref="/portal/solicitudes/nueva"
          />
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {list.map((r) => (
                <RequestCard key={r.id} request={r} href={`/portal/solicitudes/${r.id}`} />
              ))}
            </div>

            <TableWrapper className="hidden md:block">
              <Table>
                <Thead>
                  <tr>
                    <Th>Número</Th>
                    <Th>Servicio</Th>
                    <Th>Cantidad</Th>
                    <Th>Fecha</Th>
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
                      </Td>
                      <Td>{SERVICE_LABELS[r.service_type]}</Td>
                      <Td>{r.quantity_unknown ? 'Por definir' : formatGallons(r.quantity_gal)}</Td>
                      <Td>{formatDateShort(r.preferred_date)}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td className="text-right">
                        <Link href={`/portal/solicitudes/${r.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                          Ver detalles
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <Pagination page={page} totalPages={totalPages} baseUrl={`/portal/solicitudes?filtro=${filterKey}`} />
          </>
        )}
      </Card>

      <p className="mt-4 text-xs text-navy-300">
        Estados posibles: {Object.values(REQUEST_STATUS_LABELS).join(' · ')}
      </p>
    </div>
  );
}
