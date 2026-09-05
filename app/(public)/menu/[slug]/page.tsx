import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Section, Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { AddToCartForm } from '@/components/cart/AddToCartForm';
import { getProductBySlug } from '@/lib/database/products';
import { getProductImageUrl } from '@/lib/utilities/storage';
import { formatPrice } from '@/lib/utilities/format';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return { title: product?.name ?? 'Product not found' };
}

const isDrinkType = (t: string) => t !== 'food';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const drink = isDrinkType(product.productType);
  const catalogueBasePath = drink ? '/bar' : '/restaurant';
  const catalogueLabel = drink ? 'Bar Menu' : 'Restaurant Menu';

  const attrs = product.attributes as Record<string, unknown>;
  const spiceLevel = typeof attrs.spice_level === 'string' ? attrs.spice_level : null;
  const abv = typeof attrs.abv_percentage === 'number' ? attrs.abv_percentage : null;
  const varietal = typeof attrs.varietal === 'string' ? attrs.varietal : null;
  const origin = typeof attrs.origin === 'string' ? attrs.origin : null;
  const allergens = Array.isArray(attrs.allergens) ? (attrs.allergens as string[]) : [];

  return (
    <Section className="min-h-[70vh]">
      <Container>
        <Link
          href={catalogueBasePath}
          className="font-body text-sm text-charcoal-700 hover:text-gold-700"
        >
          ← {catalogueLabel}
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div>
            {product.images.length > 0 ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image
                  src={getProductImageUrl(product.images[0].storagePath)}
                  alt={product.images[0].altText ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 45vw, 100vw"
                  priority
                />
              </div>
            ) : (
              <div
                className={`flex aspect-[4/3] items-center justify-center rounded-md ${
                  drink
                    ? 'bg-gradient-to-br from-wine-700 to-wine-900'
                    : 'bg-gradient-to-br from-charcoal-700 to-charcoal-900'
                }`}
              >
                <span className="font-display text-6xl italic text-cream-50/40">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img) => (
                  <div key={img.storagePath} className="relative aspect-square overflow-hidden rounded">
                    <Image
                      src={getProductImageUrl(img.storagePath)}
                      alt={img.altText ?? product.name}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.categoryName && (
              <p className="font-body text-sm text-charcoal-700/60">{product.categoryName}</p>
            )}
            <h1 className="mt-1 font-display text-3xl text-charcoal-900">{product.name}</h1>

            <div className="mt-3 flex flex-wrap gap-2">
              {spiceLevel && <Badge tone="warning">Spice: {spiceLevel}</Badge>}
              {abv !== null && <Badge tone="wine">{abv}% ABV</Badge>}
              {varietal && <Badge tone="gold">{varietal}</Badge>}
              {origin && <Badge tone="neutral">{origin}</Badge>}
              {allergens.map((a) => (
                <Badge key={a} tone="danger">
                  Contains {a}
                </Badge>
              ))}
            </div>

            {product.description && (
              <p className="mt-5 font-body text-base leading-relaxed text-charcoal-800">
                {product.description}
              </p>
            )}

            <p className="mt-6 font-display text-2xl text-charcoal-900">
              {formatPrice(product.basePrice, product.currency)}
            </p>

            <AddToCartForm product={product} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
