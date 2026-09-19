export type SerpProviderStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';

export interface SerpQueryParams {
  keyword: string;
  location?: string;
  countryCode?: string;
  languageCode?: string;
  device?: 'desktop' | 'mobile';
  targetDomain?: string;
  targetUrl?: string;
}

export interface OrganicRankingResult {
  domain: string;
  url: string;
  title: string;
  position: number;
  description?: string;
  isTarget: boolean;
}

export interface LocalPackRankingResult {
  title: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  position: number;
  isTarget: boolean;
}

export interface CompetitorRankingResult {
  domain: string;
  title: string;
  url: string;
  position: number;
  rankingType: 'organic' | 'local_pack';
}

export interface FullKeywordSerpResult {
  keyword: string;
  location: string;
  countryCode: string;
  device: 'desktop' | 'mobile';
  checkedAt: string;
  targetPosition: number | null;
  targetUrl: string | null;
  targetLocalPosition: number | null;
  found: boolean;
  organicRankings: OrganicRankingResult[];
  localPackRankings: LocalPackRankingResult[];
  competitorRankings: CompetitorRankingResult[];
  providerStatus: SerpProviderStatus;
  providerName: string;
}

export interface ISerpProvider {
  readonly name: string;
  readonly status: SerpProviderStatus;
  getOrganicRankings(params: SerpQueryParams): Promise<OrganicRankingResult[]>;
  getLocalRankings(params: SerpQueryParams): Promise<LocalPackRankingResult[]>;
  getCompetitorRankings(params: SerpQueryParams): Promise<CompetitorRankingResult[]>;
  getKeywordResults(params: SerpQueryParams): Promise<FullKeywordSerpResult>;
  testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }>;
}

/**
 * Normalizes domain for matching (strips protocols, www, subpaths).
 */
