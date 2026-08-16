import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Metric {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  /** Resalta la cifra cuando exige atencion. */
  accent?: boolean;
}

/**
 * Fila de metricas separada por reglas verticales, con una regla navy arriba.
 * Sustituye a la rejilla de tarjetas: menos ruido y mas aspecto de tablero.
 */
export function MetricRow({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <div className={cn('border-t-2 border-navy-900 bg-white', className)}>
      <dl className="grid grid-cols-2 divide-navy-100 sm:grid-cols-3 sm:divide-x lg:grid-cols-6">
        {metrics.map((m) => {
          const body = (
            <div className="px-5 py-4">
              <dd
                className={cn(
                  'font-sans text-[26px] font-medium leading-none tabular-nums',
                  m.accent ? 'text-gold-700' : 'text-navy-900',
                )}
              >
                {m.value}
              </dd>
              <dt className="mt-2 font-sans text-[10px] font-medium uppercase tracking-eyebrow text-navy-500">
                {m.label}
              </dt>
              {m.hint && <p className="mt-1 text-[11px] text-navy-400">{m.hint}</p>}
            </div>
          );

          return (
            <div key={m.label} className="border-b border-navy-100 sm:border-b-0">
              {m.href ? (
                <Link href={m.href} className="block transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-mist">
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Metrica suelta, para columnas laterales. */
export function StatCard({ label, value, hint, href, accent }: Metric) {
  const body = (
    <div className="border-t-2 border-navy-900 px-4 py-3.5">
      <p className={cn('font-sans text-[22px] font-medium leading-none tabular-nums', accent ? 'text-gold-700' : 'text-navy-900')}>
        {value}
      </p>
      <p className="mt-2 font-sans text-[10px] font-medium uppercase tracking-eyebrow text-navy-500">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-navy-400">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-mist">{body}</Link> : body;
}
