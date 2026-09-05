'use server';

import { createOrder, type CreateOrderResult } from '@/lib/checkout/create-order';

export async function submitOrderAction(rawInput: unknown): Promise<CreateOrderResult> {
  // Once the admin Orders/Inventory dashboards exist (later steps), add
  // revalidatePath() calls here for their real routes so a freshly placed
  // order/stock change shows up immediately without a manual refresh.
  return createOrder(rawInput);
}
