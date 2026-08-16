import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="w-full max-w-md border-t-2 border-navy-900 pt-6">
        <p className="pes-eyebrow">Error 404</p>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight text-navy-900">
          Página no encontrada
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-navy-600">
          La página que buscas no existe o fue movida.
        </p>
        <ButtonLink href="/" className="mt-7">Ir al inicio</ButtonLink>
      </div>
    </div>
  );
}
