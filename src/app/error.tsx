'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="w-full max-w-md border-t-2 border-red-600 pt-6">
        <p className="pes-eyebrow text-red-700">Error</p>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight text-navy-900">Ocurrió un error</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-navy-600">
          No pudimos completar la operacion. Intenta de nuevo; si el problema continua, comunícate
          con nuestro equipo.
        </p>
        {error.digest && <p className="mt-3 font-sans text-[11px] text-navy-400">Referencia: {error.digest}</p>}
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={reset}>Intentar de nuevo</Button>
          <ButtonLink href="/" variant="secondary">Ir al inicio</ButtonLink>
        </div>
      </div>
    </div>
  );
}
