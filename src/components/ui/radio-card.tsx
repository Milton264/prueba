'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Opciones como bloques rectangulares. La seleccion se marca con borde navy
 * grueso y una barra dorada superior, no con relleno de color.
 */
export function RadioCardGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: T | null;
  onChange: (value: T) => void;
  options: Option<T>[];
  columns?: 1 | 2 | 3;
}) {
  const cols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' };

  return (
    <div className={cn('grid gap-3', cols[columns])} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'group relative border p-5 text-left transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-sm',
              selected ? 'border-navy-900 bg-white' : 'border-navy-200 bg-white hover:border-navy-400',
            )}
          >
            {selected && <span className="absolute inset-x-0 top-0 h-[3px] bg-gold-400" aria-hidden />}
            {Icon && (
              <Icon className={cn('icon-response h-5 w-5', selected ? 'text-navy-900' : 'text-navy-400')} aria-hidden />
            )}
            <span className={cn('mt-3 block text-[15px] font-semibold', selected ? 'text-navy-900' : 'text-navy-700')}>
              {opt.label}
            </span>
            {opt.description && (
              <span className="mt-1.5 block text-[13px] leading-relaxed text-navy-500">{opt.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Cantidades preestablecidas: botones rectos con cifras tabulares. */
export function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string | null;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-11 min-w-[96px] border px-4 font-sans text-[13px] font-medium tabular-nums transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-px active:translate-y-0',
            value === opt.value
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-200 bg-white text-navy-700 hover:border-navy-900',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
