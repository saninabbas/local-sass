import type { SERPProvider, SERPSearchParams, SERPResult } from './types';
import { DataForSeoProvider } from './dataForSeoProvider';
import { SerperProvider } from './serperProvider';

class UnconfiguredSerpProvider implements SERPProvider {
  readonly name = 'Unconfigured';

  async search(_params: SERPSearchParams): Promise<SERPResult> {
    throw new Error('CONNECTION_FAILED: SERP provider credentials (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD or SERP_API_KEY) are not configured on the server.');
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: false,
      latencyMs: 0,
      message: 'No SERP provider credentials configured'
    };
  }
}

export function createSerpProvider(env: {
  DATAFORSEO_LOGIN?: string;
  DATAFORSEO_PASSWORD?: string;
  SERP_API_KEY?: string;
  SERPER_API_KEY?: string;
}): SERPProvider {
  if (env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD) {
    return new DataForSeoProvider(env.DATAFORSEO_LOGIN, env.DATAFORSEO_PASSWORD);
  }

  const serperKey = env.SERP_API_KEY || env.SERPER_API_KEY;
  if (serperKey) {
    return new SerperProvider(serperKey);
  }

  return new UnconfiguredSerpProvider();
}
