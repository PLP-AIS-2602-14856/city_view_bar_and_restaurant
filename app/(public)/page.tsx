import { Hero } from '@/components/home/Hero';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { PromotionsStrip } from '@/components/home/PromotionsStrip';
import { ReservationBand } from '@/components/home/ReservationBand';
import { GalleryTeaser } from '@/components/home/GalleryTeaser';
import { LocationHours } from '@/components/home/LocationHours';
import { getFeaturedProducts, getRecentProducts } from '@/lib/database/products';
import { getActivePromotions } from '@/lib/database/promotions';
import { getPublishedGalleryImages } from '@/lib/database/gallery';
import { getRestaurantSettings } from '@/lib/database/settings';

/**
 * Every section below reads from the live database (see lib/database/*.ts) —
 * there is no hard-coded menu/promotion/gallery data in this component, per the
 * project's "single source of truth" requirement. Featured items fall back to
 * the most recently added items so the page isn't empty before an admin has
 * marked anything as featured yet.
 */
export default async function HomePage() {
  const [featuredFood, featuredDrinks, promotions, galleryImages, settings] = await Promise.all([
    getFeaturedProducts(['food']).then((items) =>
      items.length > 0 ? items : getRecentProducts(['food']),
    ),
    getFeaturedProducts(['wine', 'cocktail', 'alcoholic_drink']).then((items) =>
      items.length > 0 ? items : getRecentProducts(['wine', 'cocktail', 'alcoholic_drink']),
    ),
    getActivePromotions(),
    getPublishedGalleryImages(),
    getRestaurantSettings(),
  ]);

  return (
    <>
      <Hero />

      <FeaturedProductsSection
        eyebrow="From the kitchen"
        title="Signature Dishes"
        description="Char-grilled classics and comfort favourites, made to order."
        products={featuredFood}
        viewAllHref="/restaurant"
        viewAllLabel="View Restaurant Menu"
      />

      <FeaturedProductsSection
        eyebrow="From the bar"
        title="Wines & Cocktails"
        description="A serious wine list and cocktails built for the view."
        products={featuredDrinks}
        viewAllHref="/bar"
        viewAllLabel="View Bar Menu"
        tone="dark"
      />

      <PromotionsStrip promotions={promotions} />
      <ReservationBand />
      <GalleryTeaser images={galleryImages} />
      <LocationHours settings={settings} />
    </>
  );
}
