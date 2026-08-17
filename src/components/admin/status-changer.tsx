'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Select, Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Notice } from '@/components/ui/misc';
import { changeRequestStatus } from '@/lib/actions/requests';
import { ALLOWED_TRANSITIONS, REQUEST_STATUS_LABELS } from '@/lib/status';
import type { RequestStatus } from '@/types';

export function StatusChanger({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: RequestStatus;
}) {
  const [open, setOpen] = useState(false);
  const [force, setForce] = useState(false);
  const [state, action, pending] = useActionState(changeRequestStatus, null);

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  const options = force
    ? (Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).filter((s) => s !== currentStatus)
    : allowed;

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? 'Estado actualizado.');
      setOpen(false);
      setForce(false);
    }
  }, [state]);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <RefreshCw className="h-4 w-4" aria-hidden />
        Cambiar estado
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cambiar estado de la solicitud"
        description={`Estado actual: ${REQUEST_STATUS_LABELS[currentStatus]}`}
      >
        <form action={action} className="space-y-5">
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="force" value={force ? 'true' : 'false'} />

          {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

          {options.length === 0 && !force && (
            <Notice tone="warning">
              Esta solicitud está en un estado final. Marca la casilla de abajo si necesitas
              reabrirla.
            </Notice>
          )}

          <Field label="Nuevo estado" htmlFor="status" required>
            <Select id="status" name="status" required disabled={options.length === 0}>
              <option value="">Selecciona el nuevo estado</option>
              {options.map((s) => (
                <option key={s} value={s}>{REQUEST_STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </Field>

          <Field
            label="Nota para el cliente"
            htmlFor="note"
            hint="Opcional. Aparecerá en la línea de tiempo que ve el cliente."
          >
            <Textarea id="note" name="note" rows={3} />
          </Field>

          <Checkbox
            id="force"
            label="Forzar una transición fuera del flujo normal"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>Actualizar estado</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
