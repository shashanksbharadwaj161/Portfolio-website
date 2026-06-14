'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

const LOCALES: { code: 'en' | 'ja'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
];

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: 'en' | 'ja') => {
    if (next === locale) return;
    const segments = pathname.split('/');
    segments[1] = next; // replace the locale segment
    router.push(segments.join('/') || `/${next}`);
  };

  return (
    <div className="glass fixed right-6 top-6 z-50 flex items-center gap-1 p-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          aria-pressed={locale === code}
          className={cn(
            'text-mono rounded-xl px-3 py-1 text-xs transition-colors',
            locale === code
              ? 'glass-cyan text-[var(--cyan)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
