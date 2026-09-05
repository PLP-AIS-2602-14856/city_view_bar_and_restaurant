import type { Metadata } from 'next';
import { CataloguePageContent } from '@/components/menu/CataloguePageContent';
import type { CatalogueSort } from '@/lib/database/products';

export const metadata: Metadata = { title: 'Bar Menu' };

export default function BarMenuPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; sort?: string };
}) {
  return (
    <CataloguePageContent
      rootSlug="bar"
      basePath="/bar"
      eyebrow="Bar"
      title="Wines, Cocktails & More"
      description="A serious wine list, signature cocktails, spirits, soft drinks and fresh juices."
      activeCategorySlug={searchParams.category}
      search={searchParams.q}
      sort={searchParams.sort as CatalogueSort | undefined}
      tone="dark"
    />
  );
}
