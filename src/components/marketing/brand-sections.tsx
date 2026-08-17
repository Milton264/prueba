import {
  Activity,
  Anchor,
  Building,
  Building2,
  Clock,
  Droplet,
  Factory,
  Fuel,
  HardHat,
  Hotel,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Ship,
  Siren,
  Truck,
  Utensils,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { formatPhone } from '@/lib/format';
import { waMessages, whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/reveal';
import type { PhotoStripItem } from './photo-strip';

/**
 * Secciones tomadas literalmente de las piezas graficas oficiales
 * ("Suministro de diesel" / "Suministro de agua potable"): franja de
 * confianza, sectores atendidos, barra de caracteristicas en navy y barra
 * de contacto. Se usan en las mismas paginas publicas para que el esquema
 * no se aleje de una seccion a otra.
 */

/* ------------------------------------------------------------------ */
/* FRANJA DE CONFIANZA (badges superiores del flyer)                   */
/* ------------------------------------------------------------------ */
const TRUST_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: 'Seguro y confiable' },
  { icon: Clock, label: 'Servicio 24/7' },
  { icon: Zap, label: 'Entrega eficiente' },
  { icon: MapPin, label: 'Cobertura nacional' },
];

export function TrustBadges({ className, variant = 'light' }: { className?: string; variant?: 'light' | 'dark' }) {
  const dark = variant === 'dark';
  return (
    <ul className={cn('motion-stagger flex flex-wrap gap-x-9 gap-y-5', className)}>
      {TRUST_BADGES.map(({ icon: Icon, label }) => (
        <li key={label} className="group flex items-center gap-3">
          <span className="icon-response grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={cn(
              'font-sans text-[11px] font-semibold uppercase leading-tight tracking-wide2',
              dark ? 'text-white' : 'text-navy-900',
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* SECTORES QUE ATENDEMOS                                              */
/* ------------------------------------------------------------------ */
const SECTORS: { icon: LucideIcon; label: string }[] = [
  { icon: Zap, label: 'Plantas eléctricas y generadores' },
  { icon: Building, label: 'PH residenciales y comerciales' },
  { icon: Building2, label: 'Edificios corporativos' },
  { icon: ShoppingCart, label: 'Centros comerciales' },
  { icon: Hotel, label: 'Hoteles e industrias' },
  { icon: Siren, label: 'Emergencias 24/7' },
  { icon: HardHat, label: 'Obras y proyectos' },
  { icon: Anchor, label: 'Puertos y embarcaciones' },
];

export function SectorsGrid({
  items = SECTORS,
  className,
}: {
  items?: { icon: LucideIcon; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('', className)}>
      <p className="pes-eyebrow text-center">
        <span className="inline-block border-b-2 border-gold-400 pb-2">Sectores que atendemos</span>
      </p>

      <Reveal className="motion-stagger mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="group flex flex-col items-center gap-3 px-2 text-center">
            <span className="icon-response grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-gold-400 text-gold-500">
            <Icon className="h-7 w-7 overflow-visible" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="font-sans text-[11px] font-semibold uppercase leading-snug tracking-wide2 text-navy-800">
              {label}
            </span>
          </div>
        ))}
      </Reveal>
    </div>
  );
}

/** Sectores del flyer de diesel. */
export const DIESEL_SECTORS: { icon: LucideIcon; label: string }[] = [
  { icon: Zap, label: 'Plantas eléctricas y generadores' },
  { icon: Building, label: 'PH residenciales y comerciales' },
  { icon: Building2, label: 'Edificios corporativos' },
  { icon: ShoppingCart, label: 'Centros comerciales' },
  { icon: Hotel, label: 'Hoteles e industrias' },
  { icon: Utensils, label: 'Restaurantes' },
  { icon: Siren, label: 'Emergencias 24/7' },
  { icon: HardHat, label: 'Obras y proyectos' },
];

/** Sectores del flyer de agua potable. */
export const AGUA_SECTORS: { icon: LucideIcon; label: string }[] = [
  { icon: ShoppingCart, label: 'Comercios' },
  { icon: Building2, label: 'Edificios' },
  { icon: Factory, label: 'Industrias' },
  { icon: Activity, label: 'Operaciones críticas' },
  { icon: Ship, label: 'Barcos' },
  { icon: Anchor, label: 'Puertos' },
  { icon: Warehouse, label: 'Bodegas y depósitos' },
  { icon: Wrench, label: 'Proyectos de construcción' },
];

/* ------------------------------------------------------------------ */
/* BARRA DE CARACTERISTICAS (bloque navy del flyer)                    */
/* ------------------------------------------------------------------ */
const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Seguridad',
    text: 'Transporte y descarga con altos estándares de seguridad.',
  },
  {
    icon: Clock,
    title: 'Disponibilidad',
    text: 'Servicio 24 horas, los 7 días de la semana, sujeto a disponibilidad.',
  },
  {
    icon: Fuel,
    title: 'Eficiencia',
    text: 'Entrega puntual y continua para su tranquilidad.',
  },
  {
    icon: MapPin,
    title: 'Cobertura nacional',
    text: 'Desde la ciudad hasta las áreas más remotas, llevamos el suministro que su operación necesita.',
  },
];

