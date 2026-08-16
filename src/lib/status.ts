import type { QuotationStatus, RequestStatus } from '@/types';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  solicitud_recibida: 'Solicitud recibida',
  verificando_disponibilidad: 'Verificando disponibilidad',
  cotizacion_enviada: 'Cotización enviada',
  cotizacion_aprobada: 'Cotización aprobada',
  cambios_solicitados: 'Cambios solicitados',
  cotizacion_rechazada: 'Cotización rechazada',
  servicio_programado: 'Servicio programado',
  servicio_completado: 'Servicio completado',
  solicitud_cancelada: 'Solicitud cancelada',
};

/** Orden canonico para la línea de tiempo del cliente. */
export const REQUEST_TIMELINE_ORDER: RequestStatus[] = [
  'solicitud_recibida',
  'verificando_disponibilidad',
  'cotizacion_enviada',
  'cotizacion_aprobada',
  'servicio_programado',
  'servicio_completado',
];

type Tone = 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'neutral';

export const REQUEST_STATUS_TONE: Record<RequestStatus, Tone> = {
  solicitud_recibida: 'navy',
  verificando_disponibilidad: 'navy',
  cotizacion_enviada: 'gold',
  cotizacion_aprobada: 'success',
  cambios_solicitados: 'warning',
  cotizacion_rechazada: 'danger',
  servicio_programado: 'success',
  servicio_completado: 'success',
  solicitud_cancelada: 'neutral',
};

/** Barra vertical de color que precede a cada estado. */
export const TONE_BAR: Record<Tone, string> = {
  navy: 'bg-navy-400',
  gold: 'bg-gold-400',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
  neutral: 'bg-navy-200',
};

/** Color del rotulo. Todos verificados contra blanco con al menos 4.5:1. */
export const TONE_TEXT: Record<Tone, string> = {
  navy: 'text-navy-600',
  gold: 'text-gold-700',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  neutral: 'text-navy-500',
};

export const TERMINAL_STATUSES: RequestStatus[] = [
  'servicio_completado',
  'cotizacion_rechazada',
  'solicitud_cancelada',
];

/** Transiciones permitidas. El admin puede forzar otras con confirmación explicita. */
export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  solicitud_recibida: ['verificando_disponibilidad', 'cotizacion_enviada', 'solicitud_cancelada'],
  verificando_disponibilidad: ['cotizacion_enviada', 'solicitud_cancelada'],
  cotizacion_enviada: [
    'cotizacion_aprobada',
    'cambios_solicitados',
    'cotizacion_rechazada',
    'solicitud_cancelada',
  ],
  cambios_solicitados: ['cotizacion_enviada', 'verificando_disponibilidad', 'solicitud_cancelada'],
  cotizacion_aprobada: ['servicio_programado', 'solicitud_cancelada'],
  servicio_programado: ['servicio_completado', 'solicitud_cancelada'],
  cotizacion_rechazada: ['verificando_disponibilidad'],
  servicio_completado: [],
  solicitud_cancelada: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: RequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada al cliente',
  approved: 'Aprobada',
  changes_requested: 'Cambios solicitados',
  rejected: 'Rechazada',
  expired: 'Vencida',
  superseded: 'Reemplazada',
};

export const QUOTATION_STATUS_TONE: Record<QuotationStatus, Tone> = {
  draft: 'neutral',
  sent: 'gold',
  approved: 'success',
  changes_requested: 'warning',
  rejected: 'danger',
  expired: 'neutral',
  superseded: 'neutral',
};
