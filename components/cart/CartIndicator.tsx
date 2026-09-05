'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';

export function CartIndicator() {
  const { itemCount, isHydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`View cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
      className="relative font-body text-sm text-cream-100/85 hover:text-gold-300"
    >
      Cart
      {/* Only render the badge once hydrated, so the server-rendered "0 items"
          state never visibly flashes before the real saved count appears. */}
      {isHydrated && itemCount > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-charcoal-950">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
