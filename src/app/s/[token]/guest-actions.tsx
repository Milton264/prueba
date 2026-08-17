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
import { respondToQuotationByToken } from './actions';
import { waMessages } from '@/lib/whatsapp';

/** Respuesta del invitado a su cotización, autenticada por el token del enlace. */
export function GuestQuotationActions({
  token,
  quotationId,
  quotationNumber,
  status,
  whatsappNumber,
}: {
  token: string;
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

  const respond = (action: 'approve' | 'changes' | 'reject', text: string, onDone: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await respondToQuotationByToken({ token, quotationId, action, message: text });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? 'Listo.');
      onDone();
      router.refresh();
    });
  };

  if (status !== 'sent') {
    return (
      <WhatsAppButton
        message={waMessages.quotation(quotationNumber)}
        number={whatsappNumber}
        label="Hablar con un asesor por WhatsApp"
        variant="outline"
        fullWidth
      />
    );
  }

  return (
    <div className="space-y-4">
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

      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => respond('approve', '', () => setConfirmApprove(false))}
        title="¿Confirmas que deseas aprobar esta cotización?"
        description={`Al aprobar la cotización ${quotationNumber} aceptas los montos, la fecha propuesta y las condiciones de pago indicadas.`}
        confirmLabel="Sí, aprobar"
        variant="success"
        loading={pending}
      />

      <Dialog
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        title="Solicitar cambios"
        description="Cuéntanos qué necesitas modificar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangesOpen(false)} disabled={pending}>Cancelar</Button>
            <Button
              onClick={() => respond('changes', message, () => { setChangesOpen(false); setMessage(''); })}
              loading={pending}
            >
              Enviar solicitud
            </Button>
          </>
        }
      >
        <Field label="¿Qué necesitas modificar?" htmlFor="g_changes" required>
          <Textarea id="g_changes" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
      </Dialog>

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rechazar cotización"
        description="Puedes indicarnos el motivo. Es opcional."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={pending}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => respond('reject', reason, () => { setRejectOpen(false); setReason(''); })}
              loading={pending}
            >
              Rechazar cotización
            </Button>
          </>
        }
      >
        <Field label="Motivo" htmlFor="g_reason" hint="Opcional">
          <Textarea id="g_reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Dialog>
    </div>
  );
}
