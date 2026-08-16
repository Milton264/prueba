import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { FeatureBar, SectorsGrid } from '@/components/marketing/brand-sections';
import { Reveal } from '@/components/ui/reveal';
import { SERVICE_DESCRIPTIONS, SERVICE_USES } from '@/lib/constants';

export const metadata: Metadata = { title: 'Servicios' };

const SERVICES = [
  { type: 'diesel' as const, code: '01', title: 'Diésel' },
  { type: 'agua' as const, code: '02', title: 'Agua potable' },
];

export default function ServiciosPage() {
  return (
    <div className="pes-container pes-section">
      <p className="pes-eyebrow">Servicios</p>
      <h1 className="mt-3 max-w-2xl text-[32px] font-semibold leading-tight sm:text-[40px]">
<<<<<<< HEAD
        Suministro por cisterna, de punta a punta
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-600">
        Panama Energy Solutions presta directamente el suministro de diésel y agua potable, con el
        respaldo de compañías aliadas que apoyan nuestras operaciones cuando es necesario. Recibimos
        tu solicitud, confirmamos disponibilidad y precio, y te acompañamos hasta la entrega.
=======
        Suministro por cisterna, coordinado de punta a punta
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-600">
        Panama Energy Solutions coordina el suministro con compañías operadoras aliadas. Recibimos
        tu solicitud, verificamos disponibilidad y precio, y te acompañamos hasta la entrega.
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
      </p>

      <div className="mt-16 space-y-16">
        {SERVICES.map(({ type, code, title }, index) => (
          <Reveal key={type} delay={index * 60}>
          <section className="grid gap-8 border-t-2 border-navy-900 pt-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="font-sans text-[11px] tabular-nums text-gold-700">{code}</span>
              <h2 className="mt-2 text-[26px] font-semibold text-navy-900">{title}</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-navy-600">
                {SERVICE_DESCRIPTIONS[type]}
              </p>
              <Link
                href={`/solicitar?servicio=${type}`}
                className="group mt-6 inline-flex items-center gap-2 border-b-2 border-gold-400 pb-1 font-sans text-[11px] font-semibold uppercase tracking-wide2 text-navy-900 transition-[border-color,color] duration-200 hover:border-navy-900"
              >
                Solicitar {title.toLowerCase()}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            <div className="lg:col-span-8">
              <p className="pes-eyebrow border-b border-navy-100 pb-2">Aplicaciones</p>
              <ul className="grid gap-px bg-navy-100 sm:grid-cols-2">
                {SERVICE_USES[type].map((use, i) => (
                  <li key={use} className="flex items-baseline gap-3 bg-white py-3.5 pr-4 transition-[background-color,transform] duration-200 hover:translate-x-1 hover:bg-mist">
                    <span className="font-sans text-[10px] tabular-nums text-navy-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14px] text-navy-700">{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          </Reveal>
        ))}
      </div>

      <DisclaimerNotice className="mt-16" />

      <div className="mt-20 border-t border-navy-100 pt-16">
        <SectorsGrid />
      </div>

      <div className="mt-16">
        <FeatureBar />
      </div>
    </div>
  );
}
