'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Award } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScholarSpotlight() {
  const t = useTranslations('achievements');
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.scholar-badge', {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
      gsap.from('.scholar-content > *', {
        opacity: 0,
        x: 40,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="scholar-spotlight">
      <div className="scholar-badge">
        <Award size={64} className="scholar-icon" />
      </div>

      <div className="scholar-content">
        <span className="scholar-kicker">{t('scholarship_label')}</span>
        <h2 className="scholar-title">{t('scholarship_title')}</h2>
        <p className="scholar-subtitle">{t('scholar_subtitle')}</p>

        <div className="scholar-details">
          <div className="scholar-detail">
            <span className="scholar-label">{t('scholar_year')}</span>
          </div>
          <div className="scholar-detail">
            <span className="scholar-stat">{t('scholar_stat')}</span>
          </div>
        </div>

        <p className="scholar-description">{t('scholarship_body')}</p>
      </div>
    </section>
  );
}
