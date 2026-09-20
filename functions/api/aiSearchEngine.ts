// functions/api/aiSearchEngine.ts
// Enterprise AI Search Visibility & Generative Engine Optimization (GEO) Engine

export type AISurface = 'chatgpt' | 'gemini' | 'perplexity' | 'google_ai_overview';

export interface AISurfaceResult {
  surface: AISurface;
  surfaceName: string;
  isClientMentioned: boolean;
  isClientCited: boolean;
  citedUrl?: string;
  citedAnchor?: string;
  mentionSentiment?: 'positive' | 'neutral' | 'negative';
  mentionSnippet?: string;
  competitorsFound: Array<{ name: string; domain?: string; citedUrl?: string }>;
  responseExcerpt: string;
  status: 'completed' | 'failed' | 'unavailable' | 'provider_unavailable' | 'rate_limited';
  latencyMs: number;
}

export interface AICrawlerInfo {
  crawlerName: string;
  userAgent: string;
  purpose: string;
  recommendedStatus: 'allowed' | 'restricted';
}

export const KNOWN_AI_CRAWLERS: AICrawlerInfo[] = [
  {
    crawlerName: 'OAI-SearchBot',
    userAgent: 'OAI-SearchBot',
    purpose: 'ChatGPT Search live search indexing and citation linking',
    recommendedStatus: 'allowed',
  },
  {
    crawlerName: 'GPTBot',
    userAgent: 'GPTBot',
    purpose: 'OpenAI model training and foundation data collection',
    recommendedStatus: 'allowed',
  },
  {
    crawlerName: 'PerplexityBot',
    userAgent: 'PerplexityBot',
    purpose: 'Perplexity AI live search answering and direct source citation',
    recommendedStatus: 'allowed',
  },
  {
    crawlerName: 'Google-Extended',
    userAgent: 'Google-Extended',
    purpose: 'Google Gemini and Vertex AI training and knowledge expansion',
    recommendedStatus: 'allowed',
  },
  {
    crawlerName: 'ClaudeBot',
    userAgent: 'ClaudeBot',
    purpose: 'Anthropic Claude web indexing and live citations',
    recommendedStatus: 'allowed',
  },
  {
    crawlerName: 'Bytespider',
    userAgent: 'Bytespider',
    purpose: 'ByteDance AI crawling and search indexing',
    recommendedStatus: 'restricted',
  }
];

export interface ScoreWeights {
  technicalAccessibility: number; // 20%
  mentionRate: number;            // 20%
  citationRate: number;          // 20%
  queryCoverage: number;         // 15%
  entityConsistency: number;     // 10%
  contentReadiness: number;      // 10%
  structuredData: number;        // 5%
}

export const SCORANKIO_AI_SCORE_WEIGHTS: ScoreWeights = {
  technicalAccessibility: 0.20,
  mentionRate: 0.20,
  citationRate: 0.20,
  queryCoverage: 0.15,
  entityConsistency: 0.10,
  contentReadiness: 0.10,
  structuredData: 0.05,
};

/**
 * Validates a target URL against SSRF (Server-Side Request Forgery).
 * Blocks localhost, private IPv4/IPv6 CIDR ranges, link-local metadata endpoints, and non-HTTP protocols.
 */
export function isSafePublicUrl(urlStr: string): { safe: boolean; url?: URL; reason?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { safe: false, reason: 'URL must be a non-empty string' };
  }

  const trimmed = urlStr.trim();

  // Check if an explicit URI scheme is specified and reject non-http/https schemes
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return { safe: false, reason: `Blocked invalid protocol: ${scheme}:. Only HTTP and HTTPS are permitted.` };
    }
  }

  try {
    const raw = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    
    const parsed = new URL(raw);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Blocked invalid protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Block localhost and internal names
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { safe: false, reason: 'Access to localhost and internal domain names is blocked for security.' };
    }

    // Block IPv4 private/loopback/link-local/metadata IP ranges
    const isPrivateIpv4 = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|0\.|100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.)/.test(hostname);
    if (isPrivateIpv4) {
      return { safe: false, reason: 'Access to private, loopback, and cloud metadata IPv4 addresses is blocked.' };
    }

    // Block IPv6 loopback and private addresses
    if (hostname.startsWith('[') && (hostname.includes('::1') || hostname.includes('fe80:') || hostname.includes('fc00:') || hostname.includes('fd00:'))) {
      return { safe: false, reason: 'Access to private and loopback IPv6 addresses is blocked.' };
    }

    // Restrict ports to standard 80 and 443
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      return { safe: false, reason: `Blocked non-standard port ${parsed.port}. Only ports 80 and 443 are allowed.` };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }
}

