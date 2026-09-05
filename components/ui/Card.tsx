import { cn } from '@/lib/utilities/cn';

/**
 * Deliberately restrained: hairline border rather than a soft drop-shadow-on-white
 * card, minimal radius (matches tailwind.config.ts `md` = 6px), no shadow by default.
 * `elevated` is reserved for content genuinely floating above the page (menus,
 * popovers) — most content cards should stay flat with the page.
 */
export function cardClassName({ elevated = false, className }: { elevated?: boolean; className?: string } = {}) {
  return cn('rounded-md border border-charcoal-900/10 bg-cream-50', elevated && 'shadow-card', className);
}

export function Card({
  className,
  elevated = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return <div className={cardClassName({ elevated, className })} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}
