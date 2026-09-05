import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityToggle } from '@/components/admin/AvailabilityToggle';
import { formatPrice } from '@/lib/utilities/format';
import type { AdminProductListItem } from '@/lib/admin/products';

export function ProductListTable({
  products,
  editBasePath,
  showTypeColumn = false,
}: {
  products: AdminProductListItem[];
  editBasePath: string;
  showTypeColumn?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="mt-8 font-body text-sm text-cream-100/60">
        Nothing here yet — add the first item to start building this menu.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-md border border-cream-50/10">
      <table className="w-full text-left font-body text-sm">
        <thead>
          <tr className="border-b border-cream-50/10 text-cream-100/60">
            <th className="px-4 py-3 font-normal">Name</th>
            <th className="px-4 py-3 font-normal">Category</th>
            {showTypeColumn && <th className="px-4 py-3 font-normal">Type</th>}
            <th className="px-4 py-3 font-normal">Price</th>
            <th className="px-4 py-3 font-normal">Availability</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-cream-50/5 text-cream-100/90">
              <td className="px-4 py-3 font-medium text-cream-50">{p.name}</td>
              <td className="px-4 py-3">{p.categoryName ?? '—'}</td>
              {showTypeColumn && (
                <td className="px-4 py-3">
                  <Badge tone="gold" dark>
                    {p.productType.replace('_', ' ')}
                  </Badge>
                </td>
              )}
              <td className="px-4 py-3">{formatPrice(p.basePrice, p.currency)}</td>
              <td className="px-4 py-3">
                <AvailabilityToggle
                  productId={p.id}
                  isAvailable={p.isAvailable}
                  redirectTo={editBasePath}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  {!p.isPublished && (
                    <Badge tone="neutral" dark>
                      Draft
                    </Badge>
                  )}
                  {p.isFeatured && (
                    <Badge tone="wine" dark>
                      Featured
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`${editBasePath}/${p.id}`} className="text-gold-400 hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
