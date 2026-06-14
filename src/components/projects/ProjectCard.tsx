'use client';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { Project } from '@/lib/constants';

const CATEGORY_LABEL: Record<Project['category'], string> = {
  ecommerce: 'filter_ecommerce',
  realestate: 'filter_real_estate',
  ai: 'filter_ai',
};

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const t = useTranslations('projects');
  const locale = useLocale();
  const title = locale === 'ja' ? project.titleJa : project.title;
  const description = locale === 'ja' ? project.descriptionJa : project.description;

  return (
    <button type="button" className="project-card" onClick={onClick}>
      <span className={`project-image project-${project.category}`}>
        {project.image && (
          <Image
            src={project.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            style={{ objectFit: 'cover' }}
          />
        )}
        <span className="project-category-tag">{t(CATEGORY_LABEL[project.category])}</span>
      </span>

      <span className="project-content">
        <span className="project-title">{title}</span>
        <span className="project-description">{description}</span>
        <span className="project-meta">
          <span className="project-year">
            {t('year')}: {project.year}
          </span>
          <span className="project-tech">
            {project.tech.slice(0, 2).join(' · ')}
            {project.tech.length > 2 ? ' …' : ''}
          </span>
        </span>
      </span>

      <span className="project-overlay">
        <span className="overlay-text">{t('view_details')}</span>
      </span>
    </button>
  );
}
