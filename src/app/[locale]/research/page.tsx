'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Github } from 'lucide-react';
import CircuitBackground from '@/components/research/CircuitBackground';
import HandDiagram from '@/components/research/HandDiagram';
import GloveStage from '@/components/research/GloveStage';
import HanoiDiagram from '@/components/research/HanoiDiagram';
import GlassesDiagram from '@/components/research/GlassesDiagram';
import SystemDiagram from '@/components/research/SystemDiagram';
import { cn } from '@/lib/utils';
import '@/styles/research.css';

const RESEARCH_REPO = 'https://github.com/shashanksbharadwaj161/rayban-dataglove-hanoi';

const METRICS = [
  { value: 95, prefix: '', suffix: '%', labelKey: 'metrics_accuracy' },
  { value: 50, prefix: '~', suffix: 'ms', labelKey: 'metrics_latency' },
  { value: 8, prefix: '', suffix: '', labelKey: 'metrics_sensors' },
  { value: 9, prefix: '', suffix: '', labelKey: 'metrics_axes' },
] as const;

export default function ResearchPage() {
  const t = useTranslations('research');
  const rootRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Active-chapter tracking for the progress dots (runs even when reduced)
      for (let i = 1; i <= 5; i++) {
        ScrollTrigger.create({
          trigger: `#chapter-${i}`,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setActiveChapter(i),
        });
      }
      ScrollTrigger.create({
        trigger: '.research-hero',
        start: 'top 40%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && setActiveChapter(0),
      });

      if (reduced) return;

      // Hero entrance
      gsap
        .timeline({ delay: 0.2, defaults: { ease: 'power3.out' } })
        .fromTo('.research-hero-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo('.research-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.2')
        .fromTo('.research-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(
          '.research-badges > *',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(
          '.research-hero-foot > *',
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.1 },
          '-=0.2'
        );

      gsap.to('.research-scroll-chevron', {
        y: 6,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'sine.inOut',
      });

      // Per-chapter entrance reveals
      gsap.utils.toArray<HTMLElement>('.chapter').forEach((ch) => {
        const label = ch.querySelector('.chapter-label');
        const headline = ch.querySelector('.chapter-headline');
        const body = ch.querySelector('.chapter-body');
        const visual = ch.querySelector('.chapter-visual');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ch, start: 'top 70%' },
          defaults: { ease: 'power3.out' },
        });
        if (label) tl.to(label, { opacity: 1, x: 0, duration: 0.6 }, 0);
        if (headline) tl.to(headline, { opacity: 1, y: 0, duration: 0.6 }, 0.15);
        if (body) tl.to(body, { opacity: 1, duration: 0.6 }, 0.3);
        if (visual) tl.to(visual, { opacity: 1, x: 0, duration: 0.6 }, 0.25);
      });

      // Chapter 1: hand draws itself, sensors pop, neural lines fade
      const hand = root.querySelector('.hand-svg');
      if (hand) {
        const outline = hand.querySelectorAll(':scope > path, :scope > line');
        const dots = hand.querySelectorAll('.sensor-dot');
        const neural = hand.querySelector('.neural-lines');
        outline.forEach((el) => {
          const len = (el as SVGGeometryElement).getTotalLength();
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });
        if (neural) gsap.set(neural, { opacity: 0 });

        gsap
          .timeline({ scrollTrigger: { trigger: hand, start: 'top 75%' } })
          .to(outline, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.05 })
          .to(
            dots,
            { opacity: 1, scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(2)' },
            '-=0.5'
          )
          .to(neural, { opacity: 1, duration: 0.6 }, '-=0.3');
      }

      // Chapter 2: pinned, scrubbed 4-phase build-up
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.chapter2-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: '.chapter2-pin',
            anticipatePin: 1,
          },
        })
        .fromTo('.phase-wm-1', { opacity: 0 }, { opacity: 0.05, duration: 0.5 }, 0)
        // 1 -> 2
        .to('.panel-1', { opacity: 0, x: -30, duration: 0.5 }, 1)
        .to('.phase-wm-1', { opacity: 0, duration: 0.5 }, 1)
        .fromTo('.panel-2', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5 }, 1)
        .fromTo('.phase-wm-2', { opacity: 0 }, { opacity: 0.05, duration: 0.5 }, 1)
        .fromTo('.g-sensors', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1)
        // 2 -> 3
        .to('.panel-2', { opacity: 0, x: -30, duration: 0.5 }, 2)
        .to('.phase-wm-2', { opacity: 0, duration: 0.5 }, 2)
        .fromTo('.panel-3', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5 }, 2)
        .fromTo('.phase-wm-3', { opacity: 0 }, { opacity: 0.05, duration: 0.5 }, 2)
        .fromTo('.g-velostat', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 2)
        // 3 -> 4
        .to('.panel-3', { opacity: 0, x: -30, duration: 0.5 }, 3)
        .to('.phase-wm-3', { opacity: 0, duration: 0.5 }, 3)
        .fromTo('.panel-4', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5 }, 3)
        .fromTo('.phase-wm-4', { opacity: 0 }, { opacity: 0.05, duration: 0.5 }, 3)
        .fromTo('.g-imu', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 3);

      // Metrics count-up
      gsap.utils.toArray<HTMLElement>('.metric-value').forEach((el) => {
        const target = Number(el.dataset.value || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
          },
        });
      });

      // CTA entrance
      gsap.from('.research-cta > *', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.research-cta', start: 'top 80%' },
      });

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const goToChapter = (i: number) => {
    const el = document.getElementById(i === 0 ? 'research-top' : `chapter-${i}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fillPct = activeChapter < 1 ? 0 : ((activeChapter - 1) / 4) * 100;

  return (
    <main ref={rootRef} className="research-page">
      {/* ---------- Progress dots ---------- */}
      <div className="progress-dots">
        <span className="progress-rail" aria-hidden="true" />
        <span className="progress-fill" style={{ height: `${fillPct}%` }} aria-hidden="true" />
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            className={cn('progress-dot', activeChapter === i && 'active')}
            onClick={() => goToChapter(i)}
            aria-label={t(`progress${i}`)}
            aria-current={activeChapter === i ? 'true' : undefined}
          >
            <span className="progress-label">{t(`progress${i}`)}</span>
          </button>
        ))}
      </div>

      {/* ---------- Hero ---------- */}
      <section className="research-hero" id="research-top">
        <CircuitBackground />
        <div className="research-hero-inner">
          <p className="research-hero-label">{t('thesis_label')}</p>
          <h1 className="research-title text-gradient-cyan">{t('system_title')}</h1>
          <p className="research-subtitle">{t('system_subtitle')}</p>
          <div className="research-badges">
            <span className="research-badge">{t('university_label')}</span>
            <span className="research-badge">{t('year')}</span>
          </div>
        </div>
        <div className="research-hero-foot">
          <a className="btn-gold" href={RESEARCH_REPO} target="_blank" rel="noopener noreferrer">
            <Github size={18} />
            {t('github_label')}
          </a>
          <button type="button" className="research-scroll" onClick={() => goToChapter(1)}>
            {t('scroll_begin')}
            <ChevronDown size={16} className="research-scroll-chevron" />
          </button>
        </div>
      </section>

      {/* ---------- Chapter 1 ---------- */}
      <div id="chapter-1">
        <section className="chapter">
          <div className="chapter-grid">
            <div className="chapter-text">
              <p className="chapter-label">{t('chapter1_label')}</p>
              <h2 className="chapter-headline">{t('chapter1_title')}</h2>
              <p className="chapter-body">{t('chapter1_body')}</p>
            </div>
            <div className="chapter-visual">
              <HandDiagram />
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Chapter 2 ---------- */}
      <div id="chapter-2">
        <section className="chapter chapter--intro">
          <p className="chapter-label">{t('chapter2_label')}</p>
          <h2 className="chapter-headline">{t('chapter2_title')}</h2>
          <p className="chapter-body">{t('chapter2_body')}</p>
        </section>
        <GloveStage />
      </div>

      {/* ---------- Chapter 3 ---------- */}
      <div id="chapter-3">
        <section className="chapter chapter--reverse">
          <div className="chapter-grid">
            <div className="chapter-text">
              <p className="chapter-label">{t('chapter3_label')}</p>
              <h2 className="chapter-headline">{t('chapter3_title')}</h2>
              <p className="chapter-body">{t('chapter3_body')}</p>
            </div>
            <div className="chapter-visual">
              <HanoiDiagram />
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Chapter 4 ---------- */}
      <div id="chapter-4">
        <section className="chapter">
          <div className="chapter-grid">
            <div className="chapter-text">
              <p className="chapter-label">{t('chapter4_label')}</p>
              <h2 className="chapter-headline">{t('chapter4_title')}</h2>
              <p className="chapter-body">{t('chapter4_body')}</p>
            </div>
            <div className="chapter-visual">
              <GlassesDiagram />
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Chapter 5 ---------- */}
      <div id="chapter-5">
        <section className="chapter chapter--reverse">
          <div className="chapter-grid">
            <div className="chapter-text">
              <p className="chapter-label">{t('chapter5_label')}</p>
              <h2 className="chapter-headline">{t('chapter5_title')}</h2>
              <p className="chapter-body">{t('chapter5_body')}</p>
            </div>
            <div className="chapter-visual">
              <SystemDiagram />
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Metrics ---------- */}
      <section className="research-metrics">
        <h2 className="research-metrics-title">{t('metrics_title')}</h2>
        <div className="metrics-grid">
          {METRICS.map((m) => (
            <div className="metric" key={m.labelKey}>
              <span
                className="metric-value"
                data-value={m.value}
                data-prefix={m.prefix}
                data-suffix={m.suffix}
              >
                {`${m.prefix}${m.value}${m.suffix}`}
              </span>
              <span className="metric-label">{t(m.labelKey)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- GitHub CTA ---------- */}
      <section className="research-cta">
        <h2 className="research-cta-title">{t('cta_title')}</h2>
        <p className="research-cta-subtitle">{t('cta_subtitle')}</p>
        <a
          className="btn-gold btn-gold-lg"
          href={RESEARCH_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={20} />
          {t('github_label')}
        </a>
      </section>
    </main>
  );
}
