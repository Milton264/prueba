import { cn } from '@/lib/utils';

/** Progreso del formulario: numeros tabulares sobre una regla continua. */
export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <nav aria-label="Progreso de la solicitud">
      <ol className="flex border-t-2 border-navy-100">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = Boolean(onStepClick) && done;

          return (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick?.(i) : undefined}
                className={cn(
                  'w-full border-t-2 px-1 pt-3 text-left transition-[border-color,color,transform] duration-200 -mt-[2px] enabled:hover:-translate-y-px',
                  active ? 'border-t-navy-900' : done ? 'border-t-gold-400' : 'border-t-transparent',
                  clickable && 'cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'block font-sans text-[11px] tabular-nums',
                    active ? 'text-navy-900' : done ? 'text-gold-700' : 'text-navy-300',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'mt-0.5 hidden truncate text-[13px] sm:block',
                    active ? 'font-medium text-navy-900' : done ? 'text-navy-600' : 'text-navy-400',
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-sans text-[11px] uppercase tracking-wide2 text-navy-600 sm:hidden">
        Paso {current + 1} de {steps.length} — {steps[current]}
      </p>
    </nav>
  );
}
