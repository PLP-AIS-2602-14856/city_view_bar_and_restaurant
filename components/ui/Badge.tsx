import { cn } from '@/lib/utilities/cn';

type BadgeTone = 'neutral' | 'gold' | 'wine' | 'success' | 'warning' | 'danger';

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-charcoal-800/5 text-charcoal-700',
  gold: 'bg-gold-500/15 text-gold-700',
  wine: 'bg-wine-500/10 text-wine-700',
  success: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/15 text-amber-800',
  danger: 'bg-red-500/10 text-red-700',
};

// Used on the dark admin dashboard (bg-charcoal-900/950) — the light-surface
// colors above (e.g. text-emerald-700) are too low-contrast there.
const toneStylesDark: Record<BadgeTone, string> = {
  neutral: 'bg-cream-50/10 text-cream-100/80',
  gold: 'bg-gold-500/20 text-gold-300',
  wine: 'bg-wine-500/25 text-wine-300',
  success: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-500/20 text-amber-300',
  danger: 'bg-red-500/20 text-red-300',
};

export function Badge({
  tone = 'neutral',
  dark = false,
  children,
  className,
}: {
  tone?: BadgeTone;
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
        dark ? toneStylesDark[tone] : toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
