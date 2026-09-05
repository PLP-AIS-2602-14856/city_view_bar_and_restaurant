import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getAdminProductById, DRINK_TYPES } from '@/lib/admin/products';
import { listAllCategories } from '@/lib/admin/categories';
import { updateProductAction, deleteProductAction } from '@/lib/admin/products-actions';
import { ProductForm } from '@/components/admin/ProductForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function EditDrinkPage({ params }: { params: { id: string } }) {
  await requireRole(['admin', 'staff']);
  const [product, allCategories] = await Promise.all([
    getAdminProductById(params.id),
    listAllCategories(),
  ]);
  if (!product) notFound();

  const categories = allCategories.filter(
    (c) => c.productType && (DRINK_TYPES as string[]).includes(c.productType),
  );
  const boundUpdate = updateProductAction.bind(null, product.id, '/admin/drinks');
  const boundDelete = deleteProductAction.bind(null, product.id, '/admin/drinks');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Edit Drink</h1>
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
          availableTypes={DRINK_TYPES}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
