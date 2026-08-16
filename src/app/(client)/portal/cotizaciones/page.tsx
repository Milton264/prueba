import type { Metadata } from 'next';
import Link from 'next/link';
import { ReceiptText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/misc';
import { QuotationStatusBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { QuotationPublic } from '@/types';

export const metadata: Metadata = { title: 'Cotizaciones' };

export default async function CotizacionesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('quotations_public')
    .select('*, service_requests(id, request_number, service_type)')
    .neq('status', 'superseded')
    .order('created_at', { ascending: false });

  const list = (data ?? []) as (QuotationPublic & {
    service_requests: { id: string; request_number: string } | null;
  })[];

  const pending = list.filter((q) => q.status === 'sent');

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Revisa, aprueba o solicita cambios en las cotizaciones que PES te ha enviado."
      />

      {pending.length > 0 && (
        <div className="mb-5 rounded-card border border-gold-200 bg-gold-50 px-5 py-4 text-sm text-gold-900">
          Tienes {pending.length} {pending.length === 1 ? 'cotización pendiente' : 'cotizaciones pendientes'} de
          respuesta.
        </div>
      )}

      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Aún no tienes cotizaciones"
            description="Cuándo PES verifique la disponibilidad de tu solicitud, tu cotización aparecerá aquí."
            actionLabel="Crear solicitud"
            actionHref="/portal/solicitudes/nueva"
          />
        ) : (
          <TableWrapper>
            <Table>
              <Thead>
                <tr>
                  <Th>Cotización</Th>
                  <Th>Solicitud</Th>
                  <Th>Total</Th>
                  <Th>Fecha propuesta</Th>
                  <Th>Vigencia</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </Thead>
              <tbody>
                {list.map((q) => (
                  <Tr key={q.id}>
                    <Td className="font-semibold text-navy-900">{q.quotation_number}</Td>
                    <Td>{q.service_requests?.request_number ?? '-'}</Td>
                    <Td className="font-medium">{formatCurrency(Number(q.total))}</Td>
                    <Td>{formatDateShort(q.proposed_date)}</Td>
                    <Td>{formatDateShort(q.valid_until)}</Td>
                    <Td><QuotationStatusBadge status={q.status} /></Td>
                    <Td className="text-right">
                      <Link
                        href={`/portal/solicitudes/${q.service_request_id}`}
                        className="text-sm font-medium text-navy-700 hover:text-navy-500"
                      >
                        {q.status === 'sent' ? 'Revisar' : 'Ver'}
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>
    </div>
  );
}
