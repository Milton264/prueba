import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative grid min-h-[60vh] place-items-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-navy-50" aria-hidden>
        <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-gold-400" />
      </div>
      <div className="page-enter flex flex-col items-center gap-3 text-navy-400">
        <Loader2 className="h-6 w-6 animate-spin text-navy-600" aria-hidden />
        <p className="text-sm font-medium">Cargando información...</p>
      </div>
    </div>
  );
}
