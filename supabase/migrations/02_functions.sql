-- =====================================================================
-- 02_functions.sql : numeracion, vista publica, triggers de negocio, RPC
-- =====================================================================

-- ---------------------------------------------------------------------
-- Numeracion correlativa PES-0001 / COT-0001
-- El prefijo se toma de system_settings.
-- ---------------------------------------------------------------------
create sequence if not exists request_number_seq start 1;
create sequence if not exists quotation_number_seq start 1;

create or replace function public.next_request_number()
returns text language plpgsql security definer set search_path = public as $$
declare
  prefix text;
  n bigint;
begin
  select coalesce(request_prefix, 'PES') into prefix from public.system_settings limit 1;
  n := nextval('request_number_seq');
  return coalesce(prefix, 'PES') || '-' || lpad(n::text, 4, '0');
end $$;

create or replace function public.next_quotation_number()
returns text language plpgsql security definer set search_path = public as $$
declare
  prefix text;
  n bigint;
begin
  select coalesce(quotation_prefix, 'COT') into prefix from public.system_settings limit 1;
  n := nextval('quotation_number_seq');
  return coalesce(prefix, 'COT') || '-' || lpad(n::text, 4, '0');
end $$;

create or replace function public.assign_request_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.request_number is null or new.request_number = '' then
    new.request_number := public.next_request_number();
  end if;
  return new;
end $$;

drop trigger if exists sr_assign_number on public.service_requests;
create trigger sr_assign_number before insert on public.service_requests
  for each row execute function public.assign_request_number();

create or replace function public.assign_quotation_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.quotation_number is null or new.quotation_number = '' then
    new.quotation_number := public.next_quotation_number();
  end if;
  return new;
end $$;

drop trigger if exists q_assign_number on public.quotations;
create trigger q_assign_number before insert on public.quotations
  for each row execute function public.assign_quotation_number();

-- ---------------------------------------------------------------------
-- Historial automatico de estados
-- ---------------------------------------------------------------------
create or replace function public.log_request_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.request_status_history (service_request_id, from_status, to_status, changed_by_user_id)
    values (new.id, null, new.status, new.created_by_user_id);
  elsif new.status is distinct from old.status then
    insert into public.request_status_history (service_request_id, from_status, to_status, changed_by_user_id)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end $$;

drop trigger if exists sr_log_status_ins on public.service_requests;
create trigger sr_log_status_ins after insert on public.service_requests
  for each row execute function public.log_request_status();

drop trigger if exists sr_log_status_upd on public.service_requests;
create trigger sr_log_status_upd after update of status on public.service_requests
  for each row execute function public.log_request_status();

-- ---------------------------------------------------------------------
-- Alta automatica en public.users al registrarse en auth
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
  )
  on conflict (id) do nothing;

  -- Perfil de cliente: si ya existe uno de invitado con el mismo correo, se vincula.
  if coalesce((new.raw_user_meta_data->>'role'), 'client') = 'client' then
    update public.client_profiles
       set user_id = new.id,
           full_name = coalesce(nullif(full_name, ''), new.raw_user_meta_data->>'full_name'),
           company_name = coalesce(company_name, new.raw_user_meta_data->>'company_name'),
           phone = coalesce(phone, new.raw_user_meta_data->>'phone')
     where lower(email) = lower(new.email) and user_id is null;

    if not found then
      insert into public.client_profiles (user_id, full_name, company_name, email, phone)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        new.raw_user_meta_data->>'company_name',
        new.email,
        new.raw_user_meta_data->>'phone'
      )
      on conflict do nothing;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- Helpers de rol (evitan recursion en las politicas RLS)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin' and is_active);
$$;

