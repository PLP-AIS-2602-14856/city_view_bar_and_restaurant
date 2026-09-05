'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/session';
import {
  enableTrackingSchema,
  adjustStockSchema,
  reorderThresholdSchema,
} from '@/lib/validation/inventory';

export type InventoryActionResult = { error?: string } | void;

export async function enableTrackingAction(
  productId: string,
  formData: FormData,
): Promise<InventoryActionResult> {
  await requireRole(['admin', 'staff']);
  const parsed = enableTrackingSchema.safeParse({
    quantityOnHand: formData.get('quantityOnHand'),
    reorderThreshold: formData.get('reorderThreshold'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase.from('inventory').insert({
    product_id: productId,
    track_inventory: true,
    quantity_on_hand: parsed.data.quantityOnHand,
    reorder_threshold: parsed.data.reorderThreshold,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/inventory');
}

export async function disableTrackingAction(inventoryId: string): Promise<InventoryActionResult> {
  await requireRole(['admin', 'staff']);
  const supabase = createClient();
  // Keeps the row (and its adjustment history) — just stops enforcing the
  // "reject the order if stock is insufficient" trigger for this product.
  const { error } = await supabase
    .from('inventory')
    .update({ track_inventory: false })
    .eq('id', inventoryId);

  if (error) return { error: error.message };
  revalidatePath('/admin/inventory');
}

export async function reenableTrackingAction(inventoryId: string): Promise<InventoryActionResult> {
  await requireRole(['admin', 'staff']);
  const supabase = createClient();
  const { error } = await supabase
    .from('inventory')
    .update({ track_inventory: true })
    .eq('id', inventoryId);

  if (error) return { error: error.message };
  revalidatePath('/admin/inventory');
}

/**
 * Adjusts stock and logs the change to inventory_adjustments. Not wrapped in a
 * database transaction (the Supabase JS client doesn't expose multi-statement
 * transactions) — acceptable at this scale, but two admins adjusting the same
 * item at the exact same instant could race. A future refinement would move
 * this into a Postgres function callable via .rpc() for atomicity.
 */
export async function adjustStockAction(
  inventoryId: string,
  formData: FormData,
): Promise<InventoryActionResult> {
  const profile = await requireRole(['admin', 'staff']);
  const parsed = adjustStockSchema.safeParse({
    changeQty: formData.get('changeQty'),
    reason: formData.get('reason'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { data: inv, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity_on_hand')
    .eq('id', inventoryId)
    .single();
  if (fetchError || !inv) return { error: 'Inventory record not found.' };

  const newQuantity = inv.quantity_on_hand + parsed.data.changeQty;
  if (newQuantity < 0) {
    return { error: `That would take stock below zero (currently ${inv.quantity_on_hand}).` };
  }

  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity_on_hand: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', inventoryId);
  if (updateError) return { error: updateError.message };

  const { error: logError } = await supabase.from('inventory_adjustments').insert({
    inventory_id: inventoryId,
    change_qty: parsed.data.changeQty,
    reason: parsed.data.reason,
    created_by: profile.id,
  });
  if (logError) console.error('adjustStockAction (audit log) failed:', logError.message);

  revalidatePath('/admin/inventory');
}

export async function updateReorderThresholdAction(
  inventoryId: string,
  formData: FormData,
): Promise<InventoryActionResult> {
  await requireRole(['admin', 'staff']);
  const parsed = reorderThresholdSchema.safeParse({
    reorderThreshold: formData.get('reorderThreshold'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase
    .from('inventory')
    .update({ reorder_threshold: parsed.data.reorderThreshold })
    .eq('id', inventoryId);

  if (error) return { error: error.message };
  revalidatePath('/admin/inventory');
}
