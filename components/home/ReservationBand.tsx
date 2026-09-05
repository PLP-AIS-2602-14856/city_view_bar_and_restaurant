import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { buttonStyles } from '@/components/ui/Button';

export function ReservationBand() {
  return (
    <section className="bg-wine-700 py-16 text-cream-50">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl italic">Save your table for tonight.</h2>
          <p className="mt-2 max-w-md font-body text-sm text-cream-50/80">
            Dine-in, private groups, or a spot at the bar — we'll have it ready.
          </p>
        </div>
        <Link
          href="/reservations"
          className={buttonStyles({
            variant: 'solid',
            size: 'lg',
            className: 'bg-cream-50 text-wine-800 hover:bg-cream-100',
          })}
        >
          Reserve a Table
        </Link>
      </Container>
    </section>
  );
}
