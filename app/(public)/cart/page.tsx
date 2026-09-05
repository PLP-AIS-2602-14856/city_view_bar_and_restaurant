import type { Metadata } from 'next';
import { Section, Container } from '@/components/layout/Container';
import { CartPageContent } from '@/components/cart/CartPageContent';
import { getRestaurantSettings } from '@/lib/database/settings';

export const metadata: Metadata = { title: 'Your Cart' };

export default async function CartPage() {
  const settings = await getRestaurantSettings();

  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-4xl">
        <h1 className="font-display text-4xl text-charcoal-900">Your Cart</h1>
        <div className="mt-8">
          <CartPageContent contactPhone={settings.phone} />
        </div>
      </Container>
    </Section>
  );
}
