import { cn } from '@/lib/utils';
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_TONE,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONE,
  TONE_BAR,
  TONE_TEXT,
} from '@/lib/status';
import type { QuotationStatus, RequestStatus } from '@/types';

/**
 * Estados marcados con una barra vertical de color y texto en versalitas,
 * en vez de la pastilla redondeada con fondo tenue.
 */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONE_BAR;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <span className={cn('h-3.5 w-[3px] shrink-0', TONE_BAR[tone])} aria-hidden />
      <span className={cn('font-sans text-[11px] font-medium uppercase tracking-wide2', TONE_TEXT[tone])}>
        {children}
      </span>
    </span>
  );
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Badge tone={REQUEST_STATUS_TONE[status]} className={className}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return <Badge tone={QUOTATION_STATUS_TONE[status]}>{QUOTATION_STATUS_LABELS[status]}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: 'normal' | 'urgente' }) {
  if (urgency === 'normal') return null;
  return (
    <span className="inline-flex items-center border border-gold-400 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide2 text-gold-700">
      Urgente
    </span>
  );
}
