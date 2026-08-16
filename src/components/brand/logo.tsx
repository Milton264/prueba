import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** 'primary' sobre fondo claro, 'white' sobre navy, 'mark' solo el simbolo PES. */
  variant?: 'primary' | 'white' | 'mark';
  /** Altura en px. El ancho se deriva de la proporcion oficial del archivo. */
  height?: number;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

/**
 * Componente único del logotipo de PES.
 *
 * El archivo oficial vive en /public/brand/. El ancho se calcula siempre a
 * partir de la altura y de la proporcion real del archivo (1468 x 394), de modo
 * que el logo nunca se estira ni se recorta. Para actualizarlo basta con
 * reemplazar los PNG conservando los nombres.
 */
export function Logo({
  variant = 'primary',
  height = 40,
  className,
  href = '/',
  priority = false,
}: LogoProps) {
  const isMark = variant === 'mark';
  const src = variant === 'white' ? siteConfig.logo.white : isMark ? siteConfig.logo.mark : siteConfig.logo.primary;

  // Isotipo: 645 x 188. Logotipo completo: 1468 x 394.
  const ratio = isMark ? 3.43 : siteConfig.logoRatio;
  const width = Math.round(height * ratio);

  const img = (
    <Image
      src={src}
      alt={siteConfig.name}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn('object-contain', className)}
      style={{ height, width: 'auto' }}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={siteConfig.name}>
      {img}
    </Link>
  );
}
