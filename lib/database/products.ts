import { createClient } from '@/lib/supabase/server';
import type { ProductType } from '@/types/database.types';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  currency: string;
  productType: ProductType;
  categoryId: string | null;
  categoryName: string | null;
  primaryImagePath: string | null;
}

export function mapProductCardRow(row: any): ProductCardData {
  const primaryImage =
    row.product_images?.find((img: any) => img.is_primary) ?? row.product_images?.[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    basePrice: row.base_price,
    currency: row.currency,
    productType: row.product_type,
    categoryId: row.category_id ?? null,
    categoryName: row.category?.name ?? null,
    primaryImagePath: primaryImage?.storage_path ?? null,
  };
}

export const PRODUCT_CARD_SELECT = `
  id, slug, name, description, base_price, currency, product_type, category_id,
  category:categories(name),
  product_images(storage_path, is_primary)
`;

/**
 * Featured items for the homepage. Falls back gracefully (returns []) if the
 * catalogue is empty or nothing is marked featured yet — callers render an
 * honest empty state rather than fake data.
 */
export async function getFeaturedProducts(
  productTypes: ProductType[],
  limit = 4,
): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .in('product_type', productTypes)
    .eq('is_published', true)
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('getFeaturedProducts failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapProductCardRow);
}

/**
 * Same as getFeaturedProducts but without the is_featured filter, used as a
 * fallback so a freshly-seeded catalogue with nothing marked "featured" yet
 * still shows something on the homepage rather than an empty section.
 */
export async function getRecentProducts(
  productTypes: ProductType[],
  limit = 4,
): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .in('product_type', productTypes)
    .eq('is_published', true)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentProducts failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapProductCardRow);
}

export type CatalogueSort = 'display_order' | 'price_asc' | 'price_desc' | 'name_asc';

/**
 * Published+available products in the given categories, with optional
 * in-category text search and sort. Used by the /restaurant and /bar catalogue
 * pages. Search matches product name or description (case-insensitive).
 */
export async function getProductsByCategoryIds(
  categoryIds: string[],
  options: { search?: string; sort?: CatalogueSort } = {},
): Promise<ProductCardData[]> {
  if (categoryIds.length === 0) return [];

  const supabase = createClient();
  let query = supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .in('category_id', categoryIds)
    .eq('is_published', true)
    .eq('is_available', true);

  const search = options.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_]/g, (c) => `\\${c}`);
    query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  switch (options.sort) {
    case 'price_asc':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('base_price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('display_order', { ascending: true }).order('name', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error('getProductsByCategoryIds failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapProductCardRow);
}

export interface ProductDetailData extends ProductCardData {
  attributes: Record<string, unknown>;
  categorySlug: string | null;
  images: { storagePath: string; altText: string | null; isPrimary: boolean }[];
  variants: {
    id: string;
    name: string;
    priceOverride: number | null;
    isDefault: boolean;
  }[];
  addonGroups: {
    id: string;
    name: string;
    minSelect: number;
    maxSelect: number;
    isRequired: boolean;
    options: { id: string; name: string; priceDelta: number; isAvailable: boolean }[];
  }[];
}

/** Full detail for a single product page, by its globally-unique slug. */
export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, description, base_price, currency, product_type, category_id, attributes,
      category:categories(name, slug),
      product_images(storage_path, alt_text, is_primary, display_order),
      product_variants(id, name, price_override, is_default, is_available, display_order),
      addon_groups(
        id, name, min_select, max_select, is_required, display_order,
        addon_options(id, name, price_delta, is_available, display_order)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('getProductBySlug failed:', error.message);
    }
    return null;
  }

  const row = data as any;
  const primaryImage =
    row.product_images?.find((img: any) => img.is_primary) ?? row.product_images?.[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    basePrice: row.base_price,
    currency: row.currency,
    productType: row.product_type,
    categoryId: row.category_id ?? null,
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    primaryImagePath: primaryImage?.storage_path ?? null,
    attributes: row.attributes ?? {},
    images: (row.product_images ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((img: any) => ({
        storagePath: img.storage_path,
        altText: img.alt_text,
        isPrimary: img.is_primary,
      })),
    variants: (row.product_variants ?? [])
      .filter((v: any) => v.is_available)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        priceOverride: v.price_override,
        isDefault: v.is_default,
      })),
    addonGroups: (row.addon_groups ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        minSelect: g.min_select,
        maxSelect: g.max_select,
        isRequired: g.is_required,
        options: (g.addon_options ?? [])
          .filter((o: any) => o.is_available)
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((o: any) => ({
            id: o.id,
            name: o.name,
            priceDelta: o.price_delta,
            isAvailable: o.is_available,
          })),
      })),
  };
}
