-- 0011_restaurant_settings.sql
-- Key/value store for business info that must never be hard-coded in components
-- (address, phone, hours, etc.) and that the master spec says must not be invented.
-- Seed data inserts clearly-marked placeholder values; admins edit them via Settings.

create table public.restaurant_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references public.profiles (id) on delete set null,
  updated_at  timestamptz not null default now()
);

comment on table public.restaurant_settings is
  'Editable business info: address, phone, email, hours, social links, delivery '
  'zones, hero images. Seeded with clearly-marked placeholder values only.';
