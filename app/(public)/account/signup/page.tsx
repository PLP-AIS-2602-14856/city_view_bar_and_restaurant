import Link from 'next/link';
import { Section, Container } from '@/components/layout/Container';
import { SignupForm } from '@/components/account/SignupForm';

export default function AccountSignupPage() {
  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-sm">
        <h1 className="font-display text-3xl text-charcoal-900">Create your account</h1>
        <p className="mt-2 font-body text-sm text-charcoal-700">
          Order faster and track reservations by creating a City View account.
        </p>

        <div className="mt-8">
          <SignupForm />
        </div>

        <p className="mt-6 font-body text-sm text-charcoal-700">
          Already have an account?{' '}
          <Link href="/account/login" className="text-gold-700 underline">
            Sign in
          </Link>
        </p>
      </Container>
    </Section>
  );
}
