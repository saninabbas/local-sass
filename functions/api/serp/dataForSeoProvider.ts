import type { SERPProvider, SERPSearchParams, SERPResult, SERPCompetitor } from './types';

export class DataForSeoProvider implements SERPProvider {
  readonly name = 'DataForSEO';

  constructor(
    private readonly login: string,
    private readonly password: string
  ) {}

  private getAuthHeader(): string {
    const credentials = `${this.login.trim()}:${this.password.trim()}`;
    // Cloudflare Worker / browser compatible base64
    return `Basic ${btoa(credentials)}`;
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.dataforseo.com/v3/user', {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        throw new Error(`DataForSEO returned HTTP ${response.status}`);
      }

      const data = await response.json() as any;
      if (data.status_code !== 20000) {
        throw new Error(data.status_message || 'Authentication error');
      }

      return {
        success: true,
        latencyMs,
        message: 'DataForSEO credentials verified and active'
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: `DataForSEO test failed: ${err.message}`
      };
    }
  }

  async search(params: SERPSearchParams): Promise<SERPResult> {
    const checkedAt = new Date().toISOString();
    const device = params.device || 'desktop';
    const targetDomain = params.targetDomain
      ? params.targetDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      : '';

    const payload = [
      {
        keyword: params.keyword.trim(),
        location_name: params.location.trim() || 'United States',
        language_code: params.languageCode || 'en',
        device: device,
        depth: 100
      }
    ];

    let response: Response;
    try {
      response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      throw new Error(`CONNECTION_FAILED: Unable to reach DataForSEO SERP API (${err.message})`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('AUTH_FAILED: DataForSEO API credentials rejected or expired');
    }

    if (!response.ok) {
      throw new Error(`PROVIDER_ERROR: DataForSEO returned HTTP ${response.status}`);
    }

    const data = await response.json() as any;
    if (data.status_code !== 20000 || !Array.isArray(data.tasks) || data.tasks.length === 0) {
      throw new Error(`PROVIDER_ERROR: DataForSEO error: ${data.status_message || 'No task response'}`);
    }

    const task = data.tasks[0];
    if (!task.result || !Array.isArray(task.result) || task.result.length === 0) {
      return {
        keyword: params.keyword,
        location: params.location,
        countryCode: params.countryCode,
        device: device,
        checkedAt,
        position: null,
        rankingUrl: null,
        found: false,
        status: 'NOT_RANKING',
        totalResults: 0,
        competitors: []
      };
    }

    const resultBlock = task.result[0];
    const items = Array.isArray(resultBlock.items) ? resultBlock.items : [];
    const totalResults = resultBlock.total_count || items.length;

    let position: number | null = null;
    let rankingUrl: string | null = null;
    let localPackPosition: number | null = null;
    const competitors: SERPCompetitor[] = [];

    for (const item of items) {
      const itemDomain = (item.domain || item.url || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      if (item.type === 'organic') {
        const itemRank = item.rank_group || item.rank_absolute;
        
        // Collect top 5 competitors
        if (competitors.length < 5 && itemDomain && itemDomain !== targetDomain) {
          competitors.push({
            domain: itemDomain,
            title: item.title || itemDomain,
            position: itemRank,
            url: item.url || `https://${itemDomain}`
          });
        }

        // Match target domain
        if (targetDomain && (itemDomain.includes(targetDomain) || targetDomain.includes(itemDomain))) {
          if (position === null || itemRank < position) {
            position = itemRank;
            rankingUrl = item.url || `https://${itemDomain}`;
          }
        }
      } else if (item.type === 'local_pack') {
        const localRank = item.rank_group || item.rank_absolute;
        if (targetDomain && item.url && item.url.toLowerCase().includes(targetDomain)) {
          localPackPosition = localRank;
          if (position === null || localRank < position) {
            position = localRank;
            rankingUrl = item.url;
          }
        }
      }
    }

    const found = position !== null;

    return {
      keyword: params.keyword,
      location: params.location,
      countryCode: params.countryCode,
      device: device,
      checkedAt,
      position,
      rankingUrl,
      found,
      status: found ? 'STABLE' : 'NOT_RANKING',
      totalResults,
      competitors,
      localPackPosition
    };
  }
}
