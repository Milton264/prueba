import type { Metadata } from 'next';
import { Droplets, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Notice } from '@/components/ui/misc';
import { ServiceForm } from './service-form';
import { createClient } from '@/lib/supabase/server';
import type { CatalogService } from '@/types';

export const metadata: Metadata = { title: 'Servicios' };

export default async function ServiciosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('catalog_services').select('*').order('service_type');
  const list = (data ?? []) as CatalogService[];

  return (
    <div>
      <PageHeader
        title="Servicios"
        description="Catalogo de servicios que ofrece PES. Define las cantidades sugeridas del formulario y los precios de referencia."
      />

      <Notice tone="info" className="mb-6">
        Las cantidades sugeridas son los botones que ve el cliente en el paso 2 del formulario. El
        precio de referencia es solo una guía interna para preparar cotizaciones: nunca se muestra
        al cliente.
      </Notice>

      <div className="grid gap-6 lg:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    s.service_type === 'diesel' ? 'bg-gold-50 text-gold-700' : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {s.service_type === 'diesel' ? (
                    <Fuel className="h-4 w-4" aria-hidden />
                  ) : (
                    <Droplets className="h-4 w-4" aria-hidden />
                  )}
                </span>
                {s.name}
              </CardTitle>
              <Badge tone={s.is_active ? 'success' : 'neutral'}>
                {s.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </CardHeader>
            <CardContent>
              <ServiceForm service={s} />
            </CardContent>
          </Card>
        ))}

        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-navy-500">
                No hay servicios en el catalogo. Ejecuta el script de datos demo para crearlos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
