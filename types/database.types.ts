/**
 * Hand-written to match supabase/migrations/*.sql exactly.
 * Once the project is linked to a live Supabase instance, regenerate with:
 *   npm run db:types
 * and treat that generated file as the source of truth going forward.
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
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        { id: string; full_name?: string | null; phone?: string | null; role?: UserRole },
        { full_name?: string | null; phone?: string | null; role?: UserRole; is_active?: boolean }
      >;

      categories: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          name: string;
          slug: string;
        },
        Partial<Database['public']['Tables']['categories']['Row']>
      >;

      products: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          product_type: ProductType;
          name: string;
          slug: string;
          base_price: number;
        },
        Partial<Database['public']['Tables']['products']['Row']>
      >;

      product_variants: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          product_id: string;
          name: string;
        },
        Partial<Database['public']['Tables']['product_variants']['Row']>
      >;

      addon_groups: Table<
        {
          id: string;
          product_id: string;
          name: string;
          min_select: number;
          max_select: number;
          is_required: boolean;
          display_order: number;
        },
        Partial<Database['public']['Tables']['addon_groups']['Row']> & { product_id: string; name: string },
        Partial<Database['public']['Tables']['addon_groups']['Row']>
      >;

      addon_options: Table<
        {
          id: string;
          addon_group_id: string;
          name: string;
          price_delta: number;
          is_available: boolean;
          display_order: number;
        },
        Partial<Database['public']['Tables']['addon_options']['Row']> & {
          addon_group_id: string;
          name: string;
        },
        Partial<Database['public']['Tables']['addon_options']['Row']>
      >;

      product_images: Table<
        {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        },
        Partial<Database['public']['Tables']['product_images']['Row']> & {
          product_id: string;
          storage_path: string;
        },
        Partial<Database['public']['Tables']['product_images']['Row']>
      >;

      inventory: Table<
        {
          id: string;
          product_id: string | null;
          variant_id: string | null;
          track_inventory: boolean;
          quantity_on_hand: number;
          reorder_threshold: number;
          updated_at: string;
        },
        Partial<Database['public']['Tables']['inventory']['Row']>,
        Partial<Database['public']['Tables']['inventory']['Row']>
      >;

      inventory_adjustments: Table<
        {
          id: string;
          inventory_id: string;
          change_qty: number;
          reason: string;
          created_by: string | null;
          created_at: string;
        },
        Partial<Database['public']['Tables']['inventory_adjustments']['Row']> & {
          inventory_id: string;
          change_qty: number;
          reason: string;
        },
        Partial<Database['public']['Tables']['inventory_adjustments']['Row']>
      >;

      orders: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>> & {
          channel: OrderChannel;
          contact_name: string;
          contact_phone: string;
          subtotal: number;
          total_amount: number;
        },
        Partial<Database['public']['Tables']['orders']['Row']>
      >;

      order_items: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>> & {
          order_id: string;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        },
        Partial<Database['public']['Tables']['order_items']['Row']>
      >;

      order_item_addons: Table<
        {
          id: string;
          order_item_id: string;
          addon_option_id: string | null;
          addon_name_snapshot: string;
          price_delta_snapshot: number;
        },
        Partial<Database['public']['Tables']['order_item_addons']['Row']> & {
          order_item_id: string;
          addon_name_snapshot: string;
        },
        Partial<Database['public']['Tables']['order_item_addons']['Row']>
      >;

      reservations: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          guest_name: string;
          guest_phone: string;
          party_size: number;
          reservation_date: string;
          reservation_time: string;
        },
        Partial<Database['public']['Tables']['reservations']['Row']>
      >;

      promotions: Table<
        {
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
        },
        Partial<Omit<Database['public']['Tables']['promotions']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          title: string;
          slug: string;
          promotion_type: PromotionType;
        },
        Partial<Database['public']['Tables']['promotions']['Row']>
      >;

      promotion_products: Table<
        { promotion_id: string; product_id: string },
        { promotion_id: string; product_id: string },
        never
      >;

      restaurant_settings: Table<
        { key: string; value: unknown; updated_by: string | null; updated_at: string },
        { key: string; value: unknown; updated_by?: string | null },
        { value?: unknown; updated_by?: string | null }
      >;

      gallery_images: Table<
        {
          id: string;
          storage_path: string;
          caption: string | null;
          category: GalleryCategory;
          display_order: number;
          is_published: boolean;
          created_at: string;
        },
        Partial<Database['public']['Tables']['gallery_images']['Row']> & { storage_path: string },
        Partial<Database['public']['Tables']['gallery_images']['Row']>
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
