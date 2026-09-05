import { requireRole } from '@/lib/auth/session';
import { listAllCategories } from '@/lib/admin/categories';
import { createProductAction } from '@/lib/admin/products-actions';
import { DRINK_TYPES } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function NewDrinkPage() {
  await requireRole(['admin', 'staff']);
  const allCategories = await listAllCategories();
  const categories = allCategories.filter(
    (c) => c.productType && (DRINK_TYPES as string[]).includes(c.productType),
  );

  const boundCreate = createProductAction.bind(null, '/admin/drinks');

  return (
    <div>
      <h1 className="font-display text-2xl text-cream-50">Add Drink</h1>
      <div className="mt-6">
        <ProductForm
          action={boundCreate}
          categories={categories}
          availableTypes={DRINK_TYPES}
          submitLabel="Create Drink"
        />
      </div>
    </div>
  );
}
