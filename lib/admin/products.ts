import { createClient } from '@/lib/supabase/server';
import type { ProductType } from '@/types/database.types';

export const FOOD_TYPES: ProductType[] = ['food'];
export const DRINK_TYPES: ProductType[] = [
  'alcoholic_drink',
  'wine',
  'cocktail',
  'soft_drink',
  'juice',
];

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string | null;
  productType: ProductType;
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  isPublished: boolean;
  isFeatured: boolean;
}

export async function listAdminProducts(
  productTypes: ProductType[],
  categoryId?: string,
): Promise<AdminProductListItem[]> {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select('id, name, slug, base_price, currency, product_type, is_available, is_published, is_featured, category:categories(name)')
    .in('product_type', productTypes)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) {
    console.error('listAdminProducts failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryName: row.category?.name ?? null,
    productType: row.product_type,
    basePrice: row.base_price,
    currency: row.currency,
    isAvailable: row.is_available,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
  }));
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  productType: ProductType;
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  attributes: Record<string, unknown>;
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, slug, description, category_id, product_type, base_price, currency, is_available, is_featured, is_published, display_order, attributes',
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    categoryId: data.category_id,
    productType: data.product_type,
    basePrice: data.base_price,
    currency: data.currency,
    isAvailable: data.is_available,
    isFeatured: data.is_featured,
    isPublished: data.is_published,
    displayOrder: data.display_order,
    attributes: data.attributes ?? {},
  };
}
