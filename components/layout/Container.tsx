import { cn } from '@/lib/utilities/cn';

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-6', className)} {...props} />;
}

/** Consistent vertical rhythm between homepage/landing sections. */
export function Section({
  className,
  tone = 'light',
  ...props
}: React.HTMLAttributes<HTMLElement> & { tone?: 'light' | 'dark' }) {
  return (
    <section
      className={cn(
        'py-20',
        tone === 'dark' ? 'bg-charcoal-950 text-cream-50' : 'bg-cream-50 text-charcoal-900',
        className,
      )}
      {...props}
    />
  );
}
