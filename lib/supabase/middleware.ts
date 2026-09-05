import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request and enforces the /admin
 * route boundary. Full role-based authorization (which roles can do what inside
 * /admin) is layered on top in Step 4 — this establishes the session-refresh +
 * "must be logged in at all" gate for any /admin/* route.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginRoute = request.nextUrl.pathname.startsWith('/admin/login');

  if (isAdminRoute && !isAdminLoginRoute) {
    if (!user) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Coarse role check here for fast redirects on navigation. This is NOT the
    // only check — lib/auth/session.ts#requireRole() re-verifies server-side in
    // the admin layout and in every mutating Server Action, so a matcher gap
    // here can never be the sole thing standing between a request and a write.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    const allowedRoles = ['admin', 'staff', 'kitchen', 'bar'];
    if (!profile || !profile.is_active || !allowedRoles.includes(profile.role)) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