create or replace function public.my_client_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.client_profiles where user_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------
-- VISTA PUBLICA DE COTIZACIONES
-- Segunda barrera, ademas de RLS: los campos internos no existen aqui,
-- por lo que el portal del cliente no puede consultarlos ni por error.
-- ---------------------------------------------------------------------
create or replace view public.quotations_public
with (security_invoker = true) as
select
  q.id,
  q.quotation_number,
  q.service_request_id,
  q.version,
  q.status,
  q.pricing_mode,
  q.price_per_gallon,
  q.quantity_gal,
  q.product_subtotal,
  q.delivery_charge,
  q.urgency_surcharge,
  q.discount,
  q.tax_rate,
  q.tax_amount,
  q.total,
  q.proposed_date,
  q.proposed_time_slot,
  q.payment_terms,
  q.valid_until,
  q.client_notes,
  q.sent_at,
  q.responded_at,
  q.client_response_message,
  q.rejection_reason,
  q.created_at
from public.quotations q
where q.status <> 'draft';

-- ---------------------------------------------------------------------
-- RPC de acceso por token (flujo de invitado, sin sesion)
-- ---------------------------------------------------------------------
create or replace function public.get_request_by_token(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'request', to_jsonb(r) - 'access_token',
    'client', jsonb_build_object('full_name', c.full_name, 'company_name', c.company_name, 'email', c.email),
    'history', coalesce((
      select jsonb_agg(to_jsonb(h) order by h.created_at)
      from public.request_status_history h where h.service_request_id = r.id
    ), '[]'::jsonb),
    'quotation', (
      select to_jsonb(qp)
      from public.quotations_public qp
      where qp.service_request_id = r.id and qp.status <> 'superseded'
      order by qp.version desc limit 1
    ),
    'quotation_items', coalesce((
      select jsonb_agg(to_jsonb(qi) order by qi.sort_order)
      from public.quotation_items qi
      join public.quotations_public qp2 on qp2.id = qi.quotation_id
      where qp2.service_request_id = r.id
        and qp2.version = (select max(version) from public.quotations_public where service_request_id = r.id)
    ), '[]'::jsonb)
  )
  into result
  from public.service_requests r
  join public.client_profiles c on c.id = r.client_profile_id
  where r.access_token = p_token;

  return result;  -- null si el token no existe
end $$;

