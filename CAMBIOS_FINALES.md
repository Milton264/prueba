# Revisión final solicitada por el cliente

Fecha de revisión: 16 de agosto de 2026

## Estado de los cambios

| Solicitud | Estado | Implementación |
|---|---:|---|
| Comunicar que PES presta directamente el servicio | Cumplido | Se corrigieron inicio, servicios, proceso, pie, portal y textos legales. Las compañías aliadas se presentan únicamente como respaldo operativo cuando es necesario. |
| Saber dónde se registra cada RFQ | Cumplido | La solicitud queda en `service_requests`, vinculada a `client_profiles`; sus adjuntos quedan en `attachments` y el historial en `request_status_history`. Se consulta en `/admin/solicitudes`. |
| Notificar por correo con todos los datos | Cumplido en código | Cada nueva RFQ genera una alerta completa a `RFQ_NOTIFICATION_TO`. El destino predeterminado es `pes@panamarinesolutions.com`. La entrega real requiere configurar Resend en producción. |
| Usar `www.pes.panamarinesolutions.com` | Cumplido en proyecto | URL canónica, metadatos, sitemap, robots, enlaces administrativos y documentación usan `https://www.pes.panamarinesolutions.com`. Falta crear/asignar el DNS al publicar. |
| Sustituir fotos de baja calidad y repetidas | Cumplido | Se incorporaron imágenes profesionales nuevas para el hero y las presentaciones generales de diésel y agua. No hay archivos fotográficos duplicados. |
| Conservar las fotos de “Nuestra operación” | Cumplido | Se conservaron las tiras fotográficas originales de esas dos secciones. |
| Hero grande e impactante | Cumplido | Nuevo hero portuario de gran formato, con camión cisterna, buque, grúas y espacio de contraste para el mensaje principal. |
| Apariencia moderna y corporativa | Cumplido | Tipografías Manrope y Montserrat, jerarquía reforzada, composición premium y ajustes responsivos. |
| Íconos corporativos consistentes | Cumplido | Se normalizaron con una sola familia vectorial, el mismo grosor, tamaño y contenedores. |
| Eliminar “Sitio” de contacto | Cumplido | La página pública de contacto muestra únicamente teléfono, WhatsApp, correo, ubicación y horario. |
| Completar íconos de sectores | Cumplido | Todos usan el mismo sistema vectorial, tamaño y acabado; se evitó el recorte de trazos. |

## Recorrido de una RFQ

1. El cliente completa el formulario público o autenticado.
2. La acción del servidor valida los campos y registra la solicitud en Supabase.
3. El sistema genera su número correlativo `PES-XXXX` y el historial inicial.
4. Si corresponde, registra los archivos adjuntos y el perfil de invitado.
5. Crea una notificación para los administradores activos.
6. Envía por Resend un correo a `RFQ_NOTIFICATION_TO` con todos los datos ingresados y un enlace directo al detalle administrativo.
7. Si el proveedor de correo falla, la RFQ no se pierde: permanece registrada y visible en `/admin/solicitudes`.

El token privado de seguimiento del invitado no se incluye en el correo administrativo.

## Configuración necesaria para el correo

En Vercel deben existir estas variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RFQ_FROM_EMAIL=Panama Energy Solutions <notificaciones@panamarinesolutions.com>
RFQ_NOTIFICATION_TO=pes@panamarinesolutions.com
```

`RFQ_NOTIFICATION_TO` acepta varios destinatarios separados por comas. El dominio del remitente debe estar verificado en Resend. Sin esta configuración, la solicitud se registra correctamente, pero no puede salir la notificación externa.

## Publicación

Antes de abrir la web al público:

1. Ejecutar `supabase/migrations/06_launch_settings.sql` si se usará la base existente.
2. Configurar las variables de producción indicadas en `.env.example` y `DEPLOY.md`.
3. Asociar `www.pes.panamarinesolutions.com` al proyecto en Vercel y crear el registro DNS exacto que Vercel indique.
4. Verificar `panamarinesolutions.com` en Resend.
5. Enviar una RFQ real de prueba y confirmar simultáneamente el registro en `/admin/solicitudes` y la recepción del correo.

## Validaciones realizadas

- Compilación de producción de Next.js completada.
- Comprobación de tipos completada.
- Rutas públicas principales respondieron correctamente.
- `/diagnostico` y `/configurar-acceso` quedan cerradas en producción.
- Sitemap y robots usan el dominio final.
- Fotografías principales optimizadas y sin duplicados.
- Datos públicos de contacto y mensajería revisados.
