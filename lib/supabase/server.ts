import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Server-side Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Reads/writes the auth cookie via Next's `cookies()` API. Uses only the
 * public URL + publishable key — this respects Row Level Security as the signed-in
 * user, it does not bypass it.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component with no writable cookie store.
            // Safe to ignore when middleware is refreshing the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above.
          }
        },
      },
    },
  );
}

/**
 * Server-only admin client using the service-role key. Bypasses Row Level Security.
 * Import ONLY in trusted server contexts (Route Handlers / Server Actions) that have
 * already verified the caller's role. Never import from a Client Component file.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          /* no-op: admin client does not manage a user session */
        },
        remove() {
          /* no-op */
        },
      },
    },
  );
}
