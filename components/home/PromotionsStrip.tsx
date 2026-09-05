import Link from 'next/link';
import { Section, Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import type { PromotionCardData } from '@/lib/database/promotions';

function promotionValueLabel(promo: PromotionCardData) {
  if (promo.promotionType === 'percentage_discount' && promo.discountValue) {
    return `${promo.discountValue}% off`;
  }
  if (promo.promotionType === 'fixed_discount' && promo.discountValue) {
    return `KES ${promo.discountValue} off`;
  }
  if (promo.promotionType === 'bundle') return 'Bundle offer';
  return 'Featured';
}

export function PromotionsStrip({ promotions }: { promotions: PromotionCardData[] }) {
  if (promotions.length === 0) return null;

  return (
    <Section>
      <Container>
        <p className="font-body text-sm text-gold-700">Right now</p>
        <h2 className="mt-2 font-display text-3xl text-charcoal-900">Current Promotions</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {promotions.map((promo) => (
            <Link
              key={promo.id}
              href={`/promotions#${promo.slug}`}
              className="block rounded-md border border-charcoal-900/10 p-6 transition-colors hover:border-gold-500/60"
            >
              <Badge tone="gold">{promotionValueLabel(promo)}</Badge>
              <h3 className="mt-4 font-display text-xl text-charcoal-900">{promo.title}</h3>
              {promo.description && (
                <p className="mt-2 line-clamp-2 font-body text-sm text-charcoal-700">
                  {promo.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