export function normalizeDomain(urlOrDomain?: string): string {
  if (!urlOrDomain) return '';
  return urlOrDomain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

/**
 * Serper.dev Google SERP Provider Implementation
 */
export class SerperSerpProvider implements ISerpProvider {
  readonly name = 'Serper';
  readonly status: SerpProviderStatus = 'CONNECTED';

  constructor(private readonly apiKey: string) {}

  async testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: 'rankora verification', num: 5 })
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        return {
          success: false,
          status: 'ERROR',
          latencyMs,
          message: `Serper returned HTTP ${response.status}`
        };
      }

      return {
        success: true,
        status: 'CONNECTED',
        latencyMs,
        message: 'Serper.dev Google SERP provider connected and operational'
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'ERROR',
        latencyMs: Date.now() - startTime,
        message: `Serper test failed: ${err.message}`
      };
    }
  }

  async getKeywordResults(params: SerpQueryParams): Promise<FullKeywordSerpResult> {
    const checkedAt = new Date().toISOString();
    const targetDomain = normalizeDomain(params.targetDomain);
    const location = params.location || 'United States';
    const countryCode = (params.countryCode || 'US').toLowerCase();
    const languageCode = params.languageCode || 'en';
    const device = params.device || 'desktop';

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${params.keyword} ${location}`.trim(),
        location,
        gl: countryCode,
        hl: languageCode,
        num: 100
      })
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("AUTH_FAILED: Serper API key is invalid or quota exhausted");
    }

    if (!response.ok) {
      throw new Error(`PROVIDER_ERROR: Serper search failed with status ${response.status}`);
    }

    const data = await response.json() as any;

    const organicRankings: OrganicRankingResult[] = [];
    const localPackRankings: LocalPackRankingResult[] = [];
    const competitorRankings: CompetitorRankingResult[] = [];

    let targetPosition: number | null = null;
    let targetUrl: string | null = null;
    let targetLocalPosition: number | null = null;

    // 1. Process Local Pack (places)
    if (Array.isArray(data.places)) {
      data.places.forEach((place: any, idx: number) => {
        const placeWebsite = place.website || '';
        const placeDomain = normalizeDomain(placeWebsite);
        const isTarget = !!(targetDomain && (placeDomain === targetDomain || placeWebsite.toLowerCase().includes(targetDomain)));
        const pos = idx + 1;

        if (isTarget && targetLocalPosition === null) {
          targetLocalPosition = pos;
        }

        localPackRankings.push({
          title: place.title || 'Local Business',
          address: place.address,
          phone: place.phoneNumber,
          website: place.website,
          rating: typeof place.rating === 'number' ? place.rating : undefined,
          reviewsCount: typeof place.ratingCount === 'number' ? place.ratingCount : undefined,
          position: pos,
          isTarget
        });

        if (!isTarget && placeDomain && competitorRankings.length < 10) {
          competitorRankings.push({
            domain: placeDomain,
            title: place.title || placeDomain,
            url: place.website || '',
            position: pos,
            rankingType: 'local_pack'
          });
        }
      });
    }

    // 2. Process Organic Results
    if (Array.isArray(data.organic)) {
      data.organic.forEach((item: any, idx: number) => {
        const itemUrl = item.link || '';
        const itemDomain = normalizeDomain(itemUrl);
        const pos = idx + 1;
        const isTarget = !!(targetDomain && (itemDomain === targetDomain || itemUrl.toLowerCase().includes(targetDomain)));

        if (isTarget && targetPosition === null) {
          targetPosition = pos;
          targetUrl = itemUrl;
        }

        organicRankings.push({
          domain: itemDomain,
          url: itemUrl,
          title: item.title || '',
          position: pos,
          description: item.snippet || '',
          isTarget
        });

        if (!isTarget && itemDomain && !competitorRankings.some(c => c.domain === itemDomain) && competitorRankings.length < 15) {
          competitorRankings.push({
            domain: itemDomain,
            title: item.title || itemDomain,
            url: itemUrl,
            position: pos,
            rankingType: 'organic'
          });
        }
      });
    }

    // If only found in local pack and not organic
    if (targetPosition === null && targetLocalPosition !== null) {
      targetPosition = targetLocalPosition;
    }

    return {
      keyword: params.keyword,
      location,
      countryCode: countryCode.toUpperCase(),
      device,
      checkedAt,
      targetPosition,
      targetUrl,
      targetLocalPosition,
      found: targetPosition !== null,
      organicRankings,
      localPackRankings,
      competitorRankings,
      providerStatus: 'CONNECTED',
      providerName: this.name
    };
  }

  async getOrganicRankings(params: SerpQueryParams): Promise<OrganicRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.organicRankings;
  }

  async getLocalRankings(params: SerpQueryParams): Promise<LocalPackRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.localPackRankings;
  }

  async getCompetitorRankings(params: SerpQueryParams): Promise<CompetitorRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.competitorRankings;
  }
}

/**
 * DataForSEO SERP Provider Implementation
 */
export class DataForSeoSerpProvider implements ISerpProvider {
  readonly name = 'DataForSEO';
  readonly status: SerpProviderStatus = 'CONNECTED';

  constructor(private readonly login: string, private readonly password?: string) {}

  async testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      const authHeader = 'Basic ' + btoa(`${this.login}:${this.password || ''}`);
      const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ keyword: 'rankora test', location_code: 2840, language_code: 'en' }])
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        return {
          success: false,
          status: 'ERROR',
          latencyMs,
          message: `DataForSEO returned HTTP ${response.status}`
        };
      }

      return {
        success: true,
        status: 'CONNECTED',
        latencyMs,
        message: 'DataForSEO SERP engine connected and operational'
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'ERROR',
        latencyMs: Date.now() - startTime,
        message: `DataForSEO test failed: ${err.message}`
      };
    }
  }

  async getKeywordResults(params: SerpQueryParams): Promise<FullKeywordSerpResult> {
    const checkedAt = new Date().toISOString();
    const targetDomain = normalizeDomain(params.targetDomain);
    const location = params.location || 'United States';
    const countryCode = (params.countryCode || 'US').toUpperCase();
    const device = params.device || 'desktop';

    const authHeader = 'Basic ' + btoa(`${this.login}:${this.password || ''}`);
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword: params.keyword,
        location_name: location,
        language_code: params.languageCode || 'en',
        device: device,
        depth: 100
      }])
    });

    if (!response.ok) {
      throw new Error(`PROVIDER_ERROR: DataForSEO query failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    const task = data.tasks?.[0]?.result?.[0];
    const items = Array.isArray(task?.items) ? task.items : [];

    const organicRankings: OrganicRankingResult[] = [];
    const localPackRankings: LocalPackRankingResult[] = [];
    const competitorRankings: CompetitorRankingResult[] = [];

    let targetPosition: number | null = null;
    let targetUrl: string | null = null;
    let targetLocalPosition: number | null = null;

    items.forEach((item: any) => {
      const itemType = item.type;
      const rankAbs = item.rank_absolute || item.rank_group;
      const url = item.url || '';
      const domain = normalizeDomain(item.domain || url);
      const isTarget = !!(targetDomain && (domain === targetDomain || url.toLowerCase().includes(targetDomain)));

      if (itemType === 'organic') {
        if (isTarget && targetPosition === null) {
          targetPosition = rankAbs;
          targetUrl = url;
        }

        organicRankings.push({
          domain,
          url,
          title: item.title || '',
          position: rankAbs,
          description: item.description || '',
          isTarget
        });

        if (!isTarget && domain && !competitorRankings.some(c => c.domain === domain) && competitorRankings.length < 15) {
          competitorRankings.push({
            domain,
            title: item.title || domain,
            url,
            position: rankAbs,
            rankingType: 'organic'
          });
        }
      } else if (itemType === 'local_pack' || itemType === 'maps') {
        if (isTarget && targetLocalPosition === null) {
          targetLocalPosition = rankAbs;
        }

        localPackRankings.push({
          title: item.title || 'Local Business',
          address: item.address,
          phone: item.phone,
          website: item.url,
          rating: item.rating?.value,
          reviewsCount: item.rating?.votes_count,
          position: rankAbs,
          isTarget
        });
      }
    });

    if (targetPosition === null && targetLocalPosition !== null) {
      targetPosition = targetLocalPosition;
    }

    return {
      keyword: params.keyword,
      location,
      countryCode,
      device,
      checkedAt,
      targetPosition,
      targetUrl,
      targetLocalPosition,
      found: targetPosition !== null,
      organicRankings,
      localPackRankings,
      competitorRankings,
      providerStatus: 'CONNECTED',
      providerName: this.name
    };
  }

  async getOrganicRankings(params: SerpQueryParams): Promise<OrganicRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.organicRankings;
  }

  async getLocalRankings(params: SerpQueryParams): Promise<LocalPackRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.localPackRankings;
  }

  async getCompetitorRankings(params: SerpQueryParams): Promise<CompetitorRankingResult[]> {
    const res = await this.getKeywordResults(params);
    return res.competitorRankings;
  }
}

