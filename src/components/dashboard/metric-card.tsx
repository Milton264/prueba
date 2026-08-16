import Link from 'next/link';
import {
  ClipboardList,
  Droplet,
  Fuel,
  PackageCheck,
  ReceiptText,
  Truck,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tarjetas de métrica con ícono, al estilo de las maquetas: un recuadro de
 * color suave con el ícono, el número grande y una etiqueta con sublínea.
 * El ícono se referencia por nombre para poder construir la lista en un
 * Server Component y pasarla sin problemas de serialización.
 */
const METRIC_ICONS = {
  clipboard: ClipboardList,
  receipt: ReceiptText,
  package: PackageCheck,
  truck: Truck,
  fuel: Fuel,
  droplet: Droplet,
  trend: TrendingUp,
} satisfies Record<string, LucideIcon>;

export type MetricIconName = keyof typeof METRIC_ICONS;

export type MetricTone = 'navy' | 'gold' | 'sky' | 'green';

const TONE_STYLES: Record<MetricTone, string> = {
  navy: 'bg-navy-50 text-navy-700',
  gold: 'bg-gold-50 text-gold-700',
  sky: 'bg-sky-50 text-sky-600',
  green: 'bg-green-50 text-green-700',
};

export interface IconMetric {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: MetricIconName;
  tone?: MetricTone;
  href?: string;
}

export function MetricCard({ label, value, sublabel, icon, tone = 'navy', href }: IconMetric) {
  const Icon = METRIC_ICONS[icon];

  const body = (
    <div className="group flex h-full items-start gap-4 rounded-2xl border border-navy-100 bg-white px-5 py-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-navy-200 hover:shadow-[0_14px_32px_-24px_rgba(4,11,29,0.55)]">
      <span className={cn('icon-response grid h-11 w-11 shrink-0 place-items-center rounded-xl', TONE_STYLES[tone])}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-tight text-navy-500">{label}</p>
        <p className="mt-1 font-sans text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular-nums">
          {value}
        </p>
        {sublabel && <p className="mt-1 text-[11px] text-navy-400">{sublabel}</p>}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function MetricCardGrid({ metrics, className }: { metrics: IconMetric[]; className?: string }) {
  return (
    <div className={cn('motion-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
