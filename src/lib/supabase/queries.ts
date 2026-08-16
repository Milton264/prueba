import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/utils';
import type { AppUser, ClientProfile, SystemSettings } from '@/types';

export async function getSessionUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role, is_active, created_at')
    .eq('id', user.id)
    .single();

  return (data as AppUser) ?? null;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') throw new Error('No autorizado');
  return user;
}

export async function getMyClientProfile(): Promise<ClientProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('client_profiles')
    .select('id, user_id, full_name, company_name, email, phone, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  return (data as ClientProfile) ?? null;
}

let settingsCache: { value: SystemSettings; at: number } | null = null;

export async function getSettings(): Promise<SystemSettings | null> {
  if (settingsCache && Date.now() - settingsCache.at < 30_000) return settingsCache.value;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
  if (data) settingsCache = { value: data as SystemSettings, at: Date.now() };
  return (data as SystemSettings) ?? null;
}
