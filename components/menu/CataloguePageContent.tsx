import { Section, Container } from '@/components/layout/Container';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { CategorySection } from '@/components/menu/CategorySection';
import { SearchBar } from '@/components/menu/SearchBar';
import { SortSelect } from '@/components/menu/SortSelect';
import { getCatalogueRoot } from '@/lib/database/categories';
import { getProductsByCategoryIds, type CatalogueSort } from '@/lib/database/products';

export async function CataloguePageContent({
  rootSlug,
  basePath,
  eyebrow,
  title,
  description,
  activeCategorySlug,
  search,
  sort,
  tone = 'light',
}: {
  rootSlug: string;
  basePath: string;
  eyebrow: string;
  title: string;
  description: string;
  activeCategorySlug?: string;
  search?: string;
  sort?: CatalogueSort;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const root = await getCatalogueRoot(rootSlug);

  if (!root || root.children.length === 0) {
    return (
      <Section tone={tone} className="min-h-[50vh]">
        <Container>
          <p className={`font-body text-sm ${dark ? 'text-gold-300' : 'text-gold-700'}`}>
            {eyebrow}
          </p>
          <h1 className={`mt-2 font-display text-4xl ${dark ? 'text-cream-50' : 'text-charcoal-900'}`}>
            {title}
          </h1>
          <p className={`mt-6 font-body text-sm ${dark ? 'text-cream-100/70' : 'text-charcoal-700'}`}>
            This menu is still being set up in Admin. Check back shortly.
          </p>
        </Container>
      </Section>
    );
  }

  const activeCategory = activeCategorySlug
    ? root.children.find((c) => c.slug === activeCategorySlug)
    : undefined;

  // Filtered view: only fetch/render the one selected category.
  // Unfiltered view: fetch every child category's products in one query, then
  // group in memory — avoids N sequential round-trips for an N-category menu.
  const categoriesToRender = activeCategory ? [activeCategory] : root.children;
  const allProducts = await getProductsByCategoryIds(
    categoriesToRender.map((c) => c.id),
    { search, sort },
  );
  const productsByCategory = new Map(
    categoriesToRender.map((c) => [c.id, allProducts.filter((p) => p.categoryId === c.id)]),
  );

  // While searching, only show categories that actually matched — a page full
  // of repeated "nothing here" sections isn't a useful search result.
  const sectionsToShow = search
    ? categoriesToRender.filter((c) => (productsByCategory.get(c.id)?.length ?? 0) > 0)
    : categoriesToRender;

  return (
    <Section tone={tone} className="min-h-[70vh]">
      <Container>
        <p className={`font-body text-sm ${dark ? 'text-gold-300' : 'text-gold-700'}`}>
          {eyebrow}
        </p>
        <h1 className={`mt-2 font-display text-4xl ${dark ? 'text-cream-50' : 'text-charcoal-900'}`}>
          {title}
        </h1>
        <p className={`mt-3 max-w-xl font-body text-sm ${dark ? 'text-cream-100/70' : 'text-charcoal-700'}`}>
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <SearchBar
              action={basePath}
              defaultValue={search}
              dark={dark}
              hiddenFields={{ category: activeCategory?.slug, sort }}
            />
          </div>
          <SortSelect dark={dark} />
        </div>

        <div
          className={`sticky top-20 z-10 -mx-6 mt-6 px-6 py-3 ${dark ? 'bg-charcoal-950' : 'bg-cream-50'}`}
        >
          <CategoryTabs
            categories={root.children}
            basePath={basePath}
            activeSlug={activeCategory?.slug}
            search={search}
            sort={sort}
            dark={dark}
          />
        </div>

        {search && sectionsToShow.length === 0 ? (
          <p className={`mt-10 font-body text-sm ${dark ? 'text-cream-100/60' : 'text-charcoal-700/60'}`}>
            No items match “{search}”. Try a different search, or browse by category above.
          </p>
        ) : (
          <div className="mt-4 space-y-14">
            {sectionsToShow.map((category) => (
              <CategorySection
                key={category.id}
                title={category.name}
                description={category.description}
                products={productsByCategory.get(category.id) ?? []}
                dark={dark}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
