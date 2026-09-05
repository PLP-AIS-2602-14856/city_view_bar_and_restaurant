import { createClient } from '@/lib/supabase/server';

export interface CatalogueCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface CatalogueRoot {
  id: string;
  slug: string;
  name: string;
  children: CatalogueCategory[];
}

/**
 * Fetches a top-level category ("restaurant" or "bar") and its active child
 * categories, e.g. Bar -> [Wines, Cocktails, Spirits & Alcoholic Drinks,
 * Soft Drinks, Fresh Juices]. Returns null if the root category doesn't exist
 * yet (nothing invented — the page renders an honest "not set up yet" state).
 */
export async function getCatalogueRoot(rootSlug: string): Promise<CatalogueRoot | null> {
  const supabase = createClient();

  const { data: root, error: rootError } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', rootSlug)
    .eq('is_active', true)
    .single();

  if (rootError || !root) {
    if (rootError && rootError.code !== 'PGRST116') {
      console.error('getCatalogueRoot failed:', rootError.message);
    }
    return null;
  }

  const { data: children, error: childrenError } = await supabase
    .from('categories')
    .select('id, slug, name, description')
    .eq('parent_id', root.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (childrenError) {
    console.error('getCatalogueRoot (children) failed:', childrenError.message);
  }

  return { ...root, children: children ?? [] };
}
