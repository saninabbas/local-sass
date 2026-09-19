export interface BacklinkRecord {
  id?: string;
  source_url: string;
  source_domain: string;
  target_url: string;
  target_domain: string;
  anchor_text: string;
  dofollow: boolean;
  first_seen?: string;
  last_seen?: string;
  source_domain_authority?: number;
  source_domain_rating?: number;
  page_title?: string;
  status?: 'NEW' | 'LOST' | 'STABLE';
}

export interface DomainAuthorityOverview {
  domain: string;
  authority_score: number;
  total_backlinks: number;
  referring_domains: number;
  dofollow_backlinks: number;
  nofollow_backlinks: number;
  new_backlinks_30d: number;
  lost_backlinks_30d: number;
  top_referring_domains: {
    domain: string;
    authority_score: number;
    backlinks_count: number;
    domain_type: string;
    is_dofollow: boolean;
  }[];
  top_linked_pages: {
    url: string;
    backlinks_count: number;
    referring_domains: number;
  }[];
  last_checked_at: string;
}

export type OpportunityClassification = 
  | 'LOCAL_DIRECTORY'
  | 'LOCAL_PUBLICATION'
  | 'INDUSTRY_DIRECTORY'
  | 'RESOURCE_PAGE'
  | 'BLOG'
  | 'NEWS'
  | 'PARTNERSHIP'
  | 'SPONSORSHIP'
  | 'COMMUNITY'
  | 'CHAMBER'
  | 'UNKNOWN';

export interface CompetitorGapItem {
  id: string;
  referring_domain: string;
  competitor_domain: string;
  competitor_name?: string;
  competitor_backlink_url: string;
  competitor_target_url: string;
  domain_authority: number;
  opportunity_type: OpportunityClassification;
  has_user_backlink: boolean;
  observed_date: string;
}

export interface LinkOpportunity {
  id: string;
  business_id: string;
  source_domain: string;
  source_url: string;
  opportunity_type: OpportunityClassification;
  evidence: {
    competitor_domain?: string;
    competitor_name?: string;
    competitor_source_url?: string;
    competitor_target_url?: string;
    observed_date: string;
    reason: string;
    why_relevant: string;
    local_relevance_factor?: string;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  ai_score: number; // 0 - 100
  scoring_breakdown?: {
    authority_weight: number;
    relevance_weight: number;
    local_relevance_weight: number;
    competitor_evidence_weight: number;
    freshness_weight: number;
  };
  recommended_action: string;
  status: 'DISCOVERED' | 'EVALUATING' | 'CONTACTED' | 'ACQUIRED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface AuthorityHealthResult {
  success: boolean;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  latencyMs: number;
  message: string;
  testedAt: string;
}

export interface BacklinkProvider {
  readonly name: string;
  testConnection(): Promise<AuthorityHealthResult>;
  getDomainOverview(domain: string): Promise<DomainAuthorityOverview>;
  getBacklinks(domain: string, limit?: number): Promise<BacklinkRecord[]>;
  getCompetitorBacklinks(competitorDomains: string[], limit?: number): Promise<BacklinkRecord[]>;
}
