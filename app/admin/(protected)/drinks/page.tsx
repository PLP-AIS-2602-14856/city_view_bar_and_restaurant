import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { listAdminProducts, DRINK_TYPES } from '@/lib/admin/products';
import { ProductListTable } from '@/components/admin/ProductListTable';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/lib/utilities/cn';
import type { ProductType } from '@/types/database.types';

const TYPE_LABELS: Record<ProductType, string> = {
  food: 'Food',
  alcoholic_drink: 'Spirits & Alcoholic Drinks',
  wine: 'Wine',
  cocktail: 'Cocktail',
  soft_drink: 'Soft Drink',
  juice: 'Juice',
};

export default async function AdminDrinksPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  await requireRole(['admin', 'staff']);
  const activeType = DRINK_TYPES.includes(searchParams.type as ProductType)
    ? (searchParams.type as ProductType)
    : undefined;

  const products = await listAdminProducts(activeType ? [activeType] : DRINK_TYPES);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Drinks Management</h1>
        <Link href="/admin/drinks/new" className={buttonStyles({ variant: 'solid', size: 'sm' })}>
          Add Drink
        </Link>
      </div>
      <p className="mt-1 font-body text-sm text-cream-100/60">
        Wines, cocktails, spirits, soft drinks, and juices shown on the Bar menu.
      </p>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        <Link
          href="/admin/drinks"
          className={cn(
            'rounded-full px-3 py-1.5 font-body text-xs whitespace-nowrap',
            !activeType ? 'bg-gold-500 text-charcoal-950' : 'bg-cream-50/10 text-cream-100/80',
          )}
        >
          All
        </Link>
        {DRINK_TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/drinks?type=${t}`}
            className={cn(
              'rounded-full px-3 py-1.5 font-body text-xs whitespace-nowrap',
              activeType === t ? 'bg-gold-500 text-charcoal-950' : 'bg-cream-50/10 text-cream-100/80',
            )}
          >
            {TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      <ProductListTable products={products} editBasePath="/admin/drinks" showTypeColumn={!activeType} />
    </div>
  );
}
