-- =====================================================================
-- 04_storage.sql : bucket privado para fotografias y comprobantes
-- Las imagenes se sirven siempre con URLs firmadas de corta duracion.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pes-attachments',
  'pes-attachments',
  false,                                   -- bucket PRIVADO
  5242880,                                 -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lectura: administradores, o el cliente dueno de la solicitud.
-- La comprobacion se hace contra la tabla attachments y no contra la ruta del
-- archivo, para que funcione con cualquier convencion de nombres y para
-- respetar la bandera is_client_visible.
drop policy if exists "pes_attachments_select" on storage.objects;
create policy "pes_attachments_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pes-attachments' and (
      public.is_admin() or exists (
        select 1
          from public.attachments a
          join public.service_requests r on r.id = a.service_request_id
         where a.storage_path = storage.objects.name
           and a.is_client_visible
           and r.client_profile_id = public.my_client_profile_id()
      )
    )
  );

drop policy if exists "pes_attachments_insert" on storage.objects;
create policy "pes_attachments_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pes-attachments');

drop policy if exists "pes_attachments_admin" on storage.objects;
create policy "pes_attachments_admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'pes-attachments' and public.is_admin())
  with check (bucket_id = 'pes-attachments' and public.is_admin());
