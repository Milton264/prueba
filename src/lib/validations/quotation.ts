import { z } from 'zod';

const money = (msg = 'Ingresa un monto válido') =>
  z.number({ invalid_type_error: msg }).min(0, 'El monto no puede ser negativo').default(0);

export const quotationSchema = z
  .object({
    request_id: z.string().uuid(),
    quotation_id: z.string().uuid().optional(),

    // INTERNOS - nunca visibles para el cliente
    supplier_cost: money(),
    transport_cost: money(),
    other_costs: money(),
    margin_per_gallon: money(),
    margin_fixed: money(),
    internal_notes: z.string().max(2000).optional().or(z.literal('')),

    // PUBLICOS
    pricing_mode: z.enum(['por_galon', 'monto_fijo']).default('por_galon'),
    quantity_gal: z
      .number({ invalid_type_error: 'Ingresa la cantidad a cotizar' })
      .int()
      .positive('La cantidad debe ser mayor que cero'),
    price_per_gallon: money().optional(),
    fixed_amount: money().optional(),
    delivery_charge: money(),
    urgency_surcharge: money(),
    discount: money(),
    tax_rate: z.number().min(0).max(1).default(0),

    proposed_date: z.string().min(1, 'Indica la fecha propuesta de entrega'),
    proposed_time_slot: z.string().min(1, 'Indica el horario propuesto'),
    payment_terms: z.string().min(2, 'Indica las condiciones de pago').max(200),
    valid_until: z.string().min(1, 'Indica la vigencia de la cotización'),
    client_notes: z.string().max(2000).optional().or(z.literal('')),
  })
  .refine(
    (d) => (d.pricing_mode === 'por_galon' ? (d.price_per_gallon ?? 0) > 0 : (d.fixed_amount ?? 0) > 0),
    {
      message: 'Ingresa el precio por galón o el monto fijo, según el modo seleccionado',
      path: ['price_per_gallon'],
    },
  )
  .refine(
    (d) => {
      const v = new Date(`${d.valid_until}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return v >= today;
    },
    { message: 'La vigencia no puede ser anterior a hoy', path: ['valid_until'] },
  );

export const approveSchema = z.object({
  quotation_id: z.string().uuid(),
});

export const requestChangesSchema = z.object({
  quotation_id: z.string().uuid(),
  message: z
    .string()
    .min(10, 'Explica con al menos 10 caracteres qué necesitas modificar')
    .max(1000),
});

export const rejectSchema = z.object({
  quotation_id: z.string().uuid(),
  reason: z.string().max(1000).optional().or(z.literal('')),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
