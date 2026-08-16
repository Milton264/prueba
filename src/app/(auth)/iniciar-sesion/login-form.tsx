'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

      <Field label="Correo electrónico" htmlFor="email" required error={state && !state.ok ? state.fieldErrors?.email?.[0] : undefined}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@empresa.com"
          required
        />
      </Field>

      <Field label="Contraseña" htmlFor="password" required error={state && !state.ok ? state.fieldErrors?.password?.[0] : undefined}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            className="pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-800"
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-600">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-navy-200 accent-navy-700"
          />
          Recordarme
        </label>
        <Link href="/recuperar" className="text-sm font-medium text-navy-700 hover:text-navy-500">
          Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" loading={pending}>
        Iniciar sesión
      </Button>
    </form>
  );
}
