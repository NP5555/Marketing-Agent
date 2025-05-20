-- Schema for Marketing Bot Admin Panel

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Links Table
CREATE TABLE IF NOT EXISTS referral_links (
  code VARCHAR(8) PRIMARY KEY,
  creator_id UUID REFERENCES auth.users,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Config Table
CREATE TABLE IF NOT EXISTS bot_config (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB,
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for tables

-- Offers table policies
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read offers
CREATE POLICY "Authenticated users can read offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to insert, update, delete offers
CREATE POLICY "Admins can manage offers"
  ON offers
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow moderators to update offers
CREATE POLICY "Moderators can update offers"
  ON offers
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- Referral links table policies
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read referral links
CREATE POLICY "Authenticated users can read referral links"
  ON referral_links
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create their own referral links
CREATE POLICY "Users can create their own referral links"
  ON referral_links
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Allow users to delete their own referral links, admins can delete any
CREATE POLICY "Users can delete their own referral links, admins can delete any"
  ON referral_links
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Bot config table policies
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read bot config
CREATE POLICY "Authenticated users can read bot config"
  ON bot_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage bot config
CREATE POLICY "Admins can manage bot config"
  ON bot_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin'); 