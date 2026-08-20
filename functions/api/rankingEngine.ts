import { getSerpProvider, normalizeDomain, type SerpProviderStatus } from './services/serpProvider';

export type RankingMovementStatus = 'NEW' | 'IMPROVED' | 'DECLINED' | 'STABLE' | 'LOST' | 'NOT_RANKING';

/**
 * Calculates rank position change and movement status.
 * Note for SEO: Lower position number is BETTER (e.g. #3 is better than #10).
 * A jump from #10 to #3 is +7 improvement.
 */
export function calculatePositionChange(
  previousPosition: number | null | undefined,
  currentPosition: number | null | undefined
): {
  status: RankingMovementStatus;
  positionChange: number | null;
} {
  const prev = typeof previousPosition === 'number' && previousPosition > 0 ? previousPosition : null;
  const curr = typeof currentPosition === 'number' && currentPosition > 0 ? currentPosition : null;

  if (prev === null && curr === null) {
    return { status: 'NOT_RANKING', positionChange: null };
  }

  if (prev === null && curr !== null) {
    return { status: 'NEW', positionChange: null };
  }

  if (prev !== null && curr === null) {
    return { status: 'LOST', positionChange: null };
  }

  if (prev !== null && curr !== null) {
    const diff = prev - curr; // 15 - 8 = +7 (improved 7 positions)
    if (diff > 0) {
      return { status: 'IMPROVED', positionChange: diff };
    } else if (diff < 0) {
      return { status: 'DECLINED', positionChange: diff };
    } else {
      return { status: 'STABLE', positionChange: 0 };
    }
  }

  return { status: 'NOT_RANKING', positionChange: null };
}

/**
 * Calculates organic search visibility index (0-100) based on weighted CTR distribution.
 */
export function calculateVisibility(items: Array<{ position?: number | null; current_position?: number | null }>): number {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const weights: Record<number, number> = {
    1: 100, 2: 75, 3: 55, 4: 40, 5: 32,
    6: 25, 7: 20, 8: 16, 9: 13, 10: 10
  };

  let totalScore = 0;
  let validKeywords = 0;

  for (const item of items) {
    const pos = item.current_position ?? item.position;
    validKeywords++;
    if (typeof pos === 'number' && pos > 0) {
      if (pos in weights) {
        totalScore += weights[pos];
      } else if (pos <= 20) {
        totalScore += 5;
      } else if (pos <= 50) {
        totalScore += 2;
      } else if (pos <= 100) {
        totalScore += 1;
      }
    }
  }

  if (validKeywords === 0) return 0;
  const maxPossible = validKeywords * 100;
  return parseFloat(((totalScore / maxPossible) * 100).toFixed(1));
}

/**
 * Adds a new tracked keyword to D1 database for the active business.
 */
