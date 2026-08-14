export type DataStatus = 'LIVE' | 'CALCULATED' | 'AI-ANALYZED' | 'UNAVAILABLE';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user' | string;
  subscription_status?: string;
  email_verified?: number | boolean;
  created_at?: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalBusinesses: number;
  totalAudits: number;
  totalLeads: number;
  recentSignups7d: number;
  recentSignups30d: number;
  planBreakdown: {
    free: number;
    growth: number;
    pro: number;
    enterprise: number;
    [key: string]: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | string;
  subscription_status: string;
  email_verified: number | boolean;
  created_at: string;
  businessCount: number;
  auditCount: number;
  leadCount: number;
  businessName?: string;
  businessUrl?: string;
}

export interface AdminUserDetail {
  user: User;
  businesses: Business[];
  audits: Audit[];
  growthScores: GrowthScore[];
  recommendations: Recommendation[];
  leads: any[];
  backlinks: any[];
}

export interface Business {
  id: string;
  name: string;
  type?: string;
  city: string;
  country?: string;
  websiteUrl?: string;
  mainServices?: string[];
  primaryKeywords?: string[];
  discoveredData?: any;
}

export interface DiagnosticCategory {
  name: string;
  key: string;
  score: number;
  previousScore?: number | null;
  change?: number;
  weight: number;
  status?: DataStatus;
  problems: ProblemItem[];
  whyItMatters: string;
  recommendedActions: string[];
}

export interface ProblemItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'technical' | 'onpage' | 'local' | 'content' | 'performance' | 'mobile' | 'security' | 'conversion' | 'reviews' | 'gbp' | 'rankings' | 'authority';
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  impact: string;
  difficulty?: 'Easy' | 'Medium' | 'Advanced';
  howCompetitorsPerform?: string;
  actionLink?: string;
  expected_outcome?: string;
  expectedOutcome?: string;
}

export interface QuickWinItem {
  id: string;
  action: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  impact: 'HIGH' | 'VERY HIGH' | 'MEDIUM';
  estimatedEffort: string;
  whyItMatters: string;
  category: string;
}

export interface DiscoveredCompetitor {
  id?: string;
  domain: string;
  name: string;
  ranking_position: number;
  keyword: string;
  url: string;
  location: string;
  organic_title: string;
  organic_snippet: string;
  local_pack_position?: number | null;
  rating?: number | null;
  review_count?: number | null;
  category?: string | null;
  health_score?: number;
}

export interface CompetitorComparisonItem {
  domain: string;
  name: string;
  growthScore: number;
  localScore: number;
  contentScore: number;
  technicalScore: number;
  keywordsCount: number;
  visibilityScore: number;
  rating?: number | null;
  reviewsCount?: number | null;
  isBehind: boolean;
  gapSummary: string;
}

