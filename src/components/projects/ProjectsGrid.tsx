'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import type { Project } from '@/lib/constants';

type FilterType = 'all' | 'ecommerce' | 'realestate' | 'ai';

const FILTERS: { value: FilterType; key: string }[] = [
  { value: 'all', key: 'filter_all' },
  { value: 'ecommerce', key: 'filter_ecommerce' },
  { value: 'realestate', key: 'filter_real_estate' },
  { value: 'ai', key: 'filter_ai' },
];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations('projects');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  // Initial reveal on scroll
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        '.project-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, []);

  // Re-animate on filter change (skip first mount)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-card',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.45, stagger: 0.06, ease: 'back.out(1.4)' }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filter]);

  return (
    <section className="projects-section">
      <div className="projects-filter" role="group" aria-label="Project filters">
        {FILTERS.map(({ value, key }) => (
          <button
            key={value}
            type="button"
            className={`filter-pill ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="projects-grid">
        {filtered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}
