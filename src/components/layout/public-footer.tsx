import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';
import { formatPhone } from '@/lib/format';
import { waMessages, whatsappLink } from '@/lib/whatsapp';

export function PublicFooter({ whatsapp, email }: { whatsapp?: string; email?: string }) {
  const wa = whatsapp || siteConfig.whatsapp;
  const mail = email || siteConfig.email;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-navy-900 bg-white">
      <div className="pes-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo height={42} href={null} />
          <p className="mt-4 font-sans text-[10px] uppercase tracking-eyebrow text-gold-700">
            {siteConfig.tagline}
          </p>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-navy-600">
            Suministro directo de diésel y agua potable por cisterna y barcaza en todo Panamá, con
            apoyo de compañías aliadas cuando la operación lo requiere.
          </p>
          <p className="mt-4 text-[12px] text-navy-500">
            PES es una división de{' '}
            <span className="font-medium text-navy-700">Panama Marine Solutions</span>.
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="pes-eyebrow border-b border-navy-100 pb-2">Contacto</p>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div>
              <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-400">Correo</dt>
              <dd><a href={`mailto:${mail}`} className="text-navy-700 transition-colors hover:text-navy-900">{mail}</a></dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-400">Teléfono</dt>
              <dd>
                <a href={`tel:+${siteConfig.phone}`} className="font-sans tabular-nums text-navy-700 transition-colors hover:text-navy-900">
                  {formatPhone(siteConfig.phone)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-400">WhatsApp</dt>
              <dd>
                <a
                  href={whatsappLink(waMessages.general(), wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans tabular-nums text-navy-700 transition-colors hover:text-navy-900"
                >
                  {formatPhone(wa)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-400">Ubicación</dt>
              <dd className="text-navy-700">{siteConfig.address}</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-3">
          <p className="pes-eyebrow border-b border-navy-100 pb-2">Plataforma</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li><Link href="/servicios" className="text-navy-700 transition-colors hover:text-navy-900">Servicios</Link></li>
            <li><Link href="/como-funciona" className="text-navy-700 transition-colors hover:text-navy-900">Cómo funciona</Link></li>
            <li><Link href="/solicitar" className="text-navy-700 transition-colors hover:text-navy-900">Solicitar servicio</Link></li>
            <li><Link href="/privacidad" className="text-navy-700 transition-colors hover:text-navy-900">Aviso de privacidad</Link></li>
            <li><Link href="/terminos" className="text-navy-700 transition-colors hover:text-navy-900">Términos y condiciones</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-100">
        <div className="pes-container flex flex-col justify-between gap-2 py-5 font-sans text-[10px] uppercase tracking-wide2 text-navy-400 sm:flex-row">
          <p>&copy; {year} {siteConfig.name}</p>
          <p>Panamá, República de Panamá</p>
        </div>
      </div>
    </footer>
  );
}
