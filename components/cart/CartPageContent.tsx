'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { cartItemLineTotal } from '@/lib/cart/types';
import { getProductImageUrl } from '@/lib/utilities/storage';
import { formatPrice } from '@/lib/utilities/format';
import { buttonStyles } from '@/components/ui/Button';

export function CartPageContent({ contactPhone }: { contactPhone: string | null }) {
  const { items, subtotal, isHydrated, updateQuantity, removeItem } = useCart();

  // Avoid rendering "your cart is empty" for a split second before the saved
  // cart has loaded from localStorage — show nothing until hydration settles.
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

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.lineId}
            className="flex gap-4 border-b border-charcoal-900/10 pb-4"
          >
            {item.primaryImagePath ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
                <Image
                  src={getProductImageUrl(item.primaryImagePath)}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-charcoal-900/5">
                <span className="font-display text-xl italic text-charcoal-700/40">
                  {item.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/menu/${item.slug}`} className="font-body font-medium text-charcoal-900 hover:text-gold-700">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="font-body text-xs text-charcoal-700/70">{item.variantName}</p>
                  )}
                  {item.addons.length > 0 && (
                    <p className="font-body text-xs text-charcoal-700/70">
                      {item.addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className="whitespace-nowrap font-body text-sm font-medium text-charcoal-900">
                  {formatPrice(cartItemLineTotal(item), item.currency)}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center rounded border border-charcoal-900/15">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                    className="px-2.5 py-1 text-charcoal-700 hover:text-charcoal-900"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-body text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                    className="px-2.5 py-1 text-charcoal-700 hover:text-charcoal-900"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineId)}
                  className="font-body text-xs text-charcoal-700/70 underline hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-md border border-charcoal-900/10 p-5">
        <div className="flex justify-between font-body text-sm text-charcoal-700">
          <span>Subtotal</span>
          <span className="font-medium text-charcoal-900">
            {formatPrice(subtotal, items[0]?.currency ?? 'KES')}
          </span>
        </div>
        <p className="mt-1 font-body text-xs text-charcoal-700/60">
          Delivery fee and tax, if any, are calculated at checkout.
        </p>

        {/* Checkout is now built (Step 12) — payment integration itself is
            still a future step, and CheckoutForm says so plainly. */}
        <Link href="/checkout" className={`${buttonStyles({ variant: 'solid' })} mt-5 flex w-full justify-center`}>
          Proceed to Checkout
        </Link>
        {contactPhone && (
          <p className="mt-3 text-center font-body text-xs text-charcoal-700/60">
            Prefer to order by phone? Call {contactPhone}.
          </p>
        )}
      </aside>
    </div>
  );
}
