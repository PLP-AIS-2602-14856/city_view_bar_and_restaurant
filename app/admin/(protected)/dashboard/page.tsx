import { requireRole, ADMIN_AREA_ROLES } from '@/lib/auth/session';

export default async function AdminDashboardPage() {
  const profile = await requireRole(ADMIN_AREA_ROLES);

  return (
    <div>
      <h1 className="font-display text-2xl text-cream-50">
        Welcome, {profile.full_name || 'there'}
      </h1>
      <p className="mt-2 font-body text-sm text-cream-100/60">
        Signed in as <span className="capitalize">{profile.role}</span>. Operational
        widgets (today's orders, pending reservations, low-stock alerts) arrive with
        the Orders/Inventory build steps.
      </p>
    </div>
  );
}
