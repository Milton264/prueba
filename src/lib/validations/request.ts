import { z } from 'zod';

const facilityTypes = [
  'ph_edificio', 'comercio', 'planta_electrica', 'industria', 'obra', 'residencia', 'otro',
] as const;

const optionalText = (max = 500) => z.string().max(max).optional().or(z.literal(''));

/** Paso 1: servicio */
export const step1Schema = z.object({
  service_type: z.enum(['diesel', 'agua'], {
    errorMap: () => ({ message: 'Selecciona el servicio que necesitas' }),
  }),
});

/** Paso 2: cantidad */
export const step2Schema = z
  .object({
    quantity_gal: z
      .number({ invalid_type_error: 'Ingresa una cantidad válida' })
      .int('La cantidad debe ser un número entero')
      .positive('La cantidad debe ser mayor que cero')
      .max(100000, 'Para cantidades mayores comunícate con un asesor')
      .nullable(),
    quantity_unknown: z.boolean().default(false),
    quantity_note: optionalText(300),
  })
  .refine((d) => d.quantity_unknown || d.quantity_gal !== null, {
    message: 'Indica la cantidad o marca que no conoces la capacidad exacta',
    path: ['quantity_gal'],
  });

/** Paso 3: información del lugar */
export const step3Schema = z.object({
  facility_name: z.string().min(2, 'Ingresa el nombre de la empresa o instalación').max(150),
  facility_type: z.enum(facilityTypes, {
    errorMap: () => ({ message: 'Selecciona el tipo de instalación' }),
  }),
  province: z.string().min(2, 'Selecciona la provincia'),
  district: optionalText(100),
  corregimiento: optionalText(100),
  address_line: z.string().min(8, 'Ingresa la dirección completa').max(400),
  reference_point: optionalText(300),
  access_instructions: optionalText(500),
  tank_capacity_gal: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int()
    .positive()
    .max(500000)
    .nullable()
    .optional(),
  current_level_pct: z
    .number({ invalid_type_error: 'Ingresa un porcentaje entre 0 y 100' })
    .int()
    .min(0, 'El nivel no puede ser menor que 0')
    .max(100, 'El nivel no puede ser mayor que 100')
    .nullable()
    .optional(),
});

/** Paso 4: fecha y contacto */
export const step4Schema = z.object({
  preferred_date: z
    .string()
    .min(1, 'Selecciona la fecha preferida')
    .refine((v) => {
      const d = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !Number.isNaN(d.getTime()) && d >= today;
    }, 'La fecha no puede ser anterior a hoy'),
  preferred_time_slot: z.string().min(1, 'Selecciona el horario preferido'),
  urgency: z.enum(['normal', 'urgente']).default('normal'),
  contact_name: z.string().min(3, 'Ingresa el nombre de quién recibe').max(120),
  contact_phone: z
    .string()
    .min(7, 'Ingresa un teléfono válido')
    .max(20)
    .regex(/^[\d\s()+-]+$/, 'El teléfono solo puede contener números y los signos + - ( )'),
  contact_email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  customer_comments: optionalText(1000),
});

/** Paso 5: revisión */
export const step5Schema = z.object({
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar esta condición para enviar la solicitud' }),
  }),
});

/** Datos de contacto del invitado, solicitados antes de completar el formulario. */
export const guestSchema = z.object({
  guest_full_name: z.string().min(3, 'Ingresa tu nombre completo').max(120),
  guest_company: optionalText(120),
  guest_email: z.string().min(1, 'El correo es obligatorio').email('Correo electrónico inválido'),
  guest_phone: z.string().min(7, 'Ingresa un teléfono válido').max(20),
});

/** Esquema completo, validado en el servidor. */
export const createRequestSchema = step1Schema
  .merge(step2Schema.innerType())
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(guestSchema.partial())
  .extend({
    attachment_paths: z.array(z.string()).max(3).optional(),
    save_address: z.boolean().optional(),
  })
  .refine((d) => d.quantity_unknown || d.quantity_gal !== null, {
    message: 'Indica la cantidad o marca que no conoces la capacidad exacta',
    path: ['quantity_gal'],
  });

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export type WizardData = Partial<
  Step1Input & Step2Input & Step3Input & Step4Input & GuestInput & { terms_accepted: boolean }
>;

/** Acciones administrativas */
export const changeStatusSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum([
    'solicitud_recibida', 'verificando_disponibilidad', 'cotizacion_enviada',
    'cotizacion_aprobada', 'cambios_solicitados', 'cotizacion_rechazada',
    'servicio_programado', 'servicio_completado', 'solicitud_cancelada',
  ]),
  note: optionalText(500),
  force: z.boolean().optional(),
});

export const internalNoteSchema = z.object({
  request_id: z.string().uuid(),
  body: z.string().min(2, 'Escribe la nota').max(2000),
});

export const operatorInfoSchema = z.object({
  request_id: z.string().uuid(),
  operator_name: optionalText(150),
  contact_person: optionalText(120),
  contact_phone: optionalText(30),
  availability: z.enum(['pendiente', 'si', 'no']).default('pendiente'),
  supplier_cost: z.number().min(0).nullable().optional(),
  transport_cost: z.number().min(0).nullable().optional(),
  available_date: z.string().optional().or(z.literal('')),
  available_time_slot: optionalText(60),
  internal_observations: optionalText(2000),
});

export const completeServiceSchema = z.object({
  request_id: z.string().uuid(),
  final_quantity_gal: z
    .number({ invalid_type_error: 'Ingresa la cantidad final entregada' })
    .int()
    .positive('La cantidad debe ser mayor que cero'),
  completed_at: z.string().min(1, 'Indica la fecha y hora de la entrega'),
  completion_notes: optionalText(1000),
  receipt_path: z.string().optional().or(z.literal('')),
});
