import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const PUBLIC_ROUTES = [
  '',
  '/servicios',
  '/como-funciona',
  '/contacto',
  '/solicitar',
  '/privacidad',
  '/terminos',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((path, index) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : path === '/solicitar' ? 0.9 : 0.7,
  }));
}
