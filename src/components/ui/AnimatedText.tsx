import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Renders a block of text. The per-character / scroll-reveal animation is added
 * in a later sprint — for now it is a clean, semantic text wrapper.
 */
export default function AnimatedText({ text, as = 'span', className }: AnimatedTextProps) {
  const Tag = as as React.ElementType;
  return <Tag className={cn(className)}>{text}</Tag>;
}
