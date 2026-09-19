-- Migration 0018: Backlink Intelligence & Competitor Gap Engine

-- Create Competitors table for link gap tracking
CREATE TABLE IF NOT EXISTS competitors (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competitors_business_id ON competitors(business_id);

-- Ensure backlinks table has all intelligence columns
CREATE TABLE IF NOT EXISTS backlinks_v2 (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  domain_authority INTEGER DEFAULT 0,
  traffic_estimate INTEGER DEFAULT 0,
  follow_type TEXT DEFAULT 'dofollow', -- 'dofollow' | 'nofollow'
  link_status TEXT DEFAULT 'active',   -- 'active' | 'lost' | 'new'
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_backlinks_v2_business_id ON backlinks_v2(business_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_v2_status ON backlinks_v2(link_status);
