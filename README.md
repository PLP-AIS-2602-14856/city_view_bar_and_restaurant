# City View Bar & Restaurant

Database-driven restaurant and bar ordering platform: customer-facing app +
protected admin dashboard, built on Next.js (App Router) + TypeScript + Tailwind CSS,
backed by Supabase (PostgreSQL, Auth, Storage, RLS).

> **Status:** Foundation + database layer only (see `IMPLEMENTATION_PLAN.md` for what's
> built so far and what's next). Not yet deployable as a finished product.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase: PostgreSQL, Auth, Row Level Security, Storage
- Deployment target: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — already
  provided in `.env.example` for the project's Supabase instance.
- `DATABASE_URL` — replace `[YOUR-PASSWORD]` with the actual database password.
  **Never commit this value or expose it to client code.**
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API.
  Required for guest checkout / guest reservations and other trusted server-only
  operations. **Server-side only, never `NEXT_PUBLIC_`.**

### 3. Apply database migrations

Using the Supabase CLI (recommended):

```bash
supabase link --project-ref drcahfhippwhiiqwjept
supabase db push
```

This runs every file in `supabase/migrations/` in order, creating all tables, enums,
functions, triggers, and RLS policies.

### 4. Seed demo data (optional, safe for local/dev only)

```bash
npm run db:seed
```

Seed data includes clearly-marked `[DEMO]` placeholder business info (address, phone,
hours) in `restaurant_settings` — **replace these via Admin → Settings before any real
launch.** No real business information has been invented per project rules.

### 5. Regenerate types after any schema change

```bash
npm run db:types
```

This overwrites `types/database.types.ts` (currently hand-written to match the
migrations) with the Supabase CLI's generated types — treat the generated file as the
source of truth from that point on.

### 6. Run the dev server

```bash
npm run dev
```

## Database Design

See `IMPLEMENTATION_PLAN.md` §3 for the schema's key design decision: a single unified
`products` table (with a `product_type` enum: food / alcoholic_drink / wine / cocktail /
soft_drink / juice) rather than six separate tables, so admin CRUD and customer catalogue
logic isn't duplicated six times over while still supporting distinct admin views per
type.

Full table list: `profiles`, `categories`, `products`, `product_variants`,
`addon_groups`, `addon_options`, `product_images`, `inventory`,
`inventory_adjustments`, `orders`, `order_items`, `order_item_addons`,
`reservations`, `promotions`, `promotion_products`, `restaurant_settings`,
`gallery_images`.

## Authentication & Roles

- Every Supabase Auth signup automatically gets a `profiles` row with `role =
  'customer'` (via the `handle_new_user` trigger in migration 0013).
- `/account/login` and `/account/signup` are for customers.
- `/admin/login` is a separate sign-in for staff. It uses the same Supabase Auth
  user pool, but immediately checks the signed-in account's `role` — any
  `customer`-role account is signed back out and denied, even with correct
  credentials.
- **To create your first admin user:** sign up normally via `/account/signup` (or
  the Supabase dashboard), then promote that account with SQL run directly against
  the database (e.g. via the Supabase SQL editor):

  ```sql
  update public.profiles set role = 'admin' where id =
    (select id from auth.users where email = 'you@example.com');
  ```

- Roles: `customer`, `staff` (general admin access), `kitchen` (food order status
  only), `bar` (drink order status only), `admin` (full access including staff
  management and settings). The admin sidebar (`components/admin/AdminSidebar.tsx`)
  shows only the sections a given role is permitted to use.
- Authorization is checked in three layers, deliberately redundant: `middleware.ts`
  (fast redirect for page navigation), `app/admin/(protected)/layout.tsx` (server
  re-check via `requireRole()` on every render), and RLS policies in
  `0014_row_level_security.sql` (last line of defense at the database itself, so
  even a bug in application code can't leak or mutate data outside a role's
  permissions).

## Security Notes

- Row Level Security is enabled on every table (`supabase/migrations/0014_*.sql`).
  Public/anon access is read-only and limited to published/available catalogue rows,
  active promotions, and public settings. All writes require an authenticated role
  (`customer` for their own orders/reservations; `admin`/`staff`/`kitchen`/`bar` for
  operational tables).
- Guest checkout and guest reservations are **not** inserted directly from the browser
  with the anon key. They go through a Server Action that validates input and
  recalculates totals server-side, then inserts using the service-role admin client
  (`lib/supabase/server.ts` → `createAdminClient()`).
- Never import `createAdminClient()` into a Client Component or any file that could be
  bundled into browser JS.

## Project Structure

See `IMPLEMENTATION_PLAN.md` for the full file list created in each build batch.

## Next Steps

See `IMPLEMENTATION_PLAN.md` §2 for the remaining build steps (auth/authorization,
design system, customer pages, cart/checkout, admin dashboard, realtime, testing,
security audit, and production prep).
