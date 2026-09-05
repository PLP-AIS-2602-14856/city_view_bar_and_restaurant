import { createClient } from '@/lib/supabase/server';
import {
  mapProductCardRow,
  PRODUCT_CARD_SELECT,
  type ProductCardData,
} from '@/lib/database/products';

/**
 * Searches across the entire catalogue (food and every drink type) by name or
 * description. Empty/whitespace-only queries return [] rather than the whole
 * catalogue — the /search page treats that as "no search performed yet" and
 * doesn't call this at all, but this guard keeps the function safe either way.
 */
export async function searchProducts(rawQuery: string, limit = 24): Promise<ProductCardData[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  const supabase = createClient();
  // Escape ILIKE wildcards so a literal "%" or "_" typed by the person is
  // matched literally rather than acting as a pattern.
  const escaped = query.replace(/[%_]/g, (c) => `\\${c}`);

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .eq('is_published', true)
    .eq('is_available', true)
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('searchProducts failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapProductCardRow);
}
