-- 0006_product_images.sql
-- Product photography, stored in Supabase Storage; this table holds only the
-- storage path + metadata, never binary data.

create table public.product_images (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  storage_path   text not null,   -- path within the "product-images" storage bucket
  alt_text       text,
  is_primary     boolean not null default false,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

-- Only one primary image per product.
create unique index product_images_one_primary_per_product
  on public.product_images (product_id)
  where is_primary;
