import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { getSettings } from '@/lib/supabase/queries';

export const metadata: Metadata = { title: 'Aviso de privacidad' };

const DEFAULT_POLICY = `Panama Energy Solutions recopila únicamente la información necesaria para atender y ejecutar tus solicitudes de suministro de diésel y agua potable: nombre, empresa, correo electrónico, teléfono, dirección de entrega y los detalles técnicos de la instalación.

Uso de la información. Los datos se utilizan para verificar disponibilidad y precio, preparar cotizaciones, programar y ejecutar la entrega, y mantener la comunicación contigo.

Compartición con terceros. PES presta directamente el servicio. Cuando una compañía aliada asiste o apoya una operación, compartimos únicamente los datos indispensables para esa ejecución: tipo de producto, cantidad, dirección de entrega, fecha y horario, y datos de la persona que recibe. No comercializamos ni cedemos tu información con fines publicitarios.

Conservación y seguridad. La información se conserva mientras exista relación comercial y por el período que exijan las obligaciones legales aplicables. Aplicamos controles de acceso por rol: cada cliente solo puede consultar sus propias solicitudes y cotizaciones.

Fotografías. Las imágenes que cargues del tanque o del acceso se almacenan de forma privada y se utilizan exclusivamente para preparar y ejecutar el servicio.

Tus derechos. Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiendo a nuestro correo de contacto.`;

export default async function PrivacidadPage() {
  const settings = await getSettings().catch(() => null);
  const text = settings?.privacy_policy || DEFAULT_POLICY;

  return (
    <div className="pes-container pes-section max-w-3xl">
      <h1 className="text-3xl font-semibold">Aviso de privacidad</h1>
      <p className="mt-2 text-sm text-navy-500">{siteConfig.name}</p>
      <div className="mt-8 space-y-4">
        {text.split('\n\n').map((p, i) => (
          <p key={i} className="leading-relaxed text-navy-600">{p}</p>
        ))}
      </div>
    </div>
  );
}
