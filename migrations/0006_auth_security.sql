-- Add auth security columns to users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN totp_secret TEXT;

CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
