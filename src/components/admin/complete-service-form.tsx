'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { completeService } from '@/lib/actions/requests';

export function CompleteServiceForm({
  requestId,
  suggestedQuantity,
}: {
  requestId: string;
  suggestedQuantity: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(completeService, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? 'Servicio completado.');
      setOpen(false);
    }
  }, [state]);

  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <>
      <Button variant="success" size="sm" onClick={() => setOpen(true)}>
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Marcar como completado
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar servicio completado"
        description="Estos datos quedarán visibles para el cliente."
      >
        <form action={action} className="space-y-5">
          <input type="hidden" name="request_id" value={requestId} />

          {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

          <Field
            label="Cantidad final entregada (galones)"
            htmlFor="final_quantity_gal"
            required
            hint="Puede diferir de la cantidad solicitada."
          >
            <Input
              id="final_quantity_gal"
              name="final_quantity_gal"
              type="number"
              min={1}
              className="no-spinner"
              defaultValue={suggestedQuantity ?? ''}
              required
            />
          </Field>

          <Field label="Fecha y hora de la entrega" htmlFor="completed_at" required>
            <Input id="completed_at" name="completed_at" type="datetime-local" defaultValue={localDateTime} required />
          </Field>

          <Field label="Comentarios" htmlFor="completion_notes" hint="Opcional. Visible para el cliente.">
            <Textarea id="completion_notes" name="completion_notes" rows={3} />
          </Field>

          <Notice tone="info">
            El comprobante y las fotografías se cargan desde la sección de adjuntos de la solicitud.
          </Notice>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="success" loading={pending}>Confirmar entrega</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
