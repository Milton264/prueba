import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function Tagline({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <p
      className={cn(
        'text-[11px] font-medium uppercase tracking-[0.22em]',
        light ? 'text-navy-200' : 'text-navy-500',
        className,
      )}
    >
      {siteConfig.tagline}
    </p>
  );
}
