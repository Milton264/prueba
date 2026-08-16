import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Droplet, Fuel } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { PhotoStrip } from '@/components/marketing/photo-strip';
import {
  AGUA_STRIP_ITEMS,
  AGUA_FEATURES,
  AGUA_SECTORS,
<<<<<<< HEAD
  DIESEL_STRIP_ITEMS,
=======
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
  DIESEL_FEATURES,
  DIESEL_SECTORS,
  FeatureBar,
  SectorsGrid,
  TrustBadges,
} from '@/components/marketing/brand-sections';
import { SERVICE_USES } from '@/lib/constants';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';

const STEPS = [
  { n: '01', title: 'Envía tu solicitud', text: 'Servicio, cantidad, dirección y fecha. Con cuenta o como invitado.' },
<<<<<<< HEAD
  { n: '02', title: 'PES verifica disponibilidad y precio', text: 'Confirmamos disponibilidad y precio directamente, con apoyo de aliados cuando hace falta.' },
=======
  { n: '02', title: 'PES verifica disponibilidad y precio', text: 'Consultamos con las compañías operadoras aliadas.' },
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
  { n: '03', title: 'Recibe y aprueba tu cotización', text: 'Montos, fecha y condiciones. Apruebas en línea.' },
  { n: '04', title: 'Coordinamos la entrega', text: 'Confirmamos la programación y te mantenemos informado.' },
];

const ADVANTAGES = [
  ['Atención rápida', 'Respondemos con prioridad y claridad.'],
  ['Coordinación centralizada', 'Un solo punto de contacto para todo el proceso.'],
  ['Cotizaciones claras', 'Montos y condiciones detallados, sin sorpresas.'],
  ['Servicio en Panamá', 'Cobertura en las principales provincias.'],
  ['Soporte por WhatsApp', 'Habla con un asesor cuando lo necesites.'],
];

