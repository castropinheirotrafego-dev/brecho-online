export type ItemType =
  | 'conjuntos'
  | 'jaquetas-casacos'
  | 'vestidos'
  | 'blusas-camisetas'
  | 'camisas'
  | 'shorts'
  | 'saias'
  | 'calcas'
  | 'sapatos'
  | 'tenis'
  | 'botas'
  | 'bolsas'
export type ItemCategory = 'adulto' | 'infantil'
export type ItemCondition = 'novo' | 'seminovo' | 'usado'
export type ItemStatus = 'available' | 'negotiating' | 'reserved' | 'sold'
export type OrderStatus = 'pending_delivery' | 'completed' | 'cancelled'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type OfferRoundAuthor = 'buyer' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          avatar_url: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone: string
        }
        Update: {
          full_name?: string
          phone?: string
          avatar_url?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          name: string
          type: ItemType
          category: ItemCategory
          condition: ItemCondition
          size: string | null
          price: number
          original_price: number | null
          description: string | null
          status: ItemStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          type: ItemType
          category?: ItemCategory
          condition?: ItemCondition
          size?: string | null
          price: number
          original_price?: number | null
          description?: string | null
          status?: ItemStatus
        }
        Update: {
          name?: string
          type?: ItemType
          category?: ItemCategory
          condition?: ItemCondition
          size?: string | null
          price?: number
          original_price?: number | null
          description?: string | null
          status?: ItemStatus
        }
        Relationships: []
      }
      item_images: {
        Row: {
          id: string
          item_id: string
          storage_path: string
          position: number
        }
        Insert: {
          item_id: string
          storage_path: string
          position?: number
        }
        Update: {
          storage_path?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'item_images_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
        ]
      }
      cart_items: {
        Row: {
          user_id: string
          item_id: string
          added_at: string
        }
        Insert: {
          user_id: string
          item_id: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'cart_items_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          id: string
          item_id: string
          buyer_id: string
          price: number
          status: OrderStatus
          created_at: string
        }
        Insert: {
          item_id: string
          buyer_id: string
          price: number
          status?: OrderStatus
        }
        Update: {
          status?: OrderStatus
        }
        Relationships: [
          {
            foreignKeyName: 'orders_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_buyer_id_fkey'
            columns: ['buyer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      offers: {
        Row: {
          id: string
          item_id: string
          buyer_id: string
          status: OfferStatus
          last_amount: number
          last_author: OfferRoundAuthor
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id: string
          buyer_id: string
          status?: OfferStatus
          last_amount: number
          last_author?: OfferRoundAuthor
        }
        Update: {
          status?: OfferStatus
          last_amount?: number
          last_author?: OfferRoundAuthor
        }
        Relationships: [
          {
            foreignKeyName: 'offers_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'offers_buyer_id_fkey'
            columns: ['buyer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      offer_rounds: {
        Row: {
          id: string
          offer_id: string
          author: OfferRoundAuthor
          amount: number
          message: string | null
          created_at: string
        }
        Insert: {
          offer_id: string
          author: OfferRoundAuthor
          amount: number
          message?: string | null
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'offer_rounds_offer_id_fkey'
            columns: ['offer_id']
            referencedRelation: 'offers'
            referencedColumns: ['id']
          },
        ]
      }
      category_images: {
        Row: {
          type: ItemType
          storage_path: string
          updated_at: string
        }
        Insert: {
          type: ItemType
          storage_path: string
        }
        Update: {
          storage_path?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          hero_image_path: string | null
          hero_title: string | null
          hero_subtitle: string | null
          hero_button_text: string | null
          hero_badges: string[]
          updated_at: string
        }
        Insert: {
          id: string
          hero_image_path?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_button_text?: string | null
          hero_badges?: string[]
        }
        Update: {
          hero_image_path?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_button_text?: string | null
          hero_badges?: string[]
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      checkout_cart: {
        Args: Record<string, never>
        Returns: Database['public']['Tables']['orders']['Row'][]
      }
      buy_now: {
        Args: { p_item_id: string }
        Returns: Database['public']['Tables']['orders']['Row']
      }
      create_offer: {
        Args: { p_item_id: string; p_amount: number; p_message?: string | null }
        Returns: Database['public']['Tables']['offers']['Row']
      }
      admin_respond_offer: {
        Args: { p_offer_id: string; p_action: string; p_amount?: number | null; p_message?: string | null }
        Returns: Database['public']['Tables']['offers']['Row']
      }
      buyer_respond_offer: {
        Args: { p_offer_id: string; p_action: string }
        Returns: Database['public']['Tables']['offers']['Row']
      }
      admin_finish_order: {
        Args: { p_order_id: string; p_action: string }
        Returns: Database['public']['Tables']['orders']['Row']
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
