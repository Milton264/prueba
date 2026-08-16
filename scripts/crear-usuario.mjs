#!/usr/bin/env node
/**
 * Crea (o actualiza) un usuario en Supabase Auth YA CONFIRMADO, sin depender
 * del envío de correo. Sirve para desbloquear el acceso cuando el proyecto
 * tiene activada la confirmación de email pero no hay SMTP configurado.
 *
 * Uso:
 *   node scripts/crear-usuario.mjs <correo> <contraseña> [--admin] [--nombre "Nombre"]
 *
 * Ejemplos:
 *   node scripts/crear-usuario.mjs jefe@pes.com "Clave#Segura9" --admin --nombre "Coordinación PES"
 *   node scripts/crear-usuario.mjs cliente@correo.com "Clave#Segura9" --nombre "Juan Pérez"
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (clave de servicio, NUNCA se sube al repo)
 *
 * IMPORTANTE: este script usa la clave de servicio, que omite RLS. Ejecútalo
 * solo en tu máquina local, nunca en el navegador ni en un entorno público.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Cargar variables desde .env.local sin dependencias externas ----------
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  let raw = '';
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    console.error('No se encontró .env.local en la raíz del proyecto.');
    process.exit(1);
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

// --- Parseo de argumentos --------------------------------------------------
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Uso: node scripts/crear-usuario.mjs <correo> <contraseña> [--admin] [--nombre "Nombre"]');
  process.exit(1);
}
const email = args[0];
const password = args[1];
const isAdmin = args.includes('--admin');
const nombreIdx = args.indexOf('--nombre');
const fullName = nombreIdx !== -1 ? args[nombreIdx + 1] : email.split('@')[0];

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  const role = isAdmin ? 'admin' : 'client';

  // 1) Crear el usuario ya confirmado (email_confirm: true salta la verificación)
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    }),
  });

  let userId = null;

  if (createRes.ok) {
    const user = await createRes.json();
    userId = user.id;
    console.log(`✓ Usuario creado y confirmado: ${email}`);
  } else {
    const body = await createRes.json().catch(() => ({}));
    const msg = (body.msg || body.error_description || body.error || '').toLowerCase();

    if (msg.includes('already') || createRes.status === 422) {
      // Ya existe: lo buscamos y lo confirmamos / actualizamos contraseña.
      console.log(`• El usuario ${email} ya existe. Se confirmará y se actualizará la contraseña.`);
      const listRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
        { headers },
      );
      const list = await listRes.json();
      const found = (list.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) {
        console.error('No se pudo localizar el usuario existente para actualizarlo.');
        process.exit(1);
      }
      userId = found.id;
      const updRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password,
          email_confirm: true,
          user_metadata: { ...found.user_metadata, full_name: fullName, role },
        }),
      });
      if (!updRes.ok) {
        console.error('Error al actualizar el usuario:', await updRes.text());
        process.exit(1);
      }
      console.log(`✓ Usuario actualizado y confirmado: ${email}`);
    } else {
      console.error('Error al crear el usuario:', JSON.stringify(body));
      process.exit(1);
    }
  }

  // 2) Asegurar el registro y el rol en la tabla public.users. Se usa upsert
  //    (POST con merge-duplicates) para crear la fila si el trigger no la creó,
  //    o actualizar el rol si ya existía.
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: userId,
      email,
      role,
      full_name: fullName,
      is_active: true,
    }),
  });
  if (upsertRes.ok) {
    console.log(`✓ Rol asignado en la base de datos: ${role}`);
  } else {
    const t = await upsertRes.text();
    console.log(`• Nota: no se pudo fijar el rol vía REST (status ${upsertRes.status}): ${t}`);
    console.log('  Inicia sesión una vez (para que el trigger cree la fila) y vuelve a ejecutar este comando.');
  }

  console.log('\nListo. Ya puedes iniciar sesión en /iniciar-sesion con:');
  console.log(`  Correo:      ${email}`);
  console.log(`  Contraseña:  (la que indicaste)`);
  console.log(`  Entra a:     ${isAdmin ? '/admin (panel administrativo)' : '/portal (portal de cliente)'}`);
}

main().catch((e) => {
  console.error('Fallo inesperado:', e);
  process.exit(1);
});
