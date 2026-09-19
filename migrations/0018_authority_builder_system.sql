-- =========================================================================
-- MIGRATION 0018: AUTHORITY BUILDER & GROWTH TASK SYSTEM
-- =========================================================================

-- 1. Authority Tasks Table
CREATE TABLE IF NOT EXISTS authority_tasks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_authority_tasks_biz ON authority_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_authority_tasks_status ON authority_tasks(business_id, status);
CREATE INDEX IF NOT EXISTS idx_authority_tasks_platform ON authority_tasks(business_id, platform);

-- 2. Ensure backlinks table schema compatibility
CREATE TABLE IF NOT EXISTS backlinks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  url TEXT,
  source_url TEXT,
  domain TEXT,
  source_domain TEXT,
  target_url TEXT,
  target_domain TEXT,
  authority_score INTEGER DEFAULT 0,
  anchor_text TEXT,
  follow_type TEXT DEFAULT 'dofollow',
  dofollow INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Active',
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backlinks_biz_id ON backlinks(business_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_domain ON backlinks(business_id, domain);
