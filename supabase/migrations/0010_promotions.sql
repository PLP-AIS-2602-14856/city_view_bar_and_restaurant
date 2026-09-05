-- 0010_promotions.sql

create table public.promotions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             citext not null unique,
  description      text,
  promotion_type   public.promotion_type not null,
  discount_value   numeric(10, 2), -- percentage (0-100) or fixed KES amount, per type
  image_storage_path text,

  starts_at        timestamptz not null default now(),
  ends_at          timestamptz,
  is_active        boolean not null default true,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  check (ends_at is null or ends_at > starts_at)
);

create index promotions_is_active_idx on public.promotions (is_active);
create index promotions_starts_ends_idx on public.promotions (starts_at, ends_at);

create table public.promotion_products (
  promotion_id  uuid not null references public.promotions (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  primary key (promotion_id, product_id)
);
