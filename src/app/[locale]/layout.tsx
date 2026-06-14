import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import '../globals.css';
import '@/styles/glass.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import CustomCursor from '@/components/ui/CustomCursor';
import NavigationOrbs from '@/components/layout/NavigationOrbs';
import LanguageToggle from '@/components/layout/LanguageToggle';

export const metadata: Metadata = {
  title: 'Shashank S Bharadwaj — Researcher & Full-Stack Developer',
  description:
    "Master's researcher & full-stack developer at the University of Aizu, Japan. Building intelligent systems across AI, AR, and embedded sensing.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering for the requested locale.
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          <NavigationOrbs />
          <LanguageToggle />
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
