'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { cancelRequest } from '@/lib/actions/requests';

export function CancelRequestButton({ requestId, requestNumber }: { requestId: string; requestNumber: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(cancelRequest, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? 'Solicitud cancelada.');
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
        <XCircle className="h-4 w-4" aria-hidden />
        Cancelar solicitud
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`¿Cancelar la solicitud ${requestNumber}?`}
        description="Esta acción cambia el estado a cancelada. El cliente la verá reflejada en su portal."
      >
        <form action={action} className="space-y-5">
          <input type="hidden" name="request_id" value={requestId} />
          {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

          <Field label="Motivo interno" htmlFor="reason" hint="Se guarda como nota interna. No es visible para el cliente.">
            <Textarea id="reason" name="reason" rows={3} />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Volver</Button>
            <Button type="submit" variant="danger" loading={pending}>Cancelar solicitud</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