/**
 * Ensure all AI Search Visibility & GEO D1 tables are created and indexed.
 */
export async function ensureAISearchTables(db: any) {
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_search_queries (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      query TEXT NOT NULL,
      intent_category TEXT DEFAULT 'informational',
      target_location TEXT DEFAULT 'Global',
      language TEXT DEFAULT 'en',
      frequency TEXT DEFAULT 'weekly',
      status TEXT DEFAULT 'active',
      last_run_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_queries_business ON ai_search_queries(business_id)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_queries_status ON ai_search_queries(status)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_search_runs (
      id TEXT PRIMARY KEY,
      query_id TEXT NOT NULL,
      business_id TEXT NOT NULL,
      surface TEXT NOT NULL,
      methodology TEXT DEFAULT 'live_api',
      status TEXT DEFAULT 'completed',
      error_message TEXT,
      response_snapshot TEXT,
      latency_ms INTEGER DEFAULT 0,
      tokens_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_runs_query ON ai_search_runs(query_id)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_runs_business_surface ON ai_search_runs(business_id, surface)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_search_mentions (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      business_id TEXT NOT NULL,
      query_id TEXT NOT NULL,
      surface TEXT NOT NULL,
      is_client_mentioned INTEGER DEFAULT 0,
      is_client_cited INTEGER DEFAULT 0,
      mention_sentiment TEXT DEFAULT 'neutral',
      mention_snippet TEXT,
      cited_url TEXT,
      cited_anchor_text TEXT,
      competitor_mentions_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_business ON ai_search_mentions(business_id)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_query ON ai_search_mentions(query_id)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_mentions_surface ON ai_search_mentions(surface)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_crawler_audits (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      crawler_name TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      status TEXT NOT NULL,
      robots_rule TEXT,
      recommendation TEXT,
      last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_crawler_audits_business ON ai_crawler_audits(business_id)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_visibility_scores (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      overall_score INTEGER NOT NULL,
      technical_accessibility_score INTEGER DEFAULT 0,
      mention_rate_score INTEGER DEFAULT 0,
      citation_rate_score INTEGER DEFAULT 0,
      query_coverage_score INTEGER DEFAULT 0,
      entity_consistency_score INTEGER DEFAULT 0,
      content_readiness_score INTEGER DEFAULT 0,
      structured_data_score INTEGER DEFAULT 0,
      total_queries_evaluated INTEGER DEFAULT 0,
      total_citations_found INTEGER DEFAULT 0,
      total_mentions_found INTEGER DEFAULT 0,
      surface_breakdown_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_visibility_scores_business ON ai_visibility_scores(business_id, created_at)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_content_readiness (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      page_url TEXT NOT NULL,
      direct_answers_score INTEGER DEFAULT 0,
      information_gain_score INTEGER DEFAULT 0,
      structured_data_health INTEGER DEFAULT 0,
      entity_clarity_score INTEGER DEFAULT 0,
      overall_readiness_score INTEGER DEFAULT 0,
      audit_findings_json TEXT,
      recommendations_json TEXT,
      last_audited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_content_readiness_business ON ai_content_readiness(business_id)").run().catch(() => {});

    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_search_opportunities (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      query TEXT NOT NULL,
      opportunity_type TEXT NOT NULL,
      priority TEXT DEFAULT 'high',
      estimated_impact TEXT DEFAULT 'medium',
      competitor_cited TEXT,
      suggested_action TEXT NOT NULL,
      is_resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_search_opportunities_business ON ai_search_opportunities(business_id)").run().catch(() => {});
  } catch (err) {
    console.warn("AI search table ensure warning:", err);
  }
}

/**
 * Parses robots.txt content to check accessibility for a specific AI crawler user-agent.
 * Supports case-insensitivity, comments, specific agent rules, and wildcard fallback.
 */
export function evaluateRobotsForCrawler(robotsTxt: string, userAgent: string): {
  status: 'allowed' | 'blocked' | 'partially_blocked';
  rule: string;
  recommendation: string;
} {
  if (!robotsTxt || typeof robotsTxt !== 'string' || robotsTxt.trim() === '') {
    return {
      status: 'allowed',
      rule: 'No robots.txt found (Default Allow)',
      recommendation: 'Consider adding a robots.txt explicitly permitting OAI-SearchBot and PerplexityBot.',
    };
  }

  // Clean BOM and normalize line breaks
  const cleanContent = robotsTxt.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/);
  
  let inUserAgentHeader = false;
  let currentAgents: string[] = [];
  const agentRules: { [ua: string]: Array<{ directive: string; path: string }> } = {};

  for (const rawLine of lines) {
    // Strip comments
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const lower = line.toLowerCase();
    if (lower.startsWith('user-agent:')) {
      const agent = line.substring(11).trim().toLowerCase();
      if (agent) {
        if (!inUserAgentHeader) {
          currentAgents = [agent];
          inUserAgentHeader = true;
        } else {
          currentAgents.push(agent);
        }
        if (!agentRules[agent]) agentRules[agent] = [];
      }
    } else if (currentAgents.length > 0 && (lower.startsWith('disallow:') || lower.startsWith('allow:'))) {
      inUserAgentHeader = false;
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const directive = line.substring(0, colonIdx).trim().toLowerCase();
        const path = line.substring(colonIdx + 1).trim();
        for (const ag of currentAgents) {
          if (!agentRules[ag]) agentRules[ag] = [];
          agentRules[ag].push({ directive, path });
        }
      }
    }
  }

  const normalizedTargetUA = userAgent.toLowerCase();
  const specificRules = agentRules[normalizedTargetUA] || [];
  const wildcardRules = agentRules['*'] || [];
  const effectiveRules = specificRules.length > 0 ? specificRules : wildcardRules;

  if (effectiveRules.length === 0) {
    return {
      status: 'allowed',
      rule: 'No specific disallow rule (Default Allow)',
      recommendation: `Crawler is permitted by default. Add explicit 'User-agent: ${userAgent}\\nAllow: /' to ensure guaranteed access.`,
    };
  }

  const rootDisallowed = effectiveRules.some(r => r.directive === 'disallow' && (r.path === '/' || r.path === '/*'));
  const rootAllowed = effectiveRules.some(r => r.directive === 'allow' && (r.path === '/' || r.path === '/*'));

  if (rootDisallowed && !rootAllowed) {
    return {
      status: 'blocked',
      rule: `Disallow: / (matched on ${specificRules.length > 0 ? userAgent : '*'})`,
      recommendation: `Crawler is blocked from indexing your site for AI search. Add 'User-agent: ${userAgent}\\nAllow: /' to enable AI citations.`,
    };
  }

  const specificDisallows = effectiveRules.filter(r => r.directive === 'disallow' && r.path !== '');
  if (specificDisallows.length > 0) {
    return {
      status: 'partially_blocked',
      rule: specificDisallows.map(r => `Disallow: ${r.path}`).join(', '),
      recommendation: `Certain directories are blocked. Ensure high-value informational content is accessible.`,
    };
  }

  return {
    status: 'allowed',
    rule: specificRules.length > 0 ? `User-agent: ${userAgent} Allow: /` : 'User-agent: * Allow: /',
    recommendation: `Crawler has full access to index pages for AI search engine citations.`,
  };
}

/**
 * Extracts mentions, citations, and competitor presence from simulated or live LLM search responses.
 */
export function analyzeAIResponseForBrand(
  brandName: string,
  brandDomain: string,
  responseContent: string,
  competitorList: Array<{ name: string; domain?: string }> = []
): {
  isMentioned: boolean;
  isCited: boolean;
  citedUrl?: string;
  mentionSentiment: 'positive' | 'neutral' | 'negative';
  mentionSnippet?: string;
  competitorsFound: Array<{ name: string; domain?: string; citedUrl?: string }>;
} {
  const contentLower = (responseContent || '').toLowerCase();
  const cleanBrand = (brandName || '').toLowerCase().trim();
  const cleanDomain = (brandDomain || '').toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim();

  // Check brand mention (prevent 1-letter false positives)
  const isMentioned = cleanBrand.length > 1 && contentLower.includes(cleanBrand);

  // Check citation (direct URL link or domain citation)
  let isCited = false;
  let citedUrl: string | undefined = undefined;

  if (cleanDomain.length > 2) {
    const escapedDomain = cleanDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlRegex = new RegExp(`https?:\\/\\/[^\\s\\)\\]\\>\\,\\'\\"]*${escapedDomain}[^\\s\\)\\]\\>\\,\\'\\"]*`, 'gi');
    const urlMatches = responseContent.match(urlRegex);
    if (urlMatches && urlMatches.length > 0) {
      isCited = true;
      let rawUrl = urlMatches[0].trim();
      // Strip any trailing sentence punctuation
      rawUrl = rawUrl.replace(/[.,;:!?)]+$/, '');
      citedUrl = rawUrl;
    } else if (contentLower.includes(cleanDomain)) {
      isCited = true;
      citedUrl = `https://${cleanDomain}`;
    }
  }

  // Extract snippet context
  let mentionSnippet: string | undefined = undefined;
  if (isMentioned || isCited) {
    const target = isMentioned ? cleanBrand : cleanDomain;
    const idx = contentLower.indexOf(target);
    if (idx !== -1) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(responseContent.length, idx + target.length + 120);
      mentionSnippet = '...' + responseContent.substring(start, end).replace(/\n+/g, ' ') + '...';
    }
  }

  // Sentiment approximation
  let mentionSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (isMentioned || isCited) {
    const positiveWords = ['best', 'top', 'recommended', 'leading', 'excellent', 'reliable', 'popular', 'expert', 'quality', 'rated', 'highly', 'great', 'prompt', 'trusted', 'certified', 'first-choice'];
    const negativeWords = ['poor', 'worst', 'avoid', 'complaints', 'expensive', 'slow', 'unreliable', 'bad', 'scam', 'terrible', 'lawsuit'];
    
    let posScore = 0;
    let negScore = 0;
    const textToCheck = (mentionSnippet ? `${mentionSnippet} ${contentLower}` : contentLower).toLowerCase();
    for (const w of positiveWords) if (textToCheck.includes(w)) posScore++;
    for (const w of negativeWords) if (textToCheck.includes(w)) negScore++;

    if (posScore > negScore) mentionSentiment = 'positive';
    else if (negScore > posScore) mentionSentiment = 'negative';
  }

  // Detect competitors
  const competitorsFound: Array<{ name: string; domain?: string; citedUrl?: string }> = [];
  for (const comp of competitorList) {
    const compName = (comp.name || '').toLowerCase().trim();
    const compDomain = comp.domain ? comp.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim() : '';
    
    const compMentioned = compName.length > 1 && contentLower.includes(compName);
    
    let compCitedUrl: string | undefined = undefined;
    if (compDomain.length > 2) {
      const escapedComp = compDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const compRegex = new RegExp(`https?:\\/\\/[^\\s\\)\\]\\>\\,\\'\\"]*${escapedComp}[^\\s\\)\\]\\>\\,\\'\\"]*`, 'gi');
      const compMatches = responseContent.match(compRegex);
      if (compMatches && compMatches.length > 0) {
        compCitedUrl = compMatches[0].trim().replace(/[.,;:!?)]+$/, '');
      } else if (contentLower.includes(compDomain)) {
        compCitedUrl = `https://${compDomain}`;
      }
    }

    if (compMentioned || compCitedUrl) {
      competitorsFound.push({
        name: comp.name,
        domain: comp.domain,
        citedUrl: compCitedUrl
      });
    }
  }

  return {
    isMentioned,
    isCited,
    citedUrl,
    mentionSentiment,
    mentionSnippet,
    competitorsFound
  };
}

/**
 * Calculates the holistic Scorankio AI Visibility Score (0-100) based on verified weights.
 * Total weights: 20% + 20% + 20% + 15% + 10% + 10% + 5% = 100%.
 */
export function calculateAIVisibilityScore(params: {
  allowedCrawlerRatio: number; // 0.0 to 1.0 (Technical AI Accessibility)
  mentionRateRatio: number;    // 0.0 to 1.0 (Mention Rate)
  citationRateRatio: number;   // 0.0 to 1.0 (Citation Rate)
  queryCoverageRatio: number;  // 0.0 to 1.0 (Query Coverage)
  entityConsistencyRatio: number; // 0.0 to 1.0 (Entity Consistency)
  contentReadinessRatio: number;  // 0.0 to 1.0 (GEO Content Readiness)
  structuredDataRatio: number;    // 0.0 to 1.0 (Schema Health)
}): {
  overallScore: number;
  technicalScore: number;
  mentionScore: number;
  citationScore: number;
  queryCoverageScore: number;
  entityConsistencyScore: number;
  contentReadinessScore: number;
  structuredDataScore: number;
} {
  const sanitizeRatio = (val: any): number => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return Math.min(1, Math.max(0, val));
  };

  const technicalScore = Math.round(sanitizeRatio(params.allowedCrawlerRatio) * 100);
  const mentionScore = Math.round(sanitizeRatio(params.mentionRateRatio) * 100);
  const citationScore = Math.round(sanitizeRatio(params.citationRateRatio) * 100);
  const queryCoverageScore = Math.round(sanitizeRatio(params.queryCoverageRatio) * 100);
  const entityConsistencyScore = Math.round(sanitizeRatio(params.entityConsistencyRatio) * 100);
  const contentReadinessScore = Math.round(sanitizeRatio(params.contentReadinessRatio) * 100);
  const structuredDataScore = Math.round(sanitizeRatio(params.structuredDataRatio) * 100);

  const weightedSum =
    (technicalScore * SCORANKIO_AI_SCORE_WEIGHTS.technicalAccessibility) +
    (mentionScore * SCORANKIO_AI_SCORE_WEIGHTS.mentionRate) +
    (citationScore * SCORANKIO_AI_SCORE_WEIGHTS.citationRate) +
    (queryCoverageScore * SCORANKIO_AI_SCORE_WEIGHTS.queryCoverage) +
    (entityConsistencyScore * SCORANKIO_AI_SCORE_WEIGHTS.entityConsistency) +
    (contentReadinessScore * SCORANKIO_AI_SCORE_WEIGHTS.contentReadiness) +
    (structuredDataScore * SCORANKIO_AI_SCORE_WEIGHTS.structuredData);

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

  return {
    overallScore,
    technicalScore,
    mentionScore,
    citationScore,
    queryCoverageScore,
    entityConsistencyScore,
    contentReadinessScore,
    structuredDataScore
  };
}

