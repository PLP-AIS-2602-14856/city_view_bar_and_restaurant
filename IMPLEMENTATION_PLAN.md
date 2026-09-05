# City View Bar & Restaurant — Implementation Plan

## 1. Audit Result

No existing project was found — only the master build specification was provided.
This is a **greenfield build**. The architecture below is being initialized from scratch.

| Area | Status |
|---|---|
| Framework | None — initializing Next.js 14 (App Router) + TypeScript |
| Styling | None — initializing Tailwind CSS |
| Backend | Supabase project exists (URL + publishable key provided); no schema yet |
| Database | Empty Postgres instance — full schema to be created via migrations |
| Auth | Not configured — will use Supabase Auth + `profiles` table with roles |
| Tests | None yet |
| Deployment config | None yet — targeting Vercel |

## 2. What Is Being Built Now (this batch)

This is a **piece-by-piece build**. This first batch covers **Steps 1–3** of the master
prompt's development sequence:

1. **Foundation** — Next.js/TypeScript/Tailwind scaffold, Supabase client helpers,
   environment variable setup, lint/format config.
2. **Database** — full PostgreSQL migration set: tables, relationships, constraints,
   indexes, enums, Row Level Security policies, triggers, and seed data.

Subsequent batches (in order) will cover:

- Step 4: Authentication & authorization (roles: customer, admin, kitchen, bar, staff)
- Step 5: Design system (typography, buttons, cards, forms, nav)
- Step 6–10: Customer homepage, restaurant catalogue, bar catalogue, product details,
  search/filtering
- Step 11–13: Cart, checkout, reservations
- Step 14–18: Admin dashboard, CRUD, inventory, promotions, gallery
- Step 19–23: Realtime, SEO/performance, testing, security audit, production prep

## 3. Database Design Decisions

Rather than separate tables per beverage type (alcoholic drinks, wines, cocktails, soft
drinks, juices) and a separate food table, the schema uses a **single unified `products`
table** with a `product_type` enum and a self-referencing `categories` table. Rationale:

- All product types share the same core admin operations (price, image, description,
  availability, inventory) — a unified table avoids duplicating CRUD logic 6 times over.
- Type-specific attributes (e.g. wine varietal, ABV, spice level) are stored in a
  `product_type` and a flexible `attributes JSONB` column plus a normalized
  `product_variants` table for things like glass/bottle or size options.
- Category tree supports "Bar → Wines → Red Wines" style nesting via `parent_id`.
- This satisfies the requirement that admin "manage food / alcoholic drinks / wines /
  cocktails / soft drinks / juices" as distinct experiences in the admin UI (filtered
  views over one table), while keeping one source of truth, as the master prompt requires.

Order line items snapshot product name/price at time of order (never join-compute
historical order totals from current prices), so historical orders remain accurate even
after admin price changes.

## 4. Files Created In This Batch

```text
cityview/
  package.json
  tsconfig.json
  next.config.mjs
  tailwind.config.ts
  postcss.config.js
  .eslintrc.json
  .prettierrc
  .env.example
  .gitignore
  middleware.ts
  app/
    layout.tsx
    globals.css
    page.tsx
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/middleware.ts
  types/
    database.types.ts
  supabase/
    migrations/
      0001_extensions_and_enums.sql
      0002_profiles_and_roles.sql
      0003_categories.sql
      0004_products.sql
      0005_product_variants_and_addons.sql
      0006_product_images.sql
      0007_inventory.sql
      0008_orders.sql
      0009_reservations.sql
      0010_promotions.sql
      0011_restaurant_settings.sql
      0012_gallery.sql
      0013_functions_and_triggers.sql
      0014_row_level_security.sql
    seed/
      seed.sql
  README.md
```

## 5a. Batch 2 — Step 4 (Authentication) + Step 5 (Design System)

### Authentication & authorization
- Supabase Auth wired end-to-end: customer signup/login (`/account/signup`,
  `/account/login`) and a separate staff login (`/admin/login`) against the same
  user pool, gated by `profiles.role`.
- Three redundant authorization layers: `middleware.ts` (fast page-navigation
  redirect), `app/admin/(protected)/layout.tsx` (server re-check via
  `requireRole()`), and Postgres RLS policies (last line of defense).
- `app/admin/(protected)/` route group holds every role-gated admin page;
  `app/admin/login` sits outside it deliberately so the guard doesn't create a
  redirect loop on the login page itself.
- Server Actions (`lib/auth/actions.ts`) handle sign in/up/out; forms use
  `useFormState`/`useFormStatus` for pending states and inline errors.
- See README.md "Authentication & Roles" for how to create the first admin user.

