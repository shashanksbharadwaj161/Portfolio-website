'use client';
import { useLocale, useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { CERTIFICATIONS, EXPERIENCE, HACKATHONS } from '@/lib/constants';

export default function AchievementsPage() {
  const t = useTranslations('achievements');
  const locale = useLocale();

  return (
    <main className="section px-6 pt-28">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-display text-gradient-cyan text-center text-5xl font-bold md:text-6xl">
          {t('page_title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>

        {/* Scholarship */}
        <GlassCard variant="gold" className="mt-16">
          <p className="text-mono text-xs tracking-widest text-[var(--gold)]">
            {t('scholarship_label')}
          </p>
          <h2 className="text-display mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {t('scholarship_title')}
          </h2>
          <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
            {t('scholarship_body')}
          </p>
        </GlassCard>

        {/* Experience */}
        <h3 className="text-display mt-16 text-2xl font-semibold text-[var(--text-primary)]">
          {t('experience_title')}
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {EXPERIENCE.map((exp) => (
            <GlassCard key={exp.company}>
              <h4 className="font-semibold text-[var(--text-primary)]">
                {locale === 'ja' ? exp.roleJa : exp.role}
              </h4>
              <p className="text-sm text-[var(--cyan)]">{exp.company}</p>
              <p className="text-mono mt-1 text-xs text-[var(--text-secondary)]">
                {locale === 'ja' ? exp.periodJa : exp.period} · {exp.location}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {exp.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Hackathons */}
        <h3 className="text-display mt-16 text-2xl font-semibold text-[var(--text-primary)]">
          {t('hackathons_title')}
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HACKATHONS.map((h) => (
            <GlassCard key={h.name}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[var(--text-primary)]">{h.name}</h4>
                <span className="text-mono text-xs text-[var(--text-secondary)]">{h.year}</span>
              </div>
              <p className="text-sm text-[var(--cyan)]">{h.org}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{h.project}</p>
            </GlassCard>
          ))}
        </div>

        {/* Certifications */}
        <h3 className="text-display mt-16 text-2xl font-semibold text-[var(--text-primary)]">
          {t('certs_title')}
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CERTIFICATIONS.map((c) => (
            <GlassCard key={c.name}>
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-medium text-[var(--text-primary)]">{c.name}</h4>
                <span className="text-mono shrink-0 text-xs text-[var(--text-secondary)]">
                  {c.year}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--gold)]">{c.issuer}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
