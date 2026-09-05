import type { Metadata } from 'next';
import { CataloguePageContent } from '@/components/menu/CataloguePageContent';
import type { CatalogueSort } from '@/lib/database/products';

export const metadata: Metadata = { title: 'Restaurant Menu' };

export default function RestaurantMenuPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; sort?: string };
}) {
  return (
    <CataloguePageContent
      rootSlug="restaurant"
      basePath="/restaurant"
      eyebrow="Restaurant"
      title="The Kitchen Menu"
      description="Char-grilled classics and comfort favourites, made to order and served all day."
      activeCategorySlug={searchParams.category}
      search={searchParams.q}
      sort={searchParams.sort as CatalogueSort | undefined}
      tone="light"
    />
  );
}
