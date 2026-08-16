import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

/**
 * Tipografía única y neutra para toda la plataforma.
 * Inter mantiene la interfaz legible y profesional sin mezclar familias
 * condensadas o monoespaciadas entre títulos, datos y controles.
 */
const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
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
  },
  icons: { icon: '/brand/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: '#040B1D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontSans.variable}>
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
