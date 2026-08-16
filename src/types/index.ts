export type UserRole = 'client' | 'admin';
export type ServiceType = 'diesel' | 'agua';
export type UrgencyType = 'normal' | 'urgente';
export type PricingMode = 'por_galon' | 'monto_fijo';
export type OperatorAvailability = 'pendiente' | 'si' | 'no';
export type TimeSlot = '08:00-10:00' | '09:00-12:00' | '12:00-15:00' | '15:00-18:00' | 'flexible';

export type FacilityType =
  | 'ph_edificio'
  | 'comercio'
  | 'planta_electrica'
  | 'industria'
  | 'obra'
  | 'residencia'
  | 'otro';

export type RequestStatus =
  | 'solicitud_recibida'
  | 'verificando_disponibilidad'
  | 'cotizacion_enviada'
  | 'cotizacion_aprobada'
  | 'cambios_solicitados'
  | 'cotizacion_rechazada'
  | 'servicio_programado'
  | 'servicio_completado'
  | 'solicitud_cancelada';

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'expired'
  | 'superseded';

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string | null;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  notes_internal?: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  client_profile_id: string;
  label: string;
  facility_name: string | null;
  facility_type: FacilityType;
  province: string;
  district: string | null;
  corregimiento: string | null;
  address_line: string;
  reference_point: string | null;
  access_instructions: string | null;
  tank_capacity_gal: number | null;
  is_default: boolean;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  client_profile_id: string;
  created_by_user_id: string | null;
  access_token: string;
  service_type: ServiceType;
  quantity_gal: number | null;
  quantity_unknown: boolean;
  quantity_note: string | null;
  facility_name: string | null;
  facility_type: FacilityType;
  province: string;
  district: string | null;
  corregimiento: string | null;
  address_line: string;
  reference_point: string | null;
  access_instructions: string | null;
  tank_capacity_gal: number | null;
  current_level_pct: number | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  urgency: UrgencyType;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  customer_comments: string | null;
  status: RequestStatus;
  terms_accepted_at: string | null;
  is_guest: boolean;
  final_quantity_gal: number | null;
  completed_at: string | null;
  completion_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestStatusHistory {
  id: string;
  service_request_id: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus;
  changed_by_user_id: string | null;
  note: string | null;
  created_at: string;
}

/** Campos visibles al cliente. Coincide con la vista SQL quotations_public. */
export interface QuotationPublic {
  id: string;
  quotation_number: string;
  service_request_id: string;
  version: number;
  status: QuotationStatus;
  pricing_mode: PricingMode;
  price_per_gallon: number | null;
  quantity_gal: number | null;
  product_subtotal: number;
  delivery_charge: number;
  urgency_surcharge: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  proposed_date: string | null;
  proposed_time_slot: string | null;
  payment_terms: string | null;
  valid_until: string | null;
  client_notes: string | null;
  sent_at: string | null;
  responded_at: string | null;
  client_response_message: string | null;
  rejection_reason: string | null;
  created_at: string;
}

/**
 * Campos internos de la cotización. Viven en la tabla quotation_internal,
 * accesible solo por administradores (RLS). El cliente nunca los recibe.
 */
export interface QuotationInternal {
  id: string;
  quotation_id: string;
  supplier_cost: number;
  transport_cost: number;
  other_costs: number;
  margin_per_gallon: number;
  margin_fixed: number;
  estimated_profit: number;
  internal_notes: string | null;
}

/** Vista administrativa: cotización pública mas sus datos internos. */
export interface Quotation extends QuotationPublic {
  created_by_user_id?: string | null;
  quotation_internal?: QuotationInternal | null;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  sort_order: number;
  concept: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
  is_taxable: boolean;
}

export interface OperatorInformation {
  id: string;
  service_request_id: string;
  operator_name: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  availability: OperatorAvailability;
  supplier_cost: number | null;
  transport_cost: number | null;
  available_date: string | null;
  available_time_slot: string | null;
  internal_observations: string | null;
  updated_at: string;
}

export interface InternalNote {
  id: string;
  service_request_id: string;
  author_user_id: string | null;
  author_name?: string | null;
  body: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  service_request_id: string;
  quotation_id: string | null;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: 'tanque' | 'acceso' | 'comprobante' | 'otro';
  is_client_visible: boolean;
  created_at: string;
  signedUrl?: string | null;
}

export interface SystemSettings {
  id: string;
  company_name: string;
  logo_path: string | null;
  tagline: string;
  contact_email: string;
  whatsapp_number: string;
  website_url: string | null;
  address: string | null;
  tax_rate: number;
  request_prefix: string;
  quotation_prefix: string;
  quotation_terms: string | null;
  privacy_policy: string | null;
  terms_conditions: string | null;
  updated_at: string;
}

export interface CatalogService {
  id: string;
  service_type: ServiceType;
  name: string;
  unit: string;
  preset_quantities: number[];
  reference_price: number | null;
  is_active: boolean;
}

export interface Notification {
  id: string;
  recipient_user_id: string | null;
  client_profile_id: string | null;
  service_request_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
