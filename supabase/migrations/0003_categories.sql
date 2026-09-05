-- 0003_categories.sql
-- Self-referencing category tree, e.g. Bar -> Wines -> Red Wines.

create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  parent_id      uuid references public.categories (id) on delete cascade,
  name           text not null,
  slug           citext not null unique,
  description    text,
  product_type   public.product_type, -- null = generic/parent grouping category
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.categories is
  'Hierarchical menu categories for both food and every beverage type.';

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_product_type_idx on public.categories (product_type);
create index categories_is_active_idx on public.categories (is_active);
