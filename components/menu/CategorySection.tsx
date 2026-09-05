import { ProductCard } from '@/components/menu/ProductCard';
import type { ProductCardData } from '@/lib/database/products';

export function CategorySection({
  title,
  description,
  products,
  dark = false,
}: {
  title: string;
  description?: string | null;
  products: ProductCardData[];
  dark?: boolean;
}) {
  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-24">
      <h2 className={`font-display text-2xl ${dark ? 'text-cream-50' : 'text-charcoal-900'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-1 font-body text-sm ${dark ? 'text-cream-100/70' : 'text-charcoal-700'}`}>
          {description}
        </p>
      )}

      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p
          className={`mt-6 font-body text-sm ${dark ? 'text-cream-100/50' : 'text-charcoal-700/50'}`}
        >
          Nothing in this category yet — check back soon.
        </p>
      )}
    </section>
  );
}
