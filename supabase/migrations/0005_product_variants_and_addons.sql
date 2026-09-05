-- 0005_product_variants_and_addons.sql
-- Variants (e.g. "Glass" / "Bottle", "250ml" / "500ml") and add-on groups
-- (e.g. spice level, extra toppings, mixers) for customizable orders.

create table public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  name           text not null,             -- "Glass", "Bottle", "500ml"
  price_override numeric(10, 2) check (price_override >= 0), -- null = use base_price
  sku            text,
  is_default     boolean not null default false,
  is_available   boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (product_id, name)
);

create index product_variants_product_id_idx on public.product_variants (product_id);

-- One product can have several independent add-on groups, e.g. "Spice Level"
-- (pick exactly 1) and "Extra Toppings" (pick 0-4).
create table public.addon_groups (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  name           text not null,
  min_select     integer not null default 0,
  max_select     integer not null default 1,
  is_required    boolean not null default false,
  display_order  integer not null default 0,

  check (min_select >= 0 and max_select >= min_select)
);

create index addon_groups_product_id_idx on public.addon_groups (product_id);

create table public.addon_options (
  id             uuid primary key default gen_random_uuid(),
  addon_group_id uuid not null references public.addon_groups (id) on delete cascade,
  name           text not null,
  price_delta    numeric(10, 2) not null default 0,
  is_available   boolean not null default true,
  display_order  integer not null default 0
);

create index addon_options_addon_group_id_idx on public.addon_options (addon_group_id);
