import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  solid: 'bg-[#0B5C29] text-white hover:bg-[#084520]',
  outline: 'border border-[#0B5C29] text-[#0B5C29] bg-white hover:bg-[#0B5C29] hover:text-white',
  ghost: 'text-[#0B5C29] hover:bg-mist',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[11px] gap-2',
  md: 'h-11 px-6 text-[12px] gap-2',
  lg: 'h-[52px] px-8 text-[13px] gap-2.5',
};

/**
 * Enlace directo a WhatsApp con mensaje prellenado.
 * El número se toma de la configuración del sistema o de la variable de entorno.
 */
export function WhatsAppButton({
  message,
  number,
  label = 'Hablar por WhatsApp',
  variant = 'solid',
  size = 'md',
  fullWidth,
  className,
}: {
  message: string;
  number?: string | null;
  label?: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <a
      href={whatsappLink(message, number)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'no-print inline-flex items-center justify-center whitespace-nowrap rounded-sm font-sans font-medium uppercase tracking-wide2 transition-colors',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
      {label}
    </a>
  );
}
