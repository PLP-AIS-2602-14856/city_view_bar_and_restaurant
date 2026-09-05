import { forwardRef } from 'react';
import { cn } from '@/lib/utilities/cn';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'bar';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Primary CTA — used sparingly (Order Now, Reserve a Table, Save changes).
  solid: 'bg-gold-500 text-charcoal-950 hover:bg-gold-400 active:bg-gold-600',
  // Secondary actions on light or dark surfaces.
  outline:
    'border border-charcoal-700 text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50',
  // Tertiary / low-emphasis actions.
  ghost: 'text-charcoal-700 hover:bg-charcoal-900/5',
  // Reserved for bar/nightlife-flavored moments (e.g. cocktail menu CTA).
  bar: 'bg-wine-500 text-cream-50 hover:bg-wine-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

/**
 * Shared style function so a `<Link>` styled as a button (site navigation CTAs)
 * never nests an <a> inside a <button> — an accessibility and HTML-validity bug.
 * Use `buttonStyles(...)` directly on a `<Link className={...}>` for navigation,
 * and reserve the `<Button>` component itself for actual form/action buttons.
 */
export function buttonStyles({
  variant = 'solid',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-body font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', ...props }, ref) => {
    return (
      <button ref={ref} className={buttonStyles({ variant, size, className })} {...props} />
    );
  },
);
Button.displayName = 'Button';
