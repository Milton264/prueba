'use client';

import { useActionState } from 'react';
import { requestPasswordReset } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      {state?.ok && <Notice tone="info">{state.message}</Notice>}
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

      <Field
        label="Correo electrónico"
        htmlFor="email"
        required
        error={state && !state.ok ? state.fieldErrors?.email?.[0] : undefined}
      >
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="tucorreo@empresa.com" required />
      </Field>

      <Button type="submit" fullWidth size="lg" loading={pending}>
        Enviar enlace
      </Button>
    </form>
  );
}
