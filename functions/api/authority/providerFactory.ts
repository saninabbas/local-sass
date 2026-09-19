import type { BacklinkProvider, AuthorityHealthResult, DomainAuthorityOverview, BacklinkRecord } from './types';
import { DataForSeoBacklinkProvider } from './dataForSeoBacklinkProvider';
import { SerperAuthorityProvider } from './serperAuthorityProvider';

class UnconfiguredAuthorityProvider implements BacklinkProvider {
  readonly name = 'Unconfigured';

  async testConnection(): Promise<AuthorityHealthResult> {
    return {
      success: false,
      provider: this.name,
      status: 'DISCONNECTED',
      latencyMs: 0,
      message: 'No Backlink / Authority provider credentials configured. Please set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD or SERP_API_KEY/SERPER_API_KEY.',
      testedAt: new Date().toISOString()
    };
  }

  async getDomainOverview(domain: string): Promise<DomainAuthorityOverview> {
    throw new Error('CONNECTION_FAILED: Backlink provider credentials are not configured on the server.');
  }

  async getBacklinks(domain: string, limit?: number): Promise<BacklinkRecord[]> {
    throw new Error('CONNECTION_FAILED: Backlink provider credentials are not configured on the server.');
  }

  async getCompetitorBacklinks(competitorDomains: string[], limit?: number): Promise<BacklinkRecord[]> {
    throw new Error('CONNECTION_FAILED: Backlink provider credentials are not configured on the server.');
  }
}

export function createAuthorityProvider(env: {
  DATAFORSEO_LOGIN?: string;
  DATAFORSEO_PASSWORD?: string;
  SERP_API_KEY?: string;
  SERPER_API_KEY?: string;
}): BacklinkProvider {
  if (env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD) {
    return new DataForSeoBacklinkProvider(env.DATAFORSEO_LOGIN, env.DATAFORSEO_PASSWORD);
  }

  const serperKey = env.SERP_API_KEY || env.SERPER_API_KEY;
  if (serperKey) {
    return new SerperAuthorityProvider(serperKey);
  }

  return new UnconfiguredAuthorityProvider();
}
