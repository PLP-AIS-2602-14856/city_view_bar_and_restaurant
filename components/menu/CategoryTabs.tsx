import Link from 'next/link';
import { cn } from '@/lib/utilities/cn';
import type { CatalogueCategory } from '@/lib/database/categories';

function buildHref(basePath: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CategoryTabs({
  categories,
  basePath,
  activeSlug,
  search,
  sort,
  dark = false,
}: {
  categories: CatalogueCategory[];
  basePath: string;
  activeSlug?: string;
  search?: string;
  sort?: string;
  dark?: boolean;
}) {
  const pillBase = 'rounded-full px-4 py-2 font-body text-sm whitespace-nowrap transition-colors';
  const activeClass = dark ? 'bg-gold-500 text-charcoal-950' : 'bg-charcoal-950 text-cream-50';
  const inactiveClass = dark
    ? 'bg-cream-50/10 text-cream-100/80 hover:bg-cream-50/20'
    : 'bg-charcoal-900/5 text-charcoal-800 hover:bg-charcoal-900/10';

  return (
    <nav aria-label="Menu categories" className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href={buildHref(basePath, { q: search, sort })}
        className={cn(pillBase, !activeSlug ? activeClass : inactiveClass)}
        aria-current={!activeSlug ? 'page' : undefined}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildHref(basePath, { category: category.slug, q: search, sort })}
          className={cn(pillBase, activeSlug === category.slug ? activeClass : inactiveClass)}
          aria-current={activeSlug === category.slug ? 'page' : undefined}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
