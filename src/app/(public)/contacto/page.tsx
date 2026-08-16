import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { siteConfig } from '@/config/site';
import { formatPhone } from '@/lib/format';
import { getSettings } from '@/lib/supabase/queries';
import { waMessages } from '@/lib/whatsapp';

export const metadata: Metadata = { title: 'Contacto' };

export default async function ContactoPage() {
  const settings = await getSettings().catch(() => null);
  const wa = settings?.whatsapp_number || siteConfig.whatsapp;
  const email = settings?.contact_email || siteConfig.email;
  const address = settings?.address || siteConfig.address;

  return (
    <div className="pes-container pes-section">
      <p className="pes-eyebrow">Contacto</p>
      <h1 className="mt-3 max-w-xl text-[32px] font-semibold leading-tight sm:text-[40px]">
        Hablemos de tu suministro
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-navy-600">
        La vía más rápida es WhatsApp. También puedes escribirnos por correo.
      </p>

      <Reveal className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <dl className="divide-y divide-navy-100 border-t-2 border-navy-900">
            {[
              ['Correo electrónico', email, `mailto:${email}`, false],
              ['WhatsApp', formatPhone(wa), null, true],
              ['Ubicación', address, null, false],
              ['Horario', 'Lunes a viernes · 8:00 a. m. – 5:00 p. m.', null, false],
            ].map(([label, value, href, mono]) => (
              <div key={label as string} className="grid gap-1 py-5 transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-mist/60 sm:grid-cols-3 sm:gap-6">
                <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-500">{label}</dt>
                <dd className={`text-[15px] text-navy-900 sm:col-span-2 ${mono ? 'font-sans tabular-nums' : ''}`}>
                  {href ? (
                    <a href={href as string} className="transition-colors hover:text-gold-700">{value}</a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <div className="border-t-2 border-navy-900 p-6 pl-0">
            <h2 className="text-[18px] font-semibold text-navy-900">Habla con un asesor</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-600">
              Escríbenos por WhatsApp y te atendemos con prioridad.
            </p>
            <div className="mt-6 space-y-3">
              <WhatsAppButton message={waMessages.general()} number={wa} fullWidth />
              <ButtonLink href="/solicitar" variant="secondary" fullWidth>
                Solicitar servicio
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