### Design system
- Brand direction (see `tailwind.config.ts` comment): near-black charcoal base +
  warm brass/gold accent (candlelight, not neon) + deep wine/burgundy for
  bar-specific moments + warm cream for light surfaces — deliberately avoiding
  both the generic cream-background/terracotta-accent AI-page default and the
  generic near-black/bright-accent SaaS-dark-mode default.
- Typefaces: Fraunces (display serif with real character, via `next/font/google`)
  + Inter (body), loaded as CSS variables in `app/layout.tsx`.
- Primitives built: `Button` (solid/outline/ghost/bar variants — `buttonStyles()`
  also exported so nav CTAs can be `<Link>`s styled as buttons without invalid
  `<a>`-inside-`<button>` nesting), `Badge`, `Card`, form fields (`Input`,
  `Textarea`, `Select`, `FormField` with inline error display), `Modal` (built on
  native `<dialog>` for built-in focus trapping), `Container`/`Section` layout
  helpers.
- Navigation: `Navbar` (server component, auth-aware — shows Login vs My Account)
  + `MobileMenu` (client component, animated hamburger) + `Footer`, assembled in
  `app/(public)/layout.tsx` so every customer-facing page gets them automatically.
- Admin shell: `AdminSidebar` shows only the sections the signed-in role may use.
- Accessibility baseline: visible focus rings (`:focus-visible` in
  `globals.css`), `prefers-reduced-motion` respected, semantic form labels/`role="alert"`
  on errors.
- Still placeholder content: the homepage, product pages, and every admin CRUD
  page are structural stand-ins — the actual homepage design (Step 6) and
  catalogue pages (Steps 7–10) are the next batches.

## 5b. Batch 3 — Step 6 (Customer Homepage)

The homepage (`app/(public)/page.tsx`) is now fully database-driven — every section
queries Supabase server-side (`lib/database/*.ts`) rather than using hard-coded menu
or business data:

- **Hero** — an original bespoke SVG skyline illustration (lit windows, gold glow),
  not a stock photo or generic gradient-and-headline treatment; a literal read of
  "City View" as a rooftop bar's view of the city at dusk.
- **Signature Dishes** / **Wines & Cocktails** — `getFeaturedProducts()` pulls
  `is_featured = true` items live from `products`, falling back to
  `getRecentProducts()` (newest first) so the page still shows something real
  before an admin has marked anything as featured. Empty catalogue → an honest
  "menu is being set up" message, never fake placeholder dishes.
- **Current Promotions** — reads active, in-date-range rows from `promotions`;
  the whole section is omitted (not shown with a fake empty state) when nothing
  is currently active.
- **Reserve a Table** — static CTA band linking to `/reservations` (Step 13).
- **The Room** (gallery teaser) — reads published `gallery_images`; omitted
  entirely if none are published yet.
- **Visit City View** (location/hours) — reads `restaurant_settings`; shows the
  `[DEMO]` seed placeholders honestly rather than inventing real address/hours,
  consistent with the project's rule against fabricating business information.
