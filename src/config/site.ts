/**
 * Configuración de marca y contacto.
 * Los valores por defecto vienen de variables de entorno y pueden ser
 * sobrescritos en tiempo de ejecución desde /admin/configuración (tabla system_settings).
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Panama Energy Solutions',
  shortName: 'PES',
  tagline: 'Powering Land, Sea & Air',
  description:
    'Suministro directo de diésel y agua potable por cisterna y barcaza en Panamá, con el respaldo operativo de compañías aliadas cuando es necesario.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pes.panamarinesolutions.com',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'pes@panamarinesolutions.com',
  phone: '5073873298',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '50766794702',
  address: 'Industrial Terminal Zone (Zona 1), Ciudad de Panamá, Panamá',
  parent: 'Panama Marine Solutions',
  logo: {
    primary: '/brand/pes-logo.png',
    white: '/brand/pes-logo-white.png',
    mark: '/brand/pes-isotipo.png',
  },
  /** Proporcion del logotipo oficial (1468 x 394). */
  logoRatio: 3.726,
} as const;

export type SiteConfig = typeof siteConfig;
