import Image from 'next/image';
import {
  Anchor,
  Clock,
  Droplet,
  Factory,
  MapPin,
  ShieldCheck,
  Ship,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/reveal';

const STRIP_ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  zap: Zap,
  clock: Clock,
  droplet: Droplet,
  factory: Factory,
  ship: Ship,
  anchor: Anchor,
  map: MapPin,
} satisfies Record<string, LucideIcon>;

export type StripIconName = keyof typeof STRIP_ICONS;

export interface PhotoStripItem {
  src: string;
  alt: string;
  label: string;
  icon: StripIconName;
}

/**
 * Tira horizontal de fotografias en una sola linea, tal como aparece en los
 * flyers oficiales: cada foto con su rotulo dorado e icono debajo. En moviles
 * la fila se puede desplazar de lado; en escritorio las fotos se reparten
 * uniformemente ocupando todo el ancho.
 */
export function PhotoStrip({ items, className }: { items: PhotoStripItem[]; className?: string }) {
  return (
    <Reveal
      className={cn(
        'flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 sm:grid sm:overflow-visible',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((it) => {
        const Icon = STRIP_ICONS[it.icon];
        return (
          <figure
            key={it.src}
            className="group relative w-[68%] shrink-0 snap-start overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_-24px_rgba(4,11,29,0.65)] sm:w-auto"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes="(min-width: 1024px) 260px, 68vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/25 to-transparent" />
            </div>
            <figcaption className="flex items-center gap-2 bg-gold-400 px-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-navy-900" aria-hidden />
              <span className="font-sans text-[10px] font-bold uppercase leading-tight tracking-wide2 text-navy-900">
                {it.label}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </Reveal>
  );
}
