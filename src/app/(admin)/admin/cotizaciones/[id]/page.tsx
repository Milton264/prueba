import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuotationStatusBadge } from '@/components/ui/badge';
import { DataRow, Notice, PageHeader } from '@/components/ui/misc';
import { QuotationClientView } from '@/components/quotation/quotation-client-view';
import { QuotationBuilder } from '@/components/quotation/quotation-builder';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { one } from '@/lib/utils';
import type { Quotation, QuotationItem, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Cotización' };

export default async function AdminCotizacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('quotations')
    .select('*, service_requests(*), quotation_internal(*)')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();

  const q = data as unknown as Quotation & { service_requests: ServiceRequest };
  const internal = one(q.quotation_internal);
  const r = q.service_requests;

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', id)
    .order('sort_order');

  // Un borrador se sigue editando; una cotización enviada es de solo lectura.
  if (q.status === 'draft') {
    return (
      <div>
        <PageHeader
          title={`Editar ${q.quotation_number}`}
          description={`Borrador para la solicitud ${r.request_number}`}
          backHref={`/admin/solicitudes/${r.id}`}
        >
          <QuotationStatusBadge status={q.status} />
        </PageHeader>

        <QuotationBuilder
          requestId={r.id}
          requestNumber={r.request_number}
          serviceType={r.service_type}
          defaultQuantity={q.quantity_gal ?? r.quantity_gal}
          defaultTaxRate={Number(q.tax_rate)}
          defaultPaymentTerms={q.payment_terms}
          existing={{ ...q, quotation_internal: internal }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={q.quotation_number}
        description={`Solicitud ${r.request_number} · version ${q.version}`}
        backHref={`/admin/solicitudes/${r.id}`}
      >
        <QuotationStatusBadge status={q.status} />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <QuotationClientView
            quotation={q}
            items={(items ?? []) as QuotationItem[]}
            requestNumber={r.request_number}
            serviceLabel={SERVICE_LABELS[r.service_type]}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-navy-300" aria-hidden />
                Detalle interno
              </CardTitle>
              <span className="border border-navy-200 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide2 text-navy-500">
                Solo PES
              </span>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-navy-100">
                <DataRow label="Costo del proveedor" value={formatCurrency(Number(internal?.supplier_cost ?? 0))} />
                <DataRow label="Costo de transporte" value={formatCurrency(Number(internal?.transport_cost ?? 0))} />
                <DataRow label="Otros costos" value={formatCurrency(Number(internal?.other_costs ?? 0))} />
                <DataRow label="Margen por galón" value={formatCurrency(Number(internal?.margin_per_gallon ?? 0))} />
                <DataRow label="Margen fijo" value={formatCurrency(Number(internal?.margin_fixed ?? 0))} />
                <div className="flex items-baseline justify-between gap-2 pt-3">
                  <dt className="font-semibold text-navy-900">Ganancia estimada</dt>
                  <dd className={`text-lg font-bold ${Number(internal?.estimated_profit ?? 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(Number(internal?.estimated_profit ?? 0))}
                  </dd>
                </div>
              </dl>

              {internal?.internal_notes && (
                <p className="mt-4 whitespace-pre-line rounded-lg bg-mist px-4 py-3 text-sm text-navy-700">
                  {internal.internal_notes}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trazabilidad</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y divide-navy-100">
                <DataRow label="Creada" value={formatDateTime(q.created_at)} />
                <DataRow label="Enviada al cliente" value={q.sent_at ? formatDateTime(q.sent_at) : 'Sin enviar'} />
                <DataRow label="Respuesta del cliente" value={q.responded_at ? formatDateTime(q.responded_at) : 'Sin respuesta'} />
              </dl>
            </CardContent>
          </Card>

          {q.status === 'changes_requested' && (
            <Notice tone="warning">
              El cliente solicito cambios.{' '}
              <Link href={`/admin/cotizaciones/nueva?requestId=${r.id}`} className="font-semibold underline">
                Crear nueva version
              </Link>
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
}
