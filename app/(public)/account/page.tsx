import { requireCustomer } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/lib/auth/actions';
import { Section, Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import type { ProfileRow } from '@/types/database.types';

export default async function AccountPage() {
  const user = await requireCustomer();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, is_active, created_at, updated_at')
    .eq('id', user.id)
    .single<ProfileRow>();

  return (
    <Section className="min-h-[60vh]">
      <Container className="max-w-lg">
        <h1 className="font-display text-3xl text-charcoal-900">My Account</h1>
        <div className="mt-6 space-y-2 font-body text-sm text-charcoal-800">
          <p>
            <span className="text-charcoal-700">Name:</span> {profile?.full_name || '—'}
          </p>
          <p>
            <span className="text-charcoal-700">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-charcoal-700">Phone:</span> {profile?.phone || '—'}
          </p>
        </div>

        {/* Order history and reservation history are wired once those tables
            have customer-facing pages (Steps 11-13). */}

        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </Container>
    </Section>
  );
}
