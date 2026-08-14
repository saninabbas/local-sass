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
      totalScore += 10;
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

export async function fetchSERPData(keyword: string, location: string, targetDomain: string, apiKey: string) {
  if (!apiKey) {
    console.warn("SERP_API_KEY is not configured.");
    return { position: null };
  }

  const query = `${keyword} ${location}`.trim();
  console.log(`Fetching SERP data for: "${query}" targeting domain: ${targetDomain}`);

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        location: location,
        gl: 'us',
        hl: 'en',
        num: 50 // Fetch top 50 to find position
      })
    });

    if (!response.ok) {
      console.error(`Serper API error: ${response.status}`);
      return { position: null };
    }

    const data = await response.json() as any;
    let foundPosition = null;

    // Check Local Pack (places) first
    if (data.places && data.places.length > 0) {
      const placeMatch = data.places.findIndex((place: any) => 
        place.website && place.website.toLowerCase().includes(targetDomain.toLowerCase())
      );
      if (placeMatch !== -1) {
        foundPosition = placeMatch + 1; // 1-indexed
      }
    }

    // Check Organic results if not found in places or if we want the best of either
    if (!foundPosition && data.organic && data.organic.length > 0) {
      const organicMatch = data.organic.findIndex((res: any) => 
        res.link && res.link.toLowerCase().includes(targetDomain.toLowerCase())
      );
      if (organicMatch !== -1) {
        foundPosition = organicMatch + 1;
      }
    }

    return { position: foundPosition };
  } catch (error) {
    console.error("Error fetching SERP data:", error);
    return { position: null };
  }
}
