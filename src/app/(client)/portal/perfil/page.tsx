import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/misc';
import { ProfileForm } from './profile-form';
import { FACILITY_LABELS } from '@/lib/constants';
import { formatGallons } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { getMyClientProfile, getSessionUser } from '@/lib/supabase/queries';
import type { Address } from '@/types';

export const metadata: Metadata = { title: 'Perfil' };

export default async function PerfilPage() {
  const [user, profile] = await Promise.all([getSessionUser(), getMyClientProfile()]);
  const supabase = await createClient();
  const { data: addresses } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
  const list = (addresses ?? []) as Address[];

  return (
    <div>
      <PageHeader title="Perfil" description="Administra tus datos de contacto y direcciones frecuentes." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
          <CardContent>
            <ProfileForm
              defaults={{
                full_name: profile?.full_name ?? user?.full_name ?? '',
                company_name: profile?.company_name ?? '',
                phone: profile?.phone ?? user?.phone ?? '',
                email: profile?.email ?? user?.email ?? '',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Direcciones frecuentes</CardTitle></CardHeader>
          {list.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Sin direcciones guardadas"
              description="Al crear una solicitud puedes guardar la dirección para reutilizarla después."
            />
          ) : (
            <CardContent className="space-y-3">
              {list.map((a) => (
                <div key={a.id} className="rounded-lg border border-navy-100 p-4">
                  <p className="text-sm font-semibold text-navy-900">{a.label}</p>
                  <p className="mt-1 text-xs text-navy-500">{FACILITY_LABELS[a.facility_type]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{a.address_line}</p>
                  <p className="mt-1 text-xs text-navy-300">
                    {[a.corregimiento, a.district, a.province].filter(Boolean).join(', ')}
                  </p>
                  {a.tank_capacity_gal ? (
                    <p className="mt-2 text-xs text-navy-500">
                      Capacidad: {formatGallons(a.tank_capacity_gal)}
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
