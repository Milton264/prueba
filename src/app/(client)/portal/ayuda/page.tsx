import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/misc';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { DISCLAIMER } from '@/lib/constants';
import { REQUEST_STATUS_LABELS } from '@/lib/status';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';
import type { RequestStatus } from '@/types';

export const metadata: Metadata = { title: 'Ayuda' };

const FAQ = [
  {
    q: 'Cuanto tarda la cotización?',
<<<<<<< HEAD
    a: 'PES confirma disponibilidad y precio directamente. El tiempo depende del producto y la zona; te notificamos apenas la cotización este lista.',
=======
    a: 'PES verifica disponibilidad y precio con las compañías operadoras aliadas. El tiempo depende del producto y la zona; te notificamos apenas la cotización este lista.',
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
  },
  {
    q: 'Mi solicitud confirma el precio y la fecha?',
    a: DISCLAIMER,
  },
  {
    q: 'Puedo modificar una cotización recibida?',
    a: 'Si. Desde el detalle de la solicitud puedes usar el boton "Solicitar cambios" y explicar que necesitas ajustar. Prepararemos una nueva version.',
  },
  {
    q: 'Qué pasa si no conozco la capacidad de mi tanque?',
    a: 'En el paso de cantidad puedes marcar que no la conoces. Nuestro equipo la definira contigo durante la cotización.',
  },
  {
    q: 'Como se realiza el pago?',
    a: 'Las condiciones de pago se indican en cada cotización y se gestionan directamente con PES. En esta versión no procesamos pagos en línea.',
  },
];

const STATUS_HELP: { status: RequestStatus; text: string }[] = [
  { status: 'solicitud_recibida', text: 'Recibimos tu solicitud y está en cola de revisión.' },
  { status: 'verificando_disponibilidad', text: 'Estamos consultando disponibilidad y precio con los operadores.' },
  { status: 'cotizacion_enviada', text: 'Tu cotización está lista y espera tu respuesta.' },
  { status: 'cotizacion_aprobada', text: 'Aprobaste la cotización. Procedemos a programar el servicio.' },
  { status: 'cambios_solicitados', text: 'Recibimos tu solicitud de cambios y preparamos una nueva version.' },
  { status: 'cotizacion_rechazada', text: 'La cotización fue rechazada. Puedes escribirnos para retomarla.' },
  { status: 'servicio_programado', text: 'La entrega quedo agendada para la fecha confirmada.' },
  { status: 'servicio_completado', text: 'El servicio se completo. Puedes ver la cantidad final y el comprobante.' },
  { status: 'solicitud_cancelada', text: 'La solicitud fue cancelada.' },
];

export default async function AyudaPage() {
  const settings = await getSettings().catch(() => null);

  return (
    <div>
      <PageHeader title="Ayuda" description="Respuestas rapidas y contacto directo con nuestro equipo." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Preguntas frecuentes</CardTitle></CardHeader>
            <CardContent className="divide-y divide-navy-100">
              {FAQ.map((f) => (
                <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-semibold text-navy-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{f.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Qué significa cada estado</CardTitle></CardHeader>
            <CardContent className="divide-y divide-navy-100">
              {STATUS_HELP.map((s) => (
                <div key={s.status} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
                  <p className="w-full shrink-0 text-sm font-semibold text-navy-900 sm:w-56">
                    {REQUEST_STATUS_LABELS[s.status]}
                  </p>
                  <p className="text-sm text-navy-600">{s.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gold-200 bg-gold-50">
            <CardContent className="space-y-4">
              <h2 className="text-base font-semibold text-navy-900">¿Necesitas ayuda ahora?</h2>
              <p className="text-sm leading-relaxed text-navy-600">
                Escríbenos por WhatsApp y un asesor te atenderá.
              </p>
              <WhatsAppButton
                message={waMessages.help()}
                number={settings?.whatsapp_number}
                label="Hablar por WhatsApp"
                fullWidth
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-navy-900">Documentos</p>
              <Link href="/terminos" className="block text-navy-700 hover:text-navy-500">Términos y condiciones</Link>
              <Link href="/privacidad" className="block text-navy-700 hover:text-navy-500">Aviso de privacidad</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
