'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { updateSettings } from '@/lib/actions/settings';
import type { SettingsInput } from '@/lib/validations/settings';

export function SettingsForm({ defaults }: { defaults: SettingsInput }) {
  const [state, action, pending] = useActionState(updateSettings, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? 'Configuración guardada.');
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre de la empresa" htmlFor="company_name" required error={err('company_name')}>
          <Input id="company_name" name="company_name" defaultValue={defaults.company_name} required />
        </Field>
        <Field label="Eslogan" htmlFor="tagline" required error={err('tagline')}>
          <Input id="tagline" name="tagline" defaultValue={defaults.tagline} required />
        </Field>
        <Field label="Ruta del logo" htmlFor="logo_path" hint="Ejemplo: /brand/pes-logo.svg" error={err('logo_path')}>
          <Input id="logo_path" name="logo_path" defaultValue={defaults.logo_path ?? ''} />
        </Field>
        <Field label="Correo de contacto" htmlFor="contact_email" required error={err('contact_email')}>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={defaults.contact_email} required />
        </Field>
        <Field
          label="Número de WhatsApp"
          htmlFor="whatsapp_number"
          required
          hint="Formato internacional, solo digitos. Panamá: 50760000000"
          error={err('whatsapp_number')}
        >
          <Input id="whatsapp_number" name="whatsapp_number" inputMode="numeric" defaultValue={defaults.whatsapp_number} required />
        </Field>
        <Field label="Sitio web" htmlFor="website_url" hint="Opcional" error={err('website_url')}>
          <Input id="website_url" name="website_url" type="url" placeholder="https://panamaenergysolutions.com" defaultValue={defaults.website_url ?? ''} />
        </Field>
        <Field label="Dirección" htmlFor="address" error={err('address')} className="sm:col-span-2">
          <Input id="address" name="address" defaultValue={defaults.address ?? ''} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Porcentaje de impuesto"
          htmlFor="tax_rate"
          required
          hint="Decimal. Ejemplo: 0.07 para 7%."
          error={err('tax_rate')}
        >
          <Input id="tax_rate" name="tax_rate" type="number" step="0.0001" min="0" max="1" className="no-spinner" defaultValue={defaults.tax_rate} required />
        </Field>
        <Field label="Prefijo de solicitudes" htmlFor="request_prefix" required hint="Genera PES-0001" error={err('request_prefix')}>
          <Input id="request_prefix" name="request_prefix" defaultValue={defaults.request_prefix} required />
        </Field>
        <Field label="Prefijo de cotizaciones" htmlFor="quotation_prefix" required hint="Genera COT-0001" error={err('quotation_prefix')}>
          <Input id="quotation_prefix" name="quotation_prefix" defaultValue={defaults.quotation_prefix} required />
        </Field>
      </div>

      <Field label="Términos de la cotización" htmlFor="quotation_terms" hint="Texto que acompana cada cotización." error={err('quotation_terms')}>
        <Textarea id="quotation_terms" name="quotation_terms" rows={4} defaultValue={defaults.quotation_terms ?? ''} />
      </Field>

      <Field label="Aviso de privacidad" htmlFor="privacy_policy" hint="Separa los párrafos con una línea en blanco." error={err('privacy_policy')}>
        <Textarea id="privacy_policy" name="privacy_policy" rows={6} defaultValue={defaults.privacy_policy ?? ''} />
      </Field>

      <Field label="Términos y condiciones" htmlFor="terms_conditions" hint="Separa los párrafos con una línea en blanco." error={err('terms_conditions')}>
        <Textarea id="terms_conditions" name="terms_conditions" rows={6} defaultValue={defaults.terms_conditions ?? ''} />
      </Field>

      <Button type="submit" loading={pending}>
        <Save className="h-4 w-4" aria-hidden />
        Guardar configuración
      </Button>
    </form>
  );
}