- `ProductCard` shows a designed monogram-on-gradient tile (in the product
  family's accent color) instead of a broken image or generic icon when no
  photo has been uploaded yet — swaps to the real photo automatically the
  moment `product_images` has a row for that product.
- New Storage migration (`0015_storage_buckets.sql`) creates the
  `product-images` and `gallery-images` public buckets with staff-only write
  policies, since the homepage's image components now reference them.

## 5c. Batch 4 — Steps 7–8 (Restaurant + Bar Catalogues), plus a minimal Step 9

- `/restaurant` and `/bar` share one implementation
  (`components/menu/CataloguePageContent.tsx`) rather than duplicating listing,
  filtering, and empty-state logic twice — they differ only in which root
  category they read (`restaurant` vs `bar`) and their light/dark tone.
- Category pills (`CategoryTabs`) filter via a `?category=slug` URL query param
  and are plain `<Link>`s — no client JS, shareable/bookmarkable URLs, and the
  filtered page is still a normal server-rendered page.
- Selecting "All" shows every child category as its own titled section (Starters,
  Main Courses, Wines, Cocktails, ...), like a real menu rather than one flat grid.
- An empty category shows an honest "nothing here yet" message; a root category
  with no children yet (menu not set up) shows an honest "still being set up"
  page rather than a broken/blank one.
- Pulled in a minimal version of **Step 9 (product detail)** — `/menu/[slug]` —
  because catalogue cards would otherwise be dead-end links. It shows full
  detail (images, variants with per-option pricing, add-on groups, spice
  level/ABV/varietal/allergen badges from the `attributes` JSONB column) but
  deliberately does **not** add cart/"Add to Cart" interactivity yet — that's
  Step 11 (cart) and this page is honest about that ("Online ordering is coming
  soon") rather than shipping a button that does nothing.
- Removed the redundant "Drinks" nav item — `/bar`'s category tabs already
  cover wines, cocktails, spirits, soft drinks, and juices, so a separate
  top-level "Drinks" page would have been a second source of truth for the
  same data.
- Fixed two dangling `/menu` links (Navbar and Hero "Order Now" buttons) that
  predated this batch — they now point to `/restaurant`.

Not yet real: `/promotions`, `/reservations`, `/about`, `/gallery`, `/contact`
are all linked from the nav/footer but not yet built (still upcoming steps) —
they will 404 until their own batches land.

## 5d. Batch 5 — Step 10 (Search & Filtering)

- **In-catalogue search + sort**: `/restaurant` and `/bar` each gained a search
  box and a sort control (Recommended / Name / Price low-high / Price
  high-low). Both are plain GET forms/links (`SearchBar`, `SortSelect`,
  `CategoryTabs`) so the current search+sort+category combination always lives
  in the URL — shareable, bookmarkable, and works without client JS except for
  `SortSelect`'s immediate-navigate convenience.
- Switching category, searching, and sorting all **compose** — e.g.
  `/bar?category=cocktails&q=lime&sort=price_asc` is a valid, correct state,
  because every control preserves the other active params rather than
  resetting them.
- While searching, only categories that actually matched are shown — avoids a
  page full of repeated "nothing here" sections.
- **Global search** — a new `/search` page searches name + description across
  the *entire* catalogue (food and every drink type together), reachable from
  a search icon in the desktop nav and a "Search" entry in the mobile menu.
- Consolidated a duplicated query helper: `lib/database/search.ts` now reuses
  `products.ts`'s exported `PRODUCT_CARD_SELECT`/`mapProductCardRow` instead of
  keeping its own copy — one definition of "what a product card needs," not two.
- Search input is escaped against SQL `ILIKE` wildcards (`%`, `_`) so a person
  searching for a literal percent sign doesn't get pattern-matching behavior.

## 5e. Batch 6 — Step 11 (Cart)

- **Client-side cart** (`lib/cart/CartContext.tsx`), persisted to `localStorage`
  (this is a real shipped Next.js app, not the claude.ai Artifacts sandbox where
  browser storage is restricted — localStorage is the standard, correct choice
  here for a guest-friendly cart that survives a page refresh with zero
  backend calls). No database writes happen until an actual order is placed
  (Step 12) — the cart itself is disposable client state.
- Product detail pages (`/menu/[slug]`) now have a real `AddToCartForm`:
  variant selection (radio), add-on groups rendered as radio (max 1) or
  checkboxes (max N, enforced in the UI) with required-group validation before
  the button is enabled, a quantity stepper, and a live-updating total.
- `/cart` lists items with quantity editing and removal, and a subtotal.
  **Deliberately does not have a working "Checkout" button** — Step 12
  (checkout/payment) isn't built yet, so rather than a dead link or an inert
  button, the cart page says plainly that online checkout is coming soon and
  offers what actually works today (show the cart in person, or call in using
  the phone number from `restaurant_settings`).
- Prices shown throughout the cart are for display only. Every code comment
  and the checkout-pending copy is explicit that Step 12 will re-fetch current
  prices from the database before anything is ever charged — a stale client
  price can never be trusted.
- Cart icon in the navbar shows a live item-count badge (`CartIndicator`),
  guarded against a hydration-mismatch flash by not rendering the badge until
  the client has actually read localStorage.

## 5f. Batch 7 — Step 12 (Checkout + Reservations)

### Checkout
- `/checkout` reads the cart from `CartContext` and submits a Server Action
  (`submitOrderAction` → `lib/checkout/create-order.ts`) directly — not a
  `<form action>`, since the payload is built from client cart state, not just
  form fields.
- **Every price is re-derived from the database inside the Server Action.**
  The client only ever sends product/variant/addon-option **ids** and a
  quantity; `create-order.ts` re-fetches each one, re-checks
  `is_published`/`is_available`, and computes unit price and line totals from
  scratch. A stale or tampered client price is structurally impossible to
  charge — this was promised back in the orders schema comments (Batch 1) and
  is now actually enforced.
- Order creation follows the same guest-vs-authenticated split as the RLS
  design: authenticated customers insert via the normal RLS-respecting client
  (`customer_id = auth.uid()`); guests insert via the service-role admin
  client, since there is deliberately no anon-insert policy on `orders`.
- The inventory-deduction trigger from Batch 1 (`0013_functions_and_triggers.sql`)
  fires automatically on `order_items` insert; insufficient stock raises a
  Postgres exception that surfaces as a friendly "doesn't have enough stock"
  message rather than a generic failure.
- On success, the confirmation (order number + line items + totals) is shown
  **inline on the same page** using the data the Server Action already
  returned — there is no separate `/order-confirmation/[id]` route. That was
  a deliberate choice: RLS correctly prevents a guest (no `auth.uid()`) from
  re-fetching their own `customer_id IS NULL` order after a redirect, and
  building a guessable-order-number lookup route to work around that would be
  a real privacy hole (anyone could view anyone's guest order by guessing a
  sequential order number). Showing the already-known result inline avoids
  the problem entirely instead of patching around it.
- Delivery fee is a clearly-commented placeholder flat rate — real delivery
  pricing/zones are a future admin setting, not invented here.

### Reservations
- `/reservations` — the last remaining always-linked nav destination that
  didn't exist yet. Same guest/authenticated insert split as checkout.
- Reservations are created with `status = 'pending'` (the schema default) and
  the page says so honestly: a submitted reservation is a request, confirmed
  by staff, not an instant guarantee — there's no real-time table-availability
  calendar in scope for this step.

## 5g. Batch 8 — Step 14 (Admin CRUD: Menu, Drinks, Categories, Inventory)

Found substantial partially-built work already in the sandbox for Categories CRUD
(query helpers, Server Actions, form, list/new/edit pages) from what looks like
another earlier interrupted pass — reviewed it, it was solid and consistent with
this project's conventions, and built the remaining pieces (Products/Menu/Drinks,
Inventory) to match rather than redoing what already worked.

- **Categories** (`/admin/categories`) — full CRUD. Deleting a category doesn't
  delete its products; they become uncategorized (`category_id` → `NULL` via
  `ON DELETE SET NULL`, per `0004_products.sql`) rather than silently vanishing.
- **Menu Management** (`/admin/menu`) and **Drinks Management** (`/admin/drinks`)
  share one `ProductForm`/`ProductListTable`/`products-actions.ts` — they're the
  same underlying `products` table (this project's core schema decision from
  Batch 1), just scoped to different `product_type`s and category lists, so
  there's exactly one CRUD implementation instead of two parallel ones. Drinks
  additionally gets a type filter (Wine/Cocktail/Spirits/Soft Drink/Juice),
  mirroring the storefront's own category-tab pattern.
- Per-type attributes (spice level, ABV, varietal, origin, allergens) are
  plain form fields that get assembled into the `attributes` JSONB column
  server-side — the same column the storefront's product page already reads
  from (Batch 4), so a dish's spice-level badge now actually comes from what
  an admin typed, not a hard-coded default.
- Deleting a product doesn't corrupt past orders — `order_items` snapshots the
  name/price at order time and only nulls its `product_id` reference
  (`ON DELETE SET NULL`, `0008_orders.sql`); a deleted menu item still shows
  correctly on every historical order.
- **Inventory** (`/admin/inventory`) — tracking is opt-in per product (most
  food is made to order and doesn't need a stock count). Enabling it creates
  the `inventory` row; adjustments write to `inventory_adjustments` for an
  audit trail, matching the schema built in Batch 1. Low-stock items (at or
  below their reorder point) are flagged inline.
- **Fixed a real legibility bug** in the leftover Categories code before
  building on top of it: `Badge` and the admin forms were styled only for the
  storefront's light backgrounds, so status badges and form labels were
  low-contrast-to-invisible on the dark admin dashboard. Gave `Badge` a `dark`
  variant (same pattern already used by `Section`/`CategoryTabs`) and put
  admin forms on a light card surface rather than directly on the dark page
  background, instead of threading a `dark` prop through every form primitive.

### Scope cuts, stated plainly
- Product **variants** (Glass/Bottle) and **add-on groups** still have no admin
  UI — they can only be set via direct SQL/seed data for now. Worth a follow-up
  batch once basic CRUD is confirmed working end-to-end.
- Inventory adjustments are two sequential writes, not one atomic transaction
  (the Supabase JS client doesn't expose multi-statement transactions) — fine
  at this scale, but a future refinement would move this into a Postgres
  function called via `.rpc()` for correctness under concurrent edits.

## 5. Not Yet Done (intentionally deferred)

- No UI pages beyond a placeholder homepage (Steps 5–10 come next).
- No admin dashboard UI yet (Step 14).
- No cart/checkout logic yet (Steps 11–12).
- Auth middleware exists but role-gating UI (login forms, protected admin routes) is
  Step 4's job, next batch.
- `types/database.types.ts` is hand-written to match the migrations; once the project
  is connected to a live Supabase instance, regenerate it with the Supabase CLI
  (`supabase gen types typescript`) to keep it as the single source of truth.
