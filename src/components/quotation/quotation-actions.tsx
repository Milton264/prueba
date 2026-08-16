'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import {
  approveQuotation,
  rejectQuotation,
  requestQuotationChanges,
} from '@/lib/actions/quotations';
import { waMessages } from '@/lib/whatsapp';

/** Acciones del cliente sobre una cotización enviada. */
export function QuotationActions({
  quotationId,
  quotationNumber,
  status,
  whatsappNumber,
}: {
  quotationId: string;
  quotationNumber: string;
  status: string;
  whatsappNumber?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canRespond = status === 'sent';

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, onDone: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? 'No pudimos completar la acción.');
        toast.error(result.error ?? 'No pudimos completar la acción.');
        return;
      }
      toast.success(result.message ?? 'Listo.');
      onDone();
      router.refresh();
    });
  };

  const fd = (entries: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) f.append(k, v);
    return f;
  };

  if (!canRespond) {
    return (
      <div className="no-print flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton
          message={waMessages.quotation(quotationNumber)}
          number={whatsappNumber}
          label="Hablar con un asesor por WhatsApp"
          variant="outline"
          fullWidth
        />
      </div>
    );
  }

  return (
    <div className="no-print space-y-4">
      {error && <Notice tone="danger">{error}</Notice>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant="success" onClick={() => setConfirmApprove(true)} disabled={pending}>
          <Check className="h-4 w-4" aria-hidden />
          Aprobar cotización
        </Button>
        <Button variant="secondary" onClick={() => setChangesOpen(true)} disabled={pending}>
          <MessageSquare className="h-4 w-4" aria-hidden />
          Solicitar cambios
        </Button>
        <Button variant="ghost" onClick={() => setRejectOpen(true)} disabled={pending} className="text-red-600 hover:bg-red-50">
          <X className="h-4 w-4" aria-hidden />
          Rechazar
        </Button>
      </div>

      <WhatsAppButton
        message={waMessages.quotation(quotationNumber)}
        number={whatsappNumber}
        label="Hablar con un asesor por WhatsApp"
        variant="outline"
        fullWidth
      />

      {/* Confirmación antes de guardar la aprobación */}
      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() =>
          run(
            () => approveQuotation(null, fd({ quotation_id: quotationId })),
            () => setConfirmApprove(false),
          )
        }
        title="Confirmas que deseas aprobar esta cotización?"
        description={`Al aprobar la cotización ${quotationNumber} aceptas los montos, la fecha propuesta y las condiciones de pago indicadas. Nuestro equipo procederá a programar el servicio.`}
        confirmLabel="Si, aprobar"
        variant="success"
        loading={pending}
      />

      {/* Solicitar cambios */}
      <Dialog
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        title="Solicitar cambios"
        description="Cuéntanos qué necesitas modificar y nuestro equipo preparara una nueva cotización."
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangesOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                run(
                  () => requestQuotationChanges(null, fd({ quotation_id: quotationId, message })),
                  () => {
                    setChangesOpen(false);
                    setMessage('');
                  },
                )
              }
              loading={pending}
            >
              Enviar solicitud
            </Button>
          </>
        }
      >
        <Field label="Qué necesitas modificar?" htmlFor="changes_message" required>
          <Textarea
            id="changes_message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ejemplo: necesito la entrega el viernes en la mañana y ajustar la cantidad a 800 galones."
          />
        </Field>
      </Dialog>

      {/* Rechazar */}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rechazar cotización"
        description="Puedes indicarnos el motivo. Es opcional, pero nos ayuda a mejorar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                run(
                  () => rejectQuotation(null, fd({ quotation_id: quotationId, reason })),
                  () => {
                    setRejectOpen(false);
                    setReason('');
                  },
                )
              }
              loading={pending}
            >
              Rechazar cotización
            </Button>
          </>
        }
      >
        <Field label="Motivo" htmlFor="reject_reason" hint="Opcional">
          <Textarea
            id="reject_reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ejemplo: el precio está fuera de nuestro presupuesto."
          />
        </Field>
      </Dialog>
    </div>
  );
}
