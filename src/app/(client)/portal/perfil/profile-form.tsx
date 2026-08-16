'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';

export function ProfileForm({
  defaults,
}: {
  defaults: { full_name: string; company_name: string; phone: string; email: string };
}) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? 'Perfil actualizado.');
  }, [state]);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

      <Field label="Nombre completo" htmlFor="full_name" required error={err('full_name')}>
        <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
      </Field>

      <Field label="Empresa" htmlFor="company_name" hint="Opcional" error={err('company_name')}>
        <Input id="company_name" name="company_name" defaultValue={defaults.company_name} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Teléfono" htmlFor="phone" required error={err('phone')}>
          <Input id="phone" name="phone" type="tel" defaultValue={defaults.phone} required />
        </Field>

        <Field
          label="Correo electrónico"
          htmlFor="email"
          hint="Para cambiar tu correo comunícate con PES."
        >
          <Input id="email" defaultValue={defaults.email} disabled />
        </Field>
      </div>

      <Button type="submit" loading={pending}>Guardar cambios</Button>
    </form>
  );
}
