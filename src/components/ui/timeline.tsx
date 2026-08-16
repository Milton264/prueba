import { formatDateTime } from '@/lib/format';
import { REQUEST_STATUS_LABELS, REQUEST_TIMELINE_ORDER } from '@/lib/status';
import { cn } from '@/lib/utils';
import type { RequestStatus, RequestStatusHistory } from '@/types';

/**
 * Linea de tiempo como registro de bitacora: numeros de paso tabulares
 * y una regla vertical continua. Sin circulos ni iconos de verificacion.
 */
export function RequestTimeline({
  history,
  currentStatus,
}: {
  history: RequestStatusHistory[];
  currentStatus: RequestStatus;
}) {
  const reached = new Map(history.map((h) => [h.to_status, h]));
  const steps: RequestStatus[] = [...REQUEST_TIMELINE_ORDER];

  if (currentStatus === 'cambios_solicitados' && !steps.includes('cambios_solicitados')) {
    steps.splice(3, 0, 'cambios_solicitados');
  }
  if (
    (currentStatus === 'cotizacion_rechazada' || currentStatus === 'solicitud_cancelada') &&
    !steps.includes(currentStatus)
  ) {
    steps.push(currentStatus);
  }

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const entry = reached.get(step);
        const done = Boolean(entry);
        const isCurrent = step === currentStatus;
        const pending = !done && (currentIndex === -1 || index > currentIndex);

        return (
          <li key={step} className="relative flex gap-4 pb-5 last:pb-0">
            <span
              className={cn(
                'absolute left-[13px] top-1 h-full w-px',
                index === steps.length - 1 && 'hidden',
                done ? 'bg-navy-900' : 'bg-navy-100',
              )}
              aria-hidden
            />
            <span
              className={cn(
                'relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center border font-sans transition-[background-color,border-color,color,transform] duration-200 text-[10px] tabular-nums',
                isCurrent && 'border-navy-900 bg-navy-900 text-white',
                done && !isCurrent && 'border-navy-900 bg-white text-navy-900',
                pending && 'border-navy-100 bg-white text-navy-300',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={cn(
                  'text-sm',
                  isCurrent ? 'font-semibold text-navy-900' : done ? 'font-medium text-navy-700' : 'text-navy-400',
                )}
              >
                {REQUEST_STATUS_LABELS[step]}
              </p>
              {entry && (
                <p className="mt-0.5 font-sans text-[11px] tabular-nums text-navy-500">
                  {formatDateTime(entry.created_at)}
                </p>
              )}
              {entry?.note && <p className="mt-1.5 text-[13px] leading-relaxed text-navy-600">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
