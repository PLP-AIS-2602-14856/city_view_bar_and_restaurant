import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Browser-side Supabase client. Only ever uses the public URL + publishable key.
 * Never import the service-role key here — this file is bundled into client code.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
