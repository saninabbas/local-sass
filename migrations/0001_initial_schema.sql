CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  city TEXT NOT NULL,
  country TEXT,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  score INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE growth_scores (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  seo_score INTEGER NOT NULL,
  reviews_score INTEGER NOT NULL,
  website_score INTEGER NOT NULL,
  visibility_score INTEGER NOT NULL,
  previous_score INTEGER,
  score_change INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE recommendations (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  priority TEXT NOT NULL,
  priority_color TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  estimated_minutes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  action_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Indexes for performance
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_audits_business_id ON audits(business_id);
CREATE INDEX idx_growth_scores_business_id ON growth_scores(business_id);
CREATE INDEX idx_recommendations_business_id ON recommendations(business_id);
