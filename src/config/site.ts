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
<<<<<<< HEAD
    'Suministro directo de diésel y agua potable por cisterna en Panamá. Envía tu solicitud, recibe una cotización y coordina tu entrega con Panama Energy Solutions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pes.panamarinesolutions.com',
=======
    'Solicita diésel o agua potable por cisterna en Panamá. Envía tu solicitud, recibe una cotización y coordina tu entrega con el equipo de Panama Energy Solutions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://panamarinesolutions.com',
>>>>>>> a7c438e4a48a69b977bd30deb24d61854332ffbc
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'pes@panamarinesolutions.com',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '50769954353',
  address: 'Terminal Industrial Zona 1, Corredor Sur, Ciudad de Panamá',
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
