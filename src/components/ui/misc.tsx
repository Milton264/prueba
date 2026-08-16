import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Encabezado de pagina: rotulo en versalitas, titulo y regla inferior. */
export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 border-b border-navy-100 pb-5">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-wide2 text-navy-500 transition-colors hover:text-navy-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Volver
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="pes-eyebrow mb-2">{eyebrow}</p>}
          <h2 className="text-[26px] font-semibold leading-tight text-navy-900">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-navy-500">{description}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

/** Aviso con barra lateral de color, sin fondo tenue ni esquinas redondeadas. */
export function Notice({
  children,
  tone = 'info',
  className,
}: {
  children: React.ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'gold';
  className?: string;
}) {
  const bars = {
    info: 'border-l-navy-900 text-navy-700',
    warning: 'border-l-amber-500 text-amber-900',
    danger: 'border-l-red-600 text-red-800',
    gold: 'border-l-gold-400 text-gold-900',
  };
  return (
    <div className={cn('border-l-[3px] bg-mist px-4 py-3 text-sm leading-relaxed', bars[tone], className)}>
      {children}
    </div>
  );
}

/** Fila de dato: etiqueta en versalitas a la izquierda, valor a la derecha. */
export function DataRow({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-baseline justify-between gap-3 border-b border-navy-100 py-2.5 last:border-0', className)}>
      <dt className="font-sans text-[11px] uppercase tracking-wide2 text-navy-500">{label}</dt>
      <dd className={cn('text-sm font-medium text-navy-900', mono && 'font-sans tabular-nums')}>{value ?? '—'}</dd>
    </div>
  );
}

export function Pagination({ page, totalPages, baseUrl }: { page: number; totalPages: number; baseUrl: string }) {
  if (totalPages <= 1) return null;
  const build = (p: number) => `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${p}`;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-between border-t border-navy-100 px-4 py-3" aria-label="Paginación">
      <span className="font-sans text-[11px] uppercase tracking-wide2 text-navy-500">
        Página {page} de {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={build(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={cn(
            'grid h-8 w-8 place-items-center border border-navy-200 text-navy-600 transition-[border-color,color,transform] duration-150 active:scale-95',
            page === 1 ? 'pointer-events-none opacity-40' : 'hover:border-navy-900 hover:text-navy-900',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        {pages.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 font-sans text-navy-300">···</span>}
            <Link
              href={build(p)}
              className={cn(
                'grid h-8 min-w-8 place-items-center border px-2 font-sans text-[12px] tabular-nums transition-[border-color,background-color,color,transform] duration-150 active:scale-95',
                p === page
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-navy-200 text-navy-600 hover:border-navy-900 hover:text-navy-900',
              )}
            >
              {p}
            </Link>
          </React.Fragment>
        ))}
        <Link
          href={build(Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          className={cn(
            'grid h-8 w-8 place-items-center border border-navy-200 text-navy-600 transition-[border-color,color,transform] duration-150 active:scale-95',
            page === totalPages ? 'pointer-events-none opacity-40' : 'hover:border-navy-900 hover:text-navy-900',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}
