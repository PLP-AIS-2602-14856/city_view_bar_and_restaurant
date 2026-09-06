/**
 * Hand-written to match supabase/migrations/*.sql exactly.
 * Once the project is linked to a live Supabase instance, regenerate with:
 *   npm run db:types
 * and treat that generated file as the source of truth going forward.
 *
 * IMPORTANT: each table's Row type is a standalone named interface, and
 * Insert/Update are derived FROM that named interface (e.g. `Partial<CategoryRow>`).
 * Do NOT write `Database['public']['Tables']['x']['Row']` from inside the
 * definition of table `x` itself — that circular self-reference makes
 * TypeScript resolve the whole table's type to `never`, which silently breaks
 * every query against that table project-wide. `npx tsc --noEmit` (no network
 * needed) catches this class of bug; run it after editing this file.
 */

export type UserRole = 'customer' | 'staff' | 'kitchen' | 'bar' | 'admin';
export type ProductType =
  | 'food'
  | 'alcoholic_drink'
  | 'wine'
  | 'cocktail'
  | 'soft_drink'
  | 'juice';
export type OrderChannel = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';
export type FulfillmentDestination = 'kitchen' | 'bar' | 'none';
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PromotionType = 'percentage_discount' | 'fixed_discount' | 'bundle' | 'featured';
export type GalleryCategory = 'food' | 'drinks' | 'ambience' | 'events';

interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  // Required by @supabase/supabase-js's internal GenericTable shape — omitting
  // it entirely (not just leaving it empty) breaks structural type matching
  // and silently collapses query results to `never`. An empty array is fine:
  // none of this project's queries rely on typed FK-relationship inference for
  // embedded/joined selects (those are read with `as any` and mapped by hand
  // in lib/database/*.ts and lib/admin/*.ts instead).
  Relationships: [];
}

// ---------------------------------------------------------------------------
// Named Row interfaces — one per table, standalone (no self-reference).
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  product_type: ProductType | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  category_id: string | null;
  product_type: ProductType;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  currency: string;
  is_available: boolean;
  is_featured: boolean;
  is_published: boolean;
  attributes: Record<string, unknown>;
  display_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  price_override: number | null;
  sku: string | null;
  is_default: boolean;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AddonGroupRow {
  id: string;
  product_id: string;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  display_order: number;
}

export interface AddonOptionRow {
  id: string;
  addon_group_id: string;
  name: string;
  price_delta: number;
  is_available: boolean;
  display_order: number;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface InventoryRow {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  track_inventory: boolean;
  quantity_on_hand: number;
  reorder_threshold: number;
  updated_at: string;
}

export interface InventoryAdjustmentRow {
  id: string;
  inventory_id: string;
  change_qty: number;
  reason: string;
  created_by: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  table_number: string | null;
  delivery_address: Record<string, unknown> | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  destination: FulfillmentDestination;
  special_instructions: string | null;
  created_at: string;
}

export interface OrderItemAddonRow {
  id: string;
  order_item_id: string;
  addon_option_id: string | null;
  addon_name_snapshot: string;
  price_delta_snapshot: number;
}

export interface ReservationRow {
  id: string;
  customer_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  table_preference: string | null;
  status: ReservationStatus;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  promotion_type: PromotionType;
  discount_value: number | null;
  image_storage_path: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionProductRow {
  promotion_id: string;
  product_id: string;
}

export interface RestaurantSettingRow {
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

export interface GalleryImageRow {
  id: string;
  storage_path: string;
  caption: string | null;
  category: GalleryCategory;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Database — Insert/Update derived from the named Row interfaces above.
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, 'id'> & Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      categories: Table<
        CategoryRow,
        Pick<CategoryRow, 'name' | 'slug'> &
          Partial<Omit<CategoryRow, 'id' | 'name' | 'slug' | 'created_at' | 'updated_at'>>,
        Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      products: Table<
        ProductRow,
        Pick<ProductRow, 'product_type' | 'name' | 'slug' | 'base_price'> &
          Partial<
            Omit<
              ProductRow,
              'id' | 'product_type' | 'name' | 'slug' | 'base_price' | 'created_at' | 'updated_at'
            >
          >,
        Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      product_variants: Table<
        ProductVariantRow,
        Pick<ProductVariantRow, 'product_id' | 'name'> &
          Partial<
            Omit<ProductVariantRow, 'id' | 'product_id' | 'name' | 'created_at' | 'updated_at'>
          >,
        Partial<Omit<ProductVariantRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      addon_groups: Table<
        AddonGroupRow,
        Pick<AddonGroupRow, 'product_id' | 'name'> &
          Partial<Omit<AddonGroupRow, 'id' | 'product_id' | 'name'>>,
        Partial<Omit<AddonGroupRow, 'id'>>
      >;

