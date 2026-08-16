import { DISCLAIMER } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Aviso legal obligatorio. Barra dorada a la izquierda, rótulo en versalitas. */
export function DisclaimerNotice({ className }: { className?: string }) {
  return (
    <div className={cn('border-l-[3px] border-l-gold-400 bg-mist px-5 py-4', className)}>
      <p className="pes-eyebrow text-gold-700">Aviso</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-navy-700">{DISCLAIMER}</p>
    </div>
  );
}
