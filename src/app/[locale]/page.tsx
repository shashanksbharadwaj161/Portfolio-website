'use client';
import { useLocale, useTranslations } from 'next-intl';
import GlowButton from '@/components/ui/GlowButton';

export default function HomePage() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <main className="section flex flex-col items-center justify-center px-6 text-center">
      <p className="text-mono mb-4 text-sm tracking-widest text-[var(--cyan)]">{t('greeting')}</p>

      <h1 className="text-display text-gradient-cyan max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
        {t('name')}
      </h1>

      <h2 className="text-gradient-gold mt-4 text-xl font-medium md:text-2xl">{t('title')}</h2>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
        {t('subtitle')}
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <GlowButton href={`/${locale}/research`} variant="cyan">
          {t('cta_research')}
        </GlowButton>
        <GlowButton href={`/${locale}/projects`} variant="gold">
          {t('cta_projects')}
        </GlowButton>
      </div>

      <p className="text-mono mt-16 text-xs tracking-widest text-[var(--text-secondary)]">
        {t('scroll')}
      </p>
    </main>
  );
}