      addon_options: Table<
        AddonOptionRow,
        Pick<AddonOptionRow, 'addon_group_id' | 'name'> &
          Partial<Omit<AddonOptionRow, 'id' | 'addon_group_id' | 'name'>>,
        Partial<Omit<AddonOptionRow, 'id'>>
      >;

      product_images: Table<
        ProductImageRow,
        Pick<ProductImageRow, 'product_id' | 'storage_path'> &
          Partial<Omit<ProductImageRow, 'id' | 'product_id' | 'storage_path' | 'created_at'>>,
        Partial<Omit<ProductImageRow, 'id' | 'created_at'>>
      >;

      inventory: Table<InventoryRow, Partial<InventoryRow>, Partial<InventoryRow>>;

      inventory_adjustments: Table<
        InventoryAdjustmentRow,
        Pick<InventoryAdjustmentRow, 'inventory_id' | 'change_qty' | 'reason'> &
          Partial<Omit<InventoryAdjustmentRow, 'id' | 'inventory_id' | 'change_qty' | 'reason' | 'created_at'>>,
        Partial<Omit<InventoryAdjustmentRow, 'id' | 'created_at'>>
      >;

      orders: Table<
        OrderRow,
        Pick<OrderRow, 'channel' | 'contact_name' | 'contact_phone' | 'subtotal' | 'total_amount'> &
          Partial<
            Omit<
              OrderRow,
              | 'id'
              | 'order_number'
              | 'channel'
              | 'contact_name'
              | 'contact_phone'
              | 'subtotal'
              | 'total_amount'
              | 'created_at'
              | 'updated_at'
            >
          >,
        Partial<Omit<OrderRow, 'id' | 'order_number' | 'created_at' | 'updated_at'>>
      >;

      order_items: Table<
        OrderItemRow,
        Pick<
          OrderItemRow,
          'order_id' | 'product_name_snapshot' | 'unit_price_snapshot' | 'quantity' | 'line_total'
        > &
          Partial<
            Omit<
              OrderItemRow,
              | 'id'
              | 'order_id'
              | 'product_name_snapshot'
              | 'unit_price_snapshot'
              | 'quantity'
              | 'line_total'
              | 'created_at'
            >
          >,
        Partial<Omit<OrderItemRow, 'id' | 'created_at'>>
      >;

      order_item_addons: Table<
        OrderItemAddonRow,
        Pick<OrderItemAddonRow, 'order_item_id' | 'addon_name_snapshot'> &
          Partial<Omit<OrderItemAddonRow, 'id' | 'order_item_id' | 'addon_name_snapshot'>>,
        Partial<Omit<OrderItemAddonRow, 'id'>>
      >;

      reservations: Table<
        ReservationRow,
        Pick<
          ReservationRow,
          'guest_name' | 'guest_phone' | 'party_size' | 'reservation_date' | 'reservation_time'
        > &
          Partial<
            Omit<
              ReservationRow,
              | 'id'
              | 'guest_name'
              | 'guest_phone'
              | 'party_size'
              | 'reservation_date'
              | 'reservation_time'
              | 'created_at'
              | 'updated_at'
            >
          >,
        Partial<Omit<ReservationRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      promotions: Table<
        PromotionRow,
        Pick<PromotionRow, 'title' | 'slug' | 'promotion_type'> &
          Partial<Omit<PromotionRow, 'id' | 'title' | 'slug' | 'promotion_type' | 'created_at' | 'updated_at'>>,
        Partial<Omit<PromotionRow, 'id' | 'created_at' | 'updated_at'>>
      >;

      promotion_products: Table<PromotionProductRow, PromotionProductRow, never>;

      restaurant_settings: Table<
        RestaurantSettingRow,
        Pick<RestaurantSettingRow, 'key' | 'value'> & Partial<Pick<RestaurantSettingRow, 'updated_by'>>,
        Partial<Pick<RestaurantSettingRow, 'value' | 'updated_by'>>
      >;

      gallery_images: Table<
        GalleryImageRow,
        Pick<GalleryImageRow, 'storage_path'> &
          Partial<Omit<GalleryImageRow, 'id' | 'storage_path' | 'created_at'>>,
        Partial<Omit<GalleryImageRow, 'id' | 'created_at'>>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_user_role: { Args: Record<string, never>; Returns: UserRole };
      has_any_role: { Args: { roles: UserRole[] }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      product_type: ProductType;
      order_channel: OrderChannel;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      fulfillment_destination: FulfillmentDestination;
      reservation_status: ReservationStatus;
      promotion_type: PromotionType;
      gallery_category: GalleryCategory;
    };
  };
}
