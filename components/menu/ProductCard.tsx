import Image from 'next/image';
import Link from 'next/link';
import { getProductImageUrl } from '@/lib/utilities/storage';
import { formatPrice } from '@/lib/utilities/format';
import { cardClassName, CardBody } from '@/components/ui/Card';
import type { ProductCardData } from '@/lib/database/products';

const accentByFamily: Record<'food' | 'drink', string> = {
  food: 'border-t-gold-500',
  drink: 'border-t-wine-500',
};

function isDrink(type: ProductCardData['productType']) {
  return type !== 'food';
}

/**
 * When a product has no uploaded photograph yet, this renders a designed tile
 * (monogram + gradient wash in the product family's accent color) instead of a
 * stock photo — real photography gets swapped in automatically the moment an
 * admin uploads a product image.
 */
function ImageFallback({ name, drink }: { name: string; drink: boolean }) {
  return (
    <div
      className={`flex aspect-[4/3] items-center justify-center ${
        drink
          ? 'bg-gradient-to-br from-wine-700 to-wine-900'
          : 'bg-gradient-to-br from-charcoal-700 to-charcoal-900'
      }`}
    >
      <span className="font-display text-4xl italic text-cream-50/40">
        {name.charAt(0)}
      </span>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const drink = isDrink(product.productType);

  return (
    <Link
      href={`/menu/${product.slug}`}
      className={cardClassName({
        className: `block overflow-hidden border-t-2 transition-shadow hover:shadow-card ${accentByFamily[drink ? 'drink' : 'food']}`,
      })}
    >
      {product.primaryImagePath ? (
        <div className="relative aspect-[4/3]">
          <Image
            src={getProductImageUrl(product.primaryImagePath)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </div>
      ) : (
        <ImageFallback name={product.name} drink={drink} />
      )}

      <CardBody>
        {product.categoryName && (
          <p className="font-body text-xs text-charcoal-700/60">{product.categoryName}</p>
        )}
        <h3 className="mt-1 font-display text-lg text-charcoal-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 font-body text-sm text-charcoal-700">
            {product.description}
          </p>
        )}
        <p className="mt-3 font-body text-sm font-medium text-charcoal-900">
          {formatPrice(product.basePrice, product.currency)}
        </p>
      </CardBody>
    </Link>
  );
}
