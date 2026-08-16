import { CalendarDays, Clock, CreditCard, FileText } from 'lucide-react';
import { QuotationStatusBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRow, Notice } from '@/components/ui/misc';
import { TIME_SLOT_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, formatGallons, formatPercent } from '@/lib/format';
import type { QuotationItem, QuotationPublic } from '@/types';

/**
 * Vista de la cotización para el cliente.
 * Solo recibe datos de la vista SQL quotations_public: los costos del proveedor,
 * los margenes de PES y las observaciones internas no existen en este objeto.
 */
export function QuotationClientView({
  quotation,
  items,
  requestNumber,
  serviceLabel,
}: {
  quotation: QuotationPublic;
  items: QuotationItem[];
  requestNumber: string;
  serviceLabel: string;
}) {
  const subtotal =
    Number(quotation.product_subtotal) +
    Number(quotation.delivery_charge) +
    Number(quotation.urgency_surcharge) -
    Number(quotation.discount);

  const expired =
    quotation.valid_until && new Date(quotation.valid_until) < new Date(new Date().toDateString());

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Cotización {quotation.quotation_number}</CardTitle>
          <p className="mt-0.5 text-sm text-navy-500">Solicitud {requestNumber}</p>
        </div>
        <QuotationStatusBadge status={quotation.status} />
      </CardHeader>

      <CardContent className="space-y-6">
        {expired && quotation.status === 'sent' && (
          <Notice tone="warning">
            Esta cotización venció el {formatDate(quotation.valid_until)}. Comunícate con un asesor
            para solicitar una actualizacion.
          </Notice>
        )}

        {/* Detalle */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
            Detalle
          </h3>
          <dl className="divide-y divide-navy-100">
            <DataRow label="Servicio" value={serviceLabel} />
            <DataRow label="Cantidad cotizada" value={formatGallons(quotation.quantity_gal)} />
            {quotation.pricing_mode === 'por_galon' && quotation.price_per_gallon ? (
              <DataRow
                label="Precio por galón"
                value={formatCurrency(Number(quotation.price_per_gallon))}
              />
            ) : null}
          </dl>
        </div>

        {/* Conceptos */}
        {items.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
              Conceptos
            </h3>
            <div className="overflow-hidden rounded-lg border border-navy-100">
              <table className="w-full text-sm">
                <thead className="bg-mist">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Concepto</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-navy-500">Cant.</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-navy-500">P. unitario</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-navy-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-3 text-navy-900">{it.concept}</td>
                      <td className="px-4 py-3 text-right text-navy-600">
                        {Number(it.quantity).toLocaleString('es-PA')} {it.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-navy-600">
                        {formatCurrency(Number(it.unit_price))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-navy-900">
                        {formatCurrency(Number(it.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="rounded-lg bg-mist px-5 py-4">
          <dl className="space-y-1">
            <DataRow label="Costo del producto" value={formatCurrency(Number(quotation.product_subtotal))} className="py-1.5" />
            {Number(quotation.delivery_charge) > 0 && (
              <DataRow label="Transporte y entrega" value={formatCurrency(Number(quotation.delivery_charge))} className="py-1.5" />
            )}
            {Number(quotation.urgency_surcharge) > 0 && (
              <DataRow label="Recargo por urgencia" value={formatCurrency(Number(quotation.urgency_surcharge))} className="py-1.5" />
            )}
            {Number(quotation.discount) > 0 && (
              <DataRow label="Descuento" value={`- ${formatCurrency(Number(quotation.discount))}`} className="py-1.5" />
            )}
            <div className="my-2 border-t border-navy-100" />
            <DataRow label="Subtotal" value={formatCurrency(subtotal)} className="py-1.5" />
            {Number(quotation.tax_rate) > 0 && (
              <DataRow
                label={`Impuestos (${formatPercent(Number(quotation.tax_rate))})`}
                value={formatCurrency(Number(quotation.tax_amount))}
                className="py-1.5"
              />
            )}
            <div className="my-2 border-t border-navy-100" />
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <dt className="text-base font-semibold text-navy-900">Total</dt>
              <dd className="text-2xl font-bold tracking-tight text-navy-900">
                {formatCurrency(Number(quotation.total))}
              </dd>
            </div>
          </dl>
        </div>

        {/* Condiciones */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-navy-100 p-4">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" aria-hidden />
            <div>
              <p className="text-xs font-medium text-navy-500">Fecha propuesta</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                {formatDate(quotation.proposed_date)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-navy-100 p-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" aria-hidden />
            <div>
              <p className="text-xs font-medium text-navy-500">Horario propuesto</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                {TIME_SLOT_LABELS[quotation.proposed_time_slot ?? ''] ?? quotation.proposed_time_slot ?? '-'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-navy-100 p-4">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" aria-hidden />
            <div>
              <p className="text-xs font-medium text-navy-500">Condiciones de pago</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                {quotation.payment_terms ?? '-'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-navy-100 p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" aria-hidden />
            <div>
              <p className="text-xs font-medium text-navy-500">Vigencia</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                Hasta el {formatDate(quotation.valid_until)}
              </p>
            </div>
          </div>
        </div>

        {quotation.client_notes && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-300">Notas</h3>
            <p className="whitespace-pre-line rounded-lg bg-mist px-4 py-3 text-sm leading-relaxed text-navy-700">
              {quotation.client_notes}
            </p>
          </div>
        )}

        {quotation.client_response_message && (
          <Notice tone="warning">
            <strong>Cambios que solicitaste:</strong> {quotation.client_response_message}
          </Notice>
        )}

        {quotation.rejection_reason && (
          <Notice tone="danger">
            <strong>Motivo del rechazo:</strong> {quotation.rejection_reason}
          </Notice>
        )}
      </CardContent>
    </Card>
  );
}
