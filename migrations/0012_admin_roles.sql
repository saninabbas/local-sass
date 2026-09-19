-- Migration: Add role column to users
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Create index on role for fast admin checks
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
