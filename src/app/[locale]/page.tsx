'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  ChevronDown,
  Code2,
  FlaskConical,
  Layers,
  Trophy,
} from 'lucide-react';

/**
 * Renders the name with the last three letters in a cyan gradient.
 * For space-separated names (EN) the surname drops to a second line.
 */
function HeroName({ name }: { name: string }) {
  const words = name.trim().split(/\s+/);

  if (words.length > 1) {
    const first = words.slice(0, -1).join(' ');
    const last = words[words.length - 1];
    const lastMain = last.slice(0, -3);
    const lastAccent = last.slice(-3);
    return (
      <>
        {first}
        <br />
        {lastMain}
        <span className="text-gradient-cyan">{lastAccent}</span>
      </>
    );
  }

  const main = name.slice(0, -3);
  const accent = name.slice(-3);
  return (
    <>
      {main}
      <span className="text-gradient-cyan">{accent}</span>
    </>
  );
}

export default function HomePage() {
  const t = useTranslations('hero');
  const tn = useTranslations('nav');
  const locale = useLocale();

  const previews = [
    {
      key: 'research',
      Icon: FlaskConical,
      accent: '#00d9ff',
      dim: 'rgba(0, 217, 255, 0.15)',
      desc: t('preview_research_desc'),
    },
    {
      key: 'projects',
      Icon: Code2,
      accent: '#d4a574',
      dim: 'rgba(212, 165, 116, 0.15)',
      desc: t('preview_projects_desc'),
    },
    {
      key: 'achievements',
      Icon: Trophy,
      accent: '#7c3aed',
      dim: 'rgba(124, 58, 237, 0.15)',
      desc: t('preview_achievements_desc'),
    },
  ] as const;

  return (
    <main>
      {/* ---------- Section A: Hero ---------- */}
      <section className="hero-section">
        {/* Three.js mounts here in a later sprint */}
        <div id="hero-canvas" className="hero-canvas" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-label">
            {t('role')}
            <span className="year-badge">{t('years')}</span>
          </div>

          <h1 className="hero-h1">
            <HeroName name={t('name')} />
          </h1>

          <p className="hero-subtitle">{t('subtitle')}</p>

          <div className="hero-buttons">
            <Link href={`/${locale}/research`} className="btn-gold">
              {t('cta_research')}
              <ArrowRight size={18} />
            </Link>
            <Link href={`/${locale}/projects`} className="btn-cyan">
              {t('cta_projects')}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hero-stats">
            <span className="floating-stat">
              <Briefcase size={14} />
              {t('stat_experience')}
            </span>
            <span className="floating-stat">
              <Layers size={14} />
              {t('stat_projects')}
            </span>
            <span className="floating-stat">
              <Award size={14} />
              {t('stat_scholar')}
            </span>
          </div>
        </div>

        <div className="scroll-indicator">
          {t('scroll')}
          <ChevronDown size={16} className="scroll-chevron" />
        </div>

        <div className="university-badge">{t('university')}</div>
      </section>

      {/* ---------- Section B: Quick preview row ---------- */}
      <section className="preview-row">
        {previews.map(({ key, Icon, accent, dim, desc }) => (
          <Link
            key={key}
            href={`/${locale}/${key}`}
            className="preview-card"
            style={
              {
                '--card-accent': accent,
                '--card-accent-dim': dim,
              } as React.CSSProperties
            }
          >
            <span className="preview-icon">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="preview-text">
              <span className="preview-title">{tn(key)}</span>
              <span className="preview-desc">{desc}</span>
            </span>
            <ArrowUpRight size={18} className="preview-arrow" />
          </Link>
        ))}
      </section>
    </main>
  );
}
