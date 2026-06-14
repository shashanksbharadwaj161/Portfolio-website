'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePageTransition } from './transition-context';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'shashank-portfolio-lang';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const { switchLocale } = usePageTransition();

  // Persist the active language so the preference survives refreshes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [locale]);

  const handleSwitch = (next: 'en' | 'ja') => {
    if (next === locale) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const segments = pathname.split('/');
    segments[1] = next; // swap the locale segment
    switchLocale(segments.join('/') || `/${next}`);
  };

  return (
    <div className="lang-toggle glass" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => handleSwitch('en')}
        aria-pressed={locale === 'en'}
        className={cn('lang-btn', locale === 'en' && 'active')}
      >
        EN
      </button>
      <span className="lang-sep" aria-hidden="true" />
      <button
        type="button"
        onClick={() => handleSwitch('ja')}
        aria-pressed={locale === 'ja'}
        className={cn('lang-btn', locale === 'ja' && 'active')}
      >
        JA
      </button>
    </div>
  );
}
