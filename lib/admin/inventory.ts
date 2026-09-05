import { createClient } from '@/lib/supabase/server';
import type { ProductType } from '@/types/database.types';

export interface InventoryOverviewRow {
  productId: string;
  productName: string;
  categoryName: string | null;
  productType: ProductType;
  /** null = tracking has never been enabled for this product yet. */
  inventoryId: string | null;
  trackInventory: boolean;
  quantityOnHand: number;
  reorderThreshold: number;
}

/**
 * One row per product, with its inventory row joined in if tracking has been
 * enabled. Scoped to product-level tracking only — per-variant stock (e.g.
 * separate glass/bottle counts) is a natural future refinement but out of
 * scope for this batch.
 */
export async function listInventoryOverview(): Promise<InventoryOverviewRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, product_type, category:categories(name), inventory(id, track_inventory, quantity_on_hand, reorder_threshold, variant_id)',
    )
    .order('name', { ascending: true });

  if (error) {
    console.error('listInventoryOverview failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => {
    // A product can only have one product-level (variant_id IS NULL) inventory
    // row — see the partial unique index in 0007_inventory.sql.
    const inv = (row.inventory ?? []).find((i: any) => i.variant_id === null) ?? null;
    return {
      productId: row.id,
      productName: row.name,
      categoryName: row.category?.name ?? null,
      productType: row.product_type,
      inventoryId: inv?.id ?? null,
      trackInventory: inv?.track_inventory ?? false,
      quantityOnHand: inv?.quantity_on_hand ?? 0,
      reorderThreshold: inv?.reorder_threshold ?? 0,
    };
  });
}
