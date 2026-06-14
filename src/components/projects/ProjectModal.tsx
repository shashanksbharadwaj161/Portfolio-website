'use client';
import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink, Github, X } from 'lucide-react';
import { gsap } from 'gsap';
import type { Project } from '@/lib/constants';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const t = useTranslations('projects');
  const locale = useLocale();
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const title = locale === 'ja' ? project.titleJa : project.title;
  const description = locale === 'ja' ? project.descriptionJa : project.description;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' }
      );
    });

    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="project-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Full-area click target to dismiss (keeps the content div non-interactive) */}
      <button type="button" className="modal-backdrop-btn" aria-label={t('modal_close')} onClick={onClose} />

      <div ref={contentRef} className="project-modal-content">
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('modal_close')}>
          <X size={22} />
        </button>

        <div className={`modal-image project-${project.category}`} aria-hidden="true" />

        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-description">{description}</p>

          <div className="modal-tech">
            <h4>{t('tech_stack')}</h4>
            <div className="tech-pills">
              {project.tech.map((tech) => (
                <span key={tech} className="tech-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-links">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link-primary"
              >
                <ExternalLink size={16} />
                {t('view_site')}
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link-secondary"
              >
                <Github size={16} />
                {t('view_code')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
