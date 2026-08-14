export function calculateLocalVisibilityScore(rankings: any[]): number {
  if (!rankings || rankings.length === 0) return 0;
  
  let totalScore = 0;
  for (const ranking of rankings) {
    if (ranking.position === null || ranking.position === undefined) {
      totalScore += 0;
    } else if (ranking.position >= 1 && ranking.position <= 3) {
      totalScore += 100;
    } else if (ranking.position >= 4 && ranking.position <= 10) {
      totalScore += 80;
    } else if (ranking.position >= 11 && ranking.position <= 20) {
      totalScore += 50;
    } else if (ranking.position >= 21) {
      totalScore += 15;
    }
  }
  
  return Math.round(totalScore / rankings.length);
}

export async function getRankingHistory(db: any, businessId: string) {
  const result = await db.prepare(
    `SELECT * FROM keyword_rankings WHERE business_id = ? ORDER BY checked_at DESC`
  ).bind(businessId).all();
  
  return result.results || [];
}

export interface SerpRankResult {
  organicPosition: number | null;
  localPackPosition: number | null;
  position: number | null; // best of organic or local pack
  bestCompetitor?: string;
  competitorPosition?: number | null;
  topPlaces?: Array<{
    title: string;
    rating?: number;
    reviewsCount?: number;
    address?: string;
    position: number;
  }>;
  status: 'FOUND' | 'NOT FOUND' | 'UNAVAILABLE';
}

export async function fetchSERPData(
  keyword: string, 
  location: string, 
  targetDomain: string, 
  apiKey?: string
): Promise<SerpRankResult> {
  if (!apiKey) {
    console.warn("SERP_API_KEY is not configured.");
    return { 
      organicPosition: null, 
      localPackPosition: null, 
      position: null, 
      status: 'UNAVAILABLE' 
    };
  }

  const query = `${keyword} ${location}`.trim();
  const cleanTarget = targetDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        location: location || 'United States',
        gl: 'us',
        hl: 'en',
        num: 50
      })
    });

    if (!response.ok) {
      console.error(`Serper API returned HTTP ${response.status}`);
      return { 
        organicPosition: null, 
        localPackPosition: null, 
        position: null, 
        status: 'UNAVAILABLE' 
      };
    }

    const data = await response.json() as any;
    let localPackPosition: number | null = null;
    let organicPosition: number | null = null;
    const topPlaces: any[] = [];

    // 1. Evaluate Local Pack (places)
    if (data.places && Array.isArray(data.places)) {
      data.places.slice(0, 5).forEach((place: any, pIdx: number) => {
        topPlaces.push({
          title: place.title || 'Local Business',
          rating: place.rating || null,
          reviewsCount: place.ratingCount || place.reviews || null,
          address: place.address || null,
          position: pIdx + 1
        });

        if (place.website && place.website.toLowerCase().includes(cleanTarget)) {
          localPackPosition = pIdx + 1;
        }
      });
    }

    // 2. Evaluate Organic search results
    let bestCompetitor = 'Local Competitor';
    let competitorPosition = 1;

    if (data.organic && Array.isArray(data.organic)) {
      if (data.organic.length > 0) {
        bestCompetitor = data.organic[0].title?.split(/[-|:]/)[0]?.trim() || data.organic[0].title || 'Market Leader';
      }

      const organicMatchIndex = data.organic.findIndex((res: any) => {
        if (!res.link) return false;
        const linkDomain = res.link.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        return linkDomain.includes(cleanTarget) || cleanTarget.includes(linkDomain);
      });

      if (organicMatchIndex !== -1) {
        organicPosition = organicMatchIndex + 1;
      }
    }

    const bestPosition = localPackPosition !== null 
      ? (organicPosition !== null ? Math.min(localPackPosition, organicPosition) : localPackPosition)
      : organicPosition;

    return {
      organicPosition,
      localPackPosition,
      position: bestPosition,
      bestCompetitor,
      competitorPosition,
      topPlaces,
      status: bestPosition !== null ? 'FOUND' : 'NOT FOUND'
    };
  } catch (error) {
    console.error("Error fetching SERP data:", error);
    return { 
      organicPosition: null, 
      localPackPosition: null, 
      position: null, 
      status: 'UNAVAILABLE' 
    };
  }
}
