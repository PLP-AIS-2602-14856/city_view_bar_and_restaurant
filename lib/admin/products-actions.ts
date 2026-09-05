'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/session';
import { productSchema } from '@/lib/validation/products';

export type ProductActionState = { error?: string } | null;

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    productType: formData.get('productType'),
    basePrice: formData.get('basePrice'),
    currency: formData.get('currency') || 'KES',
    isAvailable: formData.get('isAvailable'),
    isFeatured: formData.get('isFeatured'),
    isPublished: formData.get('isPublished'),
    displayOrder: formData.get('displayOrder') || '0',
    spiceLevel: formData.get('spiceLevel'),
    abvPercentage: formData.get('abvPercentage'),
    varietal: formData.get('varietal'),
    origin: formData.get('origin'),
    allergens: formData.get('allergens'),
  });
}

/** Assembles the sparse per-type fields into the products.attributes JSONB shape
 *  read by the storefront (see lib/database/products.ts#getProductBySlug). */
function buildAttributes(input: ReturnType<typeof productSchema.parse>) {
  const attrs: Record<string, unknown> = {};
  if (input.spiceLevel) attrs.spice_level = input.spiceLevel;
  if (!Number.isNaN(input.abvPercentage) && input.abvPercentage !== undefined) {
    attrs.abv_percentage = input.abvPercentage;
  }
  if (input.varietal) attrs.varietal = input.varietal;
  if (input.origin) attrs.origin = input.origin;
  if (input.allergens) {
    attrs.allergens = input.allergens
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
  }
  return attrs;
}

function revalidateStorefront() {
  revalidatePath('/');
  revalidatePath('/restaurant');
  revalidatePath('/bar');
  revalidatePath('/search');
}

export async function createProductAction(
  redirectTo: '/admin/menu' | '/admin/drinks',
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireRole(['admin', 'staff']);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const input = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('products').insert({
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    category_id: input.categoryId,
    product_type: input.productType,
    base_price: input.basePrice,
    currency: input.currency,
    is_available: input.isAvailable,
    is_featured: input.isFeatured,
    is_published: input.isPublished,
    display_order: input.displayOrder,
    attributes: buildAttributes(input),
  });

  if (error) {
    return {
      error: error.code === '23505' ? 'A product with that slug already exists.' : error.message,
    };
  }

  revalidatePath(redirectTo);
  revalidateStorefront();
  redirect(redirectTo);
}

export async function updateProductAction(
  productId: string,
  redirectTo: '/admin/menu' | '/admin/drinks',
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireRole(['admin', 'staff']);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const input = parsed.data;

  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category_id: input.categoryId,
      product_type: input.productType,
      base_price: input.basePrice,
      currency: input.currency,
      is_available: input.isAvailable,
      is_featured: input.isFeatured,
      is_published: input.isPublished,
      display_order: input.displayOrder,
      attributes: buildAttributes(input),
    })
    .eq('id', productId);

  if (error) {
    return {
      error: error.code === '23505' ? 'A product with that slug already exists.' : error.message,
    };
  }

  revalidatePath(redirectTo);
  revalidatePath(`/menu/${input.slug}`);
  revalidateStorefront();
  redirect(redirectTo);
}

export async function deleteProductAction(productId: string, redirectTo: string) {
  await requireRole(['admin', 'staff']);
  const supabase = createClient();
  // Order history is unaffected — order_items snapshots the name/price at the
  // time of order and only nulls its product_id reference (ON DELETE SET NULL,
  // see 0008_orders.sql), it never loses what was actually sold.
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(redirectTo);
  revalidateStorefront();
  redirect(redirectTo);
}

/** Quick toggle used from the list table, without opening the full edit form. */
export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean,
  redirectTo: string,
) {
  await requireRole(['admin', 'staff']);
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath(redirectTo);
  revalidateStorefront();
}
