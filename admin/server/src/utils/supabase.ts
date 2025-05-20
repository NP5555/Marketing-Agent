import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Initialize Supabase client with service key (admin privileges)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database types for TypeScript
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