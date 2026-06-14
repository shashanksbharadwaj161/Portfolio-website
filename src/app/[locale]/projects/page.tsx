'use client';
import { useLocale, useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { PROJECTS } from '@/lib/constants';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const locale = useLocale();

  return (
    <main className="section px-6 pt-28">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-display text-gradient-cyan text-center text-5xl font-bold md:text-6xl">
          {t('page_title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <GlassCard key={project.id} className="flex flex-col">
              <span
                className="text-mono text-xs uppercase tracking-widest"
                style={{ color: project.accent }}
              >
                {t(`categories.${project.category}`)}
              </span>
              <h2 className="text-display mt-2 text-xl font-semibold text-[var(--text-primary)]">
                {locale === 'ja' ? project.titleJa : project.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                {locale === 'ja' ? project.descriptionJa : project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-mono rounded-lg border border-[var(--glass-border)] px-2 py-1 text-[10px] text-[var(--text-secondary)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex gap-4 text-sm">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyan)] hover:underline"
                  >
                    {t('view_live')}
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--gold)] hover:underline"
                  >
                    {t('view_github')}
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
