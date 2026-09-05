-- 0001_extensions_and_enums.sql
-- Extensions and shared enum types used across the City View schema.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";      -- case-insensitive text (emails, slugs)

-- Staff/customer roles. "customer" is the default for every new signup.
create type public.user_role as enum (
  'customer',
  'staff',       -- general front-of-house staff, limited admin access
  'kitchen',     -- sees/updates food order status only
  'bar',         -- sees/updates drink order status only
  'admin'        -- full administrative access
);

-- Unified product taxonomy. Food and every beverage category share one table
-- (see 0004_products.sql) distinguished by this enum plus category assignment.
create type public.product_type as enum (
  'food',
  'alcoholic_drink',
  'wine',
  'cocktail',
  'soft_drink',
  'juice'
);

create type public.order_channel as enum (
  'dine_in',
  'takeaway',
  'delivery'
);

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled'
);

create type public.payment_status as enum (
  'unpaid',
  'pending',
  'paid',
  'refunded',
  'failed'
);

-- Where an individual order line item needs to be routed operationally.
create type public.fulfillment_destination as enum (
  'kitchen',
  'bar',
  'none'
);

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show'
);

create type public.promotion_type as enum (
  'percentage_discount',
  'fixed_discount',
  'bundle',
  'featured'
);

create type public.gallery_category as enum (
  'food',
  'drinks',
  'ambience',
  'events'
);
