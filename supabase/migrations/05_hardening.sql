-- =====================================================================
-- 05_hardening.sql : cierre de superficie de ataque
--
-- Detectado por el linter de seguridad de Supabase tras aplicar 01-04.
-- El caso grave era expire_old_quotations(): al ser SECURITY DEFINER y
-- estar expuesta en /rest/v1/rpc/, cualquier cliente autenticado podia
-- vencer TODAS las cotizaciones enviadas con una sola llamada.
-- =====================================================================

-- Funciones de trigger y de mantenimiento: no deben ser invocables por REST.
revoke execute on function public.assign_request_number()               from anon, authenticated, public;
revoke execute on function public.assign_quotation_number()             from anon, authenticated, public;
revoke execute on function public.log_request_status()                  from anon, authenticated, public;
revoke execute on function public.handle_new_auth_user()                from anon, authenticated, public;
revoke execute on function public.sync_request_status_from_quotation()  from anon, authenticated, public;
revoke execute on function public.next_request_number()                 from anon, authenticated, public;
revoke execute on function public.next_quotation_number()               from anon, authenticated, public;
revoke execute on function public.expire_old_quotations()               from anon, authenticated, public;

-- Los helpers de rol si deben quedar accesibles: las politicas RLS los evaluan
-- con los permisos de quien consulta, y solo devuelven datos del propio usuario.
grant execute on function public.is_admin()             to authenticated;
grant execute on function public.my_client_profile_id() to authenticated;

-- search_path fijo: evita el secuestro de la funcion por esquemas del usuario.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;
