-- =====================================================================
-- 03_rls.sql : Row Level Security
-- Regla general: el cliente solo ve lo suyo; el admin ve todo;
-- las tablas internas son inaccesibles para clientes.
-- =====================================================================

alter table public.users                          enable row level security;
alter table public.client_profiles                enable row level security;
alter table public.addresses                      enable row level security;
alter table public.service_requests               enable row level security;
alter table public.request_status_history         enable row level security;
alter table public.quotations                     enable row level security;
alter table public.quotation_internal             enable row level security;
alter table public.quotation_items                enable row level security;
alter table public.internal_operator_information  enable row level security;
alter table public.internal_notes                 enable row level security;
alter table public.attachments                    enable row level security;
alter table public.system_settings                enable row level security;
alter table public.catalog_services               enable row level security;
alter table public.notifications                  enable row level security;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- client_profiles
-- ---------------------------------------------------------------------
drop policy if exists cp_select on public.client_profiles;
create policy cp_select on public.client_profiles
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists cp_update_self on public.client_profiles;
create policy cp_update_self on public.client_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists cp_admin_all on public.client_profiles;
create policy cp_admin_all on public.client_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------
drop policy if exists addr_own on public.addresses;
create policy addr_own on public.addresses
  for all
  using (client_profile_id = public.my_client_profile_id() or public.is_admin())
  with check (client_profile_id = public.my_client_profile_id() or public.is_admin());

-- ---------------------------------------------------------------------
-- service_requests
-- ---------------------------------------------------------------------
drop policy if exists sr_select_own on public.service_requests;
create policy sr_select_own on public.service_requests
  for select using (client_profile_id = public.my_client_profile_id() or public.is_admin());

drop policy if exists sr_insert_own on public.service_requests;
create policy sr_insert_own on public.service_requests
  for insert with check (client_profile_id = public.my_client_profile_id() or public.is_admin());

-- El cliente NO puede cambiar el estado ni los datos de la solicitud una vez enviada.
-- Toda modificacion pasa por el administrador o por el trigger
-- sync_request_status_from_quotation(), que es SECURITY DEFINER.
drop policy if exists sr_admin_write on public.service_requests;
create policy sr_admin_write on public.service_requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists sr_admin_delete on public.service_requests;
create policy sr_admin_delete on public.service_requests
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- request_status_history : lectura para el dueno, escritura solo por trigger/admin
-- ---------------------------------------------------------------------
drop policy if exists rsh_select on public.request_status_history;
create policy rsh_select on public.request_status_history
  for select using (
    public.is_admin() or exists (
      select 1 from public.service_requests r
      where r.id = service_request_id and r.client_profile_id = public.my_client_profile_id()
    )
  );

drop policy if exists rsh_admin_write on public.request_status_history;
create policy rsh_admin_write on public.request_status_history
  for insert with check (public.is_admin());

-- El admin puede adjuntar una nota visible al cliente sobre el cambio de estado.
drop policy if exists rsh_admin_update on public.request_status_history;
create policy rsh_admin_update on public.request_status_history
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- quotations
-- El cliente puede leer las que no son borrador y responder solo campos de respuesta.
-- Los campos internos quedan fuera de su alcance vistos desde quotations_public.
-- ---------------------------------------------------------------------
drop policy if exists q_select on public.quotations;
create policy q_select on public.quotations
  for select using (
    public.is_admin() or (
      status <> 'draft' and exists (
        select 1 from public.service_requests r
        where r.id = service_request_id and r.client_profile_id = public.my_client_profile_id()
      )
    )
  );

-- El cliente NO tiene UPDATE sobre quotations: si lo tuviera, RLS es a nivel de
-- fila y podria alterar montos desde la API REST. La unica via de respuesta es
-- la funcion respond_to_quotation(), que valida propiedad y solo toca el estado.
drop policy if exists q_client_respond on public.quotations;

drop policy if exists q_admin_all on public.quotations;
create policy q_admin_all on public.quotations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- quotation_internal : costos y margenes. Sin politica para clientes,
-- por lo que RLS les niega el acceso por completo.
-- ---------------------------------------------------------------------
drop policy if exists qint_admin on public.quotation_internal;
create policy qint_admin on public.quotation_internal
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- quotation_items
-- ---------------------------------------------------------------------
drop policy if exists qi_select on public.quotation_items;
create policy qi_select on public.quotation_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.quotations q
      join public.service_requests r on r.id = q.service_request_id
      where q.id = quotation_id
        and q.status <> 'draft'
        and r.client_profile_id = public.my_client_profile_id()
    )
  );

drop policy if exists qi_admin_write on public.quotation_items;
create policy qi_admin_write on public.quotation_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- TABLAS INTERNAS : exclusivas de administradores.
-- Sin politica para clientes = acceso denegado por RLS.
-- ---------------------------------------------------------------------
drop policy if exists ioi_admin on public.internal_operator_information;
create policy ioi_admin on public.internal_operator_information
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists in_admin on public.internal_notes;
create policy in_admin on public.internal_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- attachments
-- ---------------------------------------------------------------------
drop policy if exists att_select on public.attachments;
create policy att_select on public.attachments
  for select using (
    public.is_admin() or (
      is_client_visible and exists (
        select 1 from public.service_requests r
        where r.id = service_request_id and r.client_profile_id = public.my_client_profile_id()
      )
    )
  );

drop policy if exists att_insert on public.attachments;
create policy att_insert on public.attachments
  for insert with check (
    public.is_admin() or exists (
      select 1 from public.service_requests r
      where r.id = service_request_id and r.client_profile_id = public.my_client_profile_id()
    )
  );

drop policy if exists att_admin_write on public.attachments;
create policy att_admin_write on public.attachments
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- system_settings : lectura publica (marca y contacto), escritura solo admin
-- ---------------------------------------------------------------------
drop policy if exists ss_select on public.system_settings;
create policy ss_select on public.system_settings for select using (true);

drop policy if exists ss_admin_write on public.system_settings;
create policy ss_admin_write on public.system_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- catalog_services
-- ---------------------------------------------------------------------
drop policy if exists cs_select on public.catalog_services;
create policy cs_select on public.catalog_services for select using (true);

drop policy if exists cs_admin_write on public.catalog_services;
create policy cs_admin_write on public.catalog_services
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
drop policy if exists notif_own on public.notifications;
create policy notif_own on public.notifications
  for select using (recipient_user_id = auth.uid() or public.is_admin());

drop policy if exists notif_update_own on public.notifications;
create policy notif_update_own on public.notifications
  for update using (recipient_user_id = auth.uid() or public.is_admin())
  with check (recipient_user_id = auth.uid() or public.is_admin());

drop policy if exists notif_admin_write on public.notifications;
create policy notif_admin_write on public.notifications
  for insert with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Permisos sobre la vista publica
-- ---------------------------------------------------------------------
grant select on public.quotations_public to anon, authenticated;
