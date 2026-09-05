-- 0014_row_level_security.sql
-- Enables RLS everywhere and defines least-privilege policies.
--
-- Design notes:
-- * Guest checkout / guest reservations are inserted by a trusted Server Action
--   using the service-role admin client (lib/supabase/server.ts -> createAdminClient),
--   AFTER server-side validation and total recalculation. There is deliberately no
--   policy allowing anonymous/public INSERT into orders or reservations directly
--   from the browser, per rule "validate all important mutations server-side".
-- * Authenticated customers may insert their own orders/reservations directly
--   (customer_id = auth.uid()), still subject to server-side total recalculation
--   happening in the same Server Action before the insert is issued.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.addon_groups enable row level security;
alter table public.addon_options enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_addons enable row level security;
alter table public.reservations enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.gallery_images enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (id = auth.uid() or public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- Note: role escalation prevention (a user setting their own role to 'admin')
-- must be enforced by a BEFORE UPDATE trigger or by only ever changing `role`
-- through the admin client server-side — do not expose a role field on the
-- self-service profile edit form.

create policy "profiles_admin_manage_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Catalogue tables: public reads what's live/available; admin+staff manage all.
-- ---------------------------------------------------------------------------
create policy "categories_public_read" on public.categories
  for select using (is_active = true or public.has_any_role(array['admin','staff']::public.user_role[]));
create policy "categories_staff_manage" on public.categories
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "products_public_read" on public.products
  for select using (
    (is_published = true and is_available = true)
    or public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[])
  );
create policy "products_staff_manage" on public.products
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "product_variants_public_read" on public.product_variants
  for select using (
    is_available = true or public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "product_variants_staff_manage" on public.product_variants
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "addon_groups_public_read" on public.addon_groups
  for select using (true);
create policy "addon_groups_staff_manage" on public.addon_groups
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "addon_options_public_read" on public.addon_options
  for select using (
    is_available = true or public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "addon_options_staff_manage" on public.addon_options
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "product_images_public_read" on public.product_images
  for select using (true);
create policy "product_images_staff_manage" on public.product_images
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

-- ---------------------------------------------------------------------------
-- Inventory: internal only, never exposed to customers.
-- ---------------------------------------------------------------------------
create policy "inventory_staff_only" on public.inventory
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "inventory_adjustments_staff_only" on public.inventory_adjustments
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

-- ---------------------------------------------------------------------------
-- Orders / order items: customers see only their own; ops roles see all.
-- ---------------------------------------------------------------------------
create policy "orders_select_own_or_staff" on public.orders
  for select using (
    customer_id = auth.uid()
    or public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[])
  );

create policy "orders_insert_own" on public.orders
  for insert with check (customer_id = auth.uid());

create policy "orders_update_staff_only" on public.orders
  for update using (public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]));

create policy "order_items_select_via_order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid()
             or public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]))
    )
  );

create policy "order_items_insert_via_own_order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

create policy "order_items_update_staff_only" on public.order_items
  for update using (public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]));

create policy "order_item_addons_select_via_order" on public.order_item_addons
  for select using (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_addons.order_item_id
        and (o.customer_id = auth.uid()
             or public.has_any_role(array['admin','staff','kitchen','bar']::public.user_role[]))
    )
  );

create policy "order_item_addons_insert_via_own_order" on public.order_item_addons
  for insert with check (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_addons.order_item_id and o.customer_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------------------
create policy "reservations_select_own_or_staff" on public.reservations
  for select using (
    customer_id = auth.uid()
    or public.has_any_role(array['admin','staff']::public.user_role[])
  );

create policy "reservations_insert_own" on public.reservations
  for insert with check (customer_id = auth.uid());

create policy "reservations_manage_staff" on public.reservations
  for update using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "reservations_delete_staff" on public.reservations
  for delete using (public.has_any_role(array['admin','staff']::public.user_role[]));

-- ---------------------------------------------------------------------------
-- Promotions / gallery / settings
-- ---------------------------------------------------------------------------
create policy "promotions_public_read" on public.promotions
  for select using (
    is_active = true or public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "promotions_staff_manage" on public.promotions
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "promotion_products_public_read" on public.promotion_products
  for select using (true);
create policy "promotion_products_staff_manage" on public.promotion_products
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "gallery_public_read" on public.gallery_images
  for select using (
    is_published = true or public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "gallery_staff_manage" on public.gallery_images
  for all using (public.has_any_role(array['admin','staff']::public.user_role[]))
  with check (public.has_any_role(array['admin','staff']::public.user_role[]));

create policy "restaurant_settings_public_read" on public.restaurant_settings
  for select using (true);
create policy "restaurant_settings_admin_manage" on public.restaurant_settings
  for all using (public.is_admin()) with check (public.is_admin());
