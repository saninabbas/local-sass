-- RANKORA MIGRATION 0011: SEO CAMPAIGN ENGINE & MULTI-PROJECT TABLES

-- Projects Table (Scoped per user)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  category TEXT,
  city TEXT,
  country TEXT DEFAULT 'US',
  latitude REAL,
  longitude REAL,
  status TEXT DEFAULT 'active',
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Settings
CREATE TABLE IF NOT EXISTS project_settings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  target_country TEXT DEFAULT 'US',
  target_city TEXT,
  target_zip TEXT,
  primary_language TEXT DEFAULT 'en',
  business_type TEXT,
  crawl_frequency TEXT DEFAULT 'weekly',
  rank_tracking_frequency TEXT DEFAULT 'daily',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- SEO Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  goal TEXT DEFAULT 'Local 3-Pack Rank Elevation',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Campaign Tasks
CREATE TABLE IF NOT EXISTS campaign_tasks (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PENDING',
  source TEXT DEFAULT 'audit',
  target_url TEXT,
  target_keyword TEXT,
  evidence TEXT,
  before_value TEXT,
  expected_value TEXT,
  after_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Keyword Targets & Intent
CREATE TABLE IF NOT EXISTS keyword_targets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  intent TEXT DEFAULT 'LOCAL_TRANSACTIONAL',
  location TEXT,
  target_url TEXT,
  current_rank INTEGER,
  previous_rank INTEGER,
  best_rank INTEGER,
  status TEXT DEFAULT 'ACTIVE',
  last_checked DATETIME,
  source TEXT DEFAULT 'discovery',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- SEO Changes Log (Before vs After Verification)
CREATE TABLE IF NOT EXISTS seo_changes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT,
  change_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  before_data TEXT,
  generated_data TEXT,
  applied_data TEXT,
  verification_status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Internal Link Opportunities
CREATE TABLE IF NOT EXISTS internal_link_opportunities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor TEXT NOT NULL,
  reason TEXT,
  confidence TEXT DEFAULT 'HIGH',
  status TEXT DEFAULT 'OPEN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_tasks_proj ON campaign_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_kw_targets_proj ON keyword_targets(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_changes_proj ON seo_changes(project_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_proj ON internal_link_opportunities(project_id);
