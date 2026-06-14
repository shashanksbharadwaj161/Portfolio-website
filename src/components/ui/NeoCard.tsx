import { cn } from '@/lib/utils';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function NeoCard({ className, children, ...props }: NeoCardProps) {
  return (
    <div className={cn('neo p-6', className)} {...props}>
      {children}
    </div>
  );
}
