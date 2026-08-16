import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * PostgREST devuelve las relaciones anidadas como objeto o como arreglo según
 * como infiera la cardinalidad. Este helper normaliza ambos casos a un objeto.
 */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Indica si las credenciales de Supabase están presentes.
 * Permite levantar el proyecto con `npm run dev` y recorrer la parte pública
 * antes de haber configurado la base de datos.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('xxxxxxxx') && !key.startsWith('placeholder'));
}
