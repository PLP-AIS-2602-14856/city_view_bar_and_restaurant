import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { listAdminProducts, FOOD_TYPES } from '@/lib/admin/products';
import { ProductListTable } from '@/components/admin/ProductListTable';
import { buttonStyles } from '@/components/ui/Button';

export default async function AdminMenuPage() {
  await requireRole(['admin', 'staff']);
  const products = await listAdminProducts(FOOD_TYPES);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Menu Management</h1>
        <Link href="/admin/menu/new" className={buttonStyles({ variant: 'solid', size: 'sm' })}>
          Add Dish
        </Link>
      </div>
      <p className="mt-1 font-body text-sm text-cream-100/60">
        Food items shown on the Restaurant menu.
      </p>

      <ProductListTable products={products} editBasePath="/admin/menu" />
    </div>
  );
}
