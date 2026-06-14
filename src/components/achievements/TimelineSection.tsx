'use client';
import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TIMELINE = [
  { year: '2025', en: 'Rotary Yoneyama Scholar', ja: 'ロータリー米山奨学生', icon: '🏆' },
  { year: '2025', en: "Master's Researcher · University of Aizu", ja: '修士研究員・会津大学', icon: '🎓' },
  { year: '2025', en: 'Software Developer · Eyes, Japan', ja: 'ソフトウェア開発者・Eyes, JAPAN', icon: '💻' },
  { year: '2024', en: 'WordPress Developer · Freelance', ja: 'WordPress開発者・フリーランス', icon: '🌐' },
  { year: '2023', en: "RAKATHON'23 · Full-Stack Intern at L&T", ja: "RAKATHON'23・L&Tインターン", icon: '🚀' },
  { year: '2022', en: "ETHIndia'22 Participant", ja: "ETHIndia'22 参加", icon: '⛓️' },
];

export default function TimelineSection() {
  const t = useTranslations('achievements');
  const locale = useLocale();
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.timeline-event', {
        opacity: 0,
        x: -40,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
      });
      gsap.from('.timeline-line', {
        scaleY: 0,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="timeline-section">
      <h2 className="timeline-title">{t('timeline_title')}</h2>

      <div className="timeline-container">
        <div className="timeline-line" />
        {TIMELINE.map((item, index) => (
          <div key={index} className="timeline-event">
            <div className="timeline-marker">
              <span className="timeline-icon">{item.icon}</span>
            </div>
            <div className="timeline-content">
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-event-text">{locale === 'ja' ? item.ja : item.en}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
