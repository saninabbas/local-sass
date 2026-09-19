// Local Geo-Grid Engine for Rankora
// Simulates and queries spatial Google Maps / Local 3-Pack rankings across a multi-point grid matrix

export interface GridPoint {
  id: string;
  lat: number;
  lng: number;
  label: string; // e.g. "NW", "N", "NE", "Center", etc.
  rank: number | null; // 1-20+ or null
  localPackRank: number | null; // 1, 2, 3 or null
  bestCompetitor?: string;
  status: 'TOP_3' | 'PAGE_1' | 'RANKED' | 'NOT_FOUND' | 'UNAVAILABLE';
  competitorsAtPoint?: Array<{ name: string; position: number; rating?: number; reviews?: number }>;
}

export interface GeoGridScanResult {
  keyword: string;
  location: string;
  zipCode?: string;
  gridSize: number; // 3 (3x3 = 9 points) or 5 (5x5 = 25 points)
  radiusMiles: number;
  centerLat: number;
  centerLng: number;
  averageGridRank: number | null;
  localVisibilityIndex: number; // 0-100%
  top3Percentage: number;
  points: GridPoint[];
  scannedAt: string;
}

// Approximate conversion: 1 mile ~ 0.0145 degrees latitude, 1 mile ~ 0.017 degrees longitude
export function generateGridCoordinates(
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
  gridSize: 3 | 5 = 3
): Array<{ lat: number; lng: number; row: number; col: number; label: string }> {
  const points: Array<{ lat: number; lng: number; row: number; col: number; label: string }> = [];
  const latStep = (radiusMiles * 0.0145 * 2) / (gridSize - 1);
  const lngStep = (radiusMiles * 0.017 * 2) / (gridSize - 1);

  const startLat = centerLat + radiusMiles * 0.0145;
  const startLng = centerLng - radiusMiles * 0.017;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const lat = Number((startLat - r * latStep).toFixed(5));
      const lng = Number((startLng + c * lngStep).toFixed(5));
      
      let label = `R${r + 1}C${c + 1}`;
      if (gridSize === 3) {
        const rowLabels = ['N', 'C', 'S'];
        const colLabels = ['W', 'C', 'E'];
        label = rowLabels[r] === 'C' && colLabels[c] === 'C' ? 'Center' : `${rowLabels[r]}${colLabels[c]}`;
      }

      points.push({ lat, lng, row: r, col: c, label });
    }
  }

  return points;
}

// Default coordinates for major cities fallback
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'austin': { lat: 30.2672, lng: -97.7431 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'toronto': { lat: 43.6532, lng: -79.3832 }
};

export async function executeGeoGridScan(
  keyword: string,
  city: string,
  domain: string,
  serpApiKey?: string,
  gridSize: 3 | 5 = 3,
  radiusMiles: number = 3,
  customLat?: number,
  customLng?: number
): Promise<GeoGridScanResult> {
  const cleanCity = (city || 'Austin').toLowerCase().trim();
  const centerCoords = customLat && customLng 
    ? { lat: customLat, lng: customLng }
    : CITY_COORDINATES[cleanCity] || { lat: 30.2672, lng: -97.7431 };

  const rawPoints = generateGridCoordinates(centerCoords.lat, centerCoords.lng, radiusMiles, gridSize);
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();

  const gridPoints: GridPoint[] = [];

  // If SERP API key is available, we query Serper for each coordinate point
  if (serpApiKey) {
    try {
      // Query center point and key points via Serper
      for (const pt of rawPoints) {
        const pointId = `pt-${pt.row}-${pt.col}`;
        
        try {
          const res = await fetch('https://google.serper.dev/places', {
            method: 'POST',
            headers: {
              'X-API-KEY': serpApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              q: `${keyword} in ${city}`,
              location: `${city}`,
              ll: `@${pt.lat},${pt.lng},14z`
            })
          });

          if (res.ok) {
            const data = await res.json() as any;
            const places = data.places || [];
            
            let myRank: number | null = null;
            let bestRival = places[0]?.title || 'Local Competitor';
            const compsAtPt = places.slice(0, 3).map((p: any, idx: number) => ({
              name: p.title,
              position: idx + 1,
              rating: p.rating,
              reviews: p.ratingCount
            }));

            places.forEach((place: any, idx: number) => {
              const placeUrl = (place.website || '').toLowerCase();
              const placeTitle = (place.title || '').toLowerCase();
              if (placeUrl.includes(cleanDomain) || placeTitle.includes(cleanDomain)) {
                myRank = idx + 1;
              }
            });

            let status: GridPoint['status'] = 'NOT_FOUND';
            if (myRank !== null) {
              if (myRank <= 3) status = 'TOP_3';
              else if (myRank <= 10) status = 'PAGE_1';
              else status = 'RANKED';
            }

            gridPoints.push({
              id: pointId,
              lat: pt.lat,
              lng: pt.lng,
              label: pt.label,
              rank: myRank,
              localPackRank: myRank && myRank <= 3 ? myRank : null,
              bestCompetitor: bestRival,
              status,
              competitorsAtPoint: compsAtPt
            });
          } else {
            // Fallback for API failure at point
            gridPoints.push({
              id: pointId,
              lat: pt.lat,
              lng: pt.lng,
              label: pt.label,
              rank: null,
              localPackRank: null,
              status: 'UNAVAILABLE'
            });
          }
        } catch {
          gridPoints.push({
            id: pointId,
            lat: pt.lat,
            lng: pt.lng,
            label: pt.label,
            rank: null,
            localPackRank: null,
            status: 'UNAVAILABLE'
          });
        }
      }
    } catch {
      // Fallback
    }
  }

  // If no SERP key or points are empty, return explicit UNAVAILABLE state
  if (gridPoints.length === 0) {
    rawPoints.forEach((pt) => {
      gridPoints.push({
        id: `pt-${pt.row}-${pt.col}`,
        lat: pt.lat,
        lng: pt.lng,
        label: pt.label,
        rank: null,
        localPackRank: null,
        bestCompetitor: undefined,
        status: 'UNAVAILABLE',
        competitorsAtPoint: []
      });
    });
  }

  // Calculate Average Grid Rank (AGR) and Local Visibility Index (LVI)
  const rankedPoints = gridPoints.filter(p => p.rank !== null);
  const avgRank = rankedPoints.length > 0
    ? Number((rankedPoints.reduce((acc, p) => acc + (p.rank || 20), 0) / rankedPoints.length).toFixed(1))
    : null;

  const top3Points = gridPoints.filter(p => p.rank !== null && p.rank <= 3).length;
  const top3Percentage = Math.round((top3Points / gridPoints.length) * 100);
  
  // LVI = weighted visibility score based on grid coverage
  const lvi = Math.min(100, Math.round(
    (top3Points * 10 + gridPoints.filter(p => p.rank && p.rank > 3 && p.rank <= 10).length * 5) / (gridPoints.length * 10) * 100
  ));

  return {
    keyword,
    location: city,
    gridSize,
    radiusMiles,
    centerLat: centerCoords.lat,
    centerLng: centerCoords.lng,
    averageGridRank: avgRank,
    localVisibilityIndex: lvi,
    top3Percentage,
    points: gridPoints,
    scannedAt: new Date().toISOString()
  };
}
