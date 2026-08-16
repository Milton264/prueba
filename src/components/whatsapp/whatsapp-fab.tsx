import { MessageCircle } from 'lucide-react';
import { waMessages, whatsappLink } from '@/lib/whatsapp';

/** Boton flotante presente en la pagina pública. */
export function WhatsAppFab({ number }: { number?: string | null }) {
  return (
    <a
      href={whatsappLink(waMessages.general(), number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      className="group no-print fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center bg-[#0B5C29] text-white shadow-panel transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:scale-105 hover:bg-[#084520]"
    >
      <MessageCircle className="h-7 w-7 transition-transform duration-200 group-hover:rotate-[-4deg]" aria-hidden />
    </a>
  );
}