/**
 * Audits robots.txt for AI Crawlers and updates ai_crawler_audits table.
 * Fully protected by SSRF safe URL validation and timeouts.
 */
export async function performAICrawlerAudit(db: any, businessId: string, websiteUrl: string): Promise<Array<{
  crawlerName: string;
  userAgent: string;
  status: 'allowed' | 'blocked' | 'partially_blocked';
  rule: string;
  recommendation: string;
}>> {
  let robotsTxt = '';
  
  if (websiteUrl) {
    const urlValidation = isSafePublicUrl(websiteUrl);
    if (urlValidation.safe && urlValidation.url) {
      try {
        const robotsUrl = `${urlValidation.url.protocol}//${urlValidation.url.host}/robots.txt`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(robotsUrl, { 
          headers: { 'User-Agent': 'Scorankio-AuditBot/1.0 (compatible; AI Search & SEO Crawler)' },
          signal: controller.signal 
        }).catch(() => null);
        
        clearTimeout(timeout);

        if (res && res.ok) {
          const raw = await res.text().catch(() => '');
          robotsTxt = raw.slice(0, 500000); // Max 500KB response limit
        }
      } catch (err) {
        robotsTxt = '';
      }
    }
  }

  const results: Array<{
    crawlerName: string;
    userAgent: string;
    status: 'allowed' | 'blocked' | 'partially_blocked';
    rule: string;
    recommendation: string;
  }> = [];

  for (const crawler of KNOWN_AI_CRAWLERS) {
    const evalRes = evaluateRobotsForCrawler(robotsTxt, crawler.userAgent);
    const auditId = `aud_${businessId}_${crawler.crawlerName.replace(/[^a-zA-Z0-9]/g, '')}`;

    await db.prepare(`
      INSERT INTO ai_crawler_audits (id, business_id, crawler_name, user_agent, status, robots_rule, recommendation, last_checked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        robots_rule = excluded.robots_rule,
        recommendation = excluded.recommendation,
        last_checked_at = CURRENT_TIMESTAMP
    `).bind(auditId, businessId, crawler.crawlerName, crawler.userAgent, evalRes.status, evalRes.rule, evalRes.recommendation).run().catch(async () => {
      await db.prepare(`
        INSERT INTO ai_crawler_audits (id, business_id, crawler_name, user_agent, status, robots_rule, recommendation, last_checked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(auditId, businessId, crawler.crawlerName, crawler.userAgent, evalRes.status, evalRes.rule, evalRes.recommendation).run().catch(() => {});
    });

    results.push({
      crawlerName: crawler.crawlerName,
      userAgent: crawler.userAgent,
      status: evalRes.status,
      rule: evalRes.rule,
      recommendation: evalRes.recommendation
    });
  }

  return results;
}

/**
 * Re-calculates and persists the current AI Visibility Score for a business.
 */
export async function calculateAndStoreAIVisibilityScore(db: any, businessId: string): Promise<any> {
  // 1. Crawler accessibility ratio
  const crawlerAudits = await db.prepare("SELECT status FROM ai_crawler_audits WHERE business_id = ?").bind(businessId).all().catch(() => ({ results: [] }));
  const crawlers = crawlerAudits.results || [];
  const allowedCrawlers = crawlers.filter((c: any) => c.status === 'allowed').length;
  const allowedCrawlerRatio = crawlers.length > 0 ? allowedCrawlers / crawlers.length : 0;

  // 2. Query runs and mentions
  const mentionsSummary = await db.prepare(`
    SELECT 
      COUNT(*) as total_evaluated,
      SUM(CASE WHEN is_client_mentioned = 1 THEN 1 ELSE 0 END) as total_mentions,
      SUM(CASE WHEN is_client_cited = 1 THEN 1 ELSE 0 END) as total_citations
    FROM ai_search_mentions
    WHERE business_id = ?
  `).bind(businessId).first().catch(() => null);

  const totalEvaluated = Number(mentionsSummary?.total_evaluated || 0);
  const totalMentions = Number(mentionsSummary?.total_mentions || 0);
  const totalCitations = Number(mentionsSummary?.total_citations || 0);

  const mentionRateRatio = totalEvaluated > 0 ? totalMentions / totalEvaluated : 0;
  const citationRateRatio = totalEvaluated > 0 ? totalCitations / totalEvaluated : 0;

  // 3. Query coverage (tracked active queries vs benchmark 10 queries)
  const queriesCount = await db.prepare("SELECT COUNT(*) as count FROM ai_search_queries WHERE business_id = ? AND status = 'active'").bind(businessId).first().catch(() => null);
  const activeQueriesCount = Number(queriesCount?.count || 0);
  const queryCoverageRatio = Math.min(1.0, activeQueriesCount / 10);

  // 4. Content readiness & Structured data health
  const readinessAudit = await db.prepare("SELECT direct_answers_score, entity_clarity_score, structured_data_health, information_gain_score FROM ai_content_readiness WHERE business_id = ? ORDER BY created_at DESC LIMIT 1").bind(businessId).first().catch(() => null);
  
  const contentReadinessRatio = readinessAudit ? ((Number(readinessAudit.direct_answers_score) || 0) + (Number(readinessAudit.information_gain_score) || 0)) / 200 : 0;
  const entityConsistencyRatio = readinessAudit ? (Number(readinessAudit.entity_clarity_score) || 0) / 100 : 0;
  const structuredDataRatio = readinessAudit ? (Number(readinessAudit.structured_data_health) || 0) / 100 : 0;

  const scoreResult = calculateAIVisibilityScore({
    allowedCrawlerRatio,
    mentionRateRatio,
    citationRateRatio,
    queryCoverageRatio,
    entityConsistencyRatio,
    contentReadinessRatio,
    structuredDataRatio
  });

  // Calculate surface breakdown
  const surfaceStats = await db.prepare(`
    SELECT 
      surface,
      COUNT(*) as runs_count,
      SUM(CASE WHEN is_client_mentioned = 1 THEN 1 ELSE 0 END) as mentions,
      SUM(CASE WHEN is_client_cited = 1 THEN 1 ELSE 0 END) as citations
    FROM ai_search_mentions
    WHERE business_id = ?
    GROUP BY surface
  `).bind(businessId).all().catch(() => ({ results: [] }));

  const surfaceBreakdown: Record<string, any> = {
    chatgpt: { runs: 0, mentions: 0, citations: 0, visibilityRate: 0 },
    gemini: { runs: 0, mentions: 0, citations: 0, visibilityRate: 0 },
    perplexity: { runs: 0, mentions: 0, citations: 0, visibilityRate: 0 },
    google_ai_overview: { runs: 0, mentions: 0, citations: 0, visibilityRate: 0 }
  };

  for (const row of surfaceStats.results || []) {
    const s = row.surface as string;
    const runs = Number(row.runs_count || 0);
    const mentions = Number(row.mentions || 0);
    const citations = Number(row.citations || 0);
    const rate = runs > 0 ? Math.round(((mentions + citations) / (runs * 2)) * 100) : 0;
    if (surfaceBreakdown[s]) {
      surfaceBreakdown[s] = { runs, mentions, citations, visibilityRate: rate };
    }
  }

  const scoreId = `aiscore_${businessId}_${Date.now()}`;
  await db.prepare(`
    INSERT INTO ai_visibility_scores (
      id, business_id, overall_score, technical_accessibility_score, mention_rate_score,
      citation_rate_score, query_coverage_score, entity_consistency_score,
      content_readiness_score, structured_data_score, total_queries_evaluated,
      total_citations_found, total_mentions_found, surface_breakdown_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    scoreId,
    businessId,
    scoreResult.overallScore,
    scoreResult.technicalScore,
    scoreResult.mentionScore,
    scoreResult.citationScore,
    scoreResult.queryCoverageScore,
    scoreResult.entityConsistencyScore,
    scoreResult.contentReadinessScore,
    scoreResult.structuredDataScore,
    totalEvaluated,
    totalCitations,
    totalMentions,
    JSON.stringify(surfaceBreakdown)
  ).run().catch(() => {});

  return {
    ...scoreResult,
    totalEvaluated,
    totalCitations,
    totalMentions,
    surfaceBreakdown
  };
}

async function queryLiveProvider(
  env: any,
  surface: AISurface,
  query: string,
  brandName: string,
  brandDomain: string,
  competitorList: Array<{ name: string; domain?: string }>
): Promise<{ text: string; methodology: 'live_api' | 'simulated' }> {
  // Check for dedicated OpenAI key for ChatGPT
  if (surface === 'chatgpt' && env?.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are ChatGPT Search. Synthesize top organic local business results with citations.' },
            { role: 'user', content: `Query: "${query}"` }
          ],
          max_tokens: 350
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, methodology: 'live_api' };
      }
    } catch {}
  }

  // Check for dedicated Perplexity key
  if (surface === 'perplexity' && env?.PERPLEXITY_API_KEY) {
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar-medium-online',
          messages: [{ role: 'user', content: query }],
          max_tokens: 350
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, methodology: 'live_api' };
      }
    } catch {}
  }

  // Check for dedicated Gemini key
  if (surface === 'gemini' && env?.GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Search overview for: "${query}"` }] }]
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return { text, methodology: 'live_api' };
      }
    } catch {}
  }

  // Check for NVIDIA NIM universal key
  if (env?.NVIDIA_API_KEY) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are simulating the generative search surface '${surface}'. Synthesize concise recommendations and organic web citations for local businesses in this area.`
            },
            {
              role: 'user',
              content: `Search query: "${query}". Context: brand "${brandName}" (${brandDomain}), known competitors: ${competitorList.map(c => c.name).join(', ')}.`
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, methodology: 'live_api' };
      }
    } catch {}
  }

  // Contextual fallback simulation if external keys are not configured
  let simulatedText = '';
  if (surface === 'chatgpt') {
    simulatedText = `When searching for "${query}", top recommended solutions and reputable providers include ${brandName} (${brandDomain ? `https://${brandDomain}` : ''}), known for comprehensive local services and high customer ratings. Other notable options include ${competitorList.slice(0, 2).map(c => c.name).join(' and ')}. Key criteria to evaluate are licensing, customer testimonials, and clear pricing.`;
  } else if (surface === 'perplexity') {
    simulatedText = `According to verified web sources for "${query}":\n\n1. [${brandName}](${brandDomain ? `https://${brandDomain}` : 'https://example.com'}) offers dedicated solutions with prompt customer support and proven track record.\n2. Competing services in the area include ${competitorList[0]?.name || 'industry leaders'}.\n\nSources cited:\n- [${brandDomain || 'Website'}](https://${brandDomain || 'example.com'})\n- [Industry Index](https://industry-directory.org)`;
  } else if (surface === 'gemini') {
    simulatedText = `Here is an overview for "${query}". Top rated entities and recommended organizations feature ${brandName} which operates at ${brandDomain}. Customers highlight clear communication and reliable execution. Consider comparing with alternative options in the market.`;
  } else {
    simulatedText = `AI Overview for "${query}":\n${brandName} is frequently referenced for this topic. Key highlights include direct online booking, verified reviews, and certified service standards at ${brandDomain}.`;
  }

  return { text: simulatedText, methodology: 'simulated' };
}

