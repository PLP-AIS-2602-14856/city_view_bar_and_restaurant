import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getAdminProductById, FOOD_TYPES } from '@/lib/admin/products';
import { listAllCategories } from '@/lib/admin/categories';
import { updateProductAction, deleteProductAction } from '@/lib/admin/products-actions';
import { ProductForm } from '@/components/admin/ProductForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  await requireRole(['admin', 'staff']);
  const [product, allCategories] = await Promise.all([
    getAdminProductById(params.id),
    listAllCategories(),
  ]);
  if (!product) notFound();

  const categories = allCategories.filter((c) => c.productType === 'food');
  const boundUpdate = updateProductAction.bind(null, product.id, '/admin/menu');
  const boundDelete = deleteProductAction.bind(null, product.id, '/admin/menu');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Edit Dish</h1>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`Delete "${product.name}"? This cannot be undone. Past orders keep their own record of it.`}
        />
      </div>
      <div className="mt-6">
        <ProductForm
          action={boundUpdate}
          product={product}
          categories={categories}
          availableTypes={FOOD_TYPES}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
