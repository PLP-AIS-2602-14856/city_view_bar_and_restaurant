import Link from 'next/link';
import { Section, Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/menu/ProductCard';
import { buttonStyles } from '@/components/ui/Button';
import type { ProductCardData } from '@/lib/database/products';

export function FeaturedProductsSection({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  viewAllLabel,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: ProductCardData[];
  viewAllHref: string;
  viewAllLabel: string;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';

  return (
    <Section tone={tone}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <p className={`font-body text-sm ${isDark ? 'text-gold-300' : 'text-gold-700'}`}>
              {eyebrow}
            </p>
            <h2
              className={`mt-2 font-display text-3xl ${isDark ? 'text-cream-50' : 'text-charcoal-900'}`}
            >
              {title}
            </h2>
            <p
              className={`mt-3 font-body text-sm ${isDark ? 'text-cream-100/75' : 'text-charcoal-700'}`}
            >
              {description}
            </p>
          </div>
          <Link
            href={viewAllHref}
            className={buttonStyles({
              variant: 'outline',
              size: 'sm',
              className: isDark
                ? 'border-cream-50/30 text-cream-50 hover:bg-cream-50 hover:text-charcoal-950'
                : undefined,
            })}
          >
            {viewAllLabel}
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p
            className={`mt-10 font-body text-sm ${isDark ? 'text-cream-100/60' : 'text-charcoal-700/60'}`}
          >
            The menu is being set up — check back shortly.
          </p>
        )}
      </Container>
    </Section>
  );
}
