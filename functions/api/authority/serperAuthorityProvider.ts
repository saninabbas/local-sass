import type { 
  BacklinkProvider, 
  BacklinkRecord, 
  DomainAuthorityOverview, 
  AuthorityHealthResult,
  OpportunityClassification
} from './types';

export class SerperAuthorityProvider implements BacklinkProvider {
  readonly name = 'Serper.dev (Google Index)';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<AuthorityHealthResult> {
    const startTime = Date.now();
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: 'test connection', num: 1 })
      });
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          provider: this.name,
          status: 'ERROR',
          latencyMs,
          message: `Serper API returned HTTP ${res.status}`,
          testedAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        provider: this.name,
        status: 'CONNECTED',
        latencyMs,
        message: 'Connected to Serper Link Intelligence Provider successfully',
        testedAt: new Date().toISOString()
      };
    } catch (e: any) {
      return {
        success: false,
        provider: this.name,
        status: 'ERROR',
        latencyMs: Date.now() - startTime,
        message: `Connection error: ${e.message}`,
        testedAt: new Date().toISOString()
      };
    }
  }

  async getDomainOverview(domain: string): Promise<DomainAuthorityOverview> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const backlinks = await this.getBacklinks(cleanDomain, 30);
    
    const referringDomainSet = new Set<string>();
    let dofollowCount = 0;
    const domainCounts: Record<string, number> = {};

    for (const b of backlinks) {
      if (b.source_domain) {
        referringDomainSet.add(b.source_domain);
        domainCounts[b.source_domain] = (domainCounts[b.source_domain] || 0) + 1;
      }
      if (b.dofollow) dofollowCount++;
    }

    const topReferring = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([dom, count]) => ({
        domain: dom,
        authority_score: Math.min(95, 30 + (count * 10)),
        backlinks_count: count,
        domain_type: this.classifyDomain(dom),
        is_dofollow: true
      }));

    // Estimate domain authority score deterministically based on verified referring domain count
    const refCount = referringDomainSet.size;
    const calculatedAuthority = refCount === 0 ? 10 : Math.min(99, Math.round(20 + Math.log2(refCount + 1) * 12));

    return {
      domain: cleanDomain,
      authority_score: calculatedAuthority,
      total_backlinks: backlinks.length,
      referring_domains: refCount,
      dofollow_backlinks: dofollowCount,
      nofollow_backlinks: Math.max(0, backlinks.length - dofollowCount),
      new_backlinks_30d: backlinks.filter(b => b.status === 'NEW').length,
      lost_backlinks_30d: backlinks.filter(b => b.status === 'LOST').length,
      top_referring_domains: topReferring,
      top_linked_pages: [
        { url: `https://${cleanDomain}/`, backlinks_count: backlinks.length, referring_domains: refCount }
      ],
      last_checked_at: new Date().toISOString()
    };
  }

  async getBacklinks(domain: string, limit = 30): Promise<BacklinkRecord[]> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const records: BacklinkRecord[] = [];

    try {
      // 1. Google Link Discovery query: Find external web pages referencing or linking to target domain
      const queries = [
        `"${cleanDomain}" -site:${cleanDomain}`,
        `link:${cleanDomain}`
      ];

      for (const q of queries) {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q, num: limit })
        });

        if (!res.ok) continue;

        const data = await res.json() as any;
        const results = data.organic || [];

        for (const item of results) {
          if (!item.link) continue;
          const sourceDomain = item.link.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          if (sourceDomain.toLowerCase() === cleanDomain.toLowerCase()) continue;
          if (sourceDomain.includes('google.') || sourceDomain.includes('bing.') || sourceDomain.includes('yahoo.')) continue;

          // Prevent duplicates
          if (records.some(r => r.source_url === item.link)) continue;

          const classification = this.classifyDomain(sourceDomain);
          const isDofollow = !item.snippet?.toLowerCase().includes('sponsored') && !item.snippet?.toLowerCase().includes('ugc');

          records.push({
            source_url: item.link,
            source_domain: sourceDomain,
            target_url: `https://${cleanDomain}/`,
            target_domain: cleanDomain,
            anchor_text: item.title || cleanDomain,
            dofollow: isDofollow,
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            source_domain_authority: Math.min(95, 35 + (item.position ? (10 - Math.min(10, item.position)) * 4 : 20)),
            source_domain_rating: 40,
            page_title: item.title || '',
            status: 'STABLE'
          });

          if (records.length >= limit) break;
        }

        if (records.length >= limit) break;
      }
    } catch (err) {
      console.warn("Serper link query failed:", err);
    }

    return records;
  }

  async getCompetitorBacklinks(competitorDomains: string[], limit = 20): Promise<BacklinkRecord[]> {
    const allRecords: BacklinkRecord[] = [];
    for (const compDomain of competitorDomains) {
      try {
        const clean = compDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        const res = await this.getBacklinks(clean, limit);
        allRecords.push(...res);
      } catch (err) {
        console.warn(`Competitor backlink fetch failed for ${compDomain}:`, err);
      }
    }
    return allRecords;
  }

  private classifyDomain(domain: string): OpportunityClassification {
    const d = domain.toLowerCase();
    if (d.includes('directory') || d.includes('yellowpages') || d.includes('yelp') || d.includes('hotfrog') || d.includes('cylex')) {
      return 'LOCAL_DIRECTORY';
    }
    if (d.includes('chamber') || d.includes('commerce') || d.includes('alliance')) {
      return 'CHAMBER';
    }
    if (d.includes('news') || d.includes('post') || d.includes('times') || d.includes('tribune') || d.includes('herald') || d.includes('daily')) {
      return 'NEWS';
    }
    if (d.includes('blog') || d.includes('medium.com')) {
      return 'BLOG';
    }
    if (d.includes('association') || d.includes('society') || d.includes('council')) {
      return 'COMMUNITY';
    }
    if (d.includes('marham') || d.includes('oladoc') || d.includes('health') || d.includes('dental') || d.includes('clinic')) {
      return 'INDUSTRY_DIRECTORY';
    }
    return 'RESOURCE_PAGE';
  }
}
