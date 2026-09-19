CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  location TEXT,
  intent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS keyword_rankings (
  id TEXT PRIMARY KEY,
  keyword_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  position INTEGER,
  visibility_score INTEGER,
  search_volume INTEGER,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_keywords_business_id ON keywords(business_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword_id ON keyword_rankings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_business_id ON keyword_rankings(business_id);
