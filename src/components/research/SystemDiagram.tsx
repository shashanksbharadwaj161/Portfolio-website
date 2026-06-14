'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

/**
 * Chapter 5 — full system architecture. HTML blocks (so translated labels
 * wrap cleanly) wired with pulsing flow arrows; the processor sits at the
 * centre with a breathing glow, and golden feedback arrows close the loop.
 */
export default function SystemDiagram() {
  const t = useTranslations('research');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // CSS shows blocks + base-opacity arrows statically

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.system-block',
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        }
      );
      gsap.to('.flow-arrow', {
        opacity: 1,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.25,
        ease: 'sine.inOut',
      });
      gsap.to('.processor-glow', {
        opacity: 0.8,
        scale: 1.12,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.feedback-arrow', {
        opacity: 1,
        y: -4,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: 'sine.inOut',
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div className="system-diagram-container" ref={ref}>
      <div className="system-flow">
        <div
          className="system-block"
          style={{ '--block-accent': '#00d9ff', '--block-dim': 'rgba(0,217,255,0.1)' } as React.CSSProperties}
        >
          <span className="system-label">{t('chapter5_system_input')}</span>
          <span className="system-sublabel">Finger Movements</span>
          <span className="system-sublabel">Pressure Patterns</span>
        </div>

        <ArrowRight className="flow-arrow" size={28} />

        <div
          className="system-block"
          style={{ '--block-accent': '#d4a574', '--block-dim': 'rgba(212,165,116,0.1)' } as React.CSSProperties}
        >
          <span className="system-label">{t('chapter5_system_glove')}</span>
          <span className="system-sublabel">8 Pressure Points</span>
          <span className="system-sublabel">9-DOF IMU</span>
        </div>

        <ArrowRight className="flow-arrow" size={28} />

        <div
          className="system-block"
          style={{ '--block-accent': '#7c3aed', '--block-dim': 'rgba(124,58,237,0.1)' } as React.CSSProperties}
        >
          <span className="system-label">{t('chapter5_system_glasses')}</span>
          <span className="system-sublabel">Real-time Guidance</span>
          <span className="system-sublabel">30 FPS Display</span>
        </div>
      </div>

      <ArrowDown className="flow-arrow system-down" size={28} />

      <div className="system-processor-wrap">
        <span className="processor-glow" aria-hidden="true" />
        <div
          className="system-block system-block--processor"
          style={{ '--block-accent': '#00d9ff', '--block-dim': 'rgba(0,217,255,0.18)' } as React.CSSProperties}
        >
          <span className="system-label">{t('chapter5_system_processor')}</span>
          <span className="system-sublabel">Real-time Analysis</span>
        </div>
      </div>

      <div className="system-feedback">
        <ArrowUp className="feedback-arrow" size={18} />
        <span className="feedback-label">{t('chapter5_integration_point')}</span>
        <ArrowUp className="feedback-arrow" size={18} />
      </div>
    </div>
  );
}
