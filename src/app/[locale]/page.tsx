'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

// Three.js runs client-only to avoid hydration mismatches / SSR WebGL errors.
const HeroParticles = dynamic(() => import('@/components/three/HeroParticles'), {
  ssr: false,
});

/**
 * Renders the name with the last three letters in a cyan gradient.
 * For space-separated names (EN) the surname drops to a second line so the
 * two lines can be animated independently.
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
        <span className="hero-name-line1">{first}</span>
        <span className="hero-name-line2">
          {lastMain}
          <span className="text-gradient-cyan">{lastAccent}</span>
        </span>
      </>
    );
  }

  const main = name.slice(0, -3);
  const accent = name.slice(-3);
  return (
    <span className="hero-name-line1">
      {main}
      <span className="text-gradient-cyan">{accent}</span>
    </span>
  );
}

export default function HomePage() {
  const t = useTranslations('hero');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion: the CSS @media override reveals everything statically.
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } });

      tl.fromTo(
        document.body,
        { backgroundColor: '#000000' },
        { backgroundColor: '#060914', duration: 0.8, ease: 'power3.inOut' }
      )
        .fromTo(
          '.hero-line',
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }
        )
        .fromTo('.hero-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo(
          '.hero-name-line1',
          { opacity: 0, y: 60, skewX: -5 },
          { opacity: 1, y: 0, skewX: 0, duration: 0.7, ease: 'power4.out' },
          '-=0.2'
        )
        .fromTo(
          '.hero-name-line2',
          { opacity: 0, y: 60, skewX: -5 },
          { opacity: 1, y: 0, skewX: 0, duration: 0.7, ease: 'power4.out' },
          '-=0.5'
        )
        .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
        .fromTo(
          '.hero-buttons > *',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
          '-=0.2'
        )
        .fromTo(
          '.floating-stat',
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.3)' },
          '-=0.3'
        )
        .fromTo('.scroll-indicator', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
        .fromTo('.hero-canvas canvas', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.5');

      // Continuous chevron pulse
      gsap.to('.scroll-chevron', {
        y: 8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Continuous floating stats (starts after the intro, staggered phases)
      gsap.to('.floating-stat', {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
        stagger: 1,
      });

      // Preview cards reveal on scroll
      gsap.fromTo(
        '.preview-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.preview-row',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

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
    <main ref={rootRef}>
      {/* ---------- Section A: Hero ---------- */}
      <section className="hero-section">
        {/* Three.js particle field (over a static depth glow) + subtle grid */}
        <div id="hero-canvas" className="hero-canvas" aria-hidden="true">
          <HeroParticles />
        </div>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-line" aria-hidden="true" />

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

      {/* Decorative divider between hero and preview */}
      <div className="hero-divider" aria-hidden="true" />

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
