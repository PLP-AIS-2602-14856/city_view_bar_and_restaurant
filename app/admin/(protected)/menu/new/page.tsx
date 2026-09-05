import { requireRole } from '@/lib/auth/session';
import { listAllCategories } from '@/lib/admin/categories';
import { createProductAction } from '@/lib/admin/products-actions';
import { FOOD_TYPES } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function NewMenuItemPage() {
  await requireRole(['admin', 'staff']);
  const allCategories = await listAllCategories();
  const categories = allCategories.filter((c) => c.productType === 'food');

  const boundCreate = createProductAction.bind(null, '/admin/menu');

  return (
    <div>
      <h1 className="font-display text-2xl text-cream-50">Add Dish</h1>
      <div className="mt-6">
        <ProductForm
          action={boundCreate}
          categories={categories}
          availableTypes={FOOD_TYPES}
          submitLabel="Create Dish"
        />
      </div>
    </div>
  );
}
