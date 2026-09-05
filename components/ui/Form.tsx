import { forwardRef } from 'react';
import { cn } from '@/lib/utilities/cn';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-charcoal-800', className)}
      {...props}
    />
  );
}

const fieldStyles =
  'w-full rounded border border-charcoal-900/15 bg-cream-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-gold-500';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldStyles, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldStyles, 'min-h-28 resize-y', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldStyles, className)} {...props}>
    {children}
  </select>
));
Select.displayName = 'Select';

/** Wraps a field with its label and, when present, an inline error message. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-charcoal-700/70">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
