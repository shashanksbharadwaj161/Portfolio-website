'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'cyan' | 'gold';

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

type GlowButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  );

const VARIANT_CLASS: Record<Variant, string> = {
  cyan: 'glass-cyan glow-cyan text-[var(--cyan)]',
  gold: 'glass-gold glow-gold text-[var(--gold)]',
};

export default function GlowButton({
  variant = 'cyan',
  className,
  children,
  ...props
}: GlowButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5',
    VARIANT_CLASS[variant],
    className
  );

  if ('href' in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { href: _omit, ...rest } = props as { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
