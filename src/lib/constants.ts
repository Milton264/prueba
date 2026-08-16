import type { FacilityType, ServiceType, TimeSlot, UrgencyType } from '@/types';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  diesel: 'Diésel',
  agua: 'Agua potable',
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  diesel: 'Suministro para plantas eléctricas, PH y edificios, comercios, industrias, obras y operaciones críticas.',
  agua: 'Llenado de tanques para PH y edificios, comercios, obras e instalaciones industriales. Servicios programados o urgentes.',
};

export const SERVICE_USES: Record<ServiceType, string[]> = {
  diesel: [
    'Plantas eléctricas',
    'PH y edificios',
    'Comercios',
    'Industrias',
    'Obras',
    'Operaciones críticas',
  ],
  agua: [
    'Llenado de tanques',
    'PH y edificios',
    'Comercios',
    'Obras',
    'Instalaciones industriales',
    'Servicios programados o urgentes',
  ],
};

/** Cantidades sugeridas. Editables desde /admin/servicios. */
export const DIESEL_QUANTITIES = [100, 200, 500, 1000] as const;
export const AGUA_QUANTITIES = [500, 1000, 2000, 5000] as const;

export const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: 'ph_edificio', label: 'PH o edificio' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'planta_electrica', label: 'Planta eléctrica' },
  { value: 'industria', label: 'Industria' },
  { value: 'obra', label: 'Obra' },
  { value: 'residencia', label: 'Residencia' },
  { value: 'otro', label: 'Otro' },
];

export const FACILITY_LABELS = Object.fromEntries(
  FACILITY_TYPES.map((f) => [f.value, f.label]),
) as Record<FacilityType, string>;

export const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: '08:00-10:00', label: '8:00 a. m. - 10:00 a. m.' },
  { value: '09:00-12:00', label: '9:00 a. m. - 12:00 p. m.' },
  { value: '12:00-15:00', label: '12:00 p. m. - 3:00 p. m.' },
  { value: '15:00-18:00', label: '3:00 p. m. - 6:00 p. m.' },
  { value: 'flexible', label: 'Horario flexible' },
];

export const TIME_SLOT_LABELS = Object.fromEntries(
  TIME_SLOTS.map((t) => [t.value, t.label]),
) as Record<string, string>;

export const URGENCY_TYPES: { value: UrgencyType; label: string; hint: string }[] = [
  { value: 'normal', label: 'Normal', hint: 'Coordinación estandar según disponibilidad.' },
  { value: 'urgente', label: 'Urgente', hint: 'Prioridad de atención. Puede aplicar recargo.' },
];

export const PAYMENT_TERMS_OPTIONS = [
  'Pago contra entrega',
  'Pago por adelantado',
  'Crédito 15 días',
  'Crédito 30 días',
  'Según acuerdo comercial',
];

/** Aviso legal obligatorio, visible en la pagina pública y en el formulario. */
export const DISCLAIMER =
  'Las solicitudes están sujetas a confirmación de disponibilidad, precio y horario por parte de PES.';

export const TERMS_CHECKBOX_TEXT =
  'Entiendo que esta solicitud no confirma automáticamente precio, disponibilidad ni horario. PES se comunicará conmigo después de verificar la información.';

export const MAX_UPLOAD_FILES = 3;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
