import * as React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

/**
 * Botones rectangulares con rotulo en versalitas y tracking abierto,
 * en linea con el trazo del logotipo. Sin esquinas redondeadas ni sombras.
 */
const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 disabled:bg-navy-300',
  secondary: 'border border-navy-900 text-navy-900 bg-white hover:bg-navy-900 hover:text-white',
  ghost: 'text-navy-700 hover:bg-mist',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  success: 'bg-emerald-700 text-white hover:bg-emerald-800',
  whatsapp: 'bg-[#0B5C29] text-white hover:bg-[#084520]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[11px] gap-2',
  md: 'h-11 px-6 text-[12px] gap-2',
  lg: 'h-[52px] px-8 text-[13px] gap-2.5',
};

const base =
  'group inline-flex items-center justify-center whitespace-nowrap rounded-sm font-sans font-semibold uppercase tracking-wide2 shadow-none transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985] disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60 select-none';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function ButtonLink({ className, variant = 'primary', size = 'md', fullWidth, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)} {...props} />
  );
}
