-- Add subscription_status and polar_customer_id to users
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN polar_customer_id TEXT;
