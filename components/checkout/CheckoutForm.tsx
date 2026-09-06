'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { cartItemLineTotal } from '@/lib/cart/types';
import { submitOrderAction } from '@/lib/checkout/actions';
import type { OrderConfirmation } from '@/lib/checkout/create-order';
import { formatPrice } from '@/lib/utilities/format';
import { FormField, Input, Textarea } from '@/components/ui/Form';
import { Button, buttonStyles } from '@/components/ui/Button';

const channels = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
] as const;

export function CheckoutForm() {
  const { items, subtotal, isHydrated, clearCart } = useCart();
  const [channel, setChannel] = useState<(typeof channels)[number]['value']>('dine_in');
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [isPending, startTransition] = useTransition();

  if (confirmation) {
    return (
      <div className="rounded-md border border-gold-500/30 bg-gold-500/5 p-6">
        <p className="font-display text-xl text-charcoal-900">
          Order {confirmation.orderNumber} placed
        </p>
        <p className="mt-1 font-body text-sm text-charcoal-700">
          Thank you, {confirmation.contactName}. We’ve received your order.
        </p>

        <ul className="mt-5 space-y-1.5">
          {confirmation.items.map((item, i) => (
            <li key={i} className="flex justify-between font-body text-sm text-charcoal-800">
              <span>
                {item.quantity} × {item.name}
                {item.variantName ? ` (${item.variantName})` : ''}
                {item.addonNames.length > 0 ? ` — ${item.addonNames.join(', ')}` : ''}
              </span>
              <span>{formatPrice(item.lineTotal, confirmation.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-charcoal-900/10 pt-3 font-body text-sm">
          <div className="flex justify-between text-charcoal-700">
            <span>Subtotal</span>
            <span>{formatPrice(confirmation.subtotal, confirmation.currency)}</span>
          </div>
          {confirmation.deliveryFee > 0 && (
            <div className="flex justify-between text-charcoal-700">
              <span>Delivery</span>
              <span>{formatPrice(confirmation.deliveryFee, confirmation.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-charcoal-900">
            <span>Total</span>
            <span>{formatPrice(confirmation.totalAmount, confirmation.currency)}</span>
          </div>
        </div>

        <p className="mt-5 font-body text-xs text-charcoal-700/70">
          Save your order number — staff can look up your order with it.
        </p>
        <Link href="/restaurant" className={`${buttonStyles({ variant: 'outline' })} mt-5 inline-flex`}>
          Back to Menu
        </Link>
      </div>
    );
  }

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="font-body text-charcoal-700">Your cart is empty.</p>
        <Link href="/restaurant" className={`${buttonStyles({ variant: 'solid' })} mt-6 inline-flex`}>
          Browse the Menu
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload = {
      channel,
      tableNumber: String(formData.get('tableNumber') ?? ''),
      deliveryLine1: String(formData.get('deliveryLine1') ?? ''),
      deliveryArea: String(formData.get('deliveryArea') ?? ''),
      deliveryNotes: String(formData.get('deliveryNotes') ?? ''),
      contactName: String(formData.get('contactName') ?? ''),
      contactPhone: String(formData.get('contactPhone') ?? ''),
      contactEmail: String(formData.get('contactEmail') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        addonOptionIds: item.addons.map((a) => a.addonOptionId),
        quantity: item.quantity,
      })),
    };

    startTransition(async () => {
      const result = await submitOrderAction(payload);
      if (result.success) {
        setConfirmation(result.order);
        clearCart();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-1.5 font-body text-sm font-medium text-charcoal-800">Order type</p>
          <div className="flex gap-2">
            {channels.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChannel(c.value)}
                className={`rounded-full px-4 py-2 font-body text-sm ${
                  channel === c.value
                    ? 'bg-charcoal-950 text-cream-50'
                    : 'bg-charcoal-900/5 text-charcoal-800 hover:bg-charcoal-900/10'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {channel === 'dine_in' && (
          <FormField label="Table number (if known)" htmlFor="tableNumber">
            <Input id="tableNumber" name="tableNumber" placeholder="e.g. 12" />
          </FormField>
        )}

        {channel === 'delivery' && (
          <>
            <FormField label="Delivery address" htmlFor="deliveryLine1">
              <Input id="deliveryLine1" name="deliveryLine1" required />
            </FormField>
            <FormField label="Area / neighborhood" htmlFor="deliveryArea">
              <Input id="deliveryArea" name="deliveryArea" />
            </FormField>
            <FormField label="Delivery notes (optional)" htmlFor="deliveryNotes">
              <Input id="deliveryNotes" name="deliveryNotes" placeholder="Gate code, landmark, etc." />
            </FormField>
          </>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Your name" htmlFor="contactName">
            <Input id="contactName" name="contactName" autoComplete="name" required />
          </FormField>
          <FormField label="Phone" htmlFor="contactPhone">
            <Input id="contactPhone" name="contactPhone" type="tel" autoComplete="tel" required />
          </FormField>
        </div>

        <FormField label="Email (optional)" htmlFor="contactEmail">
          <Input id="contactEmail" name="contactEmail" type="email" autoComplete="email" />
        </FormField>

        <FormField label="Order notes (optional)" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={2} placeholder="Allergies, preferences, etc." />
        </FormField>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Placing order…' : 'Place Order'}
        </Button>
        <p className="font-body text-xs text-charcoal-700/60">
          Online payment is coming soon — orders are settled in person, by phone,
          or on delivery for now.
        </p>
      </form>

      <aside className="h-fit rounded-md border border-charcoal-900/10 p-5">
        <p className="font-body text-sm font-medium text-charcoal-900">Order Summary</p>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between font-body text-sm text-charcoal-700">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatPrice(cartItemLineTotal(item), item.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-charcoal-900/10 pt-3 font-body text-sm font-medium text-charcoal-900">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, items[0]?.currency ?? 'KES')}</span>
        </div>
        <p className="mt-1 font-body text-xs text-charcoal-700/60">
          Delivery fee and tax, if any, are added after you submit.
        </p>
      </aside>
    </div>
  );
}
