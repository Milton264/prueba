'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { updateCatalogService } from '@/lib/actions/settings';
import type { CatalogService } from '@/types';

export function ServiceForm({ service }: { service: CatalogService }) {
  const [state, action, pending] = useActionState(updateCatalogService, null);

  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? 'Servicio actualizado.');
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={service.id} />
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre visible" htmlFor={`name-${service.id}`} required>
          <Input id={`name-${service.id}`} name="name" defaultValue={service.name} required />
        </Field>
        <Field label="Unidad" htmlFor={`unit-${service.id}`} required>
          <Input id={`unit-${service.id}`} name="unit" defaultValue={service.unit} required />
        </Field>
      </div>

      <Field
        label="Cantidades sugeridas"
        htmlFor={`quantities-${service.id}`}
        hint="Separadas por comas. Ejemplo: 100, 200, 500, 1000"
      >
        <Input
          id={`quantities-${service.id}`}
          name="preset_quantities"
          defaultValue={service.preset_quantities?.join(', ') ?? ''}
        />
      </Field>

      <Field
        label="Precio de referencia por unidad (USD)"
        htmlFor={`price-${service.id}`}
        hint="Guía interna. No se muestra al cliente."
      >
        <Input
          id={`price-${service.id}`}
          name="reference_price"
          type="number"
          step="0.0001"
          min="0"
          className="no-spinner"
          defaultValue={service.reference_price ?? ''}
        />
      </Field>

      <Checkbox
        id={`active-${service.id}`}
        name="is_active"
        label="Servicio activo y disponible para solicitudes"
        defaultChecked={service.is_active}
      />

      <Button type="submit" size="sm" loading={pending}>
        <Save className="h-4 w-4" aria-hidden />
        Guardar
      </Button>
    </form>
  );
}
