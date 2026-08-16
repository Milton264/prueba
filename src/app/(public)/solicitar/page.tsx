import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RequestWizard } from '@/components/request/wizard/request-wizard';
import { getSessionUser } from '@/lib/supabase/queries';
import type { ServiceType } from '@/types';

export const metadata: Metadata = { title: 'Solicitar servicio' };

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const params = await searchParams;

  // Si ya inicio sesión, usa el formulario del portal.
  const user = await getSessionUser().catch(() => null);
  if (user?.role === 'client') {
    redirect(`/portal/solicitudes/nueva${params.servicio ? `?servicio=${params.servicio}` : ''}`);
  }

  const defaultService =
    params.servicio === 'diesel' || params.servicio === 'agua'
      ? (params.servicio as ServiceType)
      : undefined;

  return (
    <div className="bg-mist">
      <div className="pes-container py-10 sm:py-14">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">Solicitar servicio</h1>
          <p className="mt-3 text-navy-600">
            Completa el formulario y nuestro equipo verificará disponibilidad y precio para enviarte
            una cotización.
          </p>
        </div>
        <RequestWizard isGuest defaultService={defaultService} />
      </div>
    </div>
  );
}
