-- =====================================================================
-- PES - Panama Energy Solutions
-- 01_schema.sql : tipos, tablas, indices y triggers
-- Ejecutar en el SQL Editor de Supabase, en orden (01 -> 02 -> 03 -> 04).
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- TIPOS
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('client', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type service_type as enum ('diesel', 'agua');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum (
    'solicitud_recibida',
    'verificando_disponibilidad',
    'cotizacion_enviada',
    'cotizacion_aprobada',
    'cambios_solicitados',
    'cotizacion_rechazada',
    'servicio_programado',
    'servicio_completado',
    'solicitud_cancelada'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type quotation_status as enum (
    'draft', 'sent', 'approved', 'changes_requested', 'rejected', 'expired', 'superseded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type urgency_type as enum ('normal', 'urgente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type facility_type as enum (
    'ph_edificio', 'comercio', 'planta_electrica', 'industria', 'obra', 'residencia', 'otro'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type operator_availability as enum ('pendiente', 'si', 'no');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pricing_mode as enum ('por_galon', 'monto_fijo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attachment_kind as enum ('tanque', 'acceso', 'comprobante', 'otro');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- UTILIDAD: updated_at automatico
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- users : espejo de auth.users con el rol de la aplicacion
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  phone       text,
  role        user_role not null default 'client',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists users_role_idx on public.users(role);

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- system_settings : fila unica de configuracion
-- ---------------------------------------------------------------------
create table if not exists public.system_settings (
  id                uuid primary key default uuid_generate_v4(),
  company_name      text not null default 'Panama Energy Solutions',
  logo_path         text default '/brand/pes-logo.svg',
  tagline           text not null default 'Powering Land, Sea & Air',
  contact_email     text not null default 'pes@panamarinesolutions.com',
  whatsapp_number   text not null default '50766794702',
  website_url       text,
  address           text default 'Industrial Terminal Zone (Zona 1), Ciudad de Panama, Panama',
  tax_rate          numeric(6,4) not null default 0.0000,
  request_prefix    text not null default 'PES',
  quotation_prefix  text not null default 'COT',
  quotation_terms   text,
  privacy_policy    text,
  terms_conditions  text,
  updated_at        timestamptz not null default now(),
  -- Garantiza una sola fila de configuracion
  singleton         boolean not null default true,
  constraint system_settings_singleton unique (singleton)
);

drop trigger if exists system_settings_updated_at on public.system_settings;
create trigger system_settings_updated_at before update on public.system_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- catalog_services : catalogo editable (menu Servicios del admin)
-- ---------------------------------------------------------------------
create table if not exists public.catalog_services (
  id                uuid primary key default uuid_generate_v4(),
  service_type      service_type not null unique,
  name              text not null,
  unit              text not null default 'gal',
  preset_quantities integer[] not null default '{100,200,500,1000}',
  reference_price   numeric(12,4),
  is_active         boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- client_profiles : user_id nulo = cliente creado desde solicitud de invitado
-- ---------------------------------------------------------------------
create table if not exists public.client_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid unique references public.users(id) on delete set null,
  full_name       text not null,
  company_name    text,
  email           text not null,
  phone           text,
  notes_internal  text,           -- SOLO admin
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index if not exists client_profiles_email_key on public.client_profiles(lower(email));
create index if not exists client_profiles_company_idx on public.client_profiles(company_name);

drop trigger if exists client_profiles_updated_at on public.client_profiles;
create trigger client_profiles_updated_at before update on public.client_profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- addresses : direcciones frecuentes
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id                  uuid primary key default uuid_generate_v4(),
  client_profile_id   uuid not null references public.client_profiles(id) on delete cascade,
  label               text not null,
  facility_name       text,
  facility_type       facility_type not null default 'otro',
  province            text not null,
  district            text,
  corregimiento       text,
  address_line        text not null,
  reference_point     text,
  access_instructions text,
  tank_capacity_gal   integer,
  is_default          boolean not null default false,
  created_at          timestamptz not null default now()
);
create index if not exists addresses_client_idx on public.addresses(client_profile_id);

-- ---------------------------------------------------------------------
-- service_requests
-- ---------------------------------------------------------------------
create table if not exists public.service_requests (
  id                  uuid primary key default uuid_generate_v4(),
  request_number      text not null unique,
  client_profile_id   uuid not null references public.client_profiles(id) on delete restrict,
  created_by_user_id  uuid references public.users(id) on delete set null,
  -- Acceso del invitado por enlace: /s/[access_token]
  access_token        uuid not null unique default uuid_generate_v4(),

  service_type        service_type not null,
  quantity_gal        integer check (quantity_gal is null or quantity_gal > 0),
  quantity_unknown    boolean not null default false,
  quantity_note       text,

  facility_name       text,
  facility_type       facility_type not null default 'otro',
  province            text not null,
  district            text,
  corregimiento       text,
  address_line        text not null,
  reference_point     text,
  access_instructions text,
  tank_capacity_gal   integer,
  current_level_pct   integer check (current_level_pct is null or (current_level_pct between 0 and 100)),

  preferred_date      date,
  preferred_time_slot text,
  urgency             urgency_type not null default 'normal',

  contact_name        text not null,
  contact_phone       text not null,
  contact_email       text,
  customer_comments   text,

  status              request_status not null default 'solicitud_recibida',
  terms_accepted_at   timestamptz,
  is_guest            boolean not null default false,

  final_quantity_gal  integer,
  completed_at        timestamptz,
  completion_notes    text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- O hay cantidad, o esta marcada como desconocida
  constraint quantity_present check (quantity_gal is not null or quantity_unknown)
);

create index if not exists sr_status_idx        on public.service_requests(status);
create index if not exists sr_client_idx        on public.service_requests(client_profile_id);
create index if not exists sr_created_idx       on public.service_requests(created_at desc);
create index if not exists sr_service_type_idx  on public.service_requests(service_type);
create index if not exists sr_urgency_idx       on public.service_requests(urgency);
create index if not exists sr_token_idx         on public.service_requests(access_token);
create index if not exists sr_preferred_date_idx on public.service_requests(preferred_date);

drop trigger if exists service_requests_updated_at on public.service_requests;
create trigger service_requests_updated_at before update on public.service_requests
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- request_status_history : alimenta la linea de tiempo del cliente
-- ---------------------------------------------------------------------
create table if not exists public.request_status_history (
  id                  uuid primary key default uuid_generate_v4(),
  service_request_id  uuid not null references public.service_requests(id) on delete cascade,
  from_status         request_status,
  to_status           request_status not null,
  changed_by_user_id  uuid references public.users(id) on delete set null,
  note                text,          -- visible al cliente
  created_at          timestamptz not null default now()
);
create index if not exists rsh_request_idx on public.request_status_history(service_request_id, created_at);

-- ---------------------------------------------------------------------
-- quotations : SOLO datos que el cliente puede ver.
-- RLS es a nivel de fila, no de columna. Por eso los costos del proveedor,
-- los margenes y la ganancia de PES no viven aqui, sino en quotation_internal,
-- una tabla cuya politica RLS solo admite administradores. Asi el cliente no
-- puede leerlos ni con un "select *" directo contra la API.
-- ---------------------------------------------------------------------
create table if not exists public.quotations (
  id                      uuid primary key default uuid_generate_v4(),
  quotation_number        text not null unique,
  service_request_id      uuid not null references public.service_requests(id) on delete cascade,
  version                 integer not null default 1,
  status                  quotation_status not null default 'draft',

  -- Solo campos PUBLICOS. Los internos viven en quotation_internal.
  pricing_mode            pricing_mode not null default 'por_galon',
  price_per_gallon        numeric(12,4),
  quantity_gal            integer,
  product_subtotal        numeric(12,2) not null default 0,
  delivery_charge         numeric(12,2) not null default 0,
  urgency_surcharge       numeric(12,2) not null default 0,
  discount                numeric(12,2) not null default 0,
  tax_rate                numeric(6,4)  not null default 0,
  tax_amount              numeric(12,2) not null default 0,
  total                   numeric(12,2) not null default 0,
  proposed_date           date,
  proposed_time_slot      text,
  payment_terms           text,
  valid_until             date,
  client_notes            text,

  -- TRAZABILIDAD
  sent_at                 timestamptz,
  responded_at            timestamptz,
  client_response_message text,
  rejection_reason        text,
  created_by_user_id      uuid references public.users(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (service_request_id, version)
);

create index if not exists q_request_idx on public.quotations(service_request_id);
create index if not exists q_status_idx  on public.quotations(status);
create index if not exists q_created_idx on public.quotations(created_at desc);

drop trigger if exists quotations_updated_at on public.quotations;
create trigger quotations_updated_at before update on public.quotations
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- quotation_internal : costos, margenes y ganancia. SOLO administradores.
-- ---------------------------------------------------------------------
create table if not exists public.quotation_internal (
  id                uuid primary key default uuid_generate_v4(),
  quotation_id      uuid not null unique references public.quotations(id) on delete cascade,
  supplier_cost     numeric(12,2) not null default 0,
  transport_cost    numeric(12,2) not null default 0,
  other_costs       numeric(12,2) not null default 0,
  margin_per_gallon numeric(12,4) not null default 0,
  margin_fixed      numeric(12,2) not null default 0,
  estimated_profit  numeric(12,2) not null default 0,
  internal_notes    text,
  updated_at        timestamptz not null default now()
);
create index if not exists qint_quotation_idx on public.quotation_internal(quotation_id);

drop trigger if exists quotation_internal_updated_at on public.quotation_internal;
create trigger quotation_internal_updated_at before update on public.quotation_internal
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- quotation_items : lineas visibles al cliente
-- ---------------------------------------------------------------------
create table if not exists public.quotation_items (
  id            uuid primary key default uuid_generate_v4(),
  quotation_id  uuid not null references public.quotations(id) on delete cascade,
  sort_order    integer not null default 0,
  concept       text not null,
  description   text,
  quantity      numeric(12,2) not null default 1,
  unit          text not null default 'servicio',
  unit_price    numeric(12,4) not null default 0,
  subtotal      numeric(12,2) not null default 0,
  is_taxable    boolean not null default true
);
create index if not exists qi_quotation_idx on public.quotation_items(quotation_id, sort_order);

-- ---------------------------------------------------------------------
-- internal_operator_information : SOLO administradores
-- ---------------------------------------------------------------------
create table if not exists public.internal_operator_information (
  id                    uuid primary key default uuid_generate_v4(),
  service_request_id    uuid not null unique references public.service_requests(id) on delete cascade,
  operator_name         text,
  contact_person        text,
  contact_phone         text,
  availability          operator_availability not null default 'pendiente',
  supplier_cost         numeric(12,2),
  transport_cost        numeric(12,2),
  available_date        date,
  available_time_slot   text,
  internal_observations text,
  updated_by_user_id    uuid references public.users(id) on delete set null,
  updated_at            timestamptz not null default now()
);

drop trigger if exists ioi_updated_at on public.internal_operator_information;
create trigger ioi_updated_at before update on public.internal_operator_information
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- internal_notes : nunca visibles para el cliente
-- ---------------------------------------------------------------------
create table if not exists public.internal_notes (
  id                  uuid primary key default uuid_generate_v4(),
  service_request_id  uuid not null references public.service_requests(id) on delete cascade,
  author_user_id      uuid references public.users(id) on delete set null,
  body                text not null,
  created_at          timestamptz not null default now()
);
create index if not exists in_request_idx on public.internal_notes(service_request_id, created_at desc);

-- ---------------------------------------------------------------------
-- attachments
-- ---------------------------------------------------------------------
create table if not exists public.attachments (
  id                  uuid primary key default uuid_generate_v4(),
  service_request_id  uuid not null references public.service_requests(id) on delete cascade,
  quotation_id        uuid references public.quotations(id) on delete set null,
  storage_path        text not null,
  file_name           text not null,
  mime_type           text,
  size_bytes          bigint,
  kind                attachment_kind not null default 'otro',
  uploaded_by_user_id uuid references public.users(id) on delete set null,
  is_client_visible   boolean not null default true,
  created_at          timestamptz not null default now()
);
create index if not exists att_request_idx on public.attachments(service_request_id);

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id                  uuid primary key default uuid_generate_v4(),
  recipient_user_id   uuid references public.users(id) on delete cascade,
  client_profile_id   uuid references public.client_profiles(id) on delete cascade,
  service_request_id  uuid references public.service_requests(id) on delete cascade,
  type                text not null,
  title               text not null,
  body                text,
  link                text,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index if not exists notif_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);
