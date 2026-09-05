-- 0004_products.sql
-- Single source of truth for every sellable item: food, alcoholic drinks, wines,
-- cocktails, soft drinks, and juices. Admin UI presents filtered views over this
-- one table per the master spec's "manage food / manage wines / ..." requirements,
-- without duplicating schema or CRUD logic six times over.

create table public.products (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid references public.categories (id) on delete set null,
  product_type       public.product_type not null,
  name               text not null,
  slug               citext not null unique,
  description        text,
  base_price         numeric(10, 2) not null check (base_price >= 0),
  currency           text not null default 'KES',

  is_available       boolean not null default true,  -- toggled off = cannot be ordered
  is_featured        boolean not null default false,
  is_published       boolean not null default true,   -- draft vs live on customer site

  -- Type-specific, non-universal attributes kept flexible rather than adding a
  -- sparse column per product type (e.g. ABV for drinks, spice_level for food,
  -- varietal/vintage for wine, allergens for food).
  attributes         jsonb not null default '{}'::jsonb,

  display_order      integer not null default 0,

  created_by         uuid references public.profiles (id) on delete set null,
  updated_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.products is
  'Unified catalogue of all food and beverage items sold by City View.';

create index products_category_id_idx on public.products (category_id);
create index products_product_type_idx on public.products (product_type);
create index products_is_available_idx on public.products (is_available);
create index products_is_published_idx on public.products (is_published);
create index products_attributes_gin_idx on public.products using gin (attributes);
