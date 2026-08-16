import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo electrónico invalido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Ingresa tu nombre completo').max(120),
    company_name: z.string().max(120).optional().or(z.literal('')),
    email: z.string().min(1, 'El correo es obligatorio').email('Correo electrónico invalido'),
    phone: z
      .string()
      .min(7, 'Ingresa un teléfono valido')
      .max(20)
      .regex(/^[\d\s()+-]+$/, 'El teléfono solo puede contener números y los signos + - ( )'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export const recoverSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo electrónico invalido'),
});

export const profileSchema = z.object({
  full_name: z.string().min(3, 'Ingresa tu nombre completo').max(120),
  company_name: z.string().max(120).optional().or(z.literal('')),
  phone: z.string().min(7, 'Ingresa un teléfono valido').max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
