'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HACKATHONS } from '@/lib/constants';

export default function HackathonsSection() {
  const t = useTranslations('achievements');
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.hackathon-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="hackathons-section">
      <h2 className="hackathons-title">{t('hackathons_title')}</h2>
      <p className="hackathons-subtitle">{t('hackathons_subtitle')}</p>

      <div className="hackathons-grid">
        {HACKATHONS.map((h) => (
          <div key={h.name} className="hackathon-card">
            <Trophy className="hackathon-icon" size={32} />
            <h3 className="hackathon-name">{h.name}</h3>
            <p className="hackathon-award">{h.org}</p>
            <p className="hackathon-project">{h.project}</p>
            <span className="hackathon-year">{h.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
