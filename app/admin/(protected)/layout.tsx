import { requireRole, ADMIN_AREA_ROLES } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already redirected unauthenticated/wrong-role
  // requests before this ever renders, but every protected admin render (and
  // every Server Action) re-verifies here rather than trusting the matcher.
  const profile = await requireRole(ADMIN_AREA_ROLES);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={profile.role} />
      <main className="flex-1 bg-charcoal-900 px-8 py-8">{children}</main>
    </div>
  );
}
