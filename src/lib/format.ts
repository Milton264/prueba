import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatGallons(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Por definir';
  return `${new Intl.NumberFormat('es-PA').format(value)} gal`;
}

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('es-PA').format(Number(value ?? 0));
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, "d 'de' MMMM 'de' yyyy", { locale: es }) : '-';
}

export function formatDateShort(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'dd/MM/yyyy', { locale: es }) : '-';
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, "d MMM yyyy, h:mm a", { locale: es }) : '-';
}

export function formatRelative(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true, locale: es }) : '-';
}

export function formatPercent(value: number | null | undefined): string {
  return `${(Number(value ?? 0) * 100).toFixed(2).replace(/\.00$/, '')}%`;
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return '-';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.length === 10 && digits.startsWith('507')) {
    return `+507 ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('507')) {
    return `+507 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return value;
}

export function initials(name: string | null | undefined): string {
  if (!name) return 'PE';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
