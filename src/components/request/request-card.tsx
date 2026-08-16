import Link from 'next/link';
import { ChevronRight, Droplets, Fuel } from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { formatDateShort, formatGallons } from '@/lib/format';
import { SERVICE_LABELS } from '@/lib/constants';
import type { ServiceRequest } from '@/types';

/** Tarjeta usada en movil, donde la tabla colapsa. */
export function RequestCard({
  request,
  href,
}: {
  request: Pick<
    ServiceRequest,
    'id' | 'request_number' | 'service_type' | 'quantity_gal' | 'quantity_unknown' | 'preferred_date' | 'status' | 'urgency' | 'address_line'
  >;
  href: string;
}) {
  const Icon = request.service_type === 'diesel' ? Fuel : Droplets;

  return (
    <Link href={href} className="group pes-card block p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-[0_12px_28px_-24px_rgba(4,11,29,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
              request.service_type === 'diesel' ? 'bg-gold-50 text-gold-700' : 'bg-sky-50 text-sky-600'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-navy-900">{request.request_number}</p>
            <p className="mt-0.5 truncate text-sm text-navy-600">
              {request.quantity_unknown ? 'Cantidad por definir' : formatGallons(request.quantity_gal)}
              {' de '}
              {SERVICE_LABELS[request.service_type]}
            </p>
            <p className="mt-0.5 truncate text-xs text-navy-300">{request.address_line}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-navy-200 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-navy-500" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-3">
        <StatusBadge status={request.status} />
        {request.urgency === 'urgente' && <UrgencyBadge urgency="urgente" />}
        <span className="ml-auto text-xs text-navy-300">
          {formatDateShort(request.preferred_date)}
        </span>
      </div>
    </Link>
  );
}
