'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Notice } from '@/components/ui/misc';
import { addInternalNote } from '@/lib/actions/requests';
import { formatDateTime } from '@/lib/format';
import type { InternalNote } from '@/types';

/** Notas internas. Nunca visibles para el cliente (RLS solo permite admin). */
export function InternalNotes({ requestId, notes }: { requestId: string; notes: InternalNote[] }) {
  const [state, action, pending] = useActionState(addInternalNote, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? 'Nota agregada.');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-navy-300" aria-hidden />
          Notas internas
        </CardTitle>
        <span className="border border-navy-200 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide2 text-navy-500">
          Solo PES
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}

        <form ref={formRef} action={action} className="space-y-3">
          <input type="hidden" name="request_id" value={requestId} />
          <Textarea
            name="body"
            rows={3}
            placeholder="Escribe una nota interna sobre esta solicitud..."
            required
          />
          <Button type="submit" size="sm" loading={pending}>
            <Send className="h-4 w-4" aria-hidden />
            Agregar nota
          </Button>
        </form>

        {notes.length > 0 && (
          <ul className="space-y-3 border-t border-navy-100 pt-4">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-mist px-4 py-3">
                <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">{n.body}</p>
                <p className="mt-2 text-xs text-navy-300">
                  {n.author_name ? `${n.author_name} · ` : ''}
                  {formatDateTime(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
