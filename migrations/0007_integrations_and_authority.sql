-- Integrations Table (Google Search Console, etc.)
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- e.g., 'google_search_console'
  access_token TEXT,
  refresh_token TEXT,
  property_id TEXT,       -- The specific website property ID selected
  status TEXT DEFAULT 'active', -- 'active', 'error', 'disconnected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);

-- Authority Opportunities Table
CREATE TABLE IF NOT EXISTS authority_opportunities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL, -- 'directory', 'partnership', 'guest_post', 'sponsorship'
  why_relevant TEXT,
  difficulty TEXT,    -- 'Easy', 'Medium', 'Hard'
  value TEXT,         -- 'Low', 'Medium', 'High'
  status TEXT DEFAULT 'New', -- 'New', 'Researching', 'Outreach Ready', 'Contacted', 'In Progress', 'Won', 'Rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Outreach Drafts Table
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  draft_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES authority_opportunities(id) ON DELETE CASCADE
);

-- Backlinks Tracking Table
CREATE TABLE IF NOT EXISTS backlinks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  status TEXT DEFAULT 'Active', -- 'Active', 'Lost', 'Pending', 'No Follow', 'Unknown'
  notes TEXT,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Local Citations Tracking
CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- e.g., 'Yelp', 'YellowPages', 'Bing Places'
  url TEXT,
  status TEXT DEFAULT 'Not Listed', -- 'Not Listed', 'Needs Update', 'Complete', 'Needs Verification'
  action_needed TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