/**
 * BrightLocal Stub Provider (Prepared for future configuration)
 */
export class BrightLocalSerpProvider implements ISerpProvider {
  readonly name = 'BrightLocal';
  readonly status: SerpProviderStatus = 'NOT_CONFIGURED';

  async testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }> {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      message: 'BrightLocal provider is not configured on this Scorankio instance.'
    };
  }

  async getKeywordResults(_params: SerpQueryParams): Promise<FullKeywordSerpResult> {
    throw new Error('PROVIDER_NOT_CONFIGURED: BrightLocal API credentials are not configured.');
  }

  async getOrganicRankings(_params: SerpQueryParams): Promise<OrganicRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: BrightLocal API credentials are not configured.');
  }

  async getLocalRankings(_params: SerpQueryParams): Promise<LocalPackRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: BrightLocal API credentials are not configured.');
  }

  async getCompetitorRankings(_params: SerpQueryParams): Promise<CompetitorRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: BrightLocal API credentials are not configured.');
  }
}

/**
 * Semrush Stub Provider (Prepared for future configuration)
 */
export class SemrushSerpProvider implements ISerpProvider {
  readonly name = 'Semrush';
  readonly status: SerpProviderStatus = 'NOT_CONFIGURED';

  async testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }> {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      message: 'Semrush provider is not configured on this Scorankio instance.'
    };
  }

  async getKeywordResults(_params: SerpQueryParams): Promise<FullKeywordSerpResult> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Semrush API credentials are not configured.');
  }

  async getOrganicRankings(_params: SerpQueryParams): Promise<OrganicRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Semrush API credentials are not configured.');
  }

  async getLocalRankings(_params: SerpQueryParams): Promise<LocalPackRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Semrush API credentials are not configured.');
  }

  async getCompetitorRankings(_params: SerpQueryParams): Promise<CompetitorRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Semrush API credentials are not configured.');
  }
}

