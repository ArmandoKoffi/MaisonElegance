import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces based on the tables we will create
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // UUID from auth.users
          role: 'client' | 'admin';
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'client' | 'admin';
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          role?: 'client' | 'admin';
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          price: number;
          category: string;
          gender: 'Homme' | 'Femme' | 'Enfant';
          image: string;
          images: string[];
          description: string;
          long_description: string;
          stock: 'available' | 'low' | 'out';
          stock_count: number;
          badge: string | null;
          created_at: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          image: string;
        };
        Insert: {
          name: string;
          slug: string;
          image: string;
        };
        Update: {
          name?: string;
          slug?: string;
          image?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_number: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          notes?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          product_name: string;
          product_image: string;
          price: number;
          quantity: number;
        };
        Insert: {
          order_id: number;
          product_id: number;
          product_name: string;
          product_image: string;
          price: number;
          quantity: number;
        };
      };
      visits: {
        Row: {
          id: number;
          page: string;
          referrer: string | null;
          session_id: string;
          created_at: string;
        };
        Insert: {
          page: string;
          referrer?: string | null;
          session_id: string;
        };
      };
    };
  };
}

export type DbUser = Database['public']['Tables']['users']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Visit = Database['public']['Tables']['visits']['Row'];
