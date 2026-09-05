import { requireRole } from '@/lib/auth/session';
import { listInventoryOverview } from '@/lib/admin/inventory';
import { InventoryRow } from '@/components/admin/InventoryRow';

export default async function AdminInventoryPage() {
  await requireRole(['admin', 'staff']);
  const rows = await listInventoryOverview();

  const lowStockCount = rows.filter(
    (r) => r.inventoryId && r.trackInventory && r.quantityOnHand <= r.reorderThreshold,
  ).length;

  return (
    <div>
      <h1 className="font-display text-2xl text-cream-50">Inventory</h1>
      <p className="mt-1 font-body text-sm text-cream-100/60">
        Tracking is opt-in per item — most food is made to order and doesn't need
        stock counts. Enable it for anything with a finite count (bottled drinks,
        limited-run specials, etc.).
        {lowStockCount > 0 &&
          ` ${lowStockCount} item${lowStockCount === 1 ? ' is' : 's are'} at or below its reorder point.`}
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 font-body text-sm text-cream-100/60">
          No products yet — add items in Menu or Drinks Management first.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-cream-50/10">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-cream-50/10 text-cream-100/60">
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal">Reorder at</th>
                <th className="px-4 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <InventoryRow key={row.productId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
