import Link from 'next/link';
import { ArrowLeft, Droplets, Fuel, Truck } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-navy-100 bg-mist p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 12%, #FDF6E7 0, transparent 45%), radial-gradient(circle at 10% 88%, #FFFFFF 0, transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative">
          <Logo height={52} />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-700">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-2xl font-semibold leading-snug text-navy-900">
            Soluciones de energía y agua cuando las necesitas
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-navy-600">
            PES presta directamente el suministro de diésel y agua potable por cisterna en Panamá,
            con el apoyo de compañías aliadas cuando la operación lo requiere.
          </p>

          <ul className="mt-10 flex gap-8">
            {[
              { icon: Fuel, label: 'Diésel', tone: 'bg-gold-50 text-gold-700' },
              { icon: Droplets, label: 'Agua potable', tone: 'bg-sky-50 text-sky-600' },
              { icon: Truck, label: 'Operación directa', tone: 'bg-navy-50 text-navy-600' },
            ].map(({ icon: Icon, label, tone }) => (
              <li key={label} className="group flex flex-col items-center gap-2 text-center">
                <span className={`icon-response grid h-11 w-11 place-items-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs text-navy-500">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-navy-500">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col justify-center bg-white px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo height={40} />
          </div>

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 transition-[color,transform] duration-200 hover:-translate-x-0.5 hover:text-navy-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al inicio
          </Link>

          {children}
        </div>
      </main>
    </div>
  );
}
