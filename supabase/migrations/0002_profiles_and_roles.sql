-- 0002_profiles_and_roles.sql
-- One profile row per Supabase Auth user, carrying the app-level role.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  phone         text,
  role          public.user_role not null default 'customer',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'App-level profile + role for each Supabase Auth user. Row is auto-created on signup.';

create index profiles_role_idx on public.profiles (role);
