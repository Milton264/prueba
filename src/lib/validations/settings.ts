import { z } from 'zod';

export const settingsSchema = z.object({
  company_name: z.string().min(2, 'Ingresa el nombre de la empresa').max(120),
  tagline: z.string().min(2, 'Ingresa el eslogan').max(120),
  logo_path: z.string().max(300).optional().or(z.literal('')),
  contact_email: z.string().email('Correo electrónico invalido'),
  whatsapp_number: z
    .string()
    .min(8, 'Ingresa el número en formato internacional, solo digitos')
    .max(20)
    .regex(/^\d+$/, 'Solo digitos. Ejemplo para Panamá: 50760000000'),
  website_url: z.string().url('URL invalida').optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  tax_rate: z
    .number({ invalid_type_error: 'Ingresa un porcentaje valido' })
    .min(0, 'No puede ser negativo')
    .max(1, 'Expresa el impuesto como decimal. Ejemplo: 0.07 para 7%'),
  request_prefix: z.string().min(1).max(10).regex(/^[A-Z]+$/, 'Solo letras mayusculas'),
  quotation_prefix: z.string().min(1).max(10).regex(/^[A-Z]+$/, 'Solo letras mayusculas'),
  quotation_terms: z.string().max(4000).optional().or(z.literal('')),
  privacy_policy: z.string().max(20000).optional().or(z.literal('')),
  terms_conditions: z.string().max(20000).optional().or(z.literal('')),
});

export const serviceCatalogSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(80),
  unit: z.string().min(1).max(20),
  preset_quantities: z.array(z.number().int().positive()).max(8),
  reference_price: z.number().min(0).nullable().optional(),
  is_active: z.boolean(),
});

export const adminUserSchema = z.object({
  email: z.string().email('Correo electrónico invalido'),
  full_name: z.string().min(3, 'Ingresa el nombre completo').max(120),
  role: z.enum(['client', 'admin']),
  is_active: z.boolean().default(true),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
