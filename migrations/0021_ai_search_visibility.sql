-- Migration: 0021_ai_search_visibility.sql
-- Purpose: Complete AI Search Visibility, Generative Engine Optimization (GEO), AI Citations, AI Crawlers, and AI Competitor Monitoring

-- 1. AI Search Monitored Queries
CREATE TABLE IF NOT EXISTS ai_search_queries (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    query TEXT NOT NULL,
    intent_category TEXT DEFAULT 'informational', -- informational, transactional, navigational, commercial, local
    target_location TEXT DEFAULT 'Global',
    language TEXT DEFAULT 'en',
    frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
    status TEXT DEFAULT 'active', -- active, paused, archived
    last_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_search_queries_business ON ai_search_queries(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_status ON ai_search_queries(status);

-- 2. AI Search Execution Runs (Per query, per surface snapshot)
CREATE TABLE IF NOT EXISTS ai_search_runs (
    id TEXT PRIMARY KEY,
    query_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    surface TEXT NOT NULL, -- chatgpt, gemini, perplexity, google_ai_overview
    methodology TEXT DEFAULT 'live_api', -- live_api, simulated_evaluation, crawler_derived
    status TEXT DEFAULT 'completed', -- completed, failed, unavailable, rate_limited
    error_message TEXT,
    response_snapshot TEXT, -- full text or excerpt returned by the LLM
    latency_ms INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES ai_search_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_search_runs_query ON ai_search_runs(query_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_runs_business_surface ON ai_search_runs(business_id, surface);

-- 3. AI Search Mentions and Citations
CREATE TABLE IF NOT EXISTS ai_search_mentions (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    query_id TEXT NOT NULL,
    surface TEXT NOT NULL,
    is_client_mentioned INTEGER DEFAULT 0, -- 1 if brand name was mentioned in the text
    is_client_cited INTEGER DEFAULT 0, -- 1 if website domain was linked as a citation
    mention_sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
    mention_snippet TEXT,
    cited_url TEXT,
    cited_anchor_text TEXT,
    competitor_mentions_json TEXT, -- JSON array of competitors mentioned/cited in this run
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES ai_search_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (query_id) REFERENCES ai_search_queries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_business ON ai_search_mentions(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_query ON ai_search_mentions(query_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_surface ON ai_search_mentions(surface);

-- 4. AI Crawler Access & Robots.txt Audits
CREATE TABLE IF NOT EXISTS ai_crawler_audits (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    crawler_name TEXT NOT NULL, -- OAI-SearchBot, GPTBot, PerplexityBot, Google-Extended, ClaudeBot, Bytespider
    user_agent TEXT NOT NULL,
    status TEXT NOT NULL, -- allowed, blocked, partially_blocked, unknown
    robots_rule TEXT, -- e.g. "Disallow: /" or "Allow: /"
    recommendation TEXT,
    last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_crawler_audits_business ON ai_crawler_audits(business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_crawler_audits_biz_crawler ON ai_crawler_audits(business_id, crawler_name);

-- 5. Historical AI Visibility Scores (Scorankio AI Visibility Score Engine)
CREATE TABLE IF NOT EXISTS ai_visibility_scores (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    overall_score INTEGER NOT NULL, -- 0 to 100
    technical_accessibility_score INTEGER DEFAULT 0, -- 20% weight
    mention_rate_score INTEGER DEFAULT 0, -- 20% weight
    citation_rate_score INTEGER DEFAULT 0, -- 20% weight
    query_coverage_score INTEGER DEFAULT 0, -- 15% weight
    entity_consistency_score INTEGER DEFAULT 0, -- 10% weight
    content_readiness_score INTEGER DEFAULT 0, -- 10% weight
    structured_data_score INTEGER DEFAULT 0, -- 5% weight
    total_queries_evaluated INTEGER DEFAULT 0,
    total_citations_found INTEGER DEFAULT 0,
    total_mentions_found INTEGER DEFAULT 0,
    surface_breakdown_json TEXT, -- JSON breakdown per engine (chatgpt, gemini, perplexity, google_ai_overview)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_visibility_scores_business ON ai_visibility_scores(business_id, created_at);

-- 6. AI Content Readiness & Generative Engine Optimization (GEO) Audits
CREATE TABLE IF NOT EXISTS ai_content_readiness (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    direct_answers_score INTEGER DEFAULT 0, -- 0-100
    information_gain_score INTEGER DEFAULT 0, -- 0-100
    structured_data_health INTEGER DEFAULT 0, -- 0-100
    entity_clarity_score INTEGER DEFAULT 0, -- 0-100
    overall_readiness_score INTEGER DEFAULT 0, -- 0-100
    audit_findings_json TEXT, -- detailed breakdown of strengths, weaknesses, gaps
    recommendations_json TEXT, -- actionable suggestions for GEO
    last_audited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_content_readiness_business ON ai_content_readiness(business_id);

-- 7. AI Search Opportunities (Query Gaps, Competitor Citations)
CREATE TABLE IF NOT EXISTS ai_search_opportunities (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    query TEXT NOT NULL,
    opportunity_type TEXT NOT NULL, -- missed_citation, competitor_dominance, missing_schema, crawler_blocked, unranked_intent
    priority TEXT DEFAULT 'high', -- high, medium, low
    estimated_impact TEXT DEFAULT 'medium', -- high, medium, low
    competitor_cited TEXT,
    suggested_action TEXT NOT NULL,
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_search_opportunities_business ON ai_search_opportunities(business_id);
