'use client';

import { Checkbox, Field, Input } from '@/components/ui/input';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { DataRow } from '@/components/ui/misc';
import {
  FACILITY_LABELS,
  SERVICE_LABELS,
  TERMS_CHECKBOX_TEXT,
  TIME_SLOT_LABELS,
} from '@/lib/constants';
import { formatDate, formatGallons } from '@/lib/format';
import type { WizardData } from '@/lib/validations/request';

type Errors = Record<string, string | undefined>;

export function StepReview({
  data,
  update,
  errors,
  isGuest,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  errors: Errors;
  isGuest: boolean;
}) {
  const location = [data.corregimiento, data.district, data.province].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Revisa tu solicitud</h2>
        <p className="mt-1 text-sm text-navy-500">
          Verifica que todo este correcto antes de enviarla.
        </p>
      </div>

      <div className="divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
        <section className="px-5 py-4">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-300">Servicio</h3>
          <dl>
            <DataRow label="Tipo de servicio" value={data.service_type ? SERVICE_LABELS[data.service_type] : '-'} />
            <DataRow
              label="Cantidad"
              value={data.quantity_unknown ? 'Por definir con PES' : formatGallons(data.quantity_gal)}
            />
            {data.quantity_note && <DataRow label="Nota sobre el tanque" value={data.quantity_note} />}
          </dl>
        </section>

        <section className="px-5 py-4">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-300">Lugar</h3>
          <dl>
            <DataRow label="Instalación" value={data.facility_name} />
            <DataRow label="Tipo" value={data.facility_type ? FACILITY_LABELS[data.facility_type] : '-'} />
            <DataRow label="Ubicación" value={location || '-'} />
            <DataRow label="Dirección" value={data.address_line} />
            {data.reference_point && <DataRow label="Punto de referencia" value={data.reference_point} />}
            {data.access_instructions && <DataRow label="Acceso" value={data.access_instructions} />}
            {data.tank_capacity_gal ? <DataRow label="Capacidad del tanque" value={formatGallons(data.tank_capacity_gal)} /> : null}
            {data.current_level_pct !== null && data.current_level_pct !== undefined ? (
              <DataRow label="Nivel actual" value={`${data.current_level_pct}%`} />
            ) : null}
          </dl>
        </section>

        <section className="px-5 py-4">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-300">Fecha y contacto</h3>
          <dl>
            <DataRow label="Fecha preferida" value={formatDate(data.preferred_date)} />
            <DataRow
              label="Horario preferido"
              value={data.preferred_time_slot ? TIME_SLOT_LABELS[data.preferred_time_slot] ?? data.preferred_time_slot : '-'}
            />
            <DataRow label="Tipo de solicitud" value={data.urgency === 'urgente' ? 'Urgente' : 'Normal'} />
            <DataRow label="Recibe" value={data.contact_name} />
            <DataRow label="Teléfono" value={data.contact_phone} />
            {data.contact_email && <DataRow label="Correo" value={data.contact_email} />}
            {data.customer_comments && <DataRow label="Comentarios" value={data.customer_comments} />}
          </dl>
        </section>

        {isGuest && (
          <section className="px-5 py-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-300">Tus datos</h3>
            <dl>
              <DataRow label="Nombre" value={data.guest_full_name} />
              {data.guest_company && <DataRow label="Empresa" value={data.guest_company} />}
              <DataRow label="Correo" value={data.guest_email} />
              <DataRow label="Teléfono" value={data.guest_phone} />
            </dl>
          </section>
        )}
      </div>

      <DisclaimerNotice />

      <Checkbox
        id="terms_accepted"
        label={TERMS_CHECKBOX_TEXT}
        checked={data.terms_accepted ?? false}
        error={errors.terms_accepted}
        onChange={(e) => update({ terms_accepted: e.target.checked })}
      />
    </div>
  );
}

/** Datos de contacto del invitado, solicitados antes de completar el formulario. */
export function GuestGate({
  data,
  update,
  errors,
}: {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  errors: Errors;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tus datos de contacto</h2>
        <p className="mt-1 text-sm text-navy-500">
          Los necesitamos para enviarte la cotización y darte seguimiento. No es necesario crear
          una cuenta.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo" htmlFor="guest_full_name" required error={errors.guest_full_name}>
          <Input
            id="guest_full_name"
            placeholder="Juan Perez"
            value={data.guest_full_name ?? ''}
            error={Boolean(errors.guest_full_name)}
            onChange={(e) => update({ guest_full_name: e.target.value })}
          />
        </Field>

        <Field label="Empresa" htmlFor="guest_company" hint="Opcional" error={errors.guest_company}>
          <Input
            id="guest_company"
            placeholder="Edificio Costa Azul"
            value={data.guest_company ?? ''}
            onChange={(e) => update({ guest_company: e.target.value })}
          />
        </Field>

        <Field label="Correo electrónico" htmlFor="guest_email" required error={errors.guest_email}>
          <Input
            id="guest_email"
            type="email"
            placeholder="tucorreo@empresa.com"
            value={data.guest_email ?? ''}
            error={Boolean(errors.guest_email)}
            onChange={(e) => update({ guest_email: e.target.value })}
          />
        </Field>

        <Field label="Teléfono" htmlFor="guest_phone" required error={errors.guest_phone}>
          <Input
            id="guest_phone"
            type="tel"
            placeholder="6000-0000"
            value={data.guest_phone ?? ''}
            error={Boolean(errors.guest_phone)}
            onChange={(e) => update({ guest_phone: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
