import type { Metadata } from 'next';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { siteConfig } from '@/config/site';
import { getSettings } from '@/lib/supabase/queries';

export const metadata: Metadata = { title: 'Términos y condiciones' };

const DEFAULT_TERMS = `Naturaleza del servicio. Panama Energy Solutions presta directamente el servicio de suministro de diésel y agua potable por cisterna. PES cuenta con compañías aliadas que asisten y apoyan sus operaciones cuando la demanda o la logística lo requieren.

Solicitudes. El envío de una solicitud a través de esta plataforma no constituye una confirmación de disponibilidad, precio ni horario. Toda solicitud queda sujeta a verificación y confirmación por parte de PES. Cuando sea necesario, las compañías aliadas podrán asistir y apoyar la operación.

Cotizaciones. Las cotizaciones emitidas por PES tienen la vigencia indicada en cada documento. Vencido ese plazo, los montos y condiciones pueden variar. La aprobación de una cotización por parte del cliente constituye la aceptación de los montos, la fecha propuesta y las condiciones de pago alli detalladas.

Cantidades. Las cantidades indicadas en la solicitud son estimadas. La cantidad final entregada se registra al completar el servicio y puede diferir de la solicitada por razones técnicas de la instalación.

Acceso y condiciones del sitio. El cliente es responsable de garantizar condiciones seguras de acceso para la cisterna, así como la exactitud de la dirección, el punto de referencia y las instrucciones de acceso proporcionadas.

Cancelaciones. El cliente puede solicitar la cancelación de una solicitud antes de que el servicio sea programado. Las cancelaciones posteriores pueden generar cargos según las condiciones indicadas por PES en la cotización.

Pagos. En esta versión de la plataforma no se procesan pagos en línea. Las condiciones de pago se establecen en cada cotización y se gestionan directamente con PES.`;

export default async function TerminosPage() {
  const settings = await getSettings().catch(() => null);
  const text = settings?.terms_conditions || DEFAULT_TERMS;

  return (
    <div className="pes-container pes-section max-w-3xl">
      <h1 className="text-3xl font-semibold">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-navy-500">{siteConfig.name}</p>
      <DisclaimerNotice className="mt-6" />
      <div className="mt-8 space-y-4">
        {text.split('\n\n').map((p, i) => (
          <p key={i} className="leading-relaxed text-navy-600">{p}</p>
        ))}
      </div>
    </div>
  );
}
