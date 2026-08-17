# Cómo acceder a la plataforma (cliente y administrador)

Esta guía resuelve el bloqueo más común al registrarse y explica dónde está el
acceso de administrador.

---

## 1. La lógica de acceso, reinventada

El acceso ya **no depende de los enlaces de confirmación por correo**, que fallaban
en local (el flujo PKCE pierde el "verificador" si abres el enlace en otro
navegador o dispositivo, y sin SMTP el correo ni llega). Ahora:

- **Al registrarte** (`/registro`), la cuenta se crea **ya confirmada** en el
  servidor y **entras directo al portal**, sin pasar por el correo.
- **Al iniciar sesión** (`/iniciar-sesion`), si por algún motivo tu cuenta
  estuviera sin confirmar, el sistema **la confirma automáticamente** y te deja
  entrar.

Esto requiere que `SUPABASE_SERVICE_ROLE_KEY` esté presente en `.env.local`.
Si falta, verás el aviso en `/diagnostico` durante el desarrollo.

> Página de diagnóstico: abre **`/diagnostico`** en el navegador para comprobar de
> un vistazo que las variables y la conexión a Supabase están bien. En producción
> la ruta responde como no encontrada.

---

## 2. Opción A (recomendada para desarrollo): desactivar la confirmación de correo

En el panel de Supabase:

1. Entra a tu proyecto → **Authentication** → **Providers** → **Email**.
2. Desactiva **"Confirm email"** (Confirmar correo).
3. Guarda.

A partir de ahí, cualquier registro nuevo entra directo al portal sin necesidad
de confirmar. Es lo más cómodo mientras desarrollas y pruebas.

> Para producción, lo correcto es dejar la confirmación activada y configurar un
> SMTP real (Authentication → Emails), para que los enlaces de confirmación y de
> recuperación de contraseña se envíen de verdad.

---

## 3. Opción B: crear cuentas ya confirmadas con un script (sin tocar SMTP)

Se incluye un script que crea (o repara) usuarios **ya confirmados**, saltándose
el correo. Úsalo en tu máquina local.

```bash
# Cliente de prueba
node scripts/crear-usuario.mjs cliente@correo.com "TuClave#Segura9" --nombre "Juan Pérez"

# Administrador
node scripts/crear-usuario.mjs jefe@pes.com "TuClave#Segura9" --admin --nombre "Coordinación PES"
```

El script lee `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` de tu
`.env.local`. Tras ejecutarlo, inicia sesión normalmente en `/iniciar-sesion`.

> La clave de servicio omite todas las reglas de seguridad (RLS). Ejecuta el
> script solo en local y nunca lo expongas al navegador.

---

## 4. ¿Dónde está el login de administrador?

**No hay una página de login separada para el administrador.** El acceso es el
mismo para todos: **`/iniciar-sesion`**. Lo que cambia es el **rol** de la
cuenta:

- Una cuenta con rol `client` entra al **portal del cliente** en `/portal`.
- Una cuenta con rol `admin` entra al **panel administrativo** en `/admin`.

El redireccionamiento es automático según el rol (lo maneja el middleware). Es
decir: te logueas en el mismo sitio, y el sistema te lleva a `/admin` o a
`/portal` según quién seas.

### ¿Cómo se vuelve admin una cuenta?

Hay dos maneras:

1. **Con el script** de arriba usando `--admin` (la más directa).
2. **Con el seed**: el archivo `supabase/seed.sql` eleva a administrador a la
   cuenta cuyo correo sea `pmn@panamarinesolutions.com`. Si registras esa
   dirección y luego corres el seed, esa cuenta pasa a ser admin. Puedes cambiar
   ese correo en el seed por el que prefieras antes de ejecutarlo.

---

## 5. ¿Y el acceso con Google / Gmail?

Hoy la plataforma **solo tiene inicio de sesión con correo y contraseña**. Puedes
usar una dirección de Gmail como tu correo, pero **no existe todavía el botón
"Continuar con Google"** (OAuth). Si quieres ese acceso con un clic mediante la
cuenta de Google, se puede añadir: requiere activar el proveedor Google en
Supabase (Authentication → Providers → Google) y agregar el botón en la
interfaz. Avísame y lo implemento como siguiente paso.

---

## Resumen rápido

| Quiero… | Cómo |
|---|---|
| Entrar como cliente | Regístrate en `/registro` y confirma correo, **o** desactiva "Confirm email", **o** usa el script. Luego entra en `/iniciar-sesion`. |
| Entrar como admin | Crea la cuenta con `--admin` (script) o vía seed, y entra en `/iniciar-sesion`. Te lleva a `/admin`. |
| Página de login admin | Es la misma: `/iniciar-sesion`. El rol decide a dónde vas. |
| Login con Google | No existe aún; se puede añadir. |
