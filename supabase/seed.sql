-- =====================================================================
-- seed.sql : datos de demostracion
-- Ejecutar DESPUES de 01, 02, 03 y 04.
--
-- REQUISITO PREVIO: crea estos dos usuarios en Supabase
--   Authentication -> Users -> Add user (marca "Auto Confirm User")
--
--   1) pmn@panamarinesolutions.com   contrasena: PesAdmin2025!
--   2) juan.perez@demo.com               contrasena: PesDemo2025!
--
-- El trigger handle_new_auth_user crea automaticamente las filas en
-- public.users y public.client_profiles. Este script eleva al primero a
-- administrador y carga las solicitudes y cotizaciones de ejemplo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Configuracion del sistema
-- ---------------------------------------------------------------------
insert into public.system_settings (
  company_name, tagline, contact_email, whatsapp_number, website_url, address,
  tax_rate, request_prefix, quotation_prefix, quotation_terms
)
values (
  'Panama Energy Solutions',
  'Powering Land, Sea & Air',
  'pes@panamarinesolutions.com',
  '50769954353',
  'https://panamarinesolutions.com',
  'Ciudad de Panama, Republica de Panama',
  0.0000,
  'PES',
  'COT',
  'Esta cotizacion esta sujeta a la disponibilidad confirmada por la compania operadora aliada al momento de la aprobacion. Los montos indicados no incluyen cargos adicionales derivados de condiciones de acceso no informadas previamente.'
)
on conflict (singleton) do nothing;

-- ---------------------------------------------------------------------
-- 2. Catalogo de servicios
-- ---------------------------------------------------------------------
insert into public.catalog_services (service_type, name, unit, preset_quantities, reference_price, is_active)
values
  ('diesel', 'Diesel',       'gal', '{100,200,500,1000}',   5.40, true),
  ('agua',   'Agua potable', 'gal', '{500,1000,2000,5000}', 0.45, true)
on conflict (service_type) do nothing;

-- ---------------------------------------------------------------------
-- 3. Elevar al administrador
-- ---------------------------------------------------------------------
update public.users
   set role = 'admin', full_name = coalesce(nullif(full_name, ''), 'Coordinacion PES')
 where lower(email) = 'pmn@panamarinesolutions.com';

-- El administrador no necesita perfil de cliente.
delete from public.client_profiles
 where lower(email) = 'pmn@panamarinesolutions.com';

-- ---------------------------------------------------------------------
-- 4. Cliente demo: Juan Perez / Edificio Costa Azul
-- ---------------------------------------------------------------------
update public.client_profiles
   set full_name = 'Juan Perez',
       company_name = 'Edificio Costa Azul',
       phone = '60001234'
 where lower(email) = 'juan.perez@demo.com';

-- Respaldo por si el usuario de auth aun no existe.
insert into public.client_profiles (full_name, company_name, email, phone)
select 'Juan Perez', 'Edificio Costa Azul', 'juan.perez@demo.com', '60001234'
where not exists (select 1 from public.client_profiles where lower(email) = 'juan.perez@demo.com');

-- ---------------------------------------------------------------------
-- 5. Direcciones frecuentes
-- ---------------------------------------------------------------------
do $$
declare cid uuid;
begin
  select id into cid from public.client_profiles where lower(email) = 'juan.perez@demo.com';
  if cid is null then return; end if;

  insert into public.addresses (
    client_profile_id, label, facility_name, facility_type, province, district,
    corregimiento, address_line, reference_point, access_instructions, tank_capacity_gal, is_default
  )
  select cid, 'Edificio Costa Azul - Planta electrica', 'Edificio Costa Azul', 'ph_edificio',
         'Panama', 'Panama', 'San Francisco',
         'Calle 74 Este, Costa del Este, Torre A, sotano 2',
         'Frente al parque central de Costa del Este',
         'Entrada por el sotano. Avisar en garita 30 minutos antes.',
         2000, true
  where not exists (
    select 1 from public.addresses
    where client_profile_id = cid and label = 'Edificio Costa Azul - Planta electrica'
  );

  insert into public.addresses (
    client_profile_id, label, facility_name, facility_type, province, district,
    corregimiento, address_line, reference_point, tank_capacity_gal, is_default
  )
  select cid, 'Edificio Costa Azul - Tanque de agua', 'Edificio Costa Azul', 'ph_edificio',
         'Panama', 'Panama', 'San Francisco',
         'Calle 74 Este, Costa del Este, Torre A, azotea',
         'Acceso por el ascensor de servicio', 5000, false
  where not exists (
    select 1 from public.addresses
    where client_profile_id = cid and label = 'Edificio Costa Azul - Tanque de agua'
  );
end $$;

