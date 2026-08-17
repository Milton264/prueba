import type { Metadata, Viewport } from 'next';
import { Manrope, Montserrat } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

/**
 * Manrope aporta legibilidad a la plataforma y Montserrat refuerza la
 * jerarquía corporativa en titulares sin alterar el contenido ni los flujos.
 */
const fontSans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'es_PA',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: '/images/hero-principal.jpg', alt: 'Operación de suministro de Panama Energy Solutions' }],
  },
  alternates: { canonical: siteConfig.url },
  icons: { icon: '/brand/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: '#040B1D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{ style: { borderRadius: '8px', fontFamily: 'var(--font-sans)' } }}
        />
      </body>
    </html>
  );
}
