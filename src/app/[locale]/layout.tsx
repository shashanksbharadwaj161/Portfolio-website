import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import '../globals.css';
import '@/styles/glass.css';
import CustomCursor from '@/components/ui/CustomCursor';
import PageTransition from '@/components/layout/PageTransition';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isJa = locale === 'ja';
  const homeTitle = isJa
    ? 'シャシャンク・S・バラドワジ — フルスタック開発者 & AI研究者'
    : 'Shashank S Bharadwaj — Full-Stack Developer & AI Researcher';
  const description = isJa
    ? 'ロータリー米山奨学生。会津大学で AI・AR・組み込みセンシングの交差点に位置するインテリジェントシステムを構築。'
    : 'Award-winning engineer. Rotary Yoneyama Scholar. Building intelligent systems at the intersection of AI, AR, and rehabilitation.';
  const url = `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: ['portfolio', 'developer', 'AI', 'AR', 'research', 'Next.js', 'React', 'TypeScript'],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    openGraph: {
      type: 'website',
      locale: isJa ? 'ja_JP' : 'en_US',
      url,
      siteName: SITE_NAME,
      title: homeTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: homeTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en`,
        ja: `${SITE_URL}/ja`,
        'x-default': `${SITE_URL}/en`,
      },
    },
  };
}

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
          <PageTransition>{children}</PageTransition>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
