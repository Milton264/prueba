'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calculator, Eye, Lock, Save, Send, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { DataRow, Notice } from '@/components/ui/misc';
import { RadioCardGroup } from '@/components/ui/radio-card';
import { QuotationClientView } from './quotation-client-view';
import { saveQuotation, sendQuotation } from '@/lib/actions/quotations';
import { PAYMENT_TERMS_OPTIONS, SERVICE_LABELS, TIME_SLOTS } from '@/lib/constants';
import { formatCurrency, formatPercent } from '@/lib/format';
import { buildClientLineItems, calculateQuotation } from '@/lib/pricing';
import type { PricingMode, Quotation, QuotationItem, ServiceType } from '@/types';

interface Props {
  requestId: string;
  requestNumber: string;
  serviceType: ServiceType;
  defaultQuantity: number | null;
  defaultTaxRate: number;
  defaultPaymentTerms?: string | null;
  /** Costos ya registrados en la seccion del operador, para prellenar. */
  operatorCosts?: { supplier: number | null; transport: number | null };
  existing?: Quotation | null;
}

const n = (v: string) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export function QuotationBuilder({
  requestId,
  requestNumber,
  serviceType,
  defaultQuantity,
  defaultTaxRate,
  defaultPaymentTerms,
  operatorCosts,
  existing,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null);

  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    pricing_mode: (existing?.pricing_mode ?? 'por_galon') as PricingMode,
    quantity_gal: String(existing?.quantity_gal ?? defaultQuantity ?? ''),
    price_per_gallon: String(existing?.price_per_gallon ?? ''),
    fixed_amount: String(existing?.pricing_mode === 'monto_fijo' ? existing.product_subtotal : ''),
    delivery_charge: String(existing?.delivery_charge ?? ''),
    urgency_surcharge: String(existing?.urgency_surcharge ?? ''),
    discount: String(existing?.discount ?? ''),
    tax_rate: String(existing?.tax_rate ?? defaultTaxRate),
    supplier_cost: String(existing?.quotation_internal?.supplier_cost ?? operatorCosts?.supplier ?? ''),
    transport_cost: String(existing?.quotation_internal?.transport_cost ?? operatorCosts?.transport ?? ''),
    other_costs: String(existing?.quotation_internal?.other_costs ?? ''),
    margin_per_gallon: String(existing?.quotation_internal?.margin_per_gallon ?? ''),
    margin_fixed: String(existing?.quotation_internal?.margin_fixed ?? ''),
    internal_notes: existing?.quotation_internal?.internal_notes ?? '',
    proposed_date: existing?.proposed_date ?? '',
    proposed_time_slot: existing?.proposed_time_slot ?? '',
    payment_terms: existing?.payment_terms ?? defaultPaymentTerms ?? PAYMENT_TERMS_OPTIONS[0],
    valid_until: existing?.valid_until ?? in7,
    client_notes: existing?.client_notes ?? '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const calcInput = useMemo(
    () => ({
      pricingMode: form.pricing_mode,
      quantityGal: n(form.quantity_gal),
      pricePerGallon: n(form.price_per_gallon),
      fixedAmount: n(form.fixed_amount),
      deliveryCharge: n(form.delivery_charge),
      urgencySurcharge: n(form.urgency_surcharge),
      discount: n(form.discount),
      taxRate: n(form.tax_rate),
      supplierCost: n(form.supplier_cost),
      transportCost: n(form.transport_cost),
      otherCosts: n(form.other_costs),
      marginPerGallon: n(form.margin_per_gallon),
      marginFixed: n(form.margin_fixed),
    }),
    [form],
  );

  const calc = useMemo(() => calculateQuotation(calcInput), [calcInput]);
  const previewItems = useMemo(
    () =>
      buildClientLineItems(calcInput, SERVICE_LABELS[serviceType]).map((it, i) => ({
        id: `preview-${i}`,
        quotation_id: 'preview',
        sort_order: i,
        concept: it.concept,
        description: null,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unitPrice,
        subtotal: it.subtotal,
        is_taxable: true,
      })) as QuotationItem[],
    [calcInput, serviceType],
  );

  const payload = () => ({
    request_id: requestId,
    quotation_id: savedId ?? undefined,
    supplier_cost: n(form.supplier_cost),
    transport_cost: n(form.transport_cost),
    other_costs: n(form.other_costs),
    margin_per_gallon: n(form.margin_per_gallon),
    margin_fixed: n(form.margin_fixed),
    internal_notes: form.internal_notes,
    pricing_mode: form.pricing_mode,
    quantity_gal: n(form.quantity_gal),
    price_per_gallon: n(form.price_per_gallon),
    fixed_amount: n(form.fixed_amount),
    delivery_charge: n(form.delivery_charge),
    urgency_surcharge: n(form.urgency_surcharge),
    discount: n(form.discount),
    tax_rate: n(form.tax_rate),
    proposed_date: form.proposed_date,
    proposed_time_slot: form.proposed_time_slot,
    payment_terms: form.payment_terms,
    valid_until: form.valid_until,
    client_notes: form.client_notes,
  });

  const save = (then?: (id: string) => void) => {
    setError(null);
    startTransition(async () => {
      const result = await saveQuotation(payload());
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setSavedId(result.data!.id);
      toast.success(result.message ?? 'Cotización guardada.');
      router.refresh();
      then?.(result.data!.id);
    });
  };

  const send = () => {
    save((id) => {
      startTransition(async () => {
        const fd = new FormData();
        fd.append('quotation_id', id);
        const result = await sendQuotation(null, fd);
        if (!result.ok) {
          setError(result.error);
          toast.error(result.error);
          return;
        }
        toast.success(result.message ?? 'Cotización enviada.');
        setConfirmSend(false);
        router.refresh();
      });
    });
  };

  const profitTone = calc.estimatedProfit < 0 ? 'text-red-600' : 'text-emerald-600';

  return (
    <div className="space-y-6">
      {error && <Notice tone="danger">{error}</Notice>}

      {/* ---------- COSTOS INTERNOS ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-navy-300" aria-hidden />
            Costos internos
          </CardTitle>
          <span className="border border-navy-200 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide2 text-navy-500">
            El cliente no ve esta sección
          </span>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Costo del proveedor (USD)" htmlFor="supplier_cost">
            <Input id="supplier_cost" type="number" step="0.01" min="0" className="no-spinner" value={form.supplier_cost} onChange={(e) => set('supplier_cost', e.target.value)} />
          </Field>
          <Field label="Costo de transporte (USD)" htmlFor="transport_cost">
            <Input id="transport_cost" type="number" step="0.01" min="0" className="no-spinner" value={form.transport_cost} onChange={(e) => set('transport_cost', e.target.value)} />
          </Field>
          <Field label="Otros costos (USD)" htmlFor="other_costs">
            <Input id="other_costs" type="number" step="0.01" min="0" className="no-spinner" value={form.other_costs} onChange={(e) => set('other_costs', e.target.value)} />
          </Field>
          <Field label="Margen PES por galón (USD)" htmlFor="margin_per_gallon">
            <Input id="margin_per_gallon" type="number" step="0.0001" min="0" className="no-spinner" value={form.margin_per_gallon} onChange={(e) => set('margin_per_gallon', e.target.value)} />
          </Field>
          <Field label="Margen PES fijo (USD)" htmlFor="margin_fixed">
            <Input id="margin_fixed" type="number" step="0.01" min="0" className="no-spinner" value={form.margin_fixed} onChange={(e) => set('margin_fixed', e.target.value)} />
          </Field>
          <Field label="Notas internas" htmlFor="internal_notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="internal_notes" rows={2} value={form.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      {/* ---------- PRECIO AL CLIENTE ---------- */}
      <Card>
        <CardHeader><CardTitle>Precio al cliente</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <Field label="Modo de precio" required>
            <RadioCardGroup<PricingMode>
              name="pricing_mode"
              value={form.pricing_mode}
              onChange={(v) => set('pricing_mode', v)}
              options={[
                { value: 'por_galon', label: 'Por galón', description: 'El precio se multiplica por la cantidad cotizada.' },
                { value: 'monto_fijo', label: 'Monto fijo', description: 'Un solo monto por el servicio. Útil para agua por viaje.' },
              ]}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Cantidad a cotizar (galones)" htmlFor="quantity_gal" required>
              <Input id="quantity_gal" type="number" min="1" className="no-spinner" value={form.quantity_gal} onChange={(e) => set('quantity_gal', e.target.value)} />
            </Field>

            {form.pricing_mode === 'por_galon' ? (
              <Field label="Precio por galón (USD)" htmlFor="price_per_gallon" required>
                <Input id="price_per_gallon" type="number" step="0.0001" min="0" className="no-spinner" value={form.price_per_gallon} onChange={(e) => set('price_per_gallon', e.target.value)} />
              </Field>
            ) : (
              <Field label="Monto fijo del servicio (USD)" htmlFor="fixed_amount" required>
                <Input id="fixed_amount" type="number" step="0.01" min="0" className="no-spinner" value={form.fixed_amount} onChange={(e) => set('fixed_amount', e.target.value)} />
              </Field>
            )}

            <Field label="Transporte o cargo de entrega (USD)" htmlFor="delivery_charge">
              <Input id="delivery_charge" type="number" step="0.01" min="0" className="no-spinner" value={form.delivery_charge} onChange={(e) => set('delivery_charge', e.target.value)} />
            </Field>
            <Field label="Recargo por urgencia (USD)" htmlFor="urgency_surcharge">
              <Input id="urgency_surcharge" type="number" step="0.01" min="0" className="no-spinner" value={form.urgency_surcharge} onChange={(e) => set('urgency_surcharge', e.target.value)} />
            </Field>
            <Field label="Descuento (USD)" htmlFor="discount">
              <Input id="discount" type="number" step="0.01" min="0" className="no-spinner" value={form.discount} onChange={(e) => set('discount', e.target.value)} />
            </Field>
            <Field label="Impuesto" htmlFor="tax_rate" hint="Decimal. Ejemplo: 0.07 para 7%.">
              <Input id="tax_rate" type="number" step="0.0001" min="0" max="1" className="no-spinner" value={form.tax_rate} onChange={(e) => set('tax_rate', e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ---------- CALCULO ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-navy-300" aria-hidden />
            Calculo automático
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-300">
              Lo que verá el cliente
            </h3>
            <dl className="divide-y divide-navy-100">
              <DataRow label="Costo del producto" value={formatCurrency(calc.productSubtotal)} />
              <DataRow label="Transporte y entrega" value={formatCurrency(n(form.delivery_charge))} />
              <DataRow label="Recargo por urgencia" value={formatCurrency(n(form.urgency_surcharge))} />
              <DataRow label="Descuento" value={`- ${formatCurrency(n(form.discount))}`} />
              <DataRow label="Subtotal" value={formatCurrency(calc.subtotal)} />
              <DataRow label={`Impuestos (${formatPercent(n(form.tax_rate))})`} value={formatCurrency(calc.taxAmount)} />
              <div className="flex items-baseline justify-between gap-2 pt-3">
                <dt className="font-semibold text-navy-900">Total final</dt>
                <dd className="text-xl font-bold text-navy-900">{formatCurrency(calc.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-mist p-5">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300">
              <Lock className="h-3 w-3" aria-hidden />
              Solo PES
            </h3>
            <dl className="divide-y divide-navy-100">
              <DataRow label="Costo base" value={formatCurrency(calc.baseCost)} />
              <DataRow label="Margen PES configurado" value={formatCurrency(calc.pesMargin)} />
              <DataRow label="Total sugerido (costo + margen)" value={formatCurrency(calc.suggestedTotal)} />
              <div className="flex items-baseline justify-between gap-2 pt-3">
                <dt className="flex items-center gap-1.5 font-semibold text-navy-900">
                  {calc.estimatedProfit < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" aria-hidden />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
                  )}
                  Ganancia estimada
                </dt>
                <dd className={`text-xl font-bold ${profitTone}`}>
                  {formatCurrency(calc.estimatedProfit)}
                </dd>
              </div>
            </dl>

            {calc.estimatedProfit < 0 && (
              <Notice tone="danger" className="mt-4">
                El total al cliente es menor que el costo base. Revisa los montos antes de enviar.
              </Notice>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- CONDICIONES ---------- */}
      <Card>
        <CardHeader><CardTitle>Condiciones y entrega</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de entrega propuesta" htmlFor="proposed_date" required>
            <Input id="proposed_date" type="date" min={today} value={form.proposed_date} onChange={(e) => set('proposed_date', e.target.value)} />
          </Field>
          <Field label="Horario propuesto" htmlFor="proposed_time_slot" required>
            <Select id="proposed_time_slot" value={form.proposed_time_slot} onChange={(e) => set('proposed_time_slot', e.target.value)}>
              <option value="">Selecciona un horario</option>
              {TIME_SLOTS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Condiciones de pago" htmlFor="payment_terms" required>
            <Select id="payment_terms" value={form.payment_terms} onChange={(e) => set('payment_terms', e.target.value)}>
              {PAYMENT_TERMS_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Vigencia de la cotización" htmlFor="valid_until" required>
            <Input id="valid_until" type="date" min={today} value={form.valid_until} onChange={(e) => set('valid_until', e.target.value)} />
          </Field>
          <Field label="Notas para el cliente" htmlFor="client_notes" className="sm:col-span-2" hint="Visible en la cotización.">
            <Textarea id="client_notes" rows={3} value={form.client_notes} onChange={(e) => set('client_notes', e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      {/* ---------- ACCIONES ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => setPreview(true)} disabled={pending}>
          <Eye className="h-4 w-4" aria-hidden />
          Vista previa
        </Button>
        <Button variant="secondary" onClick={() => save()} loading={pending}>
          <Save className="h-4 w-4" aria-hidden />
          Guardar borrador
        </Button>
        <Button onClick={() => setConfirmSend(true)} disabled={pending}>
          <Send className="h-4 w-4" aria-hidden />
          Enviar cotización al cliente
        </Button>
      </div>

      {/* Vista previa: exactamente lo que vera el cliente */}
      <Dialog
        open={preview}
        onClose={() => setPreview(false)}
        title="Vista previa de la cotización"
        description="Así la verá el cliente. Los costos internos y márgenes no aparecen."
        size="lg"
      >
        <QuotationClientView
          quotation={{
            id: 'preview',
            quotation_number: existing?.quotation_number ?? 'COT-XXXX',
            service_request_id: requestId,
            version: existing?.version ?? 1,
            status: 'sent',
            pricing_mode: form.pricing_mode,
            price_per_gallon: n(form.price_per_gallon),
            quantity_gal: n(form.quantity_gal),
            product_subtotal: calc.productSubtotal,
            delivery_charge: n(form.delivery_charge),
            urgency_surcharge: n(form.urgency_surcharge),
            discount: n(form.discount),
            tax_rate: n(form.tax_rate),
            tax_amount: calc.taxAmount,
            total: calc.total,
            proposed_date: form.proposed_date || null,
            proposed_time_slot: form.proposed_time_slot || null,
            payment_terms: form.payment_terms,
            valid_until: form.valid_until || null,
            client_notes: form.client_notes || null,
            sent_at: null,
            responded_at: null,
            client_response_message: null,
            rejection_reason: null,
            created_at: new Date().toISOString(),
          }}
          items={previewItems}
          requestNumber={requestNumber}
          serviceLabel={SERVICE_LABELS[serviceType]}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        onConfirm={send}
        title="¿Enviar la cotización al cliente?"
        description={`Se guardará y quedará visible en el portal del cliente. El estado de la solicitud ${requestNumber} pasará a "Cotización enviada".`}
        confirmLabel="Sí, enviar"
        loading={pending}
      >
        <dl className="divide-y divide-navy-100">
          <DataRow label="Total al cliente" value={formatCurrency(calc.total)} />
          <DataRow label="Ganancia estimada de PES" value={formatCurrency(calc.estimatedProfit)} />
        </dl>
      </ConfirmDialog>
    </div>
  );
}
