ALTER TABLE recommendations ADD COLUMN difficulty TEXT DEFAULT 'Medium';
ALTER TABLE recommendations ADD COLUMN seo_impact TEXT DEFAULT 'Medium';
ALTER TABLE recommendations ADD COLUMN local_visibility_impact TEXT DEFAULT 'Medium';
ALTER TABLE recommendations ADD COLUMN conversion_impact TEXT DEFAULT 'Medium';
ALTER TABLE recommendations ADD COLUMN business_outcome TEXT;
ALTER TABLE recommendations ADD COLUMN completed_at DATETIME;
