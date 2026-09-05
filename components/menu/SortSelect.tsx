'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Form';

const sortOptions = [
  { value: 'display_order', label: 'Recommended' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'price_asc', label: 'Price (low to high)' },
  { value: 'price_desc', label: 'Price (high to low)' },
] as const;

export function SortSelect({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? 'display_order';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'display_order') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      aria-label="Sort menu items"
      value={currentSort}
      onChange={handleChange}
      className={
        dark
          ? 'w-auto border-cream-50/20 bg-charcoal-950 text-cream-50'
          : 'w-auto'
      }
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
