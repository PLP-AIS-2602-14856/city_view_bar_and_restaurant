import { createClient } from '@/lib/supabase/server';
import type { ProductType } from '@/types/database.types';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  productType: ProductType | null;
  displayOrder: number;
  isActive: boolean;
}

/** Every category, flat, with parent name resolved — used for the admin list + parent picker. */
export async function listAllCategories(): Promise<AdminCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, product_type, display_order, is_active, parent:categories!parent_id(name)')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('listAllCategories failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parent_id,
    parentName: row.parent?.name ?? null,
    productType: row.product_type,
    displayOrder: row.display_order,
    isActive: row.is_active,
  }));
}

export async function getCategoryById(id: string): Promise<AdminCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, product_type, display_order, is_active')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    parentId: data.parent_id,
    parentName: null,
    productType: data.product_type,
    displayOrder: data.display_order,
    isActive: data.is_active,
  };
}
