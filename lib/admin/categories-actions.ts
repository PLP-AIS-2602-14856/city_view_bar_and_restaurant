'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/session';
import { categorySchema } from '@/lib/validation/categories';

export type CategoryActionState = { error?: string } | null;

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    parentId: formData.get('parentId'),
    productType: formData.get('productType'),
    displayOrder: formData.get('displayOrder'),
    isActive: formData.get('isActive'),
  });
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole(['admin', 'staff']);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const input = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('categories').insert({
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    parent_id: input.parentId || null,
    product_type: input.productType || null,
    display_order: input.displayOrder,
    is_active: input.isActive,
  });

  if (error) {
    return {
      error: error.code === '23505' ? 'A category with that slug already exists.' : error.message,
    };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/restaurant');
  revalidatePath('/bar');
  redirect('/admin/categories');
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole(['admin', 'staff']);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const input = parsed.data;

  if (input.parentId === categoryId) {
    return { error: 'A category cannot be its own parent.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      parent_id: input.parentId || null,
      product_type: input.productType || null,
      display_order: input.displayOrder,
      is_active: input.isActive,
    })
    .eq('id', categoryId);

  if (error) {
    return {
      error: error.code === '23505' ? 'A category with that slug already exists.' : error.message,
    };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/restaurant');
  revalidatePath('/bar');
  redirect('/admin/categories');
}

export async function deleteCategoryAction(categoryId: string) {
  await requireRole(['admin', 'staff']);
  const supabase = createClient();
  // Products referencing this category have category_id set null (ON DELETE
  // SET NULL, see 0004_products.sql) rather than being deleted — they become
  // "uncategorized" and still show up in Admin > Menu/Drinks, not silently lost.
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/restaurant');
  revalidatePath('/bar');
  redirect('/admin/categories');
}
