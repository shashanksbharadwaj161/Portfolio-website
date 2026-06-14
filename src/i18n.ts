import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` typically corresponds to the `[locale]` segment.
  const requested = await requestLocale;
  const locale =
    requested && locales.includes(requested as Locale) ? (requested as Locale) : defaultLocale;

  return {
    locale,
    messages: (await import(`./translations/${locale}.json`)).default,
  };
});
