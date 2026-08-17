'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'pes-attachments';

/**
 * URL firmada de corta duracion.
 * Las imágenes viven en un bucket privado: nunca se exponen URLs publicas.
 */
export async function getSignedUrl(path: string, expiresIn = 300): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export async function getSignedUrls(
  paths: string[],
  expiresIn = 300,
): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, expiresIn);
  const map: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

/**
 * Subida de un adjunto del formulario de solicitud.
 * Funciona con o sin sesión (el invitado no la tiene), por lo que se usa el
 * cliente de servicio con validacion estricta de tipo y tamano. El archivo
 * queda en un bucket privado y solo se sirve con URLs firmadas.
 */
export async function uploadAttachment(formData: FormData): Promise<{ path: string } | { error: string }> {
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Archivo inválido.' };

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    return { error: 'Formato no permitido. Usa JPG, PNG, WEBP o PDF.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'El archivo supera el limite de 5 MB.' };
  }

  const admin = createAdminClient();
  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `uploads/${crypto.randomUUID()}.${ext || 'bin'}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: 'No pudimos subir el archivo.' };
  return { path };
}
