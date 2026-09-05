import { requireRole } from '@/lib/auth/session';
import { listAllCategories } from '@/lib/admin/categories';
import { createCategoryAction } from '@/lib/admin/categories-actions';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function NewCategoryPage() {
  await requireRole(['admin', 'staff']);
  const categories = await listAllCategories();

  return (
    <div>
      <h1 className="font-display text-2xl text-cream-50">Add Category</h1>
      <div className="mt-6">
        <CategoryForm action={createCategoryAction} parentOptions={categories} submitLabel="Create Category" />
      </div>
    </div>
  );
}
