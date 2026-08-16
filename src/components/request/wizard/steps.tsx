'use client';

import { ChevronDown, Droplets, Fuel, Info } from 'lucide-react';
import { ChipGroup, RadioCardGroup } from '@/components/ui/radio-card';
import { FileUpload, type UploadedFile } from '@/components/ui/file-upload';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import {
  AGUA_QUANTITIES,
  DIESEL_QUANTITIES,
  FACILITY_TYPES,
  SERVICE_DESCRIPTIONS,
  TIME_SLOTS,
  URGENCY_TYPES,
} from '@/lib/constants';
import { getCorregimientos, getDistricts, PROVINCE_NAMES } from '@/lib/panama';
import type { FacilityType, ServiceType, UrgencyType } from '@/types';
import type { WizardData } from '@/lib/validations/request';

type Errors = Record<string, string | undefined>;
type Update = (patch: Partial<WizardData>) => void;

/* ------------------------------------------------------------------ */
/* PASO 1: SERVICIO                                                    */
/* ------------------------------------------------------------------ */
export function StepService({ data, update, errors }: { data: WizardData; update: Update; errors: Errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Qué servicio necesitas?</h2>
        <p className="mt-1 text-sm text-navy-500">Selecciona el tipo de suministro.</p>
      </div>

      <RadioCardGroup<ServiceType>
        name="service_type"
        value={data.service_type ?? null}
        onChange={(v) => update({ service_type: v, quantity_gal: null, quantity_unknown: false })}
        options={[
          { value: 'diesel', label: 'Diésel', description: SERVICE_DESCRIPTIONS.diesel, icon: Fuel },
          { value: 'agua', label: 'Agua potable', description: SERVICE_DESCRIPTIONS.agua, icon: Droplets },
        ]}
      />
      {errors.service_type && <p className="text-xs font-medium text-red-600">{errors.service_type}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PASO 2: CANTIDAD                                                    */
/* ------------------------------------------------------------------ */
export function StepQuantity({ data, update, errors }: { data: WizardData; update: Update; errors: Errors }) {
  const isAgua = data.service_type === 'agua';
  const presets = isAgua ? AGUA_QUANTITIES : DIESEL_QUANTITIES;
  const presetValues = presets.map(String);
  const isCustom =
    data.quantity_gal !== null &&
    data.quantity_gal !== undefined &&
    !presetValues.includes(String(data.quantity_gal));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Cuánta cantidad necesitas?</h2>
        <p className="mt-1 text-sm text-navy-500">
          Selecciona una cantidad sugerida o indica la tuya en galones.
        </p>
      </div>

      <div className="space-y-3">
        <ChipGroup
          value={data.quantity_unknown ? null : data.quantity_gal ? String(data.quantity_gal) : null}
          onChange={(v) => update({ quantity_gal: Number(v), quantity_unknown: false })}
          options={[
            ...presets.map((q) => ({ value: String(q), label: `${q.toLocaleString('es-PA')} gal` })),
            { value: 'custom', label: 'Otra cantidad' },
          ].filter((o) => o.value !== 'custom' || true)}
        />

        {(isCustom || data.quantity_gal === null) && !data.quantity_unknown && (
          <Field label="Cantidad personalizada (galones)" htmlFor="quantity_gal" error={errors.quantity_gal}>
            <Input
              id="quantity_gal"
              type="number"
              inputMode="numeric"
              min={1}
              className="no-spinner max-w-xs"
              placeholder="Ejemplo: 750"
              value={data.quantity_gal ?? ''}
              error={Boolean(errors.quantity_gal)}
              onChange={(e) =>
                update({ quantity_gal: e.target.value ? Number(e.target.value) : null, quantity_unknown: false })
              }
            />
          </Field>
        )}
      </div>

      {isAgua && (
        <Checkbox
          id="quantity_unknown"
          label="No conozco la capacidad exacta de mi tanque"
          checked={data.quantity_unknown ?? false}
          onChange={(e) =>
            update({ quantity_unknown: e.target.checked, quantity_gal: e.target.checked ? null : data.quantity_gal })
          }
        />
      )}

      {data.quantity_unknown && (
        <Field
          label="Cuéntanos lo que sepas del tanque"
          htmlFor="quantity_note"
          hint="Opcional. Por ejemplo: tanque de concreto en azotea, aproximadamente 2 metros de alto."
        >
          <Textarea
            id="quantity_note"
            value={data.quantity_note ?? ''}
            onChange={(e) => update({ quantity_note: e.target.value })}
          />
        </Field>
      )}

      {errors.quantity_gal && !isCustom && (
        <p className="text-xs font-medium text-red-600">{errors.quantity_gal}</p>
      )}

      <Notice tone="info">
        <span className="flex items-start gap-1.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          La cantidad final será confirmada durante el proceso de cotización.
        </span>
      </Notice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PASO 3: INFORMACION DEL LUGAR                                       */
/* ------------------------------------------------------------------ */
export function StepLocation({
  data,
  update,
  errors,
  files,
  onFilesChange,
}: {
  data: WizardData;
  update: Update;
  errors: Errors;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  const districts = data.province ? getDistricts(data.province) : [];
  const corregimientos = data.province && data.district ? getCorregimientos(data.province, data.district) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Información del lugar</h2>
        <p className="mt-1 text-sm text-navy-500">
          Necesitamos estos datos para coordinar el acceso de la cisterna.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre de la empresa o instalación" htmlFor="facility_name" required error={errors.facility_name} className="sm:col-span-2">
          <Input
            id="facility_name"
            placeholder="Edificio Costa Azul"
            value={data.facility_name ?? ''}
            error={Boolean(errors.facility_name)}
            onChange={(e) => update({ facility_name: e.target.value })}
          />
        </Field>

        <Field label="Tipo de instalación" htmlFor="facility_type" required error={errors.facility_type}>
          <Select
            id="facility_type"
            value={data.facility_type ?? ''}
            error={Boolean(errors.facility_type)}
            onChange={(e) => update({ facility_type: e.target.value as FacilityType })}
          >
            <option value="">Selecciona una opción</option>
            {FACILITY_TYPES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Provincia" htmlFor="province" required error={errors.province}>
          <Select
            id="province"
            value={data.province ?? ''}
            error={Boolean(errors.province)}
            onChange={(e) => update({ province: e.target.value, district: '', corregimiento: '' })}
          >
            <option value="">Selecciona la provincia</option>
            {PROVINCE_NAMES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </Field>

        <Field label="Distrito" htmlFor="district" error={errors.district}>
          <Select
            id="district"
            value={data.district ?? ''}
            disabled={!data.province}
            onChange={(e) => update({ district: e.target.value, corregimiento: '' })}
          >
            <option value="">{data.province ? 'Selecciona el distrito' : 'Selecciona primero la provincia'}</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>

        <Field
          label="Corregimiento"
          htmlFor="corregimiento"
          hint={corregimientos.length === 0 && data.district ? 'Escribe el corregimiento' : undefined}
          error={errors.corregimiento}
        >
          {corregimientos.length > 0 ? (
            <Select
              id="corregimiento"
              value={data.corregimiento ?? ''}
              onChange={(e) => update({ corregimiento: e.target.value })}
            >
              <option value="">Selecciona el corregimiento</option>
              {corregimientos.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          ) : (
            <Input
              id="corregimiento"
              placeholder="Corregimiento"
              disabled={!data.district}
              value={data.corregimiento ?? ''}
              onChange={(e) => update({ corregimiento: e.target.value })}
            />
          )}
        </Field>

        <Field label="Dirección completa" htmlFor="address_line" required error={errors.address_line} className="sm:col-span-2">
          <Textarea
            id="address_line"
            rows={2}
            placeholder="Calle, urbanizacion, número de edificio, piso"
            value={data.address_line ?? ''}
            error={Boolean(errors.address_line)}
            onChange={(e) => update({ address_line: e.target.value })}
          />
        </Field>

        <Field label="Punto de referencia" htmlFor="reference_point" hint="Opcional" error={errors.reference_point}>
          <Input
            id="reference_point"
            placeholder="Frente al supermercado"
            value={data.reference_point ?? ''}
            onChange={(e) => update({ reference_point: e.target.value })}
          />
        </Field>
      </div>

      <Field
        label="Fotos de referencia del lugar de entrega"
        hint="Recomendado (hasta 3). Fotos de la entrada, el tanque o el punto de descarga ayudan al asesor a coordinar la entrega. Se almacenan de forma privada."
      >
        <FileUpload files={files} onChange={onFilesChange} />
      </Field>

      {/* Detalles avanzados, colapsados para no recargar el formulario.
          Siguen disponibles para quien quiera aportarlos. */}
      <details className="group rounded-card border border-navy-100 bg-mist/40">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-medium text-navy-700 transition-colors hover:text-navy-900">
          <span>Detalles adicionales del tanque y acceso (opcional)</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="grid gap-5 border-t border-navy-100 px-4 py-5 sm:grid-cols-2">
          <Field label="Instrucciones de acceso" htmlFor="access_instructions" hint="Portones, horarios, permisos." error={errors.access_instructions} className="sm:col-span-2">
            <Input
              id="access_instructions"
              placeholder="Entrada por el sótano, avisar en garita"
              value={data.access_instructions ?? ''}
              onChange={(e) => update({ access_instructions: e.target.value })}
            />
          </Field>

          <Field label="Capacidad aproximada del tanque (galones)" htmlFor="tank_capacity_gal" error={errors.tank_capacity_gal}>
            <Input
              id="tank_capacity_gal"
              type="number"
              inputMode="numeric"
              min={1}
              className="no-spinner"
              placeholder="Ejemplo: 2000"
              value={data.tank_capacity_gal ?? ''}
              onChange={(e) => update({ tank_capacity_gal: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>

          <Field label="Nivel actual aproximado (%)" htmlFor="current_level_pct" hint="De 0 a 100." error={errors.current_level_pct}>
            <Input
              id="current_level_pct"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              className="no-spinner"
              placeholder="Ejemplo: 25"
              value={data.current_level_pct ?? ''}
              onChange={(e) => update({ current_level_pct: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
        </div>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PASO 4: FECHA Y CONTACTO                                            */
/* ------------------------------------------------------------------ */
export function StepSchedule({ data, update, errors }: { data: WizardData; update: Update; errors: Errors }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fecha y contacto</h2>
        <p className="mt-1 text-sm text-navy-500">
          Indícanos cuándo prefieres recibir el servicio y con quien coordinamos.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Fecha preferida" htmlFor="preferred_date" required error={errors.preferred_date}>
          <Input
            id="preferred_date"
            type="date"
            min={today}
            value={data.preferred_date ?? ''}
            error={Boolean(errors.preferred_date)}
            onChange={(e) => update({ preferred_date: e.target.value })}
          />
        </Field>

        <Field label="Horario preferido" htmlFor="preferred_time_slot" required error={errors.preferred_time_slot}>
          <Select
            id="preferred_time_slot"
            value={data.preferred_time_slot ?? ''}
            error={Boolean(errors.preferred_time_slot)}
            onChange={(e) => update({ preferred_time_slot: e.target.value })}
          >
            <option value="">Selecciona un horario</option>
            {TIME_SLOTS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Tipo de solicitud" required error={errors.urgency}>
        <RadioCardGroup<UrgencyType>
          name="urgency"
          value={data.urgency ?? 'normal'}
          onChange={(v) => update({ urgency: v })}
          options={URGENCY_TYPES.map((u) => ({ value: u.value, label: u.label, description: u.hint }))}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre de la persona que recibe" htmlFor="contact_name" required error={errors.contact_name}>
          <Input
            id="contact_name"
            placeholder="Nombre y apellido"
            value={data.contact_name ?? ''}
            error={Boolean(errors.contact_name)}
            onChange={(e) => update({ contact_name: e.target.value })}
          />
        </Field>

        <Field label="Teléfono" htmlFor="contact_phone" required error={errors.contact_phone}>
          <Input
            id="contact_phone"
            type="tel"
            placeholder="6000-0000"
            value={data.contact_phone ?? ''}
            error={Boolean(errors.contact_phone)}
            onChange={(e) => update({ contact_phone: e.target.value })}
          />
        </Field>

        <Field label="Correo electrónico" htmlFor="contact_email" hint="Opcional" error={errors.contact_email} className="sm:col-span-2">
          <Input
            id="contact_email"
            type="email"
            placeholder="contacto@empresa.com"
            value={data.contact_email ?? ''}
            onChange={(e) => update({ contact_email: e.target.value })}
          />
        </Field>

        <Field label="Comentarios adicionales" htmlFor="customer_comments" hint="Opcional" error={errors.customer_comments} className="sm:col-span-2">
          <Textarea
            id="customer_comments"
            rows={3}
            placeholder="Cualquier detalle que debamos considerar"
            value={data.customer_comments ?? ''}
            onChange={(e) => update({ customer_comments: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
