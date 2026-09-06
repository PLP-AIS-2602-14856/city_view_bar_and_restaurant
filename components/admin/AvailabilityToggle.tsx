'use client';

import { useTransition } from 'react';
import { toggleProductAvailabilityAction } from '@/lib/admin/products-actions';

export function AvailabilityToggle({
  productId,
  isAvailable,
  redirectTo,
}: {
  productId: string;
  isAvailable: boolean;
  redirectTo: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleProductAvailabilityAction(productId, !isAvailable, redirectTo);
        })
      }
      className={`rounded-full px-2.5 py-1 font-body text-xs disabled:opacity-50 ${
        isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cream-50/10 text-cream-100/70'
      }`}
    >
      {isPending ? '…' : isAvailable ? 'Available' : 'Unavailable'}
    </button>
  );
}
