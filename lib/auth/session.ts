import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole, ProfileRow } from '@/types/database.types';

/** The management roles allowed anywhere under /admin. */
export const ADMIN_AREA_ROLES: UserRole[] = ['admin', 'staff', 'kitchen', 'bar'];

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Fetches the signed-in user's profile (role, name, phone), or null if signed out. */
export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, is_active, created_at, updated_at')
    .eq('id', user.id)
    .single<ProfileRow>();

  return profile;
}

/**
 * Server Component / Server Action guard: redirects if the signed-in user's role
 * isn't in `allowedRoles`. Defense-in-depth alongside the middleware check —
 * middleware handles the coarse "logged in at all" gate and role redirect for
 * page navigation; call this again at the top of admin layouts/Server Actions so
 * a mutation is never reachable purely because a route matcher was missed.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/admin/login');
  }
  if (!allowedRoles.includes(profile.role)) {
    redirect('/admin/login?error=unauthorized');
  }

  return profile;
}

/** Server Component guard for customer-only pages, e.g. /account. */
export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/account/login');
  }
  return user;
}
