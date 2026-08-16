import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';

export const metadata: Metadata = { title: 'Cómo funciona' };

const STEPS = [
  {
    n: '01',
    title: 'Envía tu solicitud',
    text: 'Completa el formulario indicando el servicio, la cantidad, la dirección, la fecha preferida y tus datos de contacto. Puedes hacerlo con cuenta o como invitado.',
  },
  {
    n: '02',
    title: 'PES verifica disponibilidad y precio',
<<<<<<< HEAD
    text: 'Nuestro equipo confirma la disponibilidad, el costo y las fechas posibles para tu entrega.',
=======
    text: 'Nuestro equipo consulta con las compañías operadoras aliadas la disponibilidad real, el costo y las fechas posibles para tu entrega.',
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
  },
  {
    n: '03',
    title: 'Recibe y aprueba tu cotización',
    text: 'Te enviamos una cotización con el detalle de montos, fecha propuesta, horario, condiciones de pago y vigencia. Puedes aprobarla, solicitar cambios o rechazarla.',
  },
  {
    n: '04',
    title: 'Coordinamos la entrega',
    text: 'Con la cotización aprobada confirmamos la programación del servicio y te mantenemos informado hasta que quede completado.',
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="pes-container pes-section">
      <p className="pes-eyebrow">Proceso</p>
      <h1 className="mt-3 max-w-2xl text-[32px] font-semibold leading-tight sm:text-[40px]">
        Cómo funciona
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-600">
<<<<<<< HEAD
        PES presta directamente el servicio de suministro, con apoyo de compañías aliadas cuando la operación lo requiere. Recibimos tu solicitud,
=======
        PES actúa como intermediario comercial y coordinador del servicio. Recibimos tu solicitud,
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
        gestionamos con los operadores y mantenemos la comunicación contigo durante todo el proceso.
      </p>

      <Reveal as="ol" className="motion-stagger mt-16 divide-y divide-navy-100 border-t-2 border-navy-900">
        {STEPS.map((step) => (
          <li key={step.n} className="grid gap-3 py-8 transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-mist/60 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-1">
              <span className="font-sans text-[13px] tabular-nums text-gold-700">{step.n}</span>
            </div>
            <h2 className="text-[19px] font-semibold leading-snug text-navy-900 lg:col-span-4">
              {step.title}
            </h2>
            <p className="text-[14px] leading-relaxed text-navy-600 lg:col-span-7">{step.text}</p>
          </li>
        ))}
      </Reveal>

      <DisclaimerNotice className="mt-12" />

      <div className="mt-10">
        <ButtonLink href="/solicitar" size="lg">Solicitar servicio</ButtonLink>
      </div>
    </div>
  );
}
