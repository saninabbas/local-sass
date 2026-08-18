-- Migration 0016: Polar Billing Production Architecture
-- Zero Fabricated Data, Idempotent Webhooks, and Deterministic Entitlements

-- 1. Extend users table defensively with Polar subscription tracking columns
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'starter';
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN polar_customer_id TEXT;
ALTER TABLE users ADD COLUMN polar_subscription_id TEXT;
ALTER TABLE users ADD COLUMN polar_product_id TEXT;
ALTER TABLE users ADD COLUMN current_period_start DATETIME;
ALTER TABLE users ADD COLUMN current_period_end DATETIME;
ALTER TABLE users ADD COLUMN cancel_at_period_end INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN plan_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 2. Create subscriptions table for full historical & multi-tier tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  business_id TEXT,
  plan TEXT NOT NULL, -- 'starter', 'growth', 'agency_pro'
  subscription_status TEXT NOT NULL, -- 'active', 'past_due', 'canceled', 'revoked', 'trialing'
  polar_customer_id TEXT,
  polar_subscription_id TEXT UNIQUE,
  polar_product_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_sub_id ON subscriptions(polar_subscription_id);

-- 3. Create subscription_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS subscription_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  polar_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload_hash TEXT,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_events_polar_event_id ON subscription_events(polar_event_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_user_id ON subscription_events(user_id);
