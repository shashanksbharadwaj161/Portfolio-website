import { cn } from '@/lib/utils';

type Variant = 'default' | 'cyan' | 'gold';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: React.ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'glass',
  cyan: 'glass-cyan',
  gold: 'glass-gold',
};

export default function GlassCard({
  variant = 'default',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div className={cn(VARIANT_CLASS[variant], 'glass-hover p-6', className)} {...props}>
      {children}
    </div>
  );
}
