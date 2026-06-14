'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import ScholarSpotlight from '@/components/achievements/ScholarSpotlight';
import TimelineSection from '@/components/achievements/TimelineSection';
import HackathonsSection from '@/components/achievements/HackathonsSection';
import CertificationsSection from '@/components/achievements/CertificationsSection';
import ContactSection from '@/components/achievements/ContactSection';
import '@/styles/achievements.css';

export default function AchievementsPage() {
  const t = useTranslations('achievements');
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(
          '.achievements-hero-label',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6 }
        )
        .fromTo(
          '.achievements-hero-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          '.achievements-hero-subtitle',
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          '-=0.4'
        );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="achievements-page">
      <section ref={heroRef} className="achievements-hero">
        <p className="achievements-hero-label">{t('hero_label')}</p>
        <h1 className="achievements-hero-title text-gradient-cyan">{t('hero_title')}</h1>
        <p className="achievements-hero-subtitle">{t('hero_subtitle')}</p>
      </section>

      <ScholarSpotlight />
      <TimelineSection />
      <HackathonsSection />
      <CertificationsSection />
      <ContactSection />
    </main>
  );
}