-- ---------------------------------------------------------------------
-- 6. Solicitudes demo
-- ---------------------------------------------------------------------
do $$
declare
  cid uuid;
  uid uuid;
  admin_id uuid;
  r1 uuid; r2 uuid; r3 uuid;
  q1 uuid; q2 uuid;
begin
  select id into cid from public.client_profiles where lower(email) = 'juan.perez@demo.com';
  select user_id into uid from public.client_profiles where id = cid;
  select id into admin_id from public.users where role = 'admin' limit 1;
  if cid is null then return; end if;

  -- Evita duplicar los datos demo en ejecuciones repetidas.
  if exists (select 1 from public.service_requests where client_profile_id = cid) then return; end if;

  ------------------------------------------------------------------
  -- PES-0001 : 500 gal diesel, estado "Solicitud recibida"
  ------------------------------------------------------------------
  insert into public.service_requests (
    client_profile_id, created_by_user_id, service_type, quantity_gal,
    facility_name, facility_type, province, district, corregimiento,
    address_line, reference_point, access_instructions,
    tank_capacity_gal, current_level_pct,
    preferred_date, preferred_time_slot, urgency,
    contact_name, contact_phone, contact_email, customer_comments,
    status, terms_accepted_at
  ) values (
    cid, uid, 'diesel', 500,
    'Edificio Costa Azul', 'planta_electrica', 'Panama', 'Panama', 'San Francisco',
    'Calle 74 Este, Costa del Este, Torre A, sotano 2',
    'Frente al parque central de Costa del Este',
    'Entrada por el sotano. Avisar en garita 30 minutos antes.',
    2000, 25,
    current_date + 5, '09:00-12:00', 'normal',
    'Juan Perez', '60001234', 'juan.perez@demo.com',
    'La planta electrica alimenta los ascensores. Preferimos entrega en la manana.',
    'solicitud_recibida', now()
  ) returning id into r1;

  ------------------------------------------------------------------
  -- PES-0002 : 1000 gal agua, estado "Cotizacion enviada" + COT-0001
  ------------------------------------------------------------------
  insert into public.service_requests (
    client_profile_id, created_by_user_id, service_type, quantity_gal,
    facility_name, facility_type, province, district, corregimiento,
    address_line, reference_point,
    tank_capacity_gal, current_level_pct,
    preferred_date, preferred_time_slot, urgency,
    contact_name, contact_phone, contact_email,
    status, terms_accepted_at, created_at
  ) values (
    cid, uid, 'agua', 1000,
    'Edificio Costa Azul', 'ph_edificio', 'Panama', 'Panama', 'San Francisco',
    'Calle 74 Este, Costa del Este, Torre A, azotea',
    'Acceso por el ascensor de servicio',
    5000, 15,
    current_date + 3, '08:00-10:00', 'urgente',
    'Juan Perez', '60001234', 'juan.perez@demo.com',
    'cotizacion_enviada', now() - interval '3 days', now() - interval '3 days'
  ) returning id into r2;

  -- Informacion interna del operador (solo visible para administradores)
  insert into public.internal_operator_information (
    service_request_id, operator_name, contact_person, contact_phone,
    availability, supplier_cost, transport_cost, available_date, available_time_slot,
    internal_observations, updated_by_user_id
  ) values (
    r2, 'Aliado Cisternas, S.A.', 'Carlos Rodriguez', '50761112222',
    'si', 300.00, 90.00, current_date + 3, '08:00-10:00',
    'Confirman cisterna de 2000 gal disponible. Precio negociado por volumen.',
    admin_id
  );

  insert into public.quotations (
    service_request_id, version, status,
    pricing_mode, price_per_gallon, quantity_gal, product_subtotal,
    delivery_charge, urgency_surcharge, discount, tax_rate, tax_amount, total,
    proposed_date, proposed_time_slot, payment_terms, valid_until, client_notes,
    sent_at, created_by_user_id, created_at
  ) values (
    r2, 1, 'sent',
    'por_galon', 0.4500, 1000, 450.00,
    90.00, 50.00, 0.00, 0.0000, 0.00, 590.00,
    current_date + 3, '08:00-10:00', 'Pago contra entrega', current_date + 4,
    'La cisterna llegara dentro de la ventana horaria acordada. Favor tener libre el acceso al ascensor de servicio.',
    now() - interval '2 days', admin_id, now() - interval '2 days'
  ) returning id into q1;

  -- Datos internos: el cliente demo NO puede leer esta fila (RLS solo admin).
  insert into public.quotation_internal (
    quotation_id, supplier_cost, transport_cost, other_costs,
    margin_per_gallon, margin_fixed, estimated_profit, internal_notes
  ) values (
    q1, 300.00, 90.00, 0.00, 0.0800, 0.00, 200.00,
    'Margen aplicado de 0.08 por galon mas el recargo de urgencia.'
  );

  insert into public.quotation_items (quotation_id, sort_order, concept, quantity, unit, unit_price, subtotal) values
    (q1, 0, 'Suministro de Agua potable', 1000, 'gal', 0.4500, 450.00),
    (q1, 1, 'Transporte y entrega', 1, 'servicio', 90.00, 90.00),
    (q1, 2, 'Recargo por urgencia', 1, 'servicio', 50.00, 50.00);

  insert into public.internal_notes (service_request_id, author_user_id, body) values
    (r2, admin_id, 'Cliente prioritario. Confirmar entrega por WhatsApp la noche anterior.');

  ------------------------------------------------------------------
  -- PES-0003 : 300 gal diesel, estado "Servicio completado"
  ------------------------------------------------------------------
  insert into public.service_requests (
    client_profile_id, created_by_user_id, service_type, quantity_gal,
    facility_name, facility_type, province, district, corregimiento,
    address_line, tank_capacity_gal,
    preferred_date, preferred_time_slot, urgency,
    contact_name, contact_phone, contact_email,
    status, terms_accepted_at,
    final_quantity_gal, completed_at, completion_notes,
    created_at
  ) values (
    cid, uid, 'diesel', 300,
    'Edificio Costa Azul', 'planta_electrica', 'Panama', 'Panama', 'San Francisco',
    'Calle 74 Este, Costa del Este, Torre A, sotano 2', 2000,
    current_date - 20, '09:00-12:00', 'normal',
    'Juan Perez', '60001234', 'juan.perez@demo.com',
    'servicio_completado', now() - interval '25 days',
    295, now() - interval '20 days',
    'Entrega completada sin novedad. El tanque admitio 295 galones.',
    now() - interval '25 days'
  ) returning id into r3;

  insert into public.quotations (
    service_request_id, version, status,
    pricing_mode, price_per_gallon, quantity_gal, product_subtotal,
    delivery_charge, tax_rate, tax_amount, total,
    proposed_date, proposed_time_slot, payment_terms, valid_until,
    sent_at, responded_at, created_by_user_id, created_at
  ) values (
    r3, 1, 'approved',
    'por_galon', 5.4000, 300, 1620.00,
    45.00, 0.0000, 0.00, 1665.00,
    current_date - 20, '09:00-12:00', 'Credito 15 dias', current_date - 22,
    now() - interval '24 days', now() - interval '23 days', admin_id, now() - interval '24 days'
  ) returning id into q2;

  insert into public.quotation_internal (
    quotation_id, supplier_cost, transport_cost, margin_per_gallon, estimated_profit
  ) values (q2, 1500.00, 60.00, 0.1500, 105.00);

  ------------------------------------------------------------------
  -- Historial de estados coherente para la demo.
  -- Las solicitudes r2 y r3 se insertaron ya con su estado final, por lo que
  -- el trigger solo registro una entrada. Se reemplaza por la secuencia real.
  ------------------------------------------------------------------
  delete from public.request_status_history where service_request_id in (r2, r3);

  insert into public.request_status_history
    (service_request_id, from_status, to_status, changed_by_user_id, note, created_at)
  values
    -- PES-0002 : recibida -> verificando -> cotizacion enviada
    (r2, null, 'solicitud_recibida', uid, null, now() - interval '3 days'),
    (r2, 'solicitud_recibida', 'verificando_disponibilidad', admin_id,
     'Consultando disponibilidad con la compania operadora.', now() - interval '2 days 4 hours'),
    (r2, 'verificando_disponibilidad', 'cotizacion_enviada', admin_id,
     'Tu cotizacion esta lista para revision.', now() - interval '2 days'),

    -- PES-0003 : ciclo completo hasta servicio completado
    (r3, null, 'solicitud_recibida', uid, null, now() - interval '25 days'),
    (r3, 'solicitud_recibida', 'verificando_disponibilidad', admin_id, null, now() - interval '24 days 6 hours'),
    (r3, 'verificando_disponibilidad', 'cotizacion_enviada', admin_id, null, now() - interval '24 days'),
    (r3, 'cotizacion_enviada', 'cotizacion_aprobada', null,
     'Cotizacion aprobada por el cliente.', now() - interval '23 days'),
    (r3, 'cotizacion_aprobada', 'servicio_programado', admin_id,
     'Entrega programada con la compania operadora.', now() - interval '22 days'),
    (r3, 'servicio_programado', 'servicio_completado', admin_id,
     'Servicio completado. Se entregaron 295 galones.', now() - interval '20 days');
end $$;

-- ---------------------------------------------------------------------
-- 7. Verificacion
-- ---------------------------------------------------------------------
select 'Solicitudes creadas: ' || count(*)::text as resultado from public.service_requests
union all
select 'Cotizaciones creadas: ' || count(*)::text from public.quotations
union all
select 'Clientes: ' || count(*)::text from public.client_profiles
union all
select 'Administradores: ' || count(*)::text from public.users where role = 'admin';
