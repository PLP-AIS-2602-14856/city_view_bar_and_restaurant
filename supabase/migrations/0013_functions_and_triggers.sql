-- 0013_functions_and_triggers.sql

-- ---------------------------------------------------------------------------
-- Generic updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new Supabase Auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Human-readable order numbers, e.g. CV-20260903-0001
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'CV-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger set_order_number before insert on public.orders
  for each row execute function public.generate_order_number();

-- ---------------------------------------------------------------------------
-- Role-check helpers used throughout RLS policies (0014).
-- security definer + fixed search_path so they can read profiles regardless
-- of the calling role's own RLS visibility, without being spoofable.
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function public.has_any_role(roles public.user_role[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) = any(roles),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Deduct tracked inventory automatically when an order line item is created,
-- and log the adjustment. Runs as the row-inserting transaction, so it fails
-- (and rolls back the whole order) if stock is insufficient.
-- ---------------------------------------------------------------------------
create or replace function public.deduct_inventory_on_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
begin
  select * into inv
  from public.inventory
  where (product_id = new.product_id and new.variant_id is null)
     or (variant_id = new.variant_id and new.variant_id is not null)
  for update;

  if inv is null or inv.track_inventory is false then
    return new;
  end if;

  if inv.quantity_on_hand < new.quantity then
    raise exception 'Insufficient stock for %', new.product_name_snapshot;
  end if;

  update public.inventory
    set quantity_on_hand = quantity_on_hand - new.quantity,
        updated_at = now()
    where id = inv.id;

  insert into public.inventory_adjustments (inventory_id, change_qty, reason, created_by)
  values (inv.id, -new.quantity, 'order_placed', null);

  return new;
end;
$$;

create trigger deduct_inventory_on_order_item
  after insert on public.order_items
  for each row execute function public.deduct_inventory_on_order_item();
