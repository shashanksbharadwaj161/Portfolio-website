'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Code2, FlaskConical, Trophy } from 'lucide-react';
import { gsap } from 'gsap';
import { usePageTransition } from './transition-context';
import { cn } from '@/lib/utils';

const ORBS = [
  { key: 'research', Icon: FlaskConical, accent: '#00d9ff', dim: 'rgba(0, 217, 255, 0.15)' },
  { key: 'projects', Icon: Code2, accent: '#d4a574', dim: 'rgba(212, 165, 116, 0.15)' },
  { key: 'achievements', Icon: Trophy, accent: '#7c3aed', dim: 'rgba(124, 58, 237, 0.15)' },
] as const;

export default function NavigationOrbs() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Staggered fade-in from the bottom-right on first mount.
  useEffect(() => {
    if (!containerRef.current) return;
    const orbs = containerRef.current.querySelectorAll('.nav-orb');
    gsap.fromTo(
      orbs,
      { autoAlpha: 0, scale: 0.4, x: 24 },
      {
        autoAlpha: 1,
        scale: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.3,
        ease: 'back.out(1.7)',
      }
    );
  }, []);

  const route = pathname.replace(/^\/(en|ja)/, '') || '/';

  return (
    <div ref={containerRef} className="nav-orbs" aria-label="Primary navigation">
      {ORBS.map(({ key, Icon, accent, dim }) => {
        const href = `/${locale}/${key}`;
        const isActive = route === `/${key}`;
        return (
          <button
            key={key}
            type="button"
            onClick={() => navigate(href)}
            aria-label={t(key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn('nav-orb', isActive && 'active')}
            style={
              {
                opacity: 0,
                '--orb-accent': accent,
                '--orb-accent-dim': dim,
              } as React.CSSProperties
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="orb-dot" />
            <span className="orb-label">{t(key)}</span>
          </button>
        );
      })}
    </div>
  );
}
