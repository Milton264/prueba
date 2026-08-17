# Despliegue en Vercel

Guía paso a paso para publicar la plataforma de Panama Energy Solutions.

---

## 1. Antes de empezar

Ten listo:

- El proyecto de Supabase creado, con los scripts SQL requeridos ya ejecutados (ver `README.md`, sección 3).
- Las tres llaves de Supabase (**Project Settings → API**).
- El repositorio subido a GitHub, GitLab o Bitbucket.

```bash
git init
git add .
git commit -m "PES: plataforma inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/pes-platform.git
git push -u origin main
```

> Verifica que `.env.local` **no** esté en el repositorio. Ya está listado en `.gitignore`.

---

## 2. Importar el proyecto en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new).
2. Selecciona tu repositorio → **Import**.
3. Vercel detecta Next.js automáticamente. No cambies *Framework Preset*, *Build Command* ni *Output Directory*.

---

## 3. Variables de entorno

Antes de pulsar **Deploy**, abre **Environment Variables** y agrega:

| Nombre | Valor | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://www.pes.panamarinesolutions.com` | Production |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `50766794702` | Production, Preview, Development |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `pes@panamarinesolutions.com` | Production, Preview, Development |
| `NEXT_PUBLIC_COMPANY_NAME` | `Panama Energy Solutions` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxxx` | Production |
| `RFQ_FROM_EMAIL` | `Panama Energy Solutions <notificaciones@panamarinesolutions.com>` | Production |
| `RFQ_NOTIFICATION_TO` | `pes@panamarinesolutions.com` | Production |
| `ENABLE_SETUP_ROUTE` | `false` | Production, Preview, Development |
| `SETUP_SECRET` | Una clave larga y única | Production, Preview, Development |

> **`SUPABASE_SERVICE_ROLE_KEY` es sensible.** Vercel la mantiene cifrada y solo disponible en el servidor. Nunca le antepongas el prefijo `NEXT_PUBLIC_`: eso la expondría al navegador.

Pulsa **Deploy**. El primer despliegue toma 2–3 minutos.

---

## 4. Ajustar Supabase con la URL definitiva

Una vez publicado, vuelve a Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://www.pes.panamarinesolutions.com`
- **Redirect URLs:** agrega, uno por línea:
  ```
  https://www.pes.panamarinesolutions.com/auth/callback
  https://tu-proyecto.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  ```

Sin este paso, la confirmación de correo y la recuperación de contraseña fallarán.

---

## 5. Dominio propio

1. En Vercel: **Settings → Domains → Add**.
2. Agrega exactamente `www.pes.panamarinesolutions.com`.
3. En la zona DNS de `panamarinesolutions.com`, crea el registro que indique Vercel. Normalmente será:
   - Tipo `CNAME`
   - Nombre/Host `www.pes`
   - Destino `cname.vercel-dns.com`
4. La propagación puede tardar hasta 48 horas. El certificado SSL se emite solo.
5. Confirma que `NEXT_PUBLIC_SITE_URL` conserva el dominio exacto y vuelve a desplegar.

### 5.1 Correo de nuevas RFQ

1. En Resend, verifica el dominio `panamarinesolutions.com` con los registros DNS que te entregue el servicio.
2. Crea una API key y guárdala como `RESEND_API_KEY` en Vercel.
3. Define `RFQ_FROM_EMAIL` con un remitente del dominio verificado.
4. Define `RFQ_NOTIFICATION_TO`. Puedes agregar varios correos separados por comas.
5. Confirma en `/admin/configuracion` que aparezca **Correo activo** y que el destinatario sea correcto.
6. Envía una RFQ de prueba y comprueba que aparece en `/admin/solicitudes` y que llega un correo con todos sus campos.

---

## 6. Lista de verificación posterior

Recorre la plataforma y confirma:

- [ ] La página de inicio carga con el logo y los colores de PES.
- [ ] El aviso *"Las solicitudes están sujetas a confirmación..."* es visible.
- [ ] Los botones de WhatsApp abren la aplicación con el mensaje prellenado y el número correcto.
- [ ] Se puede enviar una solicitud **como invitado** y aparece la pantalla de confirmación con el número `PES-XXXX`.
- [ ] La misma solicitud aparece en `/admin/solicitudes` y llega completa a `RFQ_NOTIFICATION_TO`.
- [ ] El enlace `/s/[token]` del invitado muestra el estado de su solicitud.
- [ ] El registro de un cliente funciona y entra al portal.
- [ ] El administrador entra a `/admin` y ve la solicitud recién creada.
- [ ] Se puede crear una cotización, ver la vista previa y enviarla.
- [ ] El cliente ve la cotización y puede aprobarla, rechazarla o pedir cambios.
- [ ] **Un cliente NO ve el costo del proveedor, el margen ni la ganancia de PES.**
- [ ] La subida de fotografías funciona y las imágenes se muestran.
- [ ] Todo se ve correctamente en un teléfono.

---

## 7. Antes de recibir clientes reales

1. **Cambia las contraseñas demo.** `pmn@panamarinesolutions.com` y `juan.perez@demo.com` traen contraseñas conocidas.
2. **Activa la confirmación de correo.** Supabase → *Authentication → Providers → Email → Confirm email*.
3. **Elimina los datos de demostración.** En el SQL Editor:
   ```sql
   delete from public.service_requests
    where client_profile_id in (
      select id from public.client_profiles where email like '%@demo.com'
    );
   delete from public.client_profiles where email like '%@demo.com';
   ```
4. **Configura el impuesto real** en `/admin/configuración` (formato decimal: `0.07` para 7%).
5. **Sube el logo oficial** a `public/brand/` (ver `README.md`, sección 7).
6. **Revisa los textos legales** de aviso de privacidad y términos en `/admin/configuración`.
7. **Activa una copia de seguridad** en Supabase → *Database → Backups*.
8. **Ejecuta `supabase/migrations/06_launch_settings.sql`** si la base ya existía antes de esta entrega.
9. **Mantén `ENABLE_SETUP_ROUTE=false`.** Si necesitas reparar una cuenta, actívala temporalmente junto con `SETUP_SECRET` y desactívala al terminar.

---

## 8. Problemas frecuentes

**El build falla al descargar Manrope o Montserrat.**
El entorno de build no tiene salida a internet. En Vercel esto no ocurre. En local, ejecuta el build con conexión.

**Los usuarios inician sesión pero el portal aparece vacío.**
Falta ejecutar `03_rls.sql`, o el usuario no tiene fila en `client_profiles`. Verifica que el trigger `on_auth_user_created` exista en Supabase → *Database → Triggers*.

**Las solicitudes de invitado devuelven error.**
Falta `SUPABASE_SERVICE_ROLE_KEY` en las variables de entorno de Vercel, o está mal copiada.

**Las fotografías no se ven.**
Ejecuta `04_storage.sql` y confirma que el bucket `pes-attachments` existe y está marcado como privado.

**Los números de solicitud no se generan.**
Falta `02_functions.sql`, que crea las secuencias y los triggers de numeración.

---

## 9. Actualizaciones futuras

Cada `git push` a `main` despliega automáticamente en producción. Las ramas generan entornos de vista previa.

Si una actualización agrega tablas o columnas, crea un archivo nuevo en `supabase/migrations/` y ejecútalo manualmente en el SQL Editor **antes** de desplegar el código que lo necesita.
