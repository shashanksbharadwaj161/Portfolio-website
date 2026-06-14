'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import { PROJECTS } from '@/lib/constants';
import '@/styles/projects.css';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.projects-hero-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 })
        .fromTo(
          '.projects-hero-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        .fromTo('.projects-hero-subtitle', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.4');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="projects-page">
      <section ref={heroRef} className="projects-hero">
        <p className="projects-hero-label">{t('hero_label')}</p>
        <h1 className="projects-hero-title text-gradient-cyan">{t('hero_title')}</h1>
        <p className="projects-hero-subtitle">{t('hero_subtitle')}</p>
      </section>

      <ProjectsGrid projects={PROJECTS} />
    </main>
  );
}
