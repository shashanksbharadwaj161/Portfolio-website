'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { filmStore } from './filmStore';
import { sceneWeights } from './scenes';

// SSR'd narrative text layer (real HTML → SEO + EN/JA parity). The SceneWriter
// effect reads scroll progress each frame and toggles `.is-visible` on each
// scene's text block; CSS handles the mask/blur reveal transitions.
export default function ResearchOverlay({ enabled }: { enabled: boolean }) {
  const t = useTranslations('research');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
    let raf = 0;
    let active = true;

    const tick = () => {
      if (!active) return;
      const weights = sceneWeights(filmStore.progress);
      for (const el of blocks) {
        const idx = Number(el.dataset.scene);
        el.classList.toggle('is-visible', (weights[idx] ?? 0) > 0.5);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div ref={rootRef} className="research-overlay" aria-hidden={!enabled}>
      {/* SCENE 0 — cold open / title (visible by default for first paint) */}
      <section className="film-text film-text--center is-visible" data-scene="0">
        <p className="film-kicker">
          {t('thesis_label')} · {t('university_label')}
        </p>
        <h1 className="film-title text-gradient-cyan">{t('system_title')}</h1>
        <p className="film-sub">{t('system_subtitle')}</p>
        <span className="film-scrollhint">{t('scroll_begin')}</span>
      </section>

      {/* SCENE 1 — the glove materializes */}
      <section className="film-text film-text--left" data-scene="1">
        <p className="film-chapter-label">{t('chapter1_label')}</p>
        <h2 className="film-chapter-title">{t('chapter1_title')}</h2>
        <p className="film-chapter-body">{t('chapter1_body')}</p>
        <div className="film-legend">
          <span className="film-legend-item">
            <span className="film-legend-dot cyan" /> {t('film_legend_pressure')}
          </span>
          <span className="film-legend-item">
            <span className="film-legend-dot gold" /> {t('film_legend_velostat')}
          </span>
          <span className="film-legend-item">
            <span className="film-legend-dot purple" /> {t('film_legend_imu')}
          </span>
        </div>
      </section>
    </div>
  );
}
