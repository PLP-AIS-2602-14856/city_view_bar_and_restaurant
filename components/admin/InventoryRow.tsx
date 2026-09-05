'use client';

import { useState, useTransition } from 'react';
import {
  enableTrackingAction,
  disableTrackingAction,
  reenableTrackingAction,
  adjustStockAction,
  updateReorderThresholdAction,
} from '@/lib/admin/inventory-actions';
import { Badge } from '@/components/ui/Badge';
import type { InventoryOverviewRow } from '@/lib/admin/inventory';

export function InventoryRow({ row }: { row: InventoryOverviewRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isLowStock = row.inventoryId && row.trackInventory && row.quantityOnHand <= row.reorderThreshold;

  function runAction(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  // Not tracked yet — offer to enable it.
  if (!row.inventoryId) {
    return (
      <tr className="border-b border-cream-50/5 text-cream-100/90">
        <td className="px-4 py-3 font-medium text-cream-50">{row.productName}</td>
        <td className="px-4 py-3">{row.categoryName ?? '—'}</td>
        <td colSpan={3} className="px-4 py-3">
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              runAction(() => enableTrackingAction(row.productId, fd));
            }}
          >
            <input
              type="number"
              name="quantityOnHand"
              min={0}
              defaultValue={0}
              placeholder="Starting qty"
              className="w-28 rounded border border-cream-50/20 bg-transparent px-2 py-1 text-xs text-cream-50 placeholder:text-cream-100/40"
            />
            <input
              type="number"
              name="reorderThreshold"
              min={0}
              defaultValue={0}
              placeholder="Reorder at"
              className="w-24 rounded border border-cream-50/20 bg-transparent px-2 py-1 text-xs text-cream-50 placeholder:text-cream-100/40"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gold-500 px-3 py-1 text-xs font-medium text-charcoal-950 disabled:opacity-50"
            >
              {isPending ? 'Enabling…' : 'Enable Tracking'}
            </button>
          </form>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-cream-50/5 text-cream-100/90 align-top">
      <td className="px-4 py-3 font-medium text-cream-50">{row.productName}</td>
      <td className="px-4 py-3">{row.categoryName ?? '—'}</td>

      <td className="px-4 py-3">
        {!row.trackInventory ? (
          <Badge tone="neutral" dark>
            Tracking off
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-cream-50">{row.quantityOnHand}</span>
            <span className="text-cream-100/50">in stock</span>
            {isLowStock && (
              <Badge tone="warning" dark>
                Low stock
              </Badge>
            )}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            runAction(() => updateReorderThresholdAction(row.inventoryId!, fd));
          }}
        >
          <input
            type="number"
            name="reorderThreshold"
            min={0}
            defaultValue={row.reorderThreshold}
            className="w-16 rounded border border-cream-50/20 bg-transparent px-2 py-1 text-xs text-cream-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="text-xs text-gold-400 hover:underline disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </td>

      <td className="px-4 py-3">
        {row.trackInventory ? (
          <div className="space-y-1.5">
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                runAction(() => adjustStockAction(row.inventoryId!, fd));
              }}
            >
              <input
                type="number"
                name="changeQty"
                placeholder="±qty"
                className="w-16 rounded border border-cream-50/20 bg-transparent px-2 py-1 text-xs text-cream-50 placeholder:text-cream-100/40"
              />
              <select
                name="reason"
                className="rounded border border-cream-50/20 bg-charcoal-900 px-1.5 py-1 text-xs text-cream-50"
              >
                <option value="manual_restock">Restock</option>
                <option value="wastage">Wastage</option>
                <option value="correction">Correction</option>
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-cream-50/10 px-3 py-1 text-xs text-cream-100 hover:bg-cream-50/20 disabled:opacity-50"
              >
                Adjust
              </button>
            </form>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => disableTrackingAction(row.inventoryId!))}
              className="text-xs text-cream-100/50 underline hover:text-cream-100/80"
            >
              Disable tracking
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => reenableTrackingAction(row.inventoryId!))}
            className="rounded-full bg-cream-50/10 px-3 py-1 text-xs text-cream-100 hover:bg-cream-50/20 disabled:opacity-50"
          >
            Re-enable
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </td>
    </tr>
  );
}
