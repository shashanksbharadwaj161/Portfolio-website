'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Lightweight top navigation. The animated "orb" treatment is layered on in a
 * later sprint — for now this is a clean, accessible bilingual nav.
 */
export default function NavigationOrbs() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: 'Shashank' },
    { href: `/${locale}/research`, label: t('research') },
    { href: `/${locale}/projects`, label: t('projects') },
    { href: `/${locale}/achievements`, label: t('achievements') },
  ];

  return (
    <nav className="glass fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 items-center gap-2 px-2 py-1 md:flex">
      {links.map(({ href, label }, i) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'rounded-xl px-4 py-2 text-sm transition-colors',
              i === 0 && 'text-display font-semibold',
              isActive
                ? 'text-[var(--cyan)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
