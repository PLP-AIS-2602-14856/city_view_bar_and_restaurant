import Link from 'next/link';
import { adminSignOutAction } from '@/lib/auth/actions';
import type { UserRole } from '@/types/database.types';

const links: { href: string; label: string; roles: UserRole[] }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', roles: ['admin', 'staff', 'kitchen', 'bar'] },
  { href: '/admin/menu', label: 'Menu Management', roles: ['admin', 'staff'] },
  { href: '/admin/drinks', label: 'Drinks Management', roles: ['admin', 'staff'] },
  { href: '/admin/categories', label: 'Categories', roles: ['admin', 'staff'] },
  { href: '/admin/inventory', label: 'Inventory', roles: ['admin', 'staff'] },
  { href: '/admin/orders', label: 'Orders', roles: ['admin', 'staff', 'kitchen', 'bar'] },
  { href: '/admin/reservations', label: 'Reservations', roles: ['admin', 'staff'] },
  { href: '/admin/promotions', label: 'Promotions', roles: ['admin', 'staff'] },
  { href: '/admin/gallery', label: 'Gallery', roles: ['admin', 'staff'] },
  { href: '/admin/customers', label: 'Customers', roles: ['admin'] },
  { href: '/admin/staff', label: 'Staff & Permissions', roles: ['admin'] },
  { href: '/admin/settings', label: 'Restaurant Settings', roles: ['admin'] },
];

export function AdminSidebar({ role }: { role: UserRole }) {
  const visibleLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-cream-50/10 bg-charcoal-950 px-4 py-6">
      <Link href="/admin/dashboard" className="px-2 font-display text-lg italic text-gold-300">
        City View Admin
      </Link>

      <nav className="mt-8 flex-1">
        <ul className="space-y-0.5">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded px-2 py-2 font-body text-sm text-cream-100/80 hover:bg-cream-50/5 hover:text-cream-50"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form action={adminSignOutAction}>
        <button
          type="submit"
          className="w-full rounded px-2 py-2 text-left font-body text-sm text-cream-100/60 hover:bg-cream-50/5 hover:text-cream-50"
        >
          Sign Out
        </button>
      </form>
    </aside>
  );
}
