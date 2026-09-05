import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Container } from '@/components/layout/Container';
import { SearchBar } from '@/components/menu/SearchBar';
import { ProductCard } from '@/components/menu/ProductCard';
import { searchProducts } from '@/lib/database/search';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <Section className="min-h-[70vh]">
      <Container className="max-w-3xl">
        <p className="font-body text-sm text-gold-700">Search</p>
        <h1 className="mt-2 font-display text-4xl text-charcoal-900">
          Find something on the menu
        </h1>
        <p className="mt-3 font-body text-sm text-charcoal-700">
          Searches every dish and drink — restaurant and bar together.
        </p>

        <div className="mt-8 max-w-md">
          <SearchBar action="/search" defaultValue={query} placeholder="Search dishes, drinks…" />
        </div>

        {query && (
          <div className="mt-10">
            <p className="font-body text-sm text-charcoal-700">
              {results.length > 0
                ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                : `No results for "${query}"`}
            </p>

            {results.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="mt-2 font-body text-sm text-charcoal-700/60">
                Try a different word, or browse the{' '}
                <Link href="/restaurant" className="text-gold-700 underline">
                  Restaurant
                </Link>{' '}
                and{' '}
                <Link href="/bar" className="text-gold-700 underline">
                  Bar
                </Link>{' '}
                menus directly.
              </p>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
