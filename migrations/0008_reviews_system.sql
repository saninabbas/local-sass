-- Review connections (Google Business Profile connections)
CREATE TABLE IF NOT EXISTS review_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google_business',
  location_id TEXT,
  location_name TEXT,
  status TEXT DEFAULT 'disconnected',
  connected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);

-- Reviews table (stores fetched or manually added reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  external_id TEXT,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  review_date TEXT,
  owner_reply TEXT,
  reply_status TEXT DEFAULT 'none',
  source TEXT DEFAULT 'google',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_review_connections_user_id ON review_connections(user_id);
