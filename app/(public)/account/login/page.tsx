import Link from 'next/link';
import { Section, Container } from '@/components/layout/Container';
import { LoginForm } from '@/components/account/LoginForm';

export default function AccountLoginPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string };
}) {
  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-sm">
        <h1 className="font-display text-3xl text-charcoal-900">Welcome back</h1>
        <p className="mt-2 font-body text-sm text-charcoal-700">
          Sign in to view your orders and reservations.
        </p>

        <div className="mt-8">
          <LoginForm redirectedFrom={searchParams.redirectedFrom} />
        </div>

        <p className="mt-6 font-body text-sm text-charcoal-700">
          New to City View?{' '}
          <Link href="/account/signup" className="text-gold-700 underline">
            Create an account
          </Link>
        </p>
      </Container>
    </Section>
  );
}
