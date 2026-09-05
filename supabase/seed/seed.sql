-- seed.sql
-- Demo/seed data only. Business-identity values (address, phone, hours, etc.) are
-- clearly marked [DEMO] and MUST be edited by an administrator via Settings before
-- launch — the master spec forbids inventing real business information.

-- ---------------------------------------------------------------------------
-- Restaurant settings (placeholders, admin-editable)
-- ---------------------------------------------------------------------------
insert into public.restaurant_settings (key, value) values
  ('business_name', '"City View Bar & Restaurant [DEMO]"'),
  ('address', '{"line1": "[DEMO] Update in Admin Settings", "city": "Nairobi", "country": "Kenya"}'),
  ('phone', '"[DEMO] +254 7XX XXX XXX"'),
  ('email', '"[DEMO] info@example.com"'),
  ('opening_hours', '{
    "monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00",
    "thursday": "11:00-23:00", "friday": "11:00-01:00", "saturday": "11:00-01:00",
    "sunday": "11:00-22:00", "note": "[DEMO] confirm real hours in Admin Settings"
  }'),
  ('social_links', '{"instagram": "", "facebook": "", "twitter": ""}'),
  ('delivery_zones', '[]')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (id, name, slug, product_type, display_order) values
  ('11111111-0000-0000-0000-000000000001', 'Restaurant', 'restaurant', 'food', 1),
  ('11111111-0000-0000-0000-000000000002', 'Bar', 'bar', null, 2)
on conflict (slug) do nothing;

insert into public.categories (id, parent_id, name, slug, product_type, display_order) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Starters', 'starters', 'food', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Main Courses', 'main-courses', 'food', 2),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Wines', 'wines', 'wine', 1),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Cocktails', 'cocktails', 'cocktail', 2),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Spirits & Alcoholic Drinks', 'spirits', 'alcoholic_drink', 3),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 'Soft Drinks', 'soft-drinks', 'soft_drink', 4),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 'Fresh Juices', 'juices', 'juice', 5)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Sample products (demo prices in KES — adjust in Admin > Menu Management)
-- ---------------------------------------------------------------------------
insert into public.products (id, category_id, product_type, name, slug, description, base_price, is_featured, attributes) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'food',
    'Chicken Tikka', 'chicken-tikka',
    'Char-grilled marinated chicken skewers, served with mint yoghurt.', 950, true,
    '{"spice_level": "medium", "allergens": ["dairy"]}'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'food',
    'Nyama Choma Platter', 'nyama-choma-platter',
    'Slow-grilled beef, served with ugali and kachumbari.', 1650, true,
    '{"spice_level": "mild"}'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'wine',
    'South African Merlot', 'south-african-merlot',
    'Medium-bodied red with soft tannins and dark berry notes.', 450, false,
    '{"varietal": "Merlot", "origin": "South Africa"}'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000005', 'alcoholic_drink',
    'Tusker Lager', 'tusker-lager',
    'Kenya''s iconic pilsner-style lager.', 350, true,
    '{"abv_percentage": 4.2}'),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000004', 'cocktail',
    'Dawa Cocktail', 'dawa-cocktail',
    'Vodka, honey, and fresh lime — Kenya''s classic "medicine" cocktail.', 750, true,
    '{"abv_percentage": 12}'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000007', 'juice',
    'Fresh Passion Juice', 'fresh-passion-juice',
    'Freshly pressed passion fruit juice.', 300, false,
    '{}')
on conflict (slug) do nothing;

-- Variants for the wine (glass / bottle)
insert into public.product_variants (product_id, name, price_override, is_default, display_order) values
  ('33333333-0000-0000-0000-000000000003', 'Glass', 450, true, 1),
  ('33333333-0000-0000-0000-000000000003', 'Bottle', 2400, false, 2)
on conflict (product_id, name) do nothing;

-- Inventory tracking for beer (bottle count) as an example
insert into public.inventory (product_id, track_inventory, quantity_on_hand, reorder_threshold)
values ('33333333-0000-0000-0000-000000000004', true, 240, 48)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Demo promotion so the homepage promotions strip has something to show.
-- ---------------------------------------------------------------------------
insert into public.promotions (title, slug, description, promotion_type, discount_value, starts_at, ends_at, is_active) values
  ('[DEMO] Happy Hour Cocktails', 'demo-happy-hour-cocktails',
   'Adjust or remove this promotion in Admin > Promotions before launch.',
   'percentage_discount', 20, now(), now() + interval '30 days', true)
on conflict (slug) do nothing;