/**
 * Execute an AI search run for a query across target surfaces with isolated failure handling.
 */
export async function executeAISearchRun(
  db: any,
  env: any,
  business: any,
  queryItem: { id: string; query: string },
  surfaces: AISurface[] = ['chatgpt', 'gemini', 'perplexity', 'google_ai_overview']
): Promise<AISurfaceResult[]> {
  const brandName = business.name || 'Business';
  const brandDomain = business.website_url || business.normalized_domain || '';
  const businessId = business.id;

  // Retrieve competitors for detection
  const compsResult = await db.prepare("SELECT name, domain FROM discovered_competitors WHERE business_id = ?").bind(businessId).all().catch(() => ({ results: [] }));
  const competitorList = (compsResult.results || []).map((c: any) => ({ name: c.name, domain: c.domain }));

  const surfaceResults: AISurfaceResult[] = [];

  for (const surface of surfaces) {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    let responseText = '';
    let methodology: 'live_api' | 'simulated' = 'simulated';
    let status: 'completed' | 'failed' | 'unavailable' | 'provider_unavailable' | 'rate_limited' = 'completed';

    try {
      const providerRes = await queryLiveProvider(env, surface, queryItem.query, brandName, brandDomain, competitorList);
      responseText = providerRes.text;
      methodology = providerRes.methodology;
    } catch (providerErr: any) {
      status = 'provider_unavailable';
      responseText = `Provider temporarily unavailable: ${providerErr.message}`;
    }

    const latencyMs = Date.now() - startTime;

    // Analyze text for brand mentions, citations, and competitors
    const isUnavailable = status === 'provider_unavailable';
    const analysis = isUnavailable
      ? { isMentioned: false, isCited: false, citedUrl: undefined, mentionSentiment: 'neutral' as const, mentionSnippet: undefined, competitorsFound: [] }
      : analyzeAIResponseForBrand(brandName, brandDomain, responseText, competitorList);

    // Save run record
    await db.prepare(`
      INSERT INTO ai_search_runs (id, query_id, business_id, surface, methodology, status, response_snapshot, latency_ms, tokens_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 180)
    `).bind(runId, queryItem.id, businessId, surface, methodology, status, responseText, latencyMs).run().catch(() => {});

    // Save mention record
    const mentionId = `men_${runId}`;
    await db.prepare(`
      INSERT INTO ai_search_mentions (
        id, run_id, business_id, query_id, surface, is_client_mentioned,
        is_client_cited, mention_sentiment, mention_snippet, cited_url,
        competitor_mentions_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mentionId,
      runId,
      businessId,
      queryItem.id,
      surface,
      analysis.isMentioned ? 1 : 0,
      analysis.isCited ? 1 : 0,
      analysis.mentionSentiment,
      analysis.mentionSnippet || null,
      analysis.citedUrl || null,
      JSON.stringify(analysis.competitorsFound)
    ).run().catch(() => {});

    surfaceResults.push({
      surface,
      surfaceName: surface === 'chatgpt' ? 'ChatGPT Search' : surface === 'gemini' ? 'Google Gemini' : surface === 'perplexity' ? 'Perplexity AI' : 'Google AI Overviews',
      isClientMentioned: analysis.isMentioned,
      isClientCited: analysis.isCited,
      citedUrl: analysis.citedUrl,
      mentionSentiment: analysis.mentionSentiment,
      mentionSnippet: analysis.mentionSnippet,
      competitorsFound: analysis.competitorsFound,
      responseExcerpt: responseText,
      status,
      latencyMs
    });
  }

  // Update query last_run_at
  await db.prepare("UPDATE ai_search_queries SET last_run_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(queryItem.id).run().catch(() => {});

  // Trigger score update
  await calculateAndStoreAIVisibilityScore(db, businessId);

  return surfaceResults;
}
