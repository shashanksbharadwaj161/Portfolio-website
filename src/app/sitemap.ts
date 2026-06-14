import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const LOCALES = ['en', 'ja'] as const;
const ROUTES = ['', '/research', '/projects', '/achievements'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );
}
