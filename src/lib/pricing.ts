import type { PricingMode } from '@/types';

export interface PricingInput {
  pricingMode: PricingMode;
  quantityGal: number;
  pricePerGallon: number;
  fixedAmount: number;
  deliveryCharge: number;
  urgencySurcharge: number;
  discount: number;
  taxRate: number;
  /** Internos: nunca se envian al cliente. */
  supplierCost: number;
  transportCost: number;
  otherCosts: number;
  marginPerGallon: number;
  marginFixed: number;
}

export interface PricingResult {
  productSubtotal: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  /** Internos */
  baseCost: number;
  pesMargin: number;
  estimatedProfit: number;
  /** Precio sugerido a partir de costo + margen, para ayudar al admin. */
  suggestedTotal: number;
}

const round2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const num = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

export function calculateQuotation(input: Partial<PricingInput>): PricingResult {
  const quantity = num(input.quantityGal);
  const mode: PricingMode = input.pricingMode ?? 'por_galon';

  const productSubtotal = round2(
    mode === 'por_galon' ? num(input.pricePerGallon) * quantity : num(input.fixedAmount),
  );

  const subtotal = round2(
    productSubtotal + num(input.deliveryCharge) + num(input.urgencySurcharge) - num(input.discount),
  );

  const taxAmount = round2(subtotal * num(input.taxRate));
  const total = round2(subtotal + taxAmount);

  const baseCost = round2(
    num(input.supplierCost) + num(input.transportCost) + num(input.otherCosts),
  );
  const pesMargin = round2(num(input.marginPerGallon) * quantity + num(input.marginFixed));

  // La ganancia se mide sobre el monto sin impuestos: el impuesto no es ingreso de PES.
  const estimatedProfit = round2(subtotal - baseCost);

  const suggestedSubtotal = round2(baseCost + pesMargin);
  const suggestedTotal = round2(suggestedSubtotal * (1 + num(input.taxRate)));

  return {
    productSubtotal,
    subtotal,
    taxAmount,
    total,
    baseCost,
    pesMargin,
    estimatedProfit,
    suggestedTotal,
  };
}

/** Lineas visibles al cliente, derivadas del calculo. */
export function buildClientLineItems(
  input: Partial<PricingInput>,
  serviceLabel: string,
): { concept: string; quantity: number; unit: string; unitPrice: number; subtotal: number }[] {
  const r = calculateQuotation(input);
  const quantity = num(input.quantityGal);
  const items: ReturnType<typeof buildClientLineItems> = [];

  if (input.pricingMode === 'por_galon') {
    items.push({
      concept: `Suministro de ${serviceLabel}`,
      quantity,
      unit: 'gal',
      unitPrice: round2(num(input.pricePerGallon)),
      subtotal: r.productSubtotal,
    });
  } else {
    items.push({
      concept: `Suministro de ${serviceLabel}`,
      quantity: 1,
      unit: 'servicio',
      unitPrice: r.productSubtotal,
      subtotal: r.productSubtotal,
    });
  }

  if (num(input.deliveryCharge) > 0) {
    items.push({
      concept: 'Transporte y entrega',
      quantity: 1,
      unit: 'servicio',
      unitPrice: round2(num(input.deliveryCharge)),
      subtotal: round2(num(input.deliveryCharge)),
    });
  }

  if (num(input.urgencySurcharge) > 0) {
    items.push({
      concept: 'Recargo por urgencia',
      quantity: 1,
      unit: 'servicio',
      unitPrice: round2(num(input.urgencySurcharge)),
      subtotal: round2(num(input.urgencySurcharge)),
    });
  }

  if (num(input.discount) > 0) {
    items.push({
      concept: 'Descuento',
      quantity: 1,
      unit: 'servicio',
      unitPrice: -round2(num(input.discount)),
      subtotal: -round2(num(input.discount)),
    });
  }

  return items;
}
