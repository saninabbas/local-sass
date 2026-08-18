import type { 
  BacklinkProvider, 
  BacklinkRecord, 
  DomainAuthorityOverview, 
  AuthorityHealthResult 
} from './types';

export class DataForSeoBacklinkProvider implements BacklinkProvider {
  readonly name = 'DataForSEO';
  private login: string;
  private password: string;
  private authHeader: string;

  constructor(login: string, password: string) {
    this.login = login;
    this.password = password;
    this.authHeader = 'Basic ' + btoa(`${login}:${password}`);
  }

  async testConnection(): Promise<AuthorityHealthResult> {
    const startTime = Date.now();
    try {
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        }
      });
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          provider: this.name,
          status: 'ERROR',
          latencyMs,
          message: `DataForSEO API responded with HTTP ${res.status}`,
          testedAt: new Date().toISOString()
        };
      }

      const data = await res.json() as any;
      if (data?.status_code === 20000) {
        return {
          success: true,
          provider: this.name,
          status: 'CONNECTED',
          latencyMs,
          message: `Connected successfully. Balance: $${data?.tasks?.[0]?.result?.[0]?.money || '0.00'}`,
          testedAt: new Date().toISOString()
        };
      }

      return {
        success: false,
        provider: this.name,
        status: 'ERROR',
        latencyMs,
        message: data?.status_message || 'DataForSEO auth failed',
        testedAt: new Date().toISOString()
      };
    } catch (e: any) {
      return {
        success: false,
        provider: this.name,
        status: 'ERROR',
        latencyMs: Date.now() - startTime,
        message: `Network error connecting to DataForSEO: ${e.message}`,
        testedAt: new Date().toISOString()
      };
    }
  }

  async getDomainOverview(domain: string): Promise<DomainAuthorityOverview> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    try {
      const res = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          target: cleanDomain,
          internal_list_limit: 10,
          include_subdomains: true
        }])
      });

      if (!res.ok) {
        throw new Error(`DataForSEO summary request failed with HTTP ${res.status}`);
      }

      const data = await res.json() as any;
      const result = data?.tasks?.[0]?.result?.[0];

      if (!result) {
        return {
          domain: cleanDomain,
          authority_score: 0,
          total_backlinks: 0,
          referring_domains: 0,
          dofollow_backlinks: 0,
          nofollow_backlinks: 0,
          new_backlinks_30d: 0,
          lost_backlinks_30d: 0,
          top_referring_domains: [],
          top_linked_pages: [],
          last_checked_at: new Date().toISOString()
        };
      }

      return {
        domain: cleanDomain,
        authority_score: result.rank || result.domain_from_rank || 0,
        total_backlinks: result.backlinks || 0,
        referring_domains: result.referring_domains || 0,
        dofollow_backlinks: result.referring_links_types?.anchor || result.backlinks || 0,
        nofollow_backlinks: result.referring_links_attributes?.nofollow || 0,
        new_backlinks_30d: result.new_backlinks || 0,
        lost_backlinks_30d: result.lost_backlinks || 0,
        top_referring_domains: (result.referring_domains_list || []).map((rd: any) => ({
          domain: rd.domain,
          authority_score: rd.rank || 0,
          backlinks_count: rd.backlinks || 1,
          domain_type: 'WEB',
          is_dofollow: true
        })),
        top_linked_pages: (result.top_pages || []).map((tp: any) => ({
          url: tp.page,
          backlinks_count: tp.backlinks || 0,
          referring_domains: tp.referring_domains || 0
        })),
        last_checked_at: new Date().toISOString()
      };
    } catch (e: any) {
      throw new Error(`Failed to fetch domain authority summary: ${e.message}`);
    }
  }

  async getBacklinks(domain: string, limit = 50): Promise<BacklinkRecord[]> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    try {
      const res = await fetch('https://api.dataforseo.com/v3/backlinks/backlinks/live', {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          target: cleanDomain,
          limit,
          mode: 'as_is'
        }])
      });

      if (!res.ok) {
        throw new Error(`DataForSEO backlinks request failed with HTTP ${res.status}`);
      }

      const data = await res.json() as any;
      const items = data?.tasks?.[0]?.result?.[0]?.items || [];

      return items.map((item: any) => ({
        source_url: item.url_from,
        source_domain: item.domain_from,
        target_url: item.url_to,
        target_domain: cleanDomain,
        anchor_text: item.anchor || '',
        dofollow: item.dofollow !== false,
        first_seen: item.first_seen || new Date().toISOString(),
        last_seen: item.last_seen || new Date().toISOString(),
        source_domain_authority: item.rank || 0,
        source_domain_rating: item.domain_from_rank || 0,
        page_title: item.page_from_title || '',
        status: item.is_lost ? 'LOST' : item.is_new ? 'NEW' : 'STABLE'
      }));
    } catch (e: any) {
      throw new Error(`Failed to fetch backlinks from DataForSEO: ${e.message}`);
    }
  }

  async getCompetitorBacklinks(competitorDomains: string[], limit = 30): Promise<BacklinkRecord[]> {
    const allRecords: BacklinkRecord[] = [];
    for (const compDomain of competitorDomains) {
      try {
        const records = await this.getBacklinks(compDomain, limit);
        allRecords.push(...records);
      } catch (err) {
        console.warn(`Competitor backlink fetch failed for ${compDomain}:`, err);
      }
    }
    return allRecords;
  }
}
