import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { checkoutSchema, type CheckoutInput } from '@/lib/validation/checkout';
import type { FulfillmentDestination } from '@/types/database.types';

export interface OrderConfirmation {
  orderNumber: string;
  channel: string;
  contactName: string;
  items: {
    name: string;
    variantName: string | null;
    addonNames: string[];
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
}

export type CreateOrderResult =
  | { success: true; order: OrderConfirmation }
  | { success: false; error: string };

// Placeholder flat delivery fee until an admin configures real delivery zones
// in restaurant_settings — clearly called out so it's never mistaken for a
// real, priced delivery policy.
const PLACEHOLDER_DELIVERY_FEE_KES = 200;

/**
 * Creates an order from a raw (untrusted) checkout submission. Every price and
 * every availability check is re-derived here from the current database state
 * — the client's cart only ever supplies product/variant/addon *ids* and a
 * quantity; names and prices shown in the cart are display-only and are
 * discarded in favor of what's authoritative in `products`/`product_variants`/
 * `addon_options` at the moment of order placement.
 */
export async function createOrder(rawInput: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid order.' };
  }
  const input: CheckoutInput = parsed.data;

  const user = await getCurrentUser();
  // Guest checkout is inserted via the service-role client, per the RLS design
  // in supabase/migrations/0014_row_level_security.sql — there is deliberately
  // no anon-insert policy on orders, so a guest order can only be created
  // through this trusted server path, never directly from the browser.
  const db = user ? createClient() : createAdminClient();

  type ResolvedLine = {
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    unitPrice: number;
    quantity: number;
    destination: FulfillmentDestination;
    currency: string;
    addons: { addonOptionId: string; name: string; priceDelta: number }[];
  };

  const resolvedLines: ResolvedLine[] = [];

  for (const item of input.items) {
    const { data: product, error: productError } = await db
      .from('products')
      .select('id, name, base_price, currency, product_type, is_published, is_available')
      .eq('id', item.productId)
      .single();

    if (productError || !product || !product.is_published || !product.is_available) {
      return { success: false, error: 'One of the items in your cart is no longer available.' };
    }

    let unitPrice = product.base_price;
    let variantName: string | null = null;

    if (item.variantId) {
      const { data: variant, error: variantError } = await db
        .from('product_variants')
        .select('id, name, price_override, is_available, product_id')
        .eq('id', item.variantId)
        .single();

      if (
        variantError ||
        !variant ||
        !variant.is_available ||
        variant.product_id !== product.id
      ) {
        return {
          success: false,
          error: `The selected option for "${product.name}" is no longer available.`,
        };
      }
      unitPrice = variant.price_override ?? product.base_price;
      variantName = variant.name;
    }

    const addons: ResolvedLine['addons'] = [];
    for (const optionId of item.addonOptionIds) {
      const { data: option, error: optionError } = await db
        .from('addon_options')
        .select('id, name, price_delta, is_available, addon_group_id, addon_groups!inner(product_id)')
        .eq('id', optionId)
        .single();

      const belongsToProduct = (option as any)?.addon_groups?.product_id === product.id;
      if (optionError || !option || !option.is_available || !belongsToProduct) {
        return {
          success: false,
          error: `An add-on for "${product.name}" is no longer available.`,
        };
      }
      addons.push({ addonOptionId: option.id, name: option.name, priceDelta: option.price_delta });
    }

    resolvedLines.push({
      productId: product.id,
      variantId: item.variantId,
      productName: product.name,
      variantName,
      unitPrice,
      quantity: item.quantity,
      destination: product.product_type === 'food' ? 'kitchen' : 'bar',
      currency: product.currency,
      addons,
    });
  }

  const subtotal = resolvedLines.reduce((sum, line) => {
    const addonsTotal = line.addons.reduce((s, a) => s + a.priceDelta, 0);
    return sum + (line.unitPrice + addonsTotal) * line.quantity;
  }, 0);
  const deliveryFee = input.channel === 'delivery' ? PLACEHOLDER_DELIVERY_FEE_KES : 0;
  const taxAmount = 0; // Tax configuration is a future admin setting, not invented here.
  const totalAmount = subtotal + deliveryFee + taxAmount;
  const currency = resolvedLines[0]?.currency ?? 'KES';

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      customer_id: user?.id ?? null,
      channel: input.channel,
      table_number: input.channel === 'dine_in' ? input.tableNumber || null : null,
      delivery_address:
        input.channel === 'delivery'
          ? { line1: input.deliveryLine1, area: input.deliveryArea, notes: input.deliveryNotes }
          : null,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail || null,
      subtotal,
      delivery_fee: deliveryFee,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: input.notes || null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('createOrder (orders insert) failed:', orderError?.message);
    return { success: false, error: 'Could not place your order. Please try again.' };
  }

  for (const line of resolvedLines) {
    const addonsTotal = line.addons.reduce((s, a) => s + a.priceDelta, 0);
    const { data: orderItem, error: itemError } = await db
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: line.productId,
        variant_id: line.variantId,
        product_name_snapshot: line.productName,
        variant_name_snapshot: line.variantName,
        unit_price_snapshot: line.unitPrice,
        quantity: line.quantity,
        line_total: (line.unitPrice + addonsTotal) * line.quantity,
        destination: line.destination,
      })
      .select('id')
      .single();

    if (itemError || !orderItem) {
      // Most commonly the inventory-deduction trigger rejecting insufficient
      // stock (see 0013_functions_and_triggers.sql) — surface it plainly.
      console.error('createOrder (order_items insert) failed:', itemError?.message);
      return {
        success: false,
        error: itemError?.message.includes('Insufficient stock')
          ? `Sorry, "${line.productName}" doesn't have enough stock for that quantity.`
          : 'Could not place your order. Please try again.',
      };
    }

    if (line.addons.length > 0) {
      const { error: addonsError } = await db.from('order_item_addons').insert(
        line.addons.map((a) => ({
          order_item_id: orderItem.id,
          addon_option_id: a.addonOptionId,
          addon_name_snapshot: a.name,
          price_delta_snapshot: a.priceDelta,
        })),
      );
      if (addonsError) {
        console.error('createOrder (order_item_addons insert) failed:', addonsError.message);
        // Not fatal to the whole order — the base item is already recorded.
      }
    }
  }

  return {
    success: true,
    order: {
      orderNumber: order.order_number,
      channel: input.channel,
      contactName: input.contactName,
      items: resolvedLines.map((line) => ({
        name: line.productName,
        variantName: line.variantName,
        addonNames: line.addons.map((a) => a.name),
        quantity: line.quantity,
        lineTotal:
          (line.unitPrice + line.addons.reduce((s, a) => s + a.priceDelta, 0)) * line.quantity,
      })),
      subtotal,
      deliveryFee,
      totalAmount,
      currency,
    },
  };
}
