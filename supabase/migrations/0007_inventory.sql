-- 0007_inventory.sql
-- Stock tracking. Not every product needs it (e.g. made-to-order food), so
-- tracking is opt-in per product via track_inventory.

create table public.inventory (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid references public.products (id) on delete cascade,
  variant_id         uuid references public.product_variants (id) on delete cascade,
  track_inventory    boolean not null default false,
  quantity_on_hand   integer not null default 0 check (quantity_on_hand >= 0),
  reorder_threshold  integer not null default 0,
  updated_at         timestamptz not null default now(),

  -- Inventory is tracked either at the product level or the variant level, not both.
  check (
    (product_id is not null and variant_id is null)
    or (product_id is null and variant_id is not null)
  )
);

create unique index inventory_one_row_per_product
  on public.inventory (product_id) where variant_id is null;
create unique index inventory_one_row_per_variant
  on public.inventory (variant_id) where product_id is null;

comment on table public.inventory is
  'Current stock level. History of changes lives in inventory_adjustments.';

create table public.inventory_adjustments (
  id            uuid primary key default gen_random_uuid(),
  inventory_id  uuid not null references public.inventory (id) on delete cascade,
  change_qty    integer not null,   -- positive = restock, negative = deduction/sale
  reason        text not null,      -- e.g. 'order_placed', 'manual_restock', 'wastage'
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index inventory_adjustments_inventory_id_idx
  on public.inventory_adjustments (inventory_id);
