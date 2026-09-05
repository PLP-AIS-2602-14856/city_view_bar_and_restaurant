-- 0009_reservations.sql
-- Table reservations. Supports both authenticated customers and guests.

create table public.reservations (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid references public.profiles (id) on delete set null,

  guest_name         text not null,
  guest_phone        text not null,
  guest_email        text,

  party_size         integer not null check (party_size > 0),
  reservation_date   date not null,
  reservation_time   time not null,
  table_preference   text,   -- e.g. 'window', 'outdoor', 'bar-side'; not a hard guarantee

  status             public.reservation_status not null default 'pending',
  special_requests   text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index reservations_customer_id_idx on public.reservations (customer_id);
create index reservations_date_idx on public.reservations (reservation_date);
create index reservations_status_idx on public.reservations (status);
