import { Section, Container } from '@/components/layout/Container';
import type { RestaurantSettings } from '@/lib/database/settings';

const dayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
const dayLabel: Record<(typeof dayOrder)[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function LocationHours({ settings }: { settings: RestaurantSettings }) {
  return (
    <Section tone="dark">
      <Container className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="font-body text-sm text-gold-300">Find us</p>
          <h2 className="mt-2 font-display text-3xl text-cream-50">Visit City View</h2>
          <div className="mt-6 space-y-1 font-body text-sm text-cream-100/75">
            <p>{settings.address?.line1 || 'Address to be confirmed'}</p>
            <p>
              {[settings.address?.city, settings.address?.country].filter(Boolean).join(', ') ||
                'Nairobi, Kenya'}
            </p>
            <p className="mt-4">{settings.phone || 'Phone number coming soon'}</p>
            <p>{settings.email || 'Email coming soon'}</p>
          </div>
        </div>

        <div>
          <p className="font-body text-sm text-gold-300">Hours</p>
          <dl className="mt-2 space-y-1.5 font-body text-sm text-cream-100/75">
            {dayOrder.map((day) => (
              <div key={day} className="flex justify-between border-b border-cream-50/5 py-1.5">
                <dt>{dayLabel[day]}</dt>
                <dd>{settings.openingHours?.[day] ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
