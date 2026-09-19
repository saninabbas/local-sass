-- Add password_hash to users
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fast session lookup
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
