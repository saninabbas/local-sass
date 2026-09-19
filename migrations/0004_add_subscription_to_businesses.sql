-- Add subscription tracking to businesses
ALTER TABLE businesses ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN polar_subscription_id TEXT;
ALTER TABLE businesses ADD COLUMN polar_customer_id TEXT;
