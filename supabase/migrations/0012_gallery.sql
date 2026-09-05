-- 0012_gallery.sql

create table public.gallery_images (
  id             uuid primary key default gen_random_uuid(),
  storage_path   text not null,
  caption        text,
  category       public.gallery_category not null default 'ambience',
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now()
);

create index gallery_images_category_idx on public.gallery_images (category);
create index gallery_images_is_published_idx on public.gallery_images (is_published);
