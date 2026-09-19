CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_leads_business_id ON leads(business_id);
