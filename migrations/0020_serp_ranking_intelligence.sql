-- Migration: 0020_serp_ranking_intelligence.sql
-- Rankora Real SERP & Local Ranking Intelligence Schema

-- 1. Tracked Keywords Table
CREATE TABLE IF NOT EXISTS tracked_keywords (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  location TEXT,
  language TEXT DEFAULT 'en',
  device TEXT DEFAULT 'desktop',
  search_engine TEXT DEFAULT 'google',
  target_url TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 2. Ranking Results Table
CREATE TABLE IF NOT EXISTS ranking_results (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  keyword_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  target_domain TEXT,
  target_url TEXT,
  position INTEGER,
  ranking_type TEXT DEFAULT 'organic',
  location TEXT,
  competitor_domain TEXT,
  search_date DATE DEFAULT (DATE('now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES tracked_keywords(id) ON DELETE CASCADE
);

-- 3. Ranking History Table
CREATE TABLE IF NOT EXISTS ranking_history (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  keyword_id TEXT NOT NULL,
  previous_position INTEGER,
  current_position INTEGER,
  position_change INTEGER,
  visibility_change REAL DEFAULT 0.0,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES tracked_keywords(id) ON DELETE CASCADE
);

-- 4. Competitor Rankings Table
CREATE TABLE IF NOT EXISTS competitor_rankings (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position INTEGER,
  ranking_type TEXT DEFAULT 'organic',
  location TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Performance and Tenant Isolation Indexes
CREATE INDEX IF NOT EXISTS idx_tracked_kw_biz ON tracked_keywords(business_id, active);
CREATE INDEX IF NOT EXISTS idx_rank_res_biz ON ranking_results(business_id, search_date DESC);
CREATE INDEX IF NOT EXISTS idx_rank_res_kw ON ranking_results(keyword_id, search_date DESC);
CREATE INDEX IF NOT EXISTS idx_rank_hist_kw ON ranking_history(keyword_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_hist_biz ON ranking_history(business_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_comp_rank_biz ON competitor_rankings(business_id, competitor_domain);
