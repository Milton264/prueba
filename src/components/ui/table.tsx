import * as React from 'react';
import { cn } from '@/lib/utils';

export function TableWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full overflow-x-auto', className)} {...props} />;
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full min-w-[640px] border-collapse text-sm', className)} {...props} />;
}

export function Thead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-white', className)} {...props} />;
}

/** Cabecera compacta en versalitas y regla navy gruesa. */
export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap border-b-2 border-navy-900 px-4 py-2.5 text-left font-sans text-[10px] font-medium uppercase tracking-eyebrow text-navy-500',
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-navy-100 transition-colors duration-150 last:border-0 hover:bg-mist', className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-navy-700', className)} {...props} />;
}

/** Celda para cifras: tabular y alineada a la derecha. */
export function TdNum({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-right font-sans tabular-nums text-navy-900', className)} {...props} />;
}
