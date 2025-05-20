import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
  created_at: string;
  last_signin: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
};

export type ReferralLink = {
  code: string;
  creator_id: string;
  click_count: number;
  created_at: string;
};

export type BotConfig = {
  key: string;
  value: any;
  last_modified: string;
}; 