import { createClient } from '@/lib/supabase/server';

export interface RestaurantSettings {
  businessName: string | null;
  address: { line1?: string; city?: string; country?: string } | null;
  phone: string | null;
  email: string | null;
  openingHours: Record<string, string> | null;
  socialLinks: Record<string, string> | null;
}

/**
 * Reads the restaurant_settings key/value table. Missing keys resolve to null
 * rather than an invented default — pages render an honest "coming soon" state
 * for anything not yet configured by an administrator, per project rules against
 * fabricating business information.
 */
export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from('restaurant_settings').select('key, value');

  if (error) {
    console.error('getRestaurantSettings failed:', error.message);
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    businessName: (map.get('business_name') as string) ?? null,
    address: (map.get('address') as RestaurantSettings['address']) ?? null,
    phone: (map.get('phone') as string) ?? null,
    email: (map.get('email') as string) ?? null,
    openingHours: (map.get('opening_hours') as Record<string, string>) ?? null,
    socialLinks: (map.get('social_links') as Record<string, string>) ?? null,
  };
}
