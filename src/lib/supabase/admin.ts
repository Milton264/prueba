import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente con service_role. Omite RLS.
 * Uso exclusivo en Server Actions para:
 *  - crear solicitudes de invitados (sin sesión)
 *  - resolver el acceso por token en /s/[token]
 * Nunca importar desde un componente de cliente.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.');
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