export default async function HomePage() {
  const settings = await getSettings().catch(() => null);
  const wa = settings?.whatsapp_number;

  return (
    <>
<<<<<<< HEAD
      {/* ================= HERO PRINCIPAL (impactante, estilo referencia) ================= */}
      <section className="relative overflow-hidden bg-navy-950">
        {/* Fondo: foto de la cisterna con degradado navy encima */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-principal.jpg"
            alt="Camión cisterna de Panama Energy Solutions en el puerto"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/30" />
        </div>

        <div className="pes-container relative">
          <div className="grid gap-10 pb-14 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-eyebrow text-gold-400">
                Suministro por cisterna · República de Panamá
              </p>

              <h1 className="mt-6 text-balance text-[36px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[50px] lg:text-[58px]">
                Diésel y agua potable
                <span className="block text-gold-400">en todo Panamá</span>
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-navy-100">
                Abastecimiento seguro y eficiente mediante camiones cisterna y barcazas, para
                mantener sus operaciones siempre activas. PES presta el servicio directamente, con el
                apoyo de compañías aliadas cuando la operación lo requiere.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/solicitar?servicio=diesel" size="lg">
                  <Fuel className="h-4 w-4" aria-hidden />
                  Solicitar diésel
                </ButtonLink>
                <ButtonLink
                  href="/solicitar?servicio=agua"
                  size="lg"
                  className="border border-white/30 bg-white/5 text-white hover:bg-white/10"
                >
                  <Droplet className="h-4 w-4" aria-hidden />
                  Solicitar agua potable
                </ButtonLink>
              </div>
            </div>

            {/* Ficha técnica sobre panel translúcido */}
            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                <dl className="divide-y divide-white/10">
                  {[
                    ['Productos', 'Diésel · Agua potable'],
                    ['Modalidad', 'Cisterna · Barcaza'],
                    ['Cobertura', 'Panamá, Panamá Oeste, Colón'],
                    ['Respuesta', 'Cotización tras confirmación'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 py-3.5">
                      <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-200">{k}</dt>
                      <dd className="text-right text-[13px] font-medium text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-navy-200">
                  Las solicitudes están sujetas a confirmación de disponibilidad, precio y horario por
                  parte de PES.
                </p>
              </div>
            </aside>
          </div>

          <div className="border-t border-white/10 py-6">
            <TrustBadges variant="dark" />
          </div>
=======
      {/* ================= HERO GENERAL (ambos servicios) ================= */}
      <section className="border-b border-navy-100 bg-gradient-to-b from-mist to-white">
        <div className="pes-container grid gap-14 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="pes-eyebrow border-b border-navy-900 pb-2.5">
              Suministro por cisterna · República de Panamá
            </p>

            <h1 className="mt-8 text-balance text-[34px] font-semibold leading-[1.08] tracking-tight text-navy-900 sm:text-[46px] lg:text-[54px]">
              Diésel y agua potable
              <span className="block text-gold-500">en todo Panamá</span>
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-navy-600">
              Dos líneas de suministro con un solo interlocutor. Abastecimiento seguro y eficiente
              mediante camiones cisterna y barcazas, para mantener sus operaciones siempre activas.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#diesel" size="lg">
                <Fuel className="h-4 w-4" aria-hidden />
                Ver diésel
              </ButtonLink>
              <ButtonLink href="#agua" variant="secondary" size="lg">
                <Droplet className="h-4 w-4" aria-hidden />
                Ver agua potable
              </ButtonLink>
            </div>

            <TrustBadges className="mt-10 border-t border-navy-100 pt-8" />
          </div>

          {/* Ficha tecnica */}
          <aside className="lg:col-span-5">
            <div className="border-t-2 border-navy-900">
              <dl className="divide-y divide-navy-100">
                {[
                  ['Productos', 'Diésel · Agua potable'],
                  ['Modalidad', 'Cisterna · Barcaza'],
                  ['Cobertura', 'Panamá, Panamá Oeste, Colón'],
                  ['Respuesta', 'Cotización tras verificación'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-3.5">
                    <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-500">{k}</dt>
                    <dd className="text-right text-[13px] font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <DisclaimerNotice className="mt-6" />
          </aside>
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
        </div>
      </section>

      {/* ================= SEGMENTO 1: DIÉSEL ================= */}
      <section id="diesel" className="scroll-mt-20 border-b border-navy-100">
        {/* Encabezado del servicio con foto del camión */}
        <div className="pes-container grid gap-10 pt-16 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide2 text-gold-400">
              <Fuel className="h-3.5 w-3.5" aria-hidden />
              Servicio 01
            </span>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.05] tracking-tight text-navy-900 sm:text-[40px]">
              Suministro de diésel
              <span className="block text-gold-500">en todo Panamá</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-navy-600">
              Abastecimiento seguro y eficiente de diésel mediante camiones cisterna para mantener
              sus operaciones siempre activas.
            </p>
            <div className="mt-7">
              <ButtonLink href="/solicitar?servicio=diesel" size="lg">
                Solicitar diésel
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="group relative aspect-[16/11] overflow-hidden rounded-2xl shadow-[0_18px_46px_-32px_rgba(4,11,29,0.55)]">
              <Image
                src="/images/diesel/hero.jpg"
                alt="Camión cisterna de diésel PES en Ciudad de Panamá"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Sectores del diésel */}
        <div className="pes-container mt-16">
          <SectorsGrid items={DIESEL_SECTORS} />
        </div>

        {/* Características del diésel */}
<<<<<<< HEAD
        <div className="pes-container mt-14">
          <FeatureBar features={DIESEL_FEATURES} />
        </div>

        {/* Franja de fotos del diésel — Nuestra operación */}
        <div className="pes-container mb-16 mt-14 sm:mb-20">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pes-eyebrow">Nuestra operación</p>
              <h3 className="mt-3 text-[24px] font-semibold leading-tight text-navy-900 sm:text-[28px]">
                Energía que no se detiene
              </h3>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-navy-500">
              {SERVICE_USES.diesel.join(' · ')}
            </p>
          </div>
          <PhotoStrip items={DIESEL_STRIP_ITEMS} />
        </div>
=======
        <div className="pes-container mt-14 pb-16 sm:pb-20">
          <FeatureBar features={DIESEL_FEATURES} />
        </div>
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
      </section>

      {/* ================= SEGMENTO 2: AGUA POTABLE ================= */}
      <section id="agua" className="scroll-mt-20 border-b border-navy-100 bg-mist">
        {/* Encabezado del servicio con foto del camión */}
        <div className="pes-container grid gap-10 pt-16 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide2 text-gold-400">
              <Droplet className="h-3.5 w-3.5" aria-hidden />
              Servicio 02
            </span>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.05] tracking-tight text-navy-900 sm:text-[40px]">
              Suministro de agua potable
              <span className="block text-gold-500">en todo Panamá</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-navy-600">
              Abastecimiento seguro y eficiente de agua potable mediante modernas barcazas y camiones
              cisterna para todo tipo de establecimientos, operaciones críticas y embarcaciones en
              puertos de Panamá.
            </p>
            <div className="mt-7">
              <ButtonLink href="/solicitar?servicio=agua" size="lg">
                Solicitar agua potable
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-[0_18px_46px_-32px_rgba(4,11,29,0.55)]">
              <Image
                src="/images/agua/hero.jpg"
                alt="Camión cisterna de agua potable PES en un puerto de Panamá"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </div>
          </div>
        </div>

        {/* Sectores del agua */}
        <div className="pes-container mt-16">
          <SectorsGrid items={AGUA_SECTORS} />
        </div>

        {/* Características del agua */}
        <div className="pes-container mt-14">
          <FeatureBar features={AGUA_FEATURES} />
        </div>

        {/* Franja de fotos del agua (una sola línea, como en el flyer) */}
        <div className="pes-container mb-16 mt-14 sm:mb-20">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pes-eyebrow">Nuestra operación</p>
              <h3 className="mt-3 text-[24px] font-semibold leading-tight text-navy-900 sm:text-[28px]">
                Agua potable de calidad, tierra y mar
              </h3>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-navy-500">
              {SERVICE_USES.agua.join(' · ')}
            </p>
          </div>
          <PhotoStrip items={AGUA_STRIP_ITEMS} />
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA (común) ================= */}
      <section id="como-funciona" className="pes-section border-b border-navy-100">
        <div className="pes-container">
          <p className="pes-eyebrow">Proceso</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">Cómo funciona</h2>

          <Reveal as="ol" className="motion-stagger mt-12 grid gap-px bg-navy-100 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="group border-t-2 border-navy-900 bg-white p-6 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:bg-mist hover:shadow-[0_14px_30px_-26px_rgba(4,11,29,0.6)]">
                <span className="font-sans text-[11px] tabular-nums text-gold-700">{step.n}</span>
                <h3 className="mt-4 text-[15px] font-semibold leading-snug text-navy-900">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">{step.text}</p>
              </li>
            ))}
          </Reveal>

          <DisclaimerNotice className="mt-10 bg-white" />
        </div>
      </section>

      {/* ================= VENTAJAS (común) ================= */}
      <section className="pes-section border-b border-navy-100 bg-mist">
        <div className="pes-container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="pes-eyebrow">Por qué PES</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">
              Coordinación, no improvisación
            </h2>
          </div>
          <dl className="divide-y divide-navy-100 border-t-2 border-navy-900 lg:col-span-8">
            {ADVANTAGES.map(([title, text]) => (
              <div key={title} className="grid gap-1 py-5 transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/60 sm:grid-cols-3 sm:gap-6">
                <dt className="text-[15px] font-semibold text-navy-900">{title}</dt>
                <dd className="text-[14px] leading-relaxed text-navy-600 sm:col-span-2">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= CIERRE (común) ================= */}
      <section>
        <div className="pes-container flex flex-col items-start gap-7 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Logo height={42} href={null} />
            <h2 className="mt-7 max-w-md text-balance text-[26px] font-semibold leading-tight text-navy-900 sm:text-[32px]">
              Listo para solicitar tu suministro
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-navy-600">
              Envía tu solicitud en menos de tres minutos. Verificamos disponibilidad y te
              respondemos con una cotización.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/solicitar" size="lg">Solicitar cotización</ButtonLink>
            <ButtonLink href="/iniciar-sesion" variant="secondary" size="lg">Ya tengo cuenta</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
