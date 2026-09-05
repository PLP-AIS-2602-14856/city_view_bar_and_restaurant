export interface CartItemAddon {
  addonOptionId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  /** Unique per distinct line — same product+variant+addons combine into one line. */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  productType: string;
  categoryName: string | null;
  primaryImagePath: string | null;
  currency: string;

  variantId: string | null;
  variantName: string | null;

  /** Unit price snapshotted at add-to-cart time, for display only — checkout
   *  (Step 12) always re-fetches current prices server-side before charging
   *  anything, so a stale client price can never be trusted or paid. */
  unitPrice: number;
  addons: CartItemAddon[];
  quantity: number;
}

export function cartItemLineTotal(item: CartItem): number {
  const addonsTotal = item.addons.reduce((sum, a) => sum + a.priceDelta, 0);
  return (item.unitPrice + addonsTotal) * item.quantity;
}

export function buildLineId(
  productId: string,
  variantId: string | null,
  addonOptionIds: string[],
): string {
  return [productId, variantId ?? 'novariant', ...[...addonOptionIds].sort()].join('|');
}
