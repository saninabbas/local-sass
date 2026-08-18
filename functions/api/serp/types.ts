export interface SERPSearchParams {
  keyword: string;
  location: string;
  countryCode: string;
  languageCode?: string;
  device?: 'desktop' | 'mobile';
  targetDomain?: string;
}

export interface SERPCompetitor {
  domain: string;
  title: string;
  position: number;
  url: string;
}

export interface SERPResult {
  keyword: string;
  location: string;
  countryCode: string;
  device: 'desktop' | 'mobile';
  checkedAt: string;
  position: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  rankingUrl: string | null;
  found: boolean;
  status: 'NEW' | 'IMPROVED' | 'DECLINED' | 'STABLE' | 'LOST' | 'NOT_RANKING';
  totalResults?: number;
  competitors?: SERPCompetitor[];
  localPackPosition?: number | null;
}

export interface SERPProvider {
  readonly name: string;
  search(params: SERPSearchParams): Promise<SERPResult>;
  testConnection?(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
