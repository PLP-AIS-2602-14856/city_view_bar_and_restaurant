import { createClient } from '@/lib/supabase/server';

export interface PromotionCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  promotionType: string;
  discountValue: number | null;
  endsAt: string | null;
}

export async function getActivePromotions(limit = 3): Promise<PromotionCardData[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotions')
    .select('id, slug, title, description, promotion_type, discount_value, ends_at, starts_at')
    .eq('is_active', true)
    .lte('starts_at', nowIso)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order('starts_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getActivePromotions failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    promotionType: row.promotion_type,
    discountValue: row.discount_value,
    endsAt: row.ends_at,
  }));
}
