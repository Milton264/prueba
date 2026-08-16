'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}
      {state && state.ok && state.message && <Notice tone="gold">{state.message}</Notice>}

      <Field label="Nombre completo" htmlFor="full_name" required error={err('full_name')}>
        <Input id="full_name" name="full_name" autoComplete="name" placeholder="Juan Perez" required />
      </Field>

      <Field label="Empresa" htmlFor="company_name" hint="Opcional" error={err('company_name')}>
        <Input id="company_name" name="company_name" autoComplete="organization" placeholder="Edificio Costa Azul" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Correo electrónico" htmlFor="email" required error={err('email')}>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="tucorreo@empresa.com" required />
        </Field>
        <Field label="Teléfono" htmlFor="phone" required error={err('phone')}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="6000-0000" required />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contraseña" htmlFor="password" required hint="Mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo" error={err('password')}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="confirm_password" required error={err('confirm_password')}>
          <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required />
        </Field>
      </div>

      <p className="text-xs leading-relaxed text-navy-500">
        Al crear tu cuenta aceptas los{' '}
        <Link href="/terminos" className="font-medium text-navy-700 underline">términos y condiciones</Link> y el{' '}
        <Link href="/privacidad" className="font-medium text-navy-700 underline">aviso de privacidad</Link>.
      </p>

      <Button type="submit" fullWidth size="lg" loading={pending}>
        Crear cuenta
      </Button>
    </form>
  );
}