export interface CompetitorRankingReason {
  factor: string;
  observation: string;
  competitorAdvantage: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface CompetitorMatrixGap {
  dimension: string;
  you: string;
  them: string;
  gap: string;
  recommendedAction: string;
}

export interface CompetitorGap {
  gap_type: string;
  gap_title: string;
  customer_evidence: string;
  competitor_evidence: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  likely_factor?: string;
  recommendation: string;
}

export interface ContentGapItem {
  topic: string;
  search_intent: string;
  reason: string;
  competitor_evidence: string;
  priority: 'high' | 'medium' | 'low' | string;
  expected_outcome: string;
}

export interface KeywordItem {
  id: string;
  keyword: string;
  intent: 'LOCAL' | 'INFORMATIONAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL' | string;
  currentRank: number | null;
  previousRank: number | null;
  change: number;
  bestCompetitor?: string;
  competitorRank?: number | null;
  opportunity?: string;
  searchVolume?: string;
  localPackRank?: number | null;
  status?: DataStatus;
}

export interface PageCrawlItem {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  wordCount: number;
  imageCount: number;
  missingAltCount: number;
  internalLinksCount: number;
  seoScore: number;
  status: number;
  issues: string[];
}

export interface ContentTopicItem {
  id: string;
  topic: string;
  intent: string;
  targetKeyword: string;
  competitorEvidence: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  brief?: string;
}

export interface AIFixRequest {
  type: 'title' | 'meta_description' | 'service_page_structure' | 'faq_schema' | 'review_response' | 'outreach_email' | 'content_brief';
  context: {
    businessName: string;
    websiteUrl: string;
    city: string;
    category?: string;
    targetKeyword?: string;
    issueEvidence?: string;
    competitorAdvantage?: string;
    reviewerName?: string;
    reviewRating?: number;
    reviewText?: string;
    prospectDomain?: string;
    prospectTitle?: string;
  };
}

export interface AIFixResult {
  type: string;
  title: string;
  generatedContent: string;
  explanation: string;
  suggestedAction: string;
  metaTags?: {
    title?: string;
    description?: string;
    h1?: string;
  };
}

export interface ActionProgressData {
  completed: number;
  pending: number;
  skipped: number;
  total: number;
  percentage: number;
}

export interface ProgressSummaryData {
  hasComparison: boolean;
  current: {
    score: number;
    local: number;
    technical: number;
    onpage: number;
    content: number;
    date: string;
  } | null;
  previous: {
    score: number;
    local: number;
    technical: number;
    onpage: number;
    content: number;
    date: string;
  } | null;
  deltas: {
    score: number;
    local: number;
    technical: number;
  };
  completedActions: number;
  totalActions: number;
  completionPercentage: number;
  summaryHighlights: string[];
}

export interface ActionPlanTask {
  id: string;
  timeframe: 'today' | 'this_week' | 'this_month' | 'next_90_days' | 'long_term';
  title?: string;
  description?: string;
  problem?: string;
  evidence: string;
  why?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  difficulty: 'EASY' | 'MEDIUM' | 'ADVANCED' | string;
  impact?: string;
  seoImpact?: string;
  localImpact?: string;
  conversionImpact?: string;
  estimatedEffort?: string;
  businessOutcome?: string;
  expected_outcome?: string;
  fixType?: 'title' | 'meta_description' | 'service_page_structure' | 'faq_schema' | 'review_response' | 'outreach_email' | 'content_brief';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'dismissed';
}

export interface GrowthScore {
  overall: number;
  technical: number;
  onpage: number;
  local: number;
  content: number;
  mobile: number;
  security: number;
  conversion?: number;
  performance?: number;
  gbp?: number | null;
  reviews?: number | null;
  rankings?: number | null;
  authority?: number | null;
  seo?: number;
  website?: number;
  visibility?: number;
  previousScore: number | null;
  change: number;
  progressHistory: number[];
  lastAudited: string;
}

export interface Recommendation {
  id: string;
  priority: string;
  priorityColor: string;
  title: string;
  description: string;
  impact: string;
  estimatedTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  actionLink: string;
  difficulty?: string;
  seoImpact?: string;
  localImpact?: string;
  conversionImpact?: string;
  businessOutcome?: string;
  timeframe?: 'today' | 'this_week' | 'this_month' | 'long_term';
}

export interface Audit {
  id: string;
  businessId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'running';
  score?: number;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardData {
  user: User;
  business: Business | null;
  growthScore: GrowthScore | null;
  recommendations: Recommendation[];
  biggestProblems?: ProblemItem[];
  competitorSnapshot?: CompetitorComparisonItem[];
  quickWins?: QuickWinItem[];
  keywordsSummary?: {
    totalTracked: number;
    top3Count: number;
    top10Count: number;
    improvingCount: number;
  };
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggested_action?: {
    action_type: string;
    action_label: string;
    action_description: string;
  } | null;
  follow_up_prompts?: string[];
  actions?: Array<{
    type: string;
    label: string;
    target?: string;
  }>;
}

export interface ReviewItem {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  owner_reply: string | null;
  reply_status: string;
  source: string;
  created_at: string;
}
