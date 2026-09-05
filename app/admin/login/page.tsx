import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-body text-sm text-gold-300">City View</p>
        <h1 className="mt-1 font-display text-3xl text-cream-50">Admin Sign In</h1>
        <p className="mt-2 font-body text-sm text-cream-100/70">
          Restricted to authorized City View staff.
        </p>

        {searchParams.error === 'unauthorized' && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            Your account does not have access to the admin area.
          </p>
        )}

        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
