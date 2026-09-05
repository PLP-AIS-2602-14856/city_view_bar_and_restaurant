import type { Metadata } from 'next';
import { Section, Container } from '@/components/layout/Container';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { getRestaurantSettings } from '@/lib/database/settings';

export const metadata: Metadata = { title: 'Reservations' };

export default async function ReservationsPage() {
  const settings = await getRestaurantSettings();

  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-xl">
        <p className="font-body text-sm text-gold-700">Reservations</p>
        <h1 className="mt-2 font-display text-4xl text-charcoal-900">Reserve a Table</h1>
        <p className="mt-3 font-body text-sm text-charcoal-700">
          Tell us when you'd like to visit and we'll confirm your table.
          {settings.phone && ` For same-day or urgent requests, call us at ${settings.phone}.`}
        </p>

        <div className="mt-8">
          <ReservationForm />
        </div>
      </Container>
    </Section>
  );
}
