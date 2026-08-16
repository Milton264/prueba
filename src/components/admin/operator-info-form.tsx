'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { saveOperatorInfo } from '@/lib/actions/requests';
import { TIME_SLOTS } from '@/lib/constants';
import { waMessages } from '@/lib/whatsapp';
import type { OperatorInformation, ServiceType } from '@/types';

/**
 * Información de la compañía operadora aliada.
 * Visible únicamente para administradores de PES.
 * En esta versión la coordinación con el operador ocurre fuera de la plataforma.
 */
export function OperatorInfoForm({
  requestId,
  info,
  request,
}: {
  requestId: string;
  info: OperatorInformation | null;
  request: {
    request_number: string;
    service_type: ServiceType;
    quantity_gal: number | null;
    quantity_unknown: boolean;
    address_line: string;
    province: string;
    district: string | null;
    preferred_date: string | null;
    preferred_time_slot: string | null;
  };
}) {
  const [state, action, pending] = useActionState(saveOperatorInfo, null);

  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? 'Información guardada.');
  }, [state]);

  const location = [request.district, request.province].filter(Boolean).join(', ');

  const operatorMessage = waMessages.operator({
    requestNumber: request.request_number,
    serviceType: request.service_type,
    quantityGal: request.quantity_gal,
    quantityUnknown: request.quantity_unknown,
    location: location || request.address_line,
    preferredDate: request.preferred_date,
    timeSlot: request.preferred_time_slot,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-navy-300" aria-hidden />
          Información del operador
        </CardTitle>
        <span className="border border-navy-200 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide2 text-navy-500">
          Solo PES
        </span>
      </CardHeader>

      <CardContent className="space-y-5">
        {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

        {/* Boton para consultar disponibilidad por WhatsApp */}
        <div className="rounded-lg border border-navy-100 bg-mist p-4">
          <p className="mb-3 text-sm text-navy-600">
            Consulta disponibilidad y precio con la compañía operadora. El mensaje se genera con los
            datos de esta solicitud.
          </p>
          <WhatsAppButton
            message={operatorMessage}
            number={info?.contact_phone || undefined}
            label="Consultar operador por WhatsApp"
            variant="outline"
            size="sm"
          />
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="request_id" value={requestId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del operador" htmlFor="operator_name">
              <Input id="operator_name" name="operator_name" defaultValue={info?.operator_name ?? ''} placeholder="Aliado Cisternas, S.A." />
            </Field>
            <Field label="Persona de contacto" htmlFor="contact_person">
              <Input id="contact_person" name="contact_person" defaultValue={info?.contact_person ?? ''} />
            </Field>
            <Field label="Teléfono" htmlFor="contact_phone" hint="Formato internacional para WhatsApp: 50760000000">
              <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={info?.contact_phone ?? ''} />
            </Field>
            <Field label="Disponibilidad confirmada" htmlFor="availability">
              <Select id="availability" name="availability" defaultValue={info?.availability ?? 'pendiente'}>
                <option value="pendiente">Pendiente</option>
                <option value="si">Si</option>
                <option value="no">No</option>
              </Select>
            </Field>
            <Field label="Costo del proveedor (USD)" htmlFor="supplier_cost">
              <Input id="supplier_cost" name="supplier_cost" type="number" step="0.01" min="0" className="no-spinner" defaultValue={info?.supplier_cost ?? ''} />
            </Field>
            <Field label="Costo del transporte (USD)" htmlFor="transport_cost">
              <Input id="transport_cost" name="transport_cost" type="number" step="0.01" min="0" className="no-spinner" defaultValue={info?.transport_cost ?? ''} />
            </Field>
            <Field label="Fecha disponible" htmlFor="available_date">
              <Input id="available_date" name="available_date" type="date" defaultValue={info?.available_date ?? ''} />
            </Field>
            <Field label="Horario disponible" htmlFor="available_time_slot">
              <Select id="available_time_slot" name="available_time_slot" defaultValue={info?.available_time_slot ?? ''}>
                <option value="">Sin definir</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Observaciones internas" htmlFor="internal_observations">
            <Textarea id="internal_observations" name="internal_observations" rows={3} defaultValue={info?.internal_observations ?? ''} />
          </Field>

          <Button type="submit" size="sm" loading={pending}>
            <Save className="h-4 w-4" aria-hidden />
            Guardar información
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
