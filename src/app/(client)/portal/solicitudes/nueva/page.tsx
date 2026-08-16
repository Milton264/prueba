import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/misc';
import { RequestWizard } from '@/components/request/wizard/request-wizard';
import { getMyClientProfile } from '@/lib/supabase/queries';
import type { ServiceType } from '@/types';

export const metadata: Metadata = { title: 'Nueva solicitud' };

export default async function NuevaSolicitudPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const params = await searchParams;
  const profile = await getMyClientProfile();
  const defaultService =
    params.servicio === 'diesel' || params.servicio === 'agua'
      ? (params.servicio as ServiceType)
      : undefined;

  return (
    <div>
      <PageHeader
        title="Nueva solicitud"
        description="Completa los cinco pasos. Toma menos de tres minutos."
        backHref="/portal/solicitudes"
      />
      <RequestWizard
        isGuest={false}
        defaultService={defaultService}
        defaultContact={{
          name: profile?.full_name,
          phone: profile?.phone ?? undefined,
          email: profile?.email,
        }}
      />
    </div>
  );
}
