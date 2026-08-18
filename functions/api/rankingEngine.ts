import { createSerpProvider } from './serp/serpFactory';
import type { SERPResult, SERPSearchParams } from './serp/types';

export type RankingMovementStatus = 'NEW' | 'IMPROVED' | 'DECLINED' | 'STABLE' | 'LOST' | 'NOT_RANKING';

/**
 * Calculates rank position change and movement status.
 * Note for SEO: Lower position number is BETTER (e.g. #3 is better than #10).
 */
export function calculateRankingMovement(
  previousPosition: number | null | undefined,
  currentPosition: number | null | undefined
): {
  status: RankingMovementStatus;
  positionChange: number | null;
} {
  const prev = (typeof previousPosition === 'number' && previousPosition > 0) ? previousPosition : null;
  const curr = (typeof currentPosition === 'number' && currentPosition > 0) ? currentPosition : null;

  // 1. Both null: Never ranked / not ranking
  if (prev === null && curr === null) {
    return { status: 'NOT_RANKING', positionChange: null };
  }

  // 2. Previously not ranking, now ranking
  if (prev === null && curr !== null) {
    return { status: 'NEW', positionChange: null };
  }

  // 3. Previously ranking, now disappeared
  if (prev !== null && curr === null) {
    return { status: 'LOST', positionChange: null };
  }

  // 4. Both present
  if (prev !== null && curr !== null) {
    const diff = prev - curr; // e.g. 15 - 8 = +7 (improved 7 spots); 8 - 15 = -7 (dropped 7 spots)
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
 * Aggregates ranking overview KPIs for dashboard cards from real D1 records
 */
export function calculateRankingKPIs(items: any[]): {
  totalKeywords: number;
  top3: number;
  top10: number;
  top20: number;
  notRanking: number;
  averagePosition: number | null;
} {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalKeywords: 0,
      top3: 0,
      top10: 0,
      top20: 0,
      notRanking: 0,
      averagePosition: null
    };
  }

  let top3 = 0;
  let top10 = 0;
  let top20 = 0;
  let notRanking = 0;
  let rankedSum = 0;
  let rankedCount = 0;

  for (const item of items) {
    const pos = item.current_position || item.position;
    if (typeof pos === 'number' && pos > 0) {
      if (pos <= 3) top3++;
      if (pos <= 10) top10++;
      if (pos <= 20) top20++;
      rankedSum += pos;
      rankedCount++;
    } else {
      notRanking++;
    }
  }

  const averagePosition = rankedCount > 0 ? parseFloat((rankedSum / rankedCount).toFixed(1)) : null;

  return {
    totalKeywords: items.length,
    top3,
    top10,
    top20,
    notRanking,
    averagePosition
  };
}

export function calculateLocalVisibilityScore(rankings: any[]): number {
  if (!rankings || rankings.length === 0) return 0;
  
  let totalScore = 0;
  for (const ranking of rankings) {
    const pos = ranking.current_position || ranking.position;
    if (pos === null || pos === undefined) {
      totalScore += 0;
    } else if (pos >= 1 && pos <= 3) {
      totalScore += 100;
    } else if (pos >= 4 && pos <= 10) {
      totalScore += 80;
    } else if (pos >= 11 && pos <= 20) {
      totalScore += 50;
    } else if (pos >= 21) {
      totalScore += 15;
    }
  }
  
  return Math.round(totalScore / rankings.length);
}

/**
 * Real Production SERP search delegate using provider abstraction
 */
export async function executeSERPSearch(
  env: any,
  params: SERPSearchParams
): Promise<SERPResult> {
  const provider = createSerpProvider(env);
  return provider.search(params);
}