revoke all on function public.get_request_by_token(uuid) from public;
grant execute on function public.get_request_by_token(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Vencimiento automatico de cotizaciones
-- ---------------------------------------------------------------------
create or replace function public.expire_old_quotations()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.quotations
     set status = 'expired'
   where status = 'sent' and valid_until is not null and valid_until < current_date;
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Propagacion del estado de la cotizacion hacia la solicitud.
-- Se hace en un trigger SECURITY DEFINER para que el cliente no necesite
-- permiso de escritura sobre service_requests.
-- ---------------------------------------------------------------------
create or replace function public.sync_request_status_from_quotation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target request_status;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  target := case new.status
    when 'sent'              then 'cotizacion_enviada'::request_status
    when 'approved'          then 'cotizacion_aprobada'::request_status
    when 'changes_requested' then 'cambios_solicitados'::request_status
    when 'rejected'          then 'cotizacion_rechazada'::request_status
    else null
  end;

  if target is not null then
    update public.service_requests
       set status = target
     where id = new.service_request_id
       and status is distinct from target;
  end if;

  return new;
end $$;

drop trigger if exists q_sync_request_status on public.quotations;
create trigger q_sync_request_status after update of status on public.quotations
  for each row execute function public.sync_request_status_from_quotation();

-- ---------------------------------------------------------------------
-- Respuesta del cliente a una cotizacion.
-- SECURITY DEFINER: el cliente NO tiene permiso de UPDATE sobre quotations,
-- por lo que no puede alterar montos desde la API. Esta funcion es la unica
-- via de escritura y valida la propiedad de la solicitud.
-- ---------------------------------------------------------------------
create or replace function public.respond_to_quotation(
  p_quotation_id uuid,
  p_action       text,
  p_message      text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  q       public.quotations%rowtype;
  mine    uuid;
  new_st  quotation_status;
begin
  if p_action not in ('approve', 'changes', 'reject') then
    return jsonb_build_object('ok', false, 'error', 'Accion no valida.');
  end if;

  select * into q from public.quotations where id = p_quotation_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Cotizacion no encontrada.');
  end if;

  -- La solicitud debe pertenecer al cliente autenticado.
  select r.client_profile_id into mine
    from public.service_requests r
   where r.id = q.service_request_id
     and r.client_profile_id = public.my_client_profile_id();

  if mine is null then
    return jsonb_build_object('ok', false, 'error', 'No tienes acceso a esta cotizacion.');
  end if;

  if q.status <> 'sent' then
    return jsonb_build_object('ok', false, 'error', 'Esta cotizacion ya no admite respuesta.');
  end if;

  if p_action = 'approve' and q.valid_until is not null and q.valid_until < current_date then
    return jsonb_build_object('ok', false, 'error', 'Esta cotizacion vencio. Comunicate con un asesor para renovarla.');
  end if;

  if p_action = 'changes' and coalesce(length(trim(p_message)), 0) < 10 then
    return jsonb_build_object('ok', false, 'error', 'Explica que necesitas modificar.');
  end if;

  new_st := case p_action
    when 'approve' then 'approved'::quotation_status
    when 'changes' then 'changes_requested'::quotation_status
    else 'rejected'::quotation_status
  end;

  update public.quotations
     set status = new_st,
         responded_at = now(),
         client_response_message = case when p_action = 'changes' then trim(p_message) else client_response_message end,
         rejection_reason        = case when p_action = 'reject'  then nullif(trim(p_message), '') else rejection_reason end
   where id = q.id;
  -- El trigger q_sync_request_status actualiza la solicitud.

  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.respond_to_quotation(uuid, text, text) from public;
grant execute on function public.respond_to_quotation(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Respuesta del invitado, autenticada por el token del enlace.
-- ---------------------------------------------------------------------
create or replace function public.respond_to_quotation_by_token(
  p_token        uuid,
  p_quotation_id uuid,
  p_action       text,
  p_message      text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  q      public.quotations%rowtype;
  req_id uuid;
  new_st quotation_status;
begin
  if p_action not in ('approve', 'changes', 'reject') then
    return jsonb_build_object('ok', false, 'error', 'Accion no valida.');
  end if;

  select id into req_id from public.service_requests where access_token = p_token;
  if req_id is null then
    return jsonb_build_object('ok', false, 'error', 'Enlace invalido o vencido.');
  end if;

  select * into q from public.quotations where id = p_quotation_id;
  -- La cotizacion debe pertenecer a la solicitud de este token.
  if not found or q.service_request_id <> req_id then
    return jsonb_build_object('ok', false, 'error', 'Cotizacion no encontrada.');
  end if;

  if q.status <> 'sent' then
    return jsonb_build_object('ok', false, 'error', 'Esta cotizacion ya no admite respuesta.');
  end if;

  if p_action = 'approve' and q.valid_until is not null and q.valid_until < current_date then
    return jsonb_build_object('ok', false, 'error', 'Esta cotizacion vencio. Comunicate con un asesor para renovarla.');
  end if;

  if p_action = 'changes' and coalesce(length(trim(p_message)), 0) < 10 then
    return jsonb_build_object('ok', false, 'error', 'Explica que necesitas modificar.');
  end if;

  new_st := case p_action
    when 'approve' then 'approved'::quotation_status
    when 'changes' then 'changes_requested'::quotation_status
    else 'rejected'::quotation_status
  end;

  update public.quotations
     set status = new_st,
         responded_at = now(),
         client_response_message = case when p_action = 'changes' then trim(p_message) else client_response_message end,
         rejection_reason        = case when p_action = 'reject'  then nullif(trim(p_message), '') else rejection_reason end
   where id = q.id;

  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.respond_to_quotation_by_token(uuid, uuid, text, text) from public;
grant execute on function public.respond_to_quotation_by_token(uuid, uuid, text, text) to anon, authenticated;
