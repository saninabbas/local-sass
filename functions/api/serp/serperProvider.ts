import type { SERPProvider, SERPSearchParams, SERPResult, SERPCompetitor } from './types';

export class SerperProvider implements SERPProvider {
  readonly name = 'Serper';

  constructor(private readonly apiKey: string) {}

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: 'test rankora', num: 10 })
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        throw new Error(`Serper returned HTTP ${response.status}`);
      }

      return {
        success: true,
        latencyMs,
        message: 'Serper API key verified and operational'
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: `Serper test failed: ${err.message}`
      };
    }
  }

  async search(params: SERPSearchParams): Promise<SERPResult> {
    const checkedAt = new Date().toISOString();
    const device = params.device || 'desktop';
    const query = `${params.keyword} ${params.location}`.trim();
    const targetDomain = params.targetDomain
      ? params.targetDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      : '';

    let response: Response;
    try {
      response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          location: params.location || 'United States',
          gl: (params.countryCode || 'US').toLowerCase(),
          hl: params.languageCode || 'en',
          num: 100
        })
      });
    } catch (err: any) {
      throw new Error(`CONNECTION_FAILED: Unable to reach Serper API (${err.message})`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('AUTH_FAILED: Serper API key is invalid or unauthorized');
    }

    if (!response.ok) {
      throw new Error(`PROVIDER_ERROR: Serper returned HTTP ${response.status}`);
    }

    const data = await response.json() as any;
    let position: number | null = null;
    let rankingUrl: string | null = null;
    let localPackPosition: number | null = null;
    const competitors: SERPCompetitor[] = [];

    // Check Local Pack (places)
    if (Array.isArray(data.places)) {
      data.places.forEach((place: any, idx: number) => {
        if (targetDomain && place.website && place.website.toLowerCase().includes(targetDomain)) {
          localPackPosition = idx + 1;
          if (position === null) {
            position = idx + 1;
            rankingUrl = place.website;
          }
        }
      });
    }

    // Check Organic results
    if (Array.isArray(data.organic)) {
      data.organic.forEach((item: any, idx: number) => {
        const itemRank = idx + 1;
        const itemDomain = (item.link || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        if (competitors.length < 5 && itemDomain && itemDomain !== targetDomain) {
          competitors.push({
            domain: itemDomain,
            title: item.title || itemDomain,
            position: itemRank,
            url: item.link || `https://${itemDomain}`
          });
        }

        if (targetDomain && item.link && (itemDomain.includes(targetDomain) || targetDomain.includes(itemDomain))) {
          if (position === null || itemRank < position) {
            position = itemRank;
            rankingUrl = item.link;
          }
        }
      });
    }

    const found = position !== null;

    return {
      keyword: params.keyword,
      location: params.location,
      countryCode: params.countryCode,
      device,
      checkedAt,
      position,
      rankingUrl,
      found,
      status: found ? 'STABLE' : 'NOT_RANKING',
      totalResults: data.searchInformation?.totalResults || (data.organic?.length || 0),
      competitors,
      localPackPosition
    };
  }
}
