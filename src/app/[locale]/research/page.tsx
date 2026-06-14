'use client';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';

const CHAPTERS = [1, 2, 3, 4, 5] as const;

export default function ResearchPage() {
  const t = useTranslations('research');

  return (
    <main className="section px-6 pt-28">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-display text-gradient-cyan text-center text-5xl font-bold md:text-6xl">
          {t('page_title')}
        </h1>
        <p className="text-mono mt-4 text-center text-sm text-[var(--text-secondary)]">
          {t('thesis_label')} · {t('university_label')}
        </p>

        <div className="mt-16 flex flex-col gap-8">
          {CHAPTERS.map((n) => (
            <GlassCard key={n}>
              <p className="text-mono text-xs tracking-widest text-[var(--cyan)]">
                {t(`chapter${n}_label`)}
              </p>
              <h2 className="text-display mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {t(`chapter${n}_title`)}
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
                {t(`chapter${n}_body`)}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