export const DIESEL_FEATURES = FEATURES;

/** Barra de caracteristicas del flyer de agua potable (5 columnas). */
export const AGUA_FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Droplet,
    title: 'Agua potable de calidad',
    text: 'Cumplimos con las normas de potabilidad y salud pública.',
  },
  {
    icon: Clock,
    title: 'Disponibilidad 24/7',
    text: 'Servicio continuo los 7 días de la semana, todo el año.',
  },
  {
    icon: Truck,
    title: 'Flota moderna y segura',
    text: 'Barcazas y camiones cisterna equipados para un servicio eficiente.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad y confianza',
    text: 'Procesos seguros, personal capacitado y cumplimiento de normas.',
  },
  {
    icon: MapPin,
    title: 'Cobertura nacional',
    text: 'Llegamos a donde nos necesite en todo Panamá.',
  },
];

export function FeatureBar({
  features = FEATURES,
  className,
}: {
  features?: { icon: LucideIcon; title: string; text: string }[];
  className?: string;
}) {
  const cols = features.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';
  return (
    <Reveal className={cn('rounded-2xl bg-navy-900 px-6 py-10 sm:px-10 sm:py-12', className)}>
      <div className={cn('grid gap-9 divide-y divide-white/10 sm:grid-cols-2 sm:gap-8 sm:divide-y-0 lg:divide-x', cols)}>
        {features.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className={cn('group flex flex-col items-start gap-4 pt-9 first:pt-0 sm:pt-0', i > 0 && 'lg:pl-6')}>
            <span className="icon-response grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-gold-400 text-gold-400">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-sans text-[12.5px] font-bold uppercase tracking-wide2 text-white">
                {title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-200">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* FRANJA DE OPERACION (equivalente a la tira de fotos del flyer)      */
/* ------------------------------------------------------------------ */
const OPERATION_HIGHLIGHTS: { icon: LucideIcon; label: string }[] = [
  { icon: Fuel, label: 'Flota moderna' },
  { icon: ShieldCheck, label: 'Suministro seguro' },
  { icon: Zap, label: 'Energía que no se detiene' },
  { icon: Clock, label: 'Operaciones 24/7' },
];

/**
 * En los flyers esta franja es un mosaico de 4 fotografias con una
 * etiqueta dorada superpuesta. Aqui, hasta contar con fotografia real de
 * la flota, se resuelve con paneles en degradado navy y el mismo rotulo
 * dorado con icono, para no usar imagenes de stock genericas.
 */
export function OperationStrip({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-1 sm:grid-cols-4', className)}>
      {OPERATION_HIGHLIGHTS.map(({ icon: Icon, label }, i) => (
        <div
          key={label}
          className="relative flex aspect-[4/3] items-end overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950"
          style={{ backgroundPosition: `${i * 20}% 50%` }}
        >
          <Icon className="pointer-events-none absolute right-3 top-3 h-7 w-7 text-white/15" aria-hidden />
          <div className="flex w-full items-center gap-2 bg-gold-400 px-3 py-2.5">
            <Icon className="h-4 w-4 shrink-0 text-navy-900" aria-hidden />
            <span className="font-sans text-[10px] font-bold uppercase leading-tight tracking-wide2 text-navy-900">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BARRA DE CONTACTO (pie navy del flyer: WhatsApp / correo / horario) */
/* ------------------------------------------------------------------ */
export function ContactBar({
  whatsapp,
  email,
  className,
}: {
  whatsapp?: string | null;
  email?: string | null;
  className?: string;
}) {
  const wa = whatsapp || siteConfig.whatsapp;
  const mail = email || siteConfig.email;

  return (
    <div className={cn('bg-navy-950', className)}>
      <div className="pes-container grid gap-6 divide-y divide-white/10 py-7 sm:grid-cols-3 sm:gap-4 sm:divide-y-0 sm:divide-x sm:divide-white/10 sm:py-6">
        <a
          href={whatsappLink(waMessages.general(), wa)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 pt-6 transition-transform duration-200 first:pt-0 hover:translate-x-1 sm:pt-0"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <span>
            <span className="block font-sans text-[10px] uppercase tracking-wide2 text-gold-400">
              Cotiza ahora
            </span>
            <span className="block font-sans text-[13px] font-semibold tabular-nums text-white">
              {formatPhone(wa ?? '')}
            </span>
          </span>
        </a>

        <a href={`mailto:${mail}`} className="group flex items-center gap-3 pt-6 transition-transform duration-200 hover:translate-x-1 sm:pt-0 sm:pl-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900">
            <Mail className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <span>
            <span className="block font-sans text-[10px] uppercase tracking-wide2 text-gold-400">Correo</span>
            <span className="block text-[13px] font-medium text-white">{mail}</span>
          </span>
        </a>

        <div className="group flex items-center gap-3 pt-6 transition-transform duration-200 hover:translate-x-1 sm:pt-0 sm:pl-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900">
            <Clock className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <span>
            <span className="block font-sans text-[10px] uppercase tracking-wide2 text-gold-400">Atención</span>
            <span className="block text-[13px] font-medium text-white">24 horas · 365 días del año</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FOTOGRAFIAS DE CADA SERVICIO (extraidas de los flyers oficiales)    */
/* Se muestran como tira horizontal, igual que en los flyers.          */
/* ------------------------------------------------------------------ */
export const DIESEL_STRIP_ITEMS: PhotoStripItem[] = [
  { src: '/images/diesel/flota_moderna.jpg', alt: 'Flota de camiones cisterna PES', label: 'Flota moderna', icon: 'truck' },
  { src: '/images/diesel/suministro_seguro.jpg', alt: 'Conexiones y descarga segura de diésel', label: 'Suministro seguro', icon: 'shield' },
  { src: '/images/diesel/energia_no_se_detiene.jpg', alt: 'Planta eléctrica de respaldo', label: 'Energía que no se detiene', icon: 'zap' },
  { src: '/images/diesel/operaciones_24_7.jpg', alt: 'Operaciones de suministro 24/7', label: 'Operaciones 24/7', icon: 'clock' },
];

export const AGUA_STRIP_ITEMS: PhotoStripItem[] = [
  { src: '/images/agua/plantas_agua.jpg', alt: 'Planta de tratamiento de agua potable', label: 'Plantas de tratamiento', icon: 'droplet' },
  { src: '/images/agua/agua_cayendo.jpg', alt: 'Agua potable de calidad', label: 'Agua de calidad', icon: 'droplet' },
  { src: '/images/agua/barco_carga.jpg', alt: 'Barcaza de suministro en el puerto', label: 'Suministro a embarcaciones', icon: 'ship' },
  { src: '/images/agua/manguera_puerto.jpg', alt: 'Carga de agua en el muelle', label: 'Operación en puertos', icon: 'anchor' },
  { src: '/images/agua/ciudad_panama.jpg', alt: 'Cobertura en Ciudad de Panamá', label: 'Cobertura nacional', icon: 'map' },
];