/**
 * Unconfigured SERP Provider (Returns explicit NOT_CONFIGURED state without fake data)
 */
export class UnconfiguredSerpProvider implements ISerpProvider {
  readonly name = 'Unconfigured';
  readonly status: SerpProviderStatus = 'NOT_CONFIGURED';

  async testConnection(): Promise<{ success: boolean; status: SerpProviderStatus; latencyMs: number; message: string }> {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      message: 'No SERP provider credentials configured. Connect Serper, DataForSEO, BrightLocal, or Semrush.'
    };
  }

  async getKeywordResults(_params: SerpQueryParams): Promise<FullKeywordSerpResult> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Connect a SERP provider (e.g. Serper, DataForSEO) to enable real ranking data.');
  }

  async getOrganicRankings(_params: SerpQueryParams): Promise<OrganicRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Connect a SERP provider to enable real ranking data.');
  }

  async getLocalRankings(_params: SerpQueryParams): Promise<LocalPackRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Connect a SERP provider to enable real ranking data.');
  }

  async getCompetitorRankings(_params: SerpQueryParams): Promise<CompetitorRankingResult[]> {
    throw new Error('PROVIDER_NOT_CONFIGURED: Connect a SERP provider to enable real ranking data.');
  }
}

/**
 * Factory function to retrieve the configured SERP provider based on environment variables.
 */
export function getSerpProvider(env: {
  DATAFORSEO_LOGIN?: string;
  DATAFORSEO_PASSWORD?: string;
  DATAFORSEO_API_KEY?: string;
  SERPER_API_KEY?: string;
  SERP_API_KEY?: string;
  BRIGHTLOCAL_API_KEY?: string;
  SEMRUSH_API_KEY?: string;
}): ISerpProvider {
  const serperKey = env.SERPER_API_KEY || env.SERP_API_KEY;
  if (serperKey && serperKey.trim().length > 0) {
    return new SerperSerpProvider(serperKey.trim());
  }

  if (env.DATAFORSEO_LOGIN && (env.DATAFORSEO_PASSWORD || env.DATAFORSEO_API_KEY)) {
    return new DataForSeoSerpProvider(env.DATAFORSEO_LOGIN.trim(), env.DATAFORSEO_PASSWORD || env.DATAFORSEO_API_KEY);
  }

  if (env.BRIGHTLOCAL_API_KEY && env.BRIGHTLOCAL_API_KEY.trim().length > 0) {
    return new BrightLocalSerpProvider();
  }

  if (env.SEMRUSH_API_KEY && env.SEMRUSH_API_KEY.trim().length > 0) {
    return new SemrushSerpProvider();
  }

  return new UnconfiguredSerpProvider();
}
