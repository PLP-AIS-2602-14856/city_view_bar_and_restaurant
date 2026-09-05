import { Input } from '@/components/ui/Form';
import { buttonStyles } from '@/components/ui/Button';

export function SearchBar({
  action,
  defaultValue,
  placeholder = 'Search the menu…',
  hiddenFields = {},
  dark = false,
}: {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  hiddenFields?: Record<string, string | undefined>;
  dark?: boolean;
}) {
  return (
    <form action={action} method="get" role="search" className="flex gap-2">
      {Object.entries(hiddenFields).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Search the menu"
        className={
          dark
            ? 'border-cream-50/20 bg-transparent text-cream-50 placeholder:text-cream-100/40'
            : undefined
        }
      />
      <button type="submit" className={buttonStyles({ variant: dark ? 'outline' : 'solid', size: 'md', className: dark ? 'border-cream-50/30 text-cream-50 hover:bg-cream-50 hover:text-charcoal-950 shrink-0' : 'shrink-0' })}>
        Search
      </button>
    </form>
  );
}
