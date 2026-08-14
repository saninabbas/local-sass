-- Migration: 0015_complete_product_intelligence.sql
-- Description: Adds remaining score dimensions, business discovery metadata, and real data tags

-- 1. Growth Score full 11 dimensions
ALTER TABLE growth_scores ADD COLUMN gbp_score INTEGER DEFAULT -1;
ALTER TABLE growth_scores ADD COLUMN rankings_score INTEGER DEFAULT -1;
ALTER TABLE growth_scores ADD COLUMN authority_score INTEGER DEFAULT -1;
ALTER TABLE growth_scores ADD COLUMN conversion_score INTEGER DEFAULT 0;

-- 2. Business discovery metadata
ALTER TABLE businesses ADD COLUMN primary_keywords TEXT;
ALTER TABLE businesses ADD COLUMN main_services TEXT;
ALTER TABLE businesses ADD COLUMN discovered_data TEXT;
ALTER TABLE businesses ADD COLUMN last_crawled_at DATETIME;
