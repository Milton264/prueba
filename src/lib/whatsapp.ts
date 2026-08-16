import { siteConfig } from '@/config/site';
import { SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatDate, formatGallons } from '@/lib/format';
import type { ServiceType } from '@/types';

function sanitizeNumber(raw?: string | null): string {
  return (raw || siteConfig.whatsapp).replace(/\D/g, '');
}

/** Construye un enlace wa.me con mensaje prellenado. */
export function whatsappLink(message: string, number?: string | null): string {
  return `https://wa.me/${sanitizeNumber(number)}?text=${encodeURIComponent(message)}`;
}

export const waMessages = {
  general: () =>
    'Hola, necesito información sobre los servicios de diésel y agua potable de PES.',

  request: (requestNumber: string) =>
    `Hola, quisiera hablar con un asesor sobre la solicitud ${requestNumber}.`,

  quotation: (quotationNumber: string) =>
    `Hola, tengo una consulta sobre la cotización ${quotationNumber}.`,

  help: () =>
    'Hola, necesito ayuda con la plataforma de Panama Energy Solutions.',

  /** Admin -> compañía operadora aliada. */
  operator: (params: {
    requestNumber: string;
    serviceType: ServiceType;
    quantityGal: number | null;
    quantityUnknown?: boolean;
    location: string;
    preferredDate: string | null;
    timeSlot: string | null;
  }) => {
    const cantidad = params.quantityUnknown
      ? 'cantidad por definir'
      : formatGallons(params.quantityGal);
    const servicio = SERVICE_LABELS[params.serviceType].toLowerCase();
    const fecha = params.preferredDate
      ? `fecha solicitada ${formatDate(params.preferredDate)}`
      : 'fecha por confirmar';
    const horario = params.timeSlot
      ? `horario de ${TIME_SLOT_LABELS[params.timeSlot] ?? params.timeSlot}`
      : 'horario por confirmar';
    return `Hola, necesitamos confirmar disponibilidad y precio para la solicitud ${params.requestNumber}: ${cantidad} de ${servicio}, entrega en ${params.location}, ${fecha}, ${horario}.`;
  },

  /** Admin -> cliente. */
  toClient: (clientName: string, requestNumber: string) =>
    `Hola ${clientName}, le escribimos de Panama Energy Solutions sobre su solicitud ${requestNumber}.`,

  /** Admin -> cliente compartiendo el enlace de la cotización. */
  shareQuotation: (clientName: string, quotationNumber: string, url: string) =>
    `Hola ${clientName}, su cotización ${quotationNumber} de Panama Energy Solutions ya está lista. Puede revisarla y aprobarla aquí: ${url}`,
};
