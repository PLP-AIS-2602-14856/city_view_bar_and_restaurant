import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request and enforces the /admin
 * route boundary. Full role-based authorization (which roles can do what inside
 * /admin) is layered on top in Step 4 — this establishes the session-refresh +
 * "must be logged in at all" gate for any /admin/* route.
 *
 * This runs on nearly every request (see middleware.ts's matcher), so any
 * unhandled error here takes down the ENTIRE site, not just /admin — the whole
 * function body is wrapped in try/catch for exactly that reason. If Supabase
 * itself is misconfigured or unreachable, we deliberately fail OPEN (let the
 * request through) rather than crash: lib/auth/session.ts#requireRole() in the
 * admin layout re-verifies on every render, and Postgres RLS is the final
 * backstop regardless — this file is a fast-redirect convenience, never the
 * only thing standing between a request and a protected page.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Most common cause: environment variables were never added in the
      // hosting provider's project settings (.env.local is gitignored on
      // purpose, so a fresh deploy starts with none configured).
      console.error(
        'Supabase middleware: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
          'is not set. Add both in your hosting provider\u2019s project environment variables. ' +
          'Failing open (request allowed through) rather than crashing the whole site.',
      );
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

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

      // Coarse role check here for fast redirects on navigation. This is NOT
      // the only check — lib/auth/session.ts#requireRole() re-verifies
      // server-side in the admin layout and in every mutating Server Action,
      // so a matcher gap here can never be the sole thing standing between a
      // request and a write.
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
  } catch (error) {
    console.error('Supabase middleware crashed — failing open. Cause:', error);
    return response;
  }
}
