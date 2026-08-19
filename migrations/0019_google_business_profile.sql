-- Migration: 0019_google_business_profile.sql
-- Rankora Google Business Profile & Local SEO Intelligence Schema

-- 1. Google Business Connections Table
CREATE TABLE IF NOT EXISTS google_connections (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  google_account_id TEXT,
  location_id TEXT,
  location_name TEXT,
  business_name TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  status TEXT DEFAULT 'connected',
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 2. Google Reviews Table
CREATE TABLE IF NOT EXISTS google_reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  review_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  reviewer_photo_url TEXT,
  rating INTEGER NOT NULL,
  review_text TEXT,
  review_date TEXT,
  owner_reply TEXT,
  reply_status TEXT DEFAULT 'unanswered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 3. Google Location Profiles & Local SEO Health Table
CREATE TABLE IF NOT EXISTS google_location_profiles (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE,
  location_id TEXT NOT NULL,
  title TEXT,
  address TEXT,
  phone TEXT,
  website_uri TEXT,
  primary_category TEXT,
  additional_categories TEXT,
  regular_hours TEXT,
  has_description INTEGER DEFAULT 0,
  description TEXT,
  photo_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0.0,
  local_seo_score INTEGER DEFAULT 50,
  audit_problems TEXT,
  last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_google_conn_biz ON google_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_google_conn_user ON google_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_rev_biz ON google_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_google_rev_reply ON google_reviews(reply_status);
CREATE INDEX IF NOT EXISTS idx_google_loc_biz ON google_location_profiles(business_id);
