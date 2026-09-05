import type { Metadata } from 'next';
import { Section, Container } from '@/components/layout/Container';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-4xl">
        <h1 className="font-display text-4xl text-charcoal-900">Checkout</h1>
        <div className="mt-8">
          <CheckoutForm />
        </div>
      </Container>
    </Section>
  );
}
