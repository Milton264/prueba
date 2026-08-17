# PES — Panama Energy Solutions

Plataforma web responsive para recibir y gestionar solicitudes de suministro de **diésel** y **agua potable** por cisterna en Panamá.

> **PES presta directamente el servicio.** Cuando la demanda o la logística lo requieren, compañías aliadas asisten y apoyan las operaciones de PES. La plataforma cubre el ciclo: solicitud → verificación de disponibilidad → cotización → aprobación → programación → servicio completado.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Instalación](#2-instalación)
3. [Configurar Supabase](#3-configurar-supabase)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Datos de demostración](#5-datos-de-demostración)
6. [Ejecutar en local](#6-ejecutar-en-local)
7. [Colocar el logo oficial](#7-colocar-el-logo-oficial)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Estados de la solicitud](#10-estados-de-la-solicitud)
11. [Cómo se protegen los datos internos](#11-cómo-se-protegen-los-datos-internos)
12. [WhatsApp](#12-whatsapp)
13. [Fuera de alcance](#13-fuera-de-alcance-en-esta-versión)
14. [Despliegue](#14-despliegue)

---

## 1. Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Una cuenta gratuita en [Supabase](https://supabase.com)
- Una cuenta en [Vercel](https://vercel.com) para publicar
- Una cuenta en [Resend](https://resend.com) para las alertas inmediatas de nuevas RFQ

---

## 2. Instalación

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local` con los valores del paso 4.

---

## 3. Supabase — ya está configurado

El proyecto está creado y migrado. No necesitas hacer nada de esta sección salvo copiar una llave.

| Dato | Valor |
|---|---|
| Proyecto | `PES Panama Energy Solutions` |
| Referencia | `fgwvttdcxebwxsaitmag` |
| Región | `us-east-1` |
| URL | `https://fgwvttdcxebwxsaitmag.supabase.co` |

**Ya aplicado:** las 14 tablas, la numeración correlativa `PES-0001` / `COT-0001`, los triggers de historial, las políticas RLS, el bucket privado `pes-attachments`, el endurecimiento de funciones y los datos de demostración.

### 3.1 Si necesitas recrearlo desde cero

Ejecuta en el SQL Editor, en este orden:

| Orden | Archivo |
|---|---|
| 1 | `supabase/migrations/01_schema.sql` |
| 2 | `supabase/migrations/02_functions.sql` |
| 3 | `supabase/migrations/03_rls.sql` |
| 4 | `supabase/migrations/04_storage.sql` |
| 5 | `supabase/migrations/05_hardening.sql` |
| 6 | `supabase/seed.sql` |
| 7 | `supabase/migrations/06_launch_settings.sql` (solo para actualizar una instalación existente) |

Todos son idempotentes: puedes volver a ejecutarlos sin romper nada.

---

## 4. Variables de entorno

Completa `.env.local` con las llaves de Supabase y la configuración de correo:

```env
SUPABASE_SERVICE_ROLE_KEY=PEGAR_AQUI_LA_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://www.pes.panamarinesolutions.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RFQ_FROM_EMAIL=Panama Energy Solutions <notificaciones@panamarinesolutions.com>
RFQ_NOTIFICATION_TO=pes@panamarinesolutions.com
```

Obtenla en **Supabase → Project Settings → API Keys → `service_role` → Reveal**.

Sin la llave de servicio no funcionan las solicitudes de invitados ni el acceso por enlace `/s/[token]`. Sin las tres variables de correo, la RFQ sí queda guardada en Supabase y en el panel, pero no sale la alerta por email.

> ⚠️ Esa llave omite todas las políticas de seguridad. Solo se usa en el servidor. Nunca le pongas el prefijo `NEXT_PUBLIC_` ni la subas al repositorio.

---

## 5. Cuentas creadas

| Correo | Contraseña | Rol |
|---|---|---|
| `pmn@panamarinesolutions.com` | `PesAdmin2026!` | Administrador |
| `juan.perez@demo.com` | `PesDemo2026!` | Cliente demo |

Ambas con el correo ya confirmado. **Cambia estas contraseñas antes de recibir clientes reales.**

### 5.1 Datos de demostración cargados

- Cliente **Juan Pérez** — *Edificio Costa Azul*, con dos direcciones frecuentes.
- **PES-0001** — 500 gal de diésel · *Solicitud recibida*.
- **PES-0002** — 1,000 gal de agua potable · *Cotización enviada* · con **COT-0001**, sus datos internos y una nota interna.
- **PES-0003** — 300 gal de diésel · *Servicio completado*, con cantidad final registrada.

Verificado: al consultar como Juan Pérez, la base devuelve sus 3 solicitudes y 2 cotizaciones, y **cero** filas de márgenes, datos de operador o notas internas.

---

## 5.2 Endurecimiento pendiente

Dos tareas que solo se hacen desde el panel de Supabase.

### Rotar la llave de servicio

La llave `service_role` es un JWT heredado y **no se puede rotar por separado**: hacerlo implicaría cambiar el secreto JWT del proyecto, lo que invalidaría también la llave anónima. Supabase ya deprecó ese formato (deja de funcionar a finales de 2026).

El camino correcto es migrar al formato nuevo:

1. Entra a **Settings → API Keys** del proyecto.
2. En la sección **Secret keys**, pulsa **Create new secret key**. Obtienes una llave `sb_secret_...`.
3. Reemplaza el valor de `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` por la nueva llave. El nombre de la variable no cambia.
4. En **Publishable key**, copia la llave `sb_publishable_...` y reemplaza `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Verifica que la plataforma siga funcionando.
6. Solo entonces, en la pestaña **Legacy API Keys**, desactiva `anon` y `service_role`.

No hay que tocar código: la aplicación lee ambos formatos indistintamente.

Las llaves nuevas además traen una protección extra: una `sb_secret_...` devuelve 401 si se usa desde un navegador, aunque se filtre.

### Requisitos de contraseña

En **Authentication → Sign In / Providers → Email**, sección *Password Requirements*:

- Longitud mínima: 8 caracteres o más.
- Caracteres requeridos: dígitos, minúsculas, mayúsculas y símbolos.

> La opción **Prevent use of leaked passwords** (contraste contra HaveIBeenPwned) **requiere plan Pro**. En el plan gratuito no está disponible.

---

## 6. Ejecutar en local

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # verificación de tipos
npm run build        # build de producción
```

| Ruta | Área |
|---|---|
| `/` | Página pública |
| `/solicitar` | Formulario para invitados |
| `/iniciar-sesion` | Acceso |
| `/portal` | Portal del cliente |
| `/admin` | Panel administrativo |
| `/s/[token]` | Seguimiento del invitado por enlace privado |

---

## 7. Sistema visual y logotipo

### 7.1 Dirección de diseño

La interfaz sigue una dirección **industrial técnica**, no un tema genérico de panel. Las decisiones deliberadas:

- **Manrope + Montserrat.** Manrope mantiene la interfaz clara y Montserrat aporta jerarquía corporativa y un acabado más premium en titulares.
- **Esquinas rectas** (2 px). Sin píldoras ni tarjetas flotantes.
- **Reglas en vez de sombras.** La jerarquía la construyen los bordes y el espaciado. `border-t-2 border-navy-900` abre cada bloque de peso.
- **Cifras tabulares.** Galones, montos y folios se alinean en columna.
- **Rótulos en versalitas** con el tracking abierto del logotipo (`.pes-eyebrow`).
- **Estados con barra vertical de color**, no con píldoras de fondo tenue.
- **Métricas en fila reglada** (`MetricRow`), no en rejilla de tarjetas.

### 7.2 Dónde tocar cada cosa

| Quieres cambiar | Archivo |
|---|---|
| Colores, radios, sombras, tracking | `tailwind.config.ts` |
| Clases reutilizables (`.pes-card`, `.pes-eyebrow`, `.pes-num`) | `src/app/globals.css` |
| Tipografía | `src/app/layout.tsx` |
| Botones | `src/components/ui/button.tsx` |
| Campos y formularios | `src/components/ui/input.tsx` |
| Colores de estado | `src/lib/status.ts` → `TONE_BAR`, `TONE_TEXT` |
| Métricas | `src/components/ui/stat-card.tsx` |

Los tokens están centralizados: cambiar `gold.400` en `tailwind.config.ts` repinta todos los acentos de las 30 páginas.

### 7.3 Contraste

Los 17 pares de color de la interfaz están verificados contra WCAG AA. El dorado del logotipo (`#C68605`) solo se usa en texto grande, donde 3.08:1 cumple el umbral; para texto normal se usa `gold-700` (6.49:1).

### 7.4 Logotipo

El logo **no se rediseña**. Reemplaza estos archivos conservando los nombres:

```
public/brand/pes-logo.png         Sobre fondo claro
public/brand/pes-logo-white.png   Sobre fondo navy
public/brand/pes-isotipo.png      Solo el símbolo PES
public/brand/favicon.png          Favicon
```

El componente `<Logo />` calcula el ancho a partir de la altura y de la proporción real del archivo, así que nunca se deforma.

## 8. Estructura del proyecto

```
src/
├── app/
│   ├── (public)/       Inicio, servicios, cómo funciona, contacto, legales, solicitar
│   ├── (auth)/         Iniciar sesión, registro, recuperar
│   ├── (client)/       Portal del cliente (protegido)
│   ├── (admin)/        Panel administrativo (protegido)
│   ├── s/[token]/      Acceso del invitado por enlace
│   └── solicitud-enviada/[id]/
├── components/
│   ├── brand/          Logo y eslogan
│   ├── ui/             Primitivos: botones, tarjetas, campos, tablas, diálogos, línea de tiempo
│   ├── layout/         Encabezados, sidebar, pie
│   ├── whatsapp/       Botones y FAB
│   ├── request/        Wizard de 5 pasos, tarjetas, filtros
│   ├── quotation/      Vista del cliente, constructor, acciones
│   └── admin/          Operador, notas internas, cambio de estado, completar servicio
├── lib/
│   ├── supabase/       Clientes de navegador, servidor y servicio
│   ├── actions/        Server Actions por dominio
│   ├── validations/    Esquemas Zod
│   ├── email/          Plantilla y envío de alertas completas de RFQ
│   ├── pricing.ts      Motor de cálculo de cotizaciones
│   ├── status.ts       Estados y transiciones permitidas
│   ├── whatsapp.ts     Constructor de enlaces con mensajes prellenados
│   └── panama.ts       Provincias, distritos y corregimientos
└── middleware.ts       Protección de rutas por rol

supabase/
├── migrations/         01_schema · 02_functions · 03_rls · 04_storage · 05_hardening · 06_launch_settings
└── seed.sql            Datos de demostración
```

**Principio de arquitectura:** las lecturas ocurren en Server Components; las escrituras, en Server Actions. El cliente de Supabase en el navegador solo se usa para autenticación. Los totales de las cotizaciones **siempre se recalculan en el servidor**: nunca se confía en los montos enviados desde el navegador.

---

## 9. Roles y permisos

| Rol | Acceso |
|---|---|
| **Invitado** | Envía una solicitud sin cuenta. Consulta y responde su cotización mediante un enlace privado con token (`/s/[token]`). Si luego se registra con el mismo correo, sus solicitudes previas se vinculan automáticamente. |
| **Cliente** | Ve únicamente sus propias solicitudes y cotizaciones. Aprueba, rechaza o solicita cambios. |
| **Administrador** | Acceso total: solicitudes, cotizaciones, clientes, servicios, reportes y configuración. |

`src/middleware.ts` protege las rutas por rol; Row Level Security lo refuerza a nivel de base de datos.

---

## 10. Estados de la solicitud

```
Solicitud recibida
   ├→ Verificando disponibilidad → Cotización enviada
   │                                  ├→ Cotización aprobada → Servicio programado → Servicio completado
   │                                  ├→ Cambios solicitados → (nueva versión) → Cotización enviada
   │                                  └→ Cotización rechazada
   └→ Solicitud cancelada
```

Cada cambio queda registrado con fecha y hora en `request_status_history`, y alimenta la línea de tiempo que ve el cliente. Las transiciones se validan en el servidor; el administrador puede forzar una excepción marcando la casilla correspondiente.

---

## 11. Cómo se protegen los datos internos

El cliente **nunca** debe ver el costo del proveedor, el margen de PES, la ganancia estimada ni las observaciones internas. La protección es estructural, no solo de interfaz.

**1. Tablas separadas, no columnas ocultas.**
Row Level Security en Postgres opera a nivel de *fila*, no de columna: si el cliente pudiera leer la fila, leería todas sus columnas. Por eso los campos internos no viven en `quotations`, sino en **`quotation_internal`**, cuya única política RLS exige rol de administrador. Un cliente que consultara la API REST directamente con `select *` sobre `quotations` obtendría solo los conceptos finales. Lo mismo aplica a `internal_operator_information` e `internal_notes`: no tienen ninguna política para clientes, así que RLS les niega el acceso por completo.

**2. El cliente no tiene permiso de escritura sobre las cotizaciones.**
Si tuviera `UPDATE` sobre `quotations` —aunque fuera solo sobre las suyas— podría alterar el total o el precio por galón con una petición directa a la API. En su lugar, la única vía de respuesta es la función `respond_to_quotation()`, que es `SECURITY DEFINER`, verifica que la solicitud le pertenezca y solo modifica el estado y el mensaje de respuesta.

**3. La solicitud se actualiza por trigger, no por el cliente.**
Cuando una cotización cambia de estado, el trigger `sync_request_status_from_quotation()` propaga el cambio a `service_requests`. Así el cliente tampoco necesita permiso de escritura sobre sus solicitudes.

**4. Vista `quotations_public`.**
El portal lee de esta vista, que además excluye los borradores. Es una segunda barrera de lectura sobre la primera.

**5. Enlace del invitado.**
`get_request_by_token` y `respond_to_quotation_by_token` son `SECURITY DEFINER` y devuelven o modifican exclusivamente campos públicos, tras comprobar que la cotización pertenece a la solicitud de ese token.

**6. Fotografías.**
Bucket privado con URLs firmadas de 5 minutos. La política de storage se resuelve contra la tabla `attachments` y respeta la bandera `is_client_visible`. Nunca se generan URLs públicas.

**7. Los totales se recalculan en el servidor.**
`saveQuotation` ignora los montos que llegan del navegador y vuelve a calcular subtotal, impuestos, total y ganancia con `src/lib/pricing.ts`.

## 12. WhatsApp

Enlaces directos `wa.me` con mensajes prellenados. No se usa la API de WhatsApp Business en esta versión.

El número se toma de `NEXT_PUBLIC_WHATSAPP_NUMBER` y puede sobrescribirse desde **/admin/configuración**.

Botones disponibles en: página principal (fijo y flotante), confirmación de solicitud, detalle de solicitud, cotización, sección de ayuda, ficha del cliente y — para el administrador — consulta al operador aliado.

Todas las plantillas están centralizadas en `src/lib/whatsapp.ts`.

### Alertas por correo de nuevas RFQ

Cada solicitud se registra en `service_requests`, se relaciona con `client_profiles`, genera historial en `request_status_history` y aparece en `/admin/solicitudes`. Además, `src/lib/email/rfq-notification.ts` envía a `RFQ_NOTIFICATION_TO` un correo con todos los datos introducidos por el cliente. Se pueden indicar varios destinatarios separados por comas. El correo usa Resend y el dominio remitente debe estar verificado. El panel `/admin/configuracion` muestra de forma segura el destino y si las variables necesarias están completas.

---

## 13. Fuera de alcance en esta versión

Deliberadamente **no** incluidos: GPS, mapas, seguimiento en vivo de cisternas, ubicación en tiempo real, datos del conductor o número de placa, portal para proveedores, aplicación para conductores y pagos en línea.

PES presta el servicio directamente. Cuando una compañía aliada asiste una operación, sus datos y costos se registran únicamente en la sección administrativa **Información del operador** y nunca se exponen al cliente.

---

## 14. Despliegue

Consulta [`DEPLOY.md`](./DEPLOY.md) para las instrucciones completas de publicación en Vercel.
