import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { listAllCategories } from '@/lib/admin/categories';
import { buttonStyles } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default async function AdminCategoriesPage() {
  await requireRole(['admin', 'staff']);
  const categories = await listAllCategories();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream-50">Categories</h1>
        <Link href="/admin/categories/new" className={buttonStyles({ variant: 'solid', size: 'sm' })}>
          Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 font-body text-sm text-cream-100/60">
          No categories yet — add the first one to start building the menu.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-cream-50/10">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-cream-50/10 text-cream-100/60">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Parent</th>
                <th className="px-4 py-3 font-normal">Product Type</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-cream-50/5 text-cream-100/90">
                  <td className="px-4 py-3">
                    <p className="font-medium text-cream-50">{c.name}</p>
                    <p className="text-xs text-cream-100/50">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3">{c.parentName ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.productType ? <Badge tone="gold" dark>{c.productType}</Badge> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isActive ? 'success' : 'neutral'} dark>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{c.displayOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categories/${c.id}`} className="text-gold-400 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
