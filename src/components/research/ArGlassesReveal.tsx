'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Final HUD metric readouts (Hand Position, Confidence %, Pressure g)
const HUD_VALUES = [120, 98, 65];

export default function ArGlassesReveal() {
  const t = useTranslations('research');
  const containerRef = useRef<HTMLDivElement>(null);
  const glassesRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion: CSS shows the flipped HUD + final values statically.
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.set(glassesRef.current, { rotateY: 0 });
      gsap.set(hudRef.current, { opacity: 0 });
      // Start the metric readouts at 0 while the HUD is still hidden.
      gsap.utils.toArray<HTMLElement>('.hud-metric-value').forEach((el) => {
        el.textContent = '0';
      });

      let fired = false;
      const revealHud = () => {
        if (fired) return;
        fired = true;

        gsap.utils.toArray<HTMLElement>('.hud-metric-value').forEach((el, i) => {
          const target = HUD_VALUES[i] ?? 0;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            delay: 0.3 + i * 0.15,
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });

        gsap.fromTo(
          '.hand-joint',
          { opacity: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box' },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(2)', delay: 0.4 }
        );

        gsap.fromTo(
          '.hud-success-badge',
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 1 }
        );
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 65%',
            end: 'center 45%',
            scrub: 0.5,
            onEnter: revealHud,
          },
        })
        .fromTo(
          glassesRef.current,
          { scale: 0.85, boxShadow: '0 0 0px rgba(0,217,255,0)' },
          { scale: 1, boxShadow: '0 0 30px rgba(0,217,255,0.3)', duration: 1 },
          0
        )
        .to(glassesRef.current, { rotateY: 180, duration: 1 }, 0.5)
        .to(hudRef.current, { opacity: 1, duration: 0.6 }, 1);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ar-glasses-container" ref={containerRef}>
      <div ref={glassesRef} className="ar-glasses-mockup">
        {/* Front face — Ray-Ban styling */}
        <div className="glasses-front">
          <div className="glasses-left-frame">
            <div className="glasses-lens" />
          </div>
          <div className="glasses-bridge" />
          <div className="glasses-right-frame">
            <div className="glasses-lens" />
          </div>
        </div>

        {/* Back face — AR HUD interior */}
        <div ref={hudRef} className="hud-interior">
          <svg className="hud-grid" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="sensorGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(0,217,255,0.18)" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#sensorGrid)" />
          </svg>

          {/* Floating metrics */}
          <div className="hud-metrics-panel">
            <div className="hud-metric">
              <span className="hud-metric-label">{t('chapter4_hud_hand_position')}</span>
              <span className="hud-metric-readout">
                <span className="hud-metric-value">120</span>
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">{t('chapter4_hud_confidence')}</span>
              <span className="hud-metric-readout">
                <span className="hud-metric-value">98</span>%
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">{t('chapter4_hud_pressure')}</span>
              <span className="hud-metric-readout">
                <span className="hud-metric-value">65</span> g
              </span>
            </div>
          </div>

          {/* Hand skeleton */}
          <div className="hud-hand-skeleton">
            <svg viewBox="0 0 80 120" className="hud-hand-svg" aria-hidden="true">
              <path
                d="M 40 10 L 40 50 M 30 25 L 25 15 M 40 25 L 40 5 M 50 25 L 55 15 M 25 50 L 20 80 M 40 50 L 40 85 M 55 50 L 60 80"
                stroke="#00d9ff"
                strokeWidth={1.5}
                fill="none"
              />
              <circle className="hand-joint" cx="40" cy="10" r="3" fill="#00d9ff" />
              <circle className="hand-joint" cx="40" cy="25" r="2.5" fill="#00d9ff" />
              <circle className="hand-joint" cx="30" cy="25" r="2.5" fill="#00d9ff" />
              <circle className="hand-joint" cx="50" cy="25" r="2.5" fill="#00d9ff" />
              <circle className="hand-joint" cx="25" cy="50" r="3" fill="#d4a574" />
              <circle className="hand-joint" cx="40" cy="50" r="3" fill="#d4a574" />
              <circle className="hand-joint" cx="55" cy="50" r="3" fill="#d4a574" />
            </svg>
          </div>

          {/* Guidance arrows */}
          <div className="hud-guidance-panel">
            <span className="guidance-label">{t('chapter4_hud_guidance')}</span>
            <svg className="guidance-arrows" viewBox="0 0 60 100" aria-hidden="true">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#d4a574" />
                </marker>
              </defs>
              <line
                className="guidance-arrow"
                x1="30"
                y1="20"
                x2="30"
                y2="50"
                stroke="#d4a574"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <line
                className="guidance-arrow"
                x1="20"
                y1="40"
                x2="40"
                y2="40"
                stroke="#d4a574"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <circle className="guidance-target" cx="30" cy="75" r="8" fill="none" stroke="#d4a574" strokeWidth={1.5} />
            </svg>
            <span className="guidance-target-label">{t('chapter4_hud_target')}</span>
          </div>

          {/* Success badge */}
          <div className="hud-success-badge">{t('chapter4_hud_success')}</div>
        </div>
      </div>

      <div className="ar-glasses-hint">{t('chapter4_flip_hint')}</div>
    </div>
  );
}
