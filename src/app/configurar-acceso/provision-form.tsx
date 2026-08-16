'use client';

import { useActionState, useState } from 'react';
import { provisionAccess } from '@/lib/actions/provision';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';

export function ProvisionForm() {
  const [state, action, pending] = useActionState(provisionAccess, null);
  const [role, setRole] = useState<'client' | 'admin'>('client');

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}
      {state && state.ok && state.message && <Notice tone="gold">{state.message}</Notice>}

      <Field label="Nombre" htmlFor="full_name">
        <Input id="full_name" name="full_name" placeholder="Coordinación PES" autoComplete="name" />
      </Field>

      <Field label="Correo electrónico" htmlFor="email" required>
        <Input id="email" name="email" type="email" placeholder="tucorreo@empresa.com" autoComplete="email" required />
      </Field>

      <Field label="Contraseña" htmlFor="password" required hint="Mínimo 8 caracteres">
        <Input id="password" name="password" type="password" placeholder="Tu contraseña" autoComplete="new-password" required />
      </Field>

      <fieldset className="space-y-2">
        <legend className="mb-2 block font-sans text-[11px] font-medium uppercase tracking-wide2 text-navy-600">
          Tipo de cuenta
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-navy-200 px-4 py-3 text-sm text-navy-700 has-[:checked]:border-navy-900 has-[:checked]:bg-mist">
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === 'client'}
            onChange={() => setRole('client')}
            className="h-4 w-4 accent-navy-700"
          />
          <span><strong className="font-semibold text-navy-900">Cliente</strong> — accede al portal en /portal</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-navy-200 px-4 py-3 text-sm text-navy-700 has-[:checked]:border-navy-900 has-[:checked]:bg-mist">
          <input
            type="radio"
            name="role"
            value="admin"
            checked={role === 'admin'}
            onChange={() => setRole('admin')}
            className="h-4 w-4 accent-navy-700"
          />
          <span><strong className="font-semibold text-navy-900">Administrador</strong> — accede al panel en /admin</span>
        </label>
      </fieldset>

      {role === 'admin' && (
        <Field
          label="Clave de configuración"
          htmlFor="setup_key"
          hint="Solo si definiste SETUP_SECRET en el entorno. En desarrollo puedes dejarlo vacío."
        >
          <Input id="setup_key" name="setup_key" type="password" placeholder="Clave para crear administradores" autoComplete="off" />
        </Field>
      )}

      <Button type="submit" fullWidth size="lg" loading={pending}>
        Crear cuenta y entrar
      </Button>
    </form>
  );
}
