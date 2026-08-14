-- Migration: 0014_copilot_and_competitor_intelligence.sql
-- Description: Schema for AI Growth Copilot, Discovered Competitors, Gap Analysis, Content Gaps, and Growth Roadmap

-- 1. Copilot Conversations
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Growth Strategy Chat',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_copilot_conv_user ON copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conv_biz ON copilot_conversations(business_id);

-- 2. Copilot Messages
CREATE TABLE IF NOT EXISTS copilot_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  action_type TEXT,   -- e.g., 'run_audit', 'discover_competitors', 'refresh_rankings', 'generate_content', 'find_authority'
  action_payload TEXT, -- JSON string of action metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES copilot_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_copilot_msg_conv ON copilot_messages(conversation_id);

-- 3. Discovered Competitors (Real SERP Results)
CREATE TABLE IF NOT EXISTS discovered_competitors (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  name TEXT NOT NULL,
  ranking_position INTEGER,
  keyword TEXT,
  url TEXT NOT NULL,
  location TEXT,
  organic_title TEXT,
  organic_snippet TEXT,
  health_score INTEGER DEFAULT 0,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discovered_comp_biz ON discovered_competitors(business_id);

-- 4. Competitor Gap Analysis ("Why Are They Ranking?" & Structural Gaps)
CREATE TABLE IF NOT EXISTS competitor_gap_analyses (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  gap_type TEXT NOT NULL, -- 'technical', 'onpage', 'content_depth', 'local_relevance', 'service_coverage', 'trust_signals'
  gap_title TEXT NOT NULL,
  customer_evidence TEXT,
  competitor_evidence TEXT,
  confidence_level TEXT NOT NULL DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW'
  likely_factor TEXT, -- 'Likely contributing factor', 'Secondary ranking factor', 'Definite advantage'
  recommendation TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comp_gaps_biz ON competitor_gap_analyses(business_id);

-- 5. Content Gaps
CREATE TABLE IF NOT EXISTS content_gaps (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  search_intent TEXT NOT NULL, -- 'commercial', 'informational', 'local_transactional'
  reason TEXT NOT NULL,
  competitor_evidence TEXT,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  expected_outcome TEXT,
  status TEXT DEFAULT 'identified', -- 'identified', 'in_progress', 'published'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_gaps_biz ON content_gaps(business_id);

-- 6. Growth Roadmap Items (Today / This Week / This Month / Next 90 Days)
CREATE TABLE IF NOT EXISTS growth_roadmap_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  timeframe TEXT NOT NULL, -- 'today', 'this_week', 'this_month', 'next_90_days'
  priority TEXT NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL DEFAULT 'High',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  expected_outcome TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_roadmap_biz ON growth_roadmap_items(business_id);
