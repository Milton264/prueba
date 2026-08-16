'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type RevealTag = 'div' | 'section' | 'ol' | 'ul';

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Elemento semántico que conserva la estructura original del contenido. */
  as?: RevealTag;
  /** Retraso opcional para encadenar bloques cercanos sin exagerar el movimiento. */
  delay?: number;
  /** Porcentaje aproximado del bloque que debe entrar al viewport. */
  amount?: number;
}

/**
 * Revelado progresivo y liviano para bloques de contenido.
 * Usa IntersectionObserver, se ejecuta una sola vez y respeta reduced-motion
 * desde globals.css. No añade dependencias de animación al bundle.
 */
export function Reveal({
  as = 'div',
  className,
  children,
  delay = 0,
  amount = 0.12,
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: amount, rootMargin: '0px 0px -7% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount]);

  return React.createElement(
    as,
    {
      ...props,
      ref,
      className: cn('reveal-on-scroll', visible && 'is-visible', className),
      style: { ...style, transitionDelay: visible && delay ? `${delay}ms` : undefined },
    },
    children,
  );
}
