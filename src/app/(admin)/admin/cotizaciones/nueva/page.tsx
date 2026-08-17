import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageHeader, Notice } from '@/components/ui/misc';
import { QuotationBuilder } from '@/components/quotation/quotation-builder';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatGallons } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/supabase/queries';
import type { OperatorInformation, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Nueva cotización' };

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;
  if (!requestId) redirect('/admin/solicitudes');

  const supabase = await createClient();
  const { data: request } = await supabase
    .from('service_requests')
    .select('*, client_profiles(full_name, company_name)')
    .eq('id', requestId)
    .maybeSingle();

  if (!request) notFound();
  const r = request as ServiceRequest & { client_profiles: { full_name: string; company_name: string | null } | null };

  const [{ data: operator }, settings] = await Promise.all([
    supabase.from('internal_operator_information').select('*').eq('service_request_id', requestId).maybeSingle(),
    getSettings().catch(() => null),
  ]);

  const op = operator as OperatorInformation | null;

  return (
    <div>
      <PageHeader
        title={`Nueva cotización para ${r.request_number}`}
        description={`${r.client_profiles?.full_name ?? ''} · ${SERVICE_LABELS[r.service_type]} · ${
          r.quantity_unknown ? 'cantidad por definir' : formatGallons(r.quantity_gal)
        }`}
        backHref={`/admin/solicitudes/${r.id}`}
      />

      {r.quantity_unknown && (
        <Notice tone="warning" className="mb-6">
          El cliente indicó que no conoce la capacidad exacta. Define la cantidad final a cotizar
          antes de enviar.
        </Notice>
      )}

      {op?.availability !== 'si' && (
        <Notice tone="info" className="mb-6">
          La disponibilidad con el operador aún no está confirmada. Puedes preparar la cotización
          como borrador y enviarla cuando tengas la confirmación.
        </Notice>
      )}

      <QuotationBuilder
        requestId={r.id}
        requestNumber={r.request_number}
        serviceType={r.service_type}
        defaultQuantity={r.quantity_gal}
        defaultTaxRate={Number(settings?.tax_rate ?? 0)}
        operatorCosts={{ supplier: op?.supplier_cost ?? null, transport: op?.transport_cost ?? null }}
      />
    </div>
  );
}
