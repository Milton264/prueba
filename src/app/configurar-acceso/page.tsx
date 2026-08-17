import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProvisionForm } from './provision-form';

export const metadata: Metadata = { title: 'Configurar acceso' };
export const dynamic = 'force-dynamic';

export default function ConfigurarAccesoPage() {
  if (process.env.ENABLE_SETUP_ROUTE !== 'true' || !process.env.SETUP_SECRET) notFound();

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-sans text-2xl font-semibold text-navy-900">Configurar acceso</h1>
      <p className="mt-2 text-sm leading-relaxed text-navy-500">
        Crea o repara tu cuenta y entra al instante, sin necesidad de confirmar el correo. Úsalo
        para tu primer acceso como cliente o como administrador.
      </p>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
        Esta página usa privilegios elevados del servidor. Habilítala únicamente durante la puesta
        en marcha y vuelve a desactivarla al terminar.
      </div>

      <ProvisionForm />
    </div>
  );
}
