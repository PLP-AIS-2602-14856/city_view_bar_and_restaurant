import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getCategoryById, listAllCategories } from '@/lib/admin/categories';
import { updateCategoryAction, deleteCategoryAction } from '@/lib/admin/categories-actions';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  await requireRole(['admin', 'staff']);
  const [category, categories] = await Promise.all([
    getCategoryById(params.id),
    listAllCategories(),
  ]);
  if (!category) notFound();

  const boundUpdate = updateCategoryAction.bind(null, category.id);
  const boundDelete = deleteCategoryAction.bind(null, category.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Edit Category</h1>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`Delete "${category.name}"? Products in it become uncategorized, not deleted.`}
        />
      </div>
      <div className="mt-6">
        <CategoryForm
          action={boundUpdate}
          category={category}
          parentOptions={categories}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