export async function trackKeyword(
  db: any,
  businessId: string,
  params: {
    keyword: string;
    location?: string;
    targetUrl?: string;
    device?: 'desktop' | 'mobile';
    language?: string;
  }
): Promise<{ id: string; keyword: string; location: string }> {
  const id = crypto.randomUUID();
  const keyword = params.keyword.trim();
  const location = params.location?.trim() || 'United States';
  const device = params.device || 'desktop';
  const language = params.language || 'en';
  const targetUrl = params.targetUrl?.trim() || null;

  await db.prepare(`
    INSERT INTO tracked_keywords (
      id, business_id, keyword, location, language, device, target_url, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(id, businessId, keyword, location, language, device, targetUrl).run();

  // Backward compatibility with legacy keywords table
  await db.prepare(`
    INSERT INTO keywords (id, business_id, keyword, location, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO NOTHING
  `).bind(id, businessId, keyword, location).run().catch(() => {});

  return { id, keyword, location };
}

/**
 * Saves ranking history entry into D1. Never overwrites historical snapshots.
 */
export async function saveRankingHistory(
  db: any,
  businessId: string,
  keywordId: string,
  previousPosition: number | null,
  currentPosition: number | null,
  visibilityChange: number = 0.0
): Promise<void> {
  const change = calculatePositionChange(previousPosition, currentPosition);
  const histId = crypto.randomUUID();

  await db.prepare(`
    INSERT INTO ranking_history (
      id, business_id, keyword_id, previous_position, current_position, position_change, visibility_change, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    histId,
    businessId,
    keywordId,
    previousPosition,
    currentPosition,
    change.positionChange,
    visibilityChange
  ).run();
}

/**
 * Executes a real live ranking check for a specific tracked keyword.
 * Strictly adheres to NOT_CONFIGURED state if no SERP provider is configured.
 */
export async function fetchRanking(
  db: any,
  businessId: string,
  keywordId: string,
  env: any
): Promise<{
  success: boolean;
  providerStatus: SerpProviderStatus;
  providerName: string;
  position: number | null;
  previousPosition: number | null;
  positionChange: number | null;
  localPackPosition: number | null;
  rankingUrl: string | null;
  status: RankingMovementStatus;
  message?: string;
}> {
  const provider = getSerpProvider(env);

  // 1. Resolve business & keyword record
  const kw: any = await db.prepare(
    "SELECT * FROM tracked_keywords WHERE id = ? AND business_id = ?"
  ).bind(keywordId, businessId).first().catch(async () => {
    return await db.prepare("SELECT * FROM keywords WHERE id = ? AND business_id = ?").bind(keywordId, businessId).first();
  });

  if (!kw) {
    throw new Error("Keyword record not found");
  }

  const business: any = await db.prepare(
    "SELECT name, website_url, domain, city FROM businesses WHERE id = ?"
  ).bind(businessId).first();

  const targetDomain = normalizeDomain(business?.website_url || business?.domain || '');

  // 2. Check provider status
  if (provider.status === 'NOT_CONFIGURED') {
    return {
      success: false,
      providerStatus: 'NOT_CONFIGURED',
      providerName: provider.name,
      position: null,
      previousPosition: null,
      positionChange: null,
      localPackPosition: null,
      rankingUrl: null,
      status: 'NOT_RANKING',
      message: 'Connect a SERP provider (e.g. Serper, DataForSEO) to enable real live ranking checks.'
    };
  }

  // 3. Get previous ranking position
  const prevResult: any = await db.prepare(`
    SELECT position FROM ranking_results 
    WHERE keyword_id = ? AND business_id = ?
    ORDER BY search_date DESC, created_at DESC 
    LIMIT 1
  `).bind(keywordId, businessId).first().catch(() => null);

  const previousPosition = prevResult?.position ?? null;

  // 4. Query live SERP provider
  const serpResult = await provider.getKeywordResults({
    keyword: kw.keyword,
    location: kw.location || business?.city || 'United States',
    countryCode: 'US',
    device: kw.device || 'desktop',
    targetDomain,
    targetUrl: kw.target_url
  });

  const currentPosition = serpResult.targetPosition;
  const movement = calculatePositionChange(previousPosition, currentPosition);

  // 5. Store current ranking result in D1
  const resultId = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO ranking_results (
      id, business_id, keyword_id, keyword, target_domain, target_url, position, ranking_type, location, competitor_domain, search_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'organic', ?, ?, DATE('now'), CURRENT_TIMESTAMP)
  `).bind(
    resultId,
    businessId,
    keywordId,
    kw.keyword,
    targetDomain,
    serpResult.targetUrl || null,
    currentPosition,
    kw.location || 'United States',
    serpResult.competitorRankings[0]?.domain || null
  ).run();

  // 6. Record Historical Snapshot
  await saveRankingHistory(db, businessId, keywordId, previousPosition, currentPosition);

  // 7. Store Competitor Rankings
  for (const comp of serpResult.competitorRankings) {
    const compId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO competitor_rankings (
        id, business_id, competitor_domain, keyword, position, ranking_type, location, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      compId,
      businessId,
      comp.domain,
      kw.keyword,
      comp.position,
      comp.rankingType || 'organic',
      kw.location || 'United States'
    ).run().catch(() => {});
  }

  // 8. Update keywords table for backward-compatible views
  await db.prepare(`
    UPDATE tracked_keywords SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(keywordId).run().catch(() => {});

  return {
    success: true,
    providerStatus: 'CONNECTED',
    providerName: provider.name,
    position: currentPosition,
    previousPosition,
    positionChange: movement.positionChange,
    localPackPosition: serpResult.targetLocalPosition,
    rankingUrl: serpResult.targetUrl,
    status: movement.status
  };
}

/**
 * Returns comprehensive ranking overview, visibility scores, and competitor intelligence.
 */
export async function getRankingOverview(
  db: any,
  businessId: string,
  env?: any
): Promise<{
  providerStatus: SerpProviderStatus;
  providerName: string;
  kpis: {
    totalKeywords: number;
    top3: number;
    top10: number;
    top20: number;
    improvedCount: number;
    declinedCount: number;
    averagePosition: number | null;
    localPackCount: number;
  };
  visibilityScore: number;
  localVisibilityScore: number;
  keywords: Array<{
    id: string;
    keyword: string;
    location: string;
    device: string;
    targetUrl: string | null;
    currentPosition: number | null;
    previousPosition: number | null;
    positionChange: number | null;
    status: RankingMovementStatus;
    localPackPosition: number | null;
    lastCheckedAt: string;
  }>;
}> {
  const provider = env ? getSerpProvider(env) : null;
  const providerStatus = provider?.status || 'NOT_CONFIGURED';
  const providerName = provider?.name || 'Unconfigured';

  // Load all tracked keywords
  const { results: rawKeywords } = await db.prepare(`
    SELECT id, keyword, location, device, target_url, active, created_at, updated_at
    FROM tracked_keywords
    WHERE business_id = ? AND active = 1
    ORDER BY created_at DESC
  `).bind(businessId).all().catch(async () => {
    return await db.prepare("SELECT id, keyword, location, 'desktop' as device, NULL as target_url, 1 as active, created_at FROM keywords WHERE business_id = ?").bind(businessId).all();
  });

  const kwList = Array.isArray(rawKeywords) ? rawKeywords : [];

  const keywordsOutput = [];
  let top3 = 0;
  let top10 = 0;
  let top20 = 0;
  let improvedCount = 0;
  let declinedCount = 0;
  let positionSum = 0;
  let rankedCount = 0;
  let localPackCount = 0;

  for (const kw of kwList) {
    // Get latest 2 ranking results
    const { results: resultsList } = await db.prepare(`
      SELECT position, target_url, ranking_type, created_at
      FROM ranking_results
      WHERE keyword_id = ? AND business_id = ?
      ORDER BY created_at DESC
      LIMIT 2
    `).bind(kw.id, businessId).all().catch(() => ({ results: [] }));

    const current = resultsList?.[0];
    const previous = resultsList?.[1];

    const currentPos = current ? current.position : null;
    const prevPos = previous ? previous.position : null;
    const movement = calculatePositionChange(prevPos, currentPos);

    if (currentPos !== null) {
      positionSum += currentPos;
      rankedCount++;
      if (currentPos <= 3) top3++;
      if (currentPos <= 10) top10++;
      if (currentPos <= 20) top20++;
    }

    if (movement.status === 'IMPROVED') improvedCount++;
    if (movement.status === 'DECLINED') declinedCount++;

    const localPackPos = current?.ranking_type === 'local_pack' ? current.position : null;
    if (localPackPos !== null) localPackCount++;

    keywordsOutput.push({
      id: kw.id,
      keyword: kw.keyword,
      location: kw.location || 'United States',
      device: kw.device || 'desktop',
      targetUrl: kw.target_url || current?.target_url || null,
      currentPosition: currentPos,
      previousPosition: prevPos,
      positionChange: movement.positionChange,
      status: movement.status,
      localPackPosition: localPackPos,
      lastCheckedAt: current?.created_at || kw.updated_at || kw.created_at
    });
  }

  const averagePosition = rankedCount > 0 ? parseFloat((positionSum / rankedCount).toFixed(1)) : null;
  const visibilityScore = calculateVisibility(keywordsOutput.map(k => ({ position: k.currentPosition })));
  const localVisibilityScore = kwList.length > 0 ? parseFloat(((localPackCount / kwList.length) * 100).toFixed(1)) : 0;

  return {
    providerStatus,
    providerName,
    kpis: {
      totalKeywords: kwList.length,
      top3,
      top10,
      top20,
      improvedCount,
      declinedCount,
      averagePosition,
      localPackCount
    },
    visibilityScore,
    localVisibilityScore,
    keywords: keywordsOutput
  };
}

/**
 * Returns competitor ranking benchmarks and search visibility comparison.
 */
export async function getCompetitorRankingGaps(
  db: any,
  businessId: string
): Promise<{
  competitors: Array<{
    domain: string;
    sharedKeywords: number;
    outrankingKeywords: number;
    outrankedKeywords: number;
    topKeywords: Array<{
      keyword: string;
      businessPosition: number | null;
      competitorPosition: number;
    }>;
  }>;
}> {
  // Get distinct competitors recorded for this business
  const { results: compDomains } = await db.prepare(`
    SELECT DISTINCT competitor_domain
    FROM competitor_rankings
    WHERE business_id = ? AND competitor_domain IS NOT NULL AND competitor_domain != ''
    LIMIT 5
  `).bind(businessId).all().catch(() => ({ results: [] }));

  const competitors = [];

  for (const c of compDomains || []) {
    const domain = c.competitor_domain;

    const { results: compRanks } = await db.prepare(`
      SELECT keyword, position
      FROM competitor_rankings
      WHERE business_id = ? AND competitor_domain = ?
      ORDER BY recorded_at DESC
    `).bind(businessId, domain).all().catch(() => ({ results: [] }));

    let outranking = 0;
    let outranked = 0;
    const topKws = [];

    for (const cr of compRanks || []) {
      const bizRank: any = await db.prepare(`
        SELECT position FROM ranking_results
        WHERE business_id = ? AND keyword = ?
        ORDER BY created_at DESC LIMIT 1
      `).bind(businessId, cr.keyword).first().catch(() => null);

      const bPos = bizRank?.position ?? null;
      const cPos = cr.position;

      if (bPos === null || cPos < bPos) {
        outranking++; // Competitor outranks business
      } else if (bPos < cPos) {
        outranked++; // Business outranks competitor
      }

      if (topKws.length < 5) {
        topKws.push({
          keyword: cr.keyword,
          businessPosition: bPos,
          competitorPosition: cPos
        });
      }
    }

    competitors.push({
      domain,
      sharedKeywords: (compRanks || []).length,
      outrankingKeywords: outranking,
      outrankedKeywords: outranked,
      topKeywords: topKws
    });
  }

  return { competitors };
}
