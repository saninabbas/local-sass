import type { DashboardData } from '../types';

// -----------------------------------------------------------------------------
// ACTIVE WORKSPACE BUSINESS HELPER
// -----------------------------------------------------------------------------
export const getActiveBusinessId = (): string | null => {
  try {
    return localStorage.getItem('rankora_active_business_id') || null;
  } catch {
    return null;
  }
};

export const setActiveBusinessId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem('rankora_active_business_id', id);
    } else {
      localStorage.removeItem('rankora_active_business_id');
    }
  } catch {}
};

// -----------------------------------------------------------------------------
// BASE API FETCHER
// -----------------------------------------------------------------------------
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}${endpoint}`;
  const activeBizId = getActiveBusinessId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(activeBizId ? { 'X-Business-Id': activeBizId } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  
  let json;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Server error (${response.status}): The server returned an invalid response.`);
  }

  if (!response.ok || (json && typeof json === 'object' && 'success' in json && !json.success)) {
    throw new Error(json?.error || json?.message || `An API error occurred (${response.status})`);
  }
  
  return json?.data !== undefined ? json.data : json;
}

// -----------------------------------------------------------------------------
// AUTH
// -----------------------------------------------------------------------------
export const signup = (data: any) => fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: any) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => fetchApi('/api/auth/logout', { method: 'POST' });
export const getCurrentUser = () => fetchApi('/api/auth/me');
export const updateProfile = (data: { name?: string; avatar_url?: string | null }) => fetchApi('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
export const uploadAvatar = (imageData: string, contentType: string) => fetchApi('/api/auth/avatar', { method: 'POST', body: JSON.stringify({ image: imageData, contentType }) });
export const deleteAvatar = () => fetchApi('/api/auth/avatar', { method: 'DELETE' });
export const forgotPassword = (email: string) => fetchApi('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (data: { email: string; token: string; password: string }) => fetchApi('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

// -----------------------------------------------------------------------------
// MULTI-WEBSITE / WORKSPACE BUSINESSES
// -----------------------------------------------------------------------------
export const getBusinesses = () => fetchApi('/api/businesses', { method: 'GET' });
export const createWorkspaceWebsite = (data: { name?: string; type?: string; city?: string; country?: string; websiteUrl: string; setAsActive?: boolean }) => 
  fetchApi('/api/businesses', { method: 'POST', body: JSON.stringify(data) });
export const updateWorkspaceWebsite = (id: string, data: any) => 
  fetchApi(`/api/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWorkspaceWebsite = (id: string) => 
  fetchApi(`/api/businesses/${id}`, { method: 'DELETE' });
export const setActiveWorkspaceBusiness = (id: string) => 
  fetchApi(`/api/businesses/${id}/set-active`, { method: 'POST' });

export const getBusiness = (businessId?: string) => 
  fetchApi(businessId ? `/api/business?business_id=${encodeURIComponent(businessId)}` : '/api/business', { method: 'GET' });
export const createBusiness = (data: any) => fetchApi('/api/business', { method: 'POST', body: JSON.stringify(data) });
export const updateBusiness = (data: any) => fetchApi('/api/business', { method: 'PUT', body: JSON.stringify(data) });

export async function getDashboard(businessId?: string): Promise<DashboardData> {
  return fetchApi(businessId ? `/api/dashboard?business_id=${encodeURIComponent(businessId)}` : '/api/dashboard');
}

export async function runAudit(businessId?: string): Promise<any> {
  return fetchApi('/api/audit', { method: 'POST', body: JSON.stringify(businessId ? { business_id: businessId } : {}) });
}

export async function getRecommendations(): Promise<any> {
  return fetchApi('/api/recommendations');
}

export async function updateRecommendationStatus(id: string, status: 'pending' | 'in-progress' | 'completed'): Promise<any> {
  return fetchApi(`/api/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function createCheckout(plan: string = 'growth'): Promise<{ url: string; checkout_url?: string; plan?: string }> {
  return fetchApi('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) });
}

export async function getBillingPlan(): Promise<any> {
  return fetchApi('/api/billing/plan', { method: 'GET' });
}

export async function getBillingHealth(): Promise<any> {
  return fetchApi('/api/billing/health', { method: 'GET' });
}

export async function openBillingPortal(): Promise<{ url: string }> {
  return fetchApi('/api/billing/portal', { method: 'POST' });
}

export async function analyzeWebsite(): Promise<any> {
  return fetchApi('/api/website/analyze', { method: 'GET' });
}

export async function fetchDeepCrawl(): Promise<any> {
  return fetchApi('/api/website/deep-crawl', { method: 'GET' });
}

export async function analyzeCompetitor(competitorUrl: string): Promise<any> {
  return fetchApi('/api/competitors/analyze', { method: 'POST', body: JSON.stringify({ competitorUrl }) });
}

export async function generateBlogArticle(topic?: string | { topic: string; target_audience?: string; tone?: string; contentType?: string }): Promise<any> {
  const payload = typeof topic === 'string' ? { topic } : (topic || {});
  return fetchApi('/api/content/generate', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchLeads(): Promise<any> {
  return fetchApi('/api/leads');
}

export async function fetchIntegrationStatus(): Promise<any> {
  return fetchApi('/api/integrations/status');
}

export async function connectGoogleSearchConsole(): Promise<void> {
  window.location.href = (import.meta.env.VITE_API_BASE_URL || '') + '/api/integrations/google/auth';
}

// -----------------------------------------------------------------------------
// AUTHORITY & BACKLINK INTELLIGENCE (PHASE 8)
// -----------------------------------------------------------------------------
export async function fetchAuthorityOverview(businessId?: string): Promise<{
  overview: {
    domain: string;
    authority_score: number;
    total_backlinks: number;
    referring_domains: number;
    dofollow_backlinks: number;
    nofollow_backlinks: number;
    new_backlinks_30d: number;
    lost_backlinks_30d: number;
    top_referring_domains: any[];
    top_linked_pages: any[];
    last_checked_at: string;
  };
  trends: {
    '7d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
    '30d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
    '90d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
  };
}> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  return fetchApi(`/api/authority/overview${query}`);
}

export async function syncAuthorityData(businessId?: string): Promise<any> {
  return fetchApi('/api/authority/sync', {
    method: 'POST',
    body: JSON.stringify({ business_id: businessId })
  });
}

export async function fetchAuthorityBacklinks(params?: {
  filter?: string;
  limit?: number;
  offset?: number;
  businessId?: string;
}): Promise<{ backlinks: any[]; total: number; limit: number; offset: number }> {
  const q = new URLSearchParams();
  if (params?.filter) q.append('filter', params.filter);
  if (params?.limit) q.append('limit', String(params.limit));
  if (params?.offset) q.append('offset', String(params.offset));
  if (params?.businessId) q.append('business_id', params.businessId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return fetchApi(`/api/authority/backlinks${qs}`);
}

export async function fetchAuthorityDomains(businessId?: string): Promise<{ domains: any[]; total: number }> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  return fetchApi(`/api/authority/domains${query}`);
}

export async function fetchAuthorityCompetitors(businessId?: string): Promise<{ competitors: any[]; total: number }> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  return fetchApi(`/api/authority/competitors${query}`);
}

export async function addAuthorityCompetitor(domain: string, businessId?: string): Promise<any> {
  return fetchApi('/api/authority/competitors', {
    method: 'POST',
    body: JSON.stringify({ domain, business_id: businessId })
  });
}

export async function analyzeAuthorityGap(payload?: { competitor_domains?: string[]; business_id?: string }): Promise<any> {
  return fetchApi('/api/authority/analyze', {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

export async function fetchAuthorityOpportunities(params?: { filter?: string; businessId?: string }): Promise<{ opportunities: any[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.filter) q.append('filter', params.filter);
  if (params?.businessId) q.append('business_id', params.businessId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return fetchApi(`/api/authority/opportunities${qs}`);
}

export async function fetchAuthorityOpportunityDetail(id: string): Promise<any> {
  return fetchApi(`/api/authority/opportunities/${encodeURIComponent(id)}`);
}

export async function updateOpportunityStatus(id: string, status: string): Promise<any> {
  return fetchApi(`/api/authority/opportunities/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function fetchAuthorityHealth(): Promise<any> {
  return fetchApi('/api/authority/health', { method: 'POST' });
}

// -----------------------------------------------------------------------------
// KEYWORDS & VISIBILITY
// -----------------------------------------------------------------------------
export async function fetchKeywords(): Promise<any> {
  return fetchApi('/api/keywords');
}

export async function addKeyword(keyword: string, city?: string, zip?: string): Promise<any> {
  return fetchApi('/api/keywords', { method: 'POST', body: JSON.stringify({ keyword, city, zip }) });
}

export async function deleteKeyword(id: string): Promise<any> {
  return fetchApi(`/api/keywords/${id}`, { method: 'DELETE' });
}

export async function refreshKeywords(): Promise<any> {
  return fetchApi('/api/keywords/refresh', { method: 'POST' });
}

// -----------------------------------------------------------------------------
// GOOGLE BUSINESS PROFILE & REPUTATION (PHASE 7)
// -----------------------------------------------------------------------------
export async function connectGoogleBusiness(businessId?: string): Promise<void> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  window.location.href = (import.meta.env.VITE_API_BASE_URL || '') + `/api/auth/googleBusiness${query}`;
}

export async function fetchGbpAccounts(): Promise<any[]> {
  return fetchApi('/api/gbp/accounts');
}

export async function fetchGbpLocations(account?: string): Promise<any[]> {
  const query = account ? `?account=${encodeURIComponent(account)}` : '';
  return fetchApi(`/api/gbp/locations${query}`);
}

export async function selectGbpLocation(locationData: { 
  locationName: string; 
  title?: string; 
  address?: string; 
  phone?: string; 
  website?: string; 
  category?: string;
  accountId?: string;
  business_id?: string;
}): Promise<any> {
  return fetchApi('/api/gbp/locations/connect', { method: 'POST', body: JSON.stringify(locationData) });
}

export async function syncGbpReviews(businessId?: string, locationId?: string): Promise<any> {
  return fetchApi('/api/gbp/sync', { 
    method: 'POST', 
    body: JSON.stringify({ business_id: businessId, locationId }) 
  });
}

export async function fetchGbpMetrics(businessId?: string): Promise<{
  metrics: {
    totalReviews: number;
    averageRating: number;
    starsBreakdown: { star5: number; star4: number; star3: number; star2: number; star1: number };
    unansweredReviews: number;
    responseRate: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
  };
  trends: {
    '7d': { periodDays: number; newReviewsCount: number; averageRating: number; responseRate: number; negativeReviewsCount: number };
    '30d': { periodDays: number; newReviewsCount: number; averageRating: number; responseRate: number; negativeReviewsCount: number };
    '90d': { periodDays: number; newReviewsCount: number; averageRating: number; responseRate: number; negativeReviewsCount: number };
  };
}> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  return fetchApi(`/api/gbp/metrics${query}`);
}

export async function fetchGbpReviews(params?: { 
  filter?: string; 
  limit?: number; 
  offset?: number; 
  businessId?: string;
}): Promise<{ reviews: any[]; total: number; limit: number; offset: number }> {
  const q = new URLSearchParams();
  if (params?.filter) q.append('filter', params.filter);
  if (params?.limit) q.append('limit', String(params.limit));
  if (params?.offset) q.append('offset', String(params.offset));
  if (params?.businessId) q.append('business_id', params.businessId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return fetchApi(`/api/gbp/reviews${qs}`);
}

export async function analyzeReviewSentiment(reviewId: string, businessId?: string): Promise<any> {
  return fetchApi('/api/gbp/reviews/analyze', {
    method: 'POST',
    body: JSON.stringify({ reviewId, business_id: businessId })
  });
}

export async function generateGbpReviewReply(payload: {
  reviewId?: string;
  reviewerName?: string;
  rating?: number;
  reviewText?: string;
  tone?: 'professional' | 'friendly' | 'empathetic' | 'concise';
  businessId?: string;
}): Promise<{ reply: string; reviewId?: string; tone?: string }> {
  return fetchApi('/api/gbp/reviews/generate-response', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveOrPublishGbpReply(reviewId: string, payload: {
  reply: string;
  action?: 'save' | 'publish';
  businessId?: string;
}): Promise<any> {
  return fetchApi(`/api/gbp/reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchGbpHealth(): Promise<any> {
  return fetchApi('/api/gbp/health');
}

export async function fetchCompetitorsReputation(): Promise<any> {
  return fetchApi('/api/competitors/reputation');
}

export async function generateOutreachEmail(payload: { opportunityId: string; opportunityName: string; whyRelevant: string }): Promise<{ subject: string; body: string }> {
  return fetchApi('/api/authority/generate-email', { method: 'POST', body: JSON.stringify(payload) });
}

// -----------------------------------------------------------------------------
// LOCAL GEO-GRID & REPORTING
// -----------------------------------------------------------------------------
export async function fetchGeoGridScans(): Promise<any> {
  return fetchApi('/api/geogrid/scans');
}

export async function runGeoGridScan(params: { keyword: string; city?: string; gridSize?: number; radiusMiles?: number; lat?: number; lng?: number }): Promise<any> {
  return fetchApi('/api/geogrid/scan', { method: 'POST', body: JSON.stringify(params) });
}

export async function fetchGrowthSummaryReport(): Promise<any> {
  return fetchApi('/api/reports/growth-summary');
}

export async function generateContentBrief(params: { topic: string; contentType?: string }): Promise<any> {
  return fetchApi('/api/content/brief', { method: 'POST', body: JSON.stringify(params) });
}

// -----------------------------------------------------------------------------
// ADMIN MANAGEMENT
// -----------------------------------------------------------------------------
export async function getAdminStats(): Promise<import('../types').AdminStats> {
  return fetchApi('/api/admin/stats');
}

export async function getAdminUsers(params?: { search?: string; plan?: string; role?: string }): Promise<import('../types').AdminUser[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('q', params.search);
  if (params?.plan && params.plan !== 'all') query.append('plan', params.plan);
  if (params?.role && params.role !== 'all') query.append('role', params.role);
  
  const queryString = query.toString();
  return fetchApi(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
}

export async function getAdminUserDetails(userId: string): Promise<import('../types').AdminUserDetail> {
  return fetchApi(`/api/admin/users/${userId}`);
}

export async function updateUserPlan(userId: string, plan: string): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/api/admin/users/${userId}/plan`, {
    method: 'POST',
    body: JSON.stringify({ plan })
  });
}

export async function revokeUserPlan(userId: string): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/api/admin/users/${userId}/revoke-plan`, {
    method: 'POST'
  });
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  });
}

export async function updateUserRole(userId: string, role: string): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/api/admin/users/${userId}/role`, {
    method: 'POST',
    body: JSON.stringify({ role })
  });
}

// -----------------------------------------------------------------------------
// COMPETITIVE INTELLIGENCE & GROWTH ROADMAP
// -----------------------------------------------------------------------------
export async function fetchDiscoveredCompetitors(): Promise<any[]> {
  return fetchApi('/api/competitors/discovered');
}

export async function discoverCompetitors(): Promise<any[]> {
  return fetchApi('/api/competitors/discover', { method: 'POST' });
}

export async function analyzeCompetitorDeep(competitorUrl: string): Promise<any> {
  return fetchApi('/api/competitors/analyze-deep', { method: 'POST', body: JSON.stringify({ competitorUrl }) });
}

export async function fetchGrowthRoadmap(): Promise<any> {
  return fetchApi('/api/growth/roadmap');
}

// -----------------------------------------------------------------------------
// AI GROWTH COPILOT
// -----------------------------------------------------------------------------
export async function sendCopilotMessage(message: string): Promise<{ reply: string; actions?: Array<{ type: string; label: string; target?: string }> }> {
  return fetchApi('/api/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

// -----------------------------------------------------------------------------
// AI FIX ENGINE (Fix with AI)
// -----------------------------------------------------------------------------
export async function fetchAIFix(type: string, context: Record<string, any>): Promise<any> {
  return fetchApi('/api/ai/fix', {
    method: 'POST',
    body: JSON.stringify({ type, context })
  });
}

// -----------------------------------------------------------------------------
// ACTION EXECUTION & PROGRESS TRACKING
// -----------------------------------------------------------------------------
export async function updateActionStatus(actionId: string, status: 'completed' | 'pending' | 'skipped'): Promise<any> {
  return fetchApi('/api/actions/status', {
    method: 'POST',
    body: JSON.stringify({ actionId, status })
  });
}

export async function fetchActionProgress(): Promise<{ completed: number; pending: number; skipped: number; total: number; percentage: number }> {
  return fetchApi('/api/actions/progress');
}

export async function fetchProgressSummary(): Promise<any> {
  return fetchApi('/api/reports/progress-summary');
}

// -----------------------------------------------------------------------------
// WEBSITE CONNECTIONS & GITHUB (PHASE 1)
// -----------------------------------------------------------------------------
export async function getConnections(): Promise<any[]> {
  return fetchApi('/api/connections');
}

export async function saveGitHubConnection(data: {
  repositoryName: string;
  repositoryOwner: string;
  repositoryId?: string;
  defaultBranch?: string;
  installationId?: string;
  token?: string;
}): Promise<any> {
  return fetchApi('/api/connections/github', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteConnection(connectionId: string): Promise<any> {
  return fetchApi(`/api/connections/${connectionId}`, {
    method: 'DELETE'
  });
}

export async function getGitHubRepositories(token?: string, owner?: string, repo?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (owner) params.set('owner', owner);
  if (repo) params.set('repo', repo);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi(`/api/github/repositories${query}`);
}

export async function getGitHubBranches(owner: string, repo: string, token?: string): Promise<any[]> {
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  return fetchApi(`/api/github/branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}${tokenParam}`);
}

export async function getGitHubTree(owner: string, repo: string, branch: string, path?: string, token?: string): Promise<any[]> {
  const pathParam = path ? `&path=${encodeURIComponent(path)}` : '';
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  return fetchApi(`/api/github/tree?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}${pathParam}${tokenParam}`);
}

export async function getGitHubFile(owner: string, repo: string, branch: string, path: string, token?: string): Promise<any> {
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  return fetchApi(`/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}&path=${encodeURIComponent(path)}${tokenParam}`);
}

// -----------------------------------------------------------------------------
// PHASE 2: GITHUB APPROVED FIX & PULL REQUEST ENGINE
// -----------------------------------------------------------------------------
export async function executeSeoFixViaGitHub(changeId: string, options: { targetFilePath?: string; customCommitMessage?: string } = {}): Promise<any> {
  return fetchApi(`/api/seo/changes/${changeId}/execute`, {
    method: 'POST',
    body: JSON.stringify(options)
  });
}

export async function checkPullRequestStatus(changeId: string): Promise<any> {
  return fetchApi(`/api/seo/changes/${changeId}/pr-status`);
}

// -----------------------------------------------------------------------------
// PHASE 3: WORDPRESS PROVIDER INTEGRATION
// -----------------------------------------------------------------------------
export async function saveWordPressConnection(data: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): Promise<any> {
  return fetchApi('/api/connections/wordpress', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function testWordPressConnection(data: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): Promise<any> {
  return fetchApi('/api/wordpress/test', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getWordPressSiteInfo(): Promise<any> {
  return fetchApi('/api/wordpress/site');
}

export async function getWordPressPages(perPage: number = 50): Promise<any[]> {
  return fetchApi(`/api/wordpress/pages?per_page=${perPage}`);
}

export async function getWordPressPosts(perPage: number = 50): Promise<any[]> {
  return fetchApi(`/api/wordpress/posts?per_page=${perPage}`);
}

export async function executeWordPressFix(changeId: string, options: { targetType?: 'page' | 'post'; targetId?: number | string; customContent?: string } = {}): Promise<any> {
  return fetchApi(`/api/seo/changes/${changeId}/execute-wordpress`, {
    method: 'POST',
    body: JSON.stringify(options)
  });
}

// -----------------------------------------------------------------------------
// PHASE 4: SHOPIFY PROVIDER & UNIVERSAL SEO ROUTER
// -----------------------------------------------------------------------------
export async function saveShopifyConnection(data: {
  shopDomain: string;
  accessToken: string;
}): Promise<any> {
  return fetchApi('/api/connections/shopify', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function testShopifyConnection(data: {
  shopDomain: string;
  accessToken: string;
}): Promise<any> {
  return fetchApi('/api/shopify/test', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getShopifyStore(): Promise<any> {
  return fetchApi('/api/shopify/store');
}

export async function getShopifyProducts(limit: number = 50): Promise<any[]> {
  return fetchApi(`/api/shopify/products?limit=${limit}`);
}

export async function getShopifyPages(limit: number = 50): Promise<any[]> {
  return fetchApi(`/api/shopify/pages?limit=${limit}`);
}

export async function getShopifyArticles(limit: number = 50): Promise<any[]> {
  return fetchApi(`/api/shopify/articles?limit=${limit}`);
}

export async function executeShopifyFix(changeId: string, options: { resourceType?: 'product' | 'page' | 'article'; resourceId?: number | string; customContent?: string } = {}): Promise<any> {
  return fetchApi(`/api/seo/changes/${changeId}/execute-shopify`, {
    method: 'POST',
    body: JSON.stringify(options)
  });
}

export async function executeUniversalFix(changeId: string, options: {
  targetFilePath?: string;
  resourceType?: 'product' | 'page' | 'article';
  resourceId?: number | string;
  customContent?: string;
  customCommitMessage?: string;
} = {}): Promise<any> {
  return fetchApi(`/api/seo/changes/${changeId}/execute-universal`, {
    method: 'POST',
    body: JSON.stringify(options)
  });
}

export async function testConnectionHealth(provider: 'github' | 'wordpress' | 'shopify' | 'serp'): Promise<any> {
  return fetchApi('/api/connections/health', {
    method: 'POST',
    body: JSON.stringify({ provider })
  });
}

// =========================================================================
// PHASE 6: REAL SERP & LOCAL RANKING INTELLIGENCE CLIENT METHODS
// =========================================================================

export async function fetchRankingsOverview(businessId?: string): Promise<any> {
  return fetchApi(`/api/rankings${businessId ? `?business_id=${businessId}` : ''}`);
}

export async function fetchTrackedKeywords(businessId?: string): Promise<any[]> {
  const res = await fetchApi(`/api/rankings/keywords${businessId ? `?business_id=${businessId}` : ''}`);
  return Array.isArray(res) ? res : (res?.data || []);
}

export async function addRankingKeyword(params: {
  keyword: string;
  location?: string;
  countryCode?: string;
  languageCode?: string;
  device?: 'desktop' | 'mobile';
  targetDomain?: string;
  businessId?: string;
}): Promise<any> {
  return fetchApi('/api/rankings/keywords', {
    method: 'POST',
    body: JSON.stringify({
      keyword: params.keyword,
      location: params.location,
      countryCode: params.countryCode || 'US',
      languageCode: params.languageCode || 'en',
      device: params.device || 'desktop',
      targetDomain: params.targetDomain,
      business_id: params.businessId
    })
  });
}

export async function deleteRankingKeyword(id: string, businessId?: string): Promise<any> {
  return fetchApi(`/api/rankings/keywords/${id}${businessId ? `?business_id=${businessId}` : ''}`, {
    method: 'DELETE'
  });
}

export async function checkRanking(keywordId: string, businessId?: string): Promise<any> {
  return fetchApi('/api/rankings/check', {
    method: 'POST',
    body: JSON.stringify({ keywordId, business_id: businessId })
  });
}

export async function bulkCheckRankings(businessId?: string): Promise<any> {
  return fetchApi('/api/rankings/bulk-check', {
    method: 'POST',
    body: JSON.stringify({ business_id: businessId })
  });
}

export async function fetchRankingHistory(keywordId: string, days: number = 30, businessId?: string): Promise<any> {
  return fetchApi(`/api/rankings/${keywordId}/history?days=${days}${businessId ? `&business_id=${businessId}` : ''}`);
}

export async function extractCompetitorKeywords(competitorUrl: string, businessId?: string): Promise<any> {
  return fetchApi('/api/competitors/keywords/extract', {
    method: 'POST',
    body: JSON.stringify({ competitorUrl, business_id: businessId })
  });
}

export async function bulkAddRankingKeywords(keywords: Array<{
  keyword: string;
  location?: string;
  countryCode?: string;
  languageCode?: string;
  device?: 'desktop' | 'mobile';
}>, businessId?: string): Promise<any> {
  return fetchApi('/api/rankings/keywords/bulk', {
    method: 'POST',
    body: JSON.stringify({ keywords, business_id: businessId })
  });
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS SYSTEM
// -----------------------------------------------------------------------------
export async function getNotifications(businessId?: string, limit = 30): Promise<{ success: boolean; notifications: any[]; unreadCount: number }> {
  const query = new URLSearchParams();
  if (businessId) query.set('business_id', businessId);
  if (limit) query.set('limit', limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return fetchApi(`/api/notifications${queryString}`);
}

export async function markNotificationRead(id: string): Promise<any> {
  return fetchApi(`/api/notifications/${id}/read`, {
    method: 'POST'
  });
}

export async function markAllNotificationsRead(businessId?: string): Promise<any> {
  const query = businessId ? `?business_id=${encodeURIComponent(businessId)}` : '';
  return fetchApi(`/api/notifications/read-all${query}`, {
    method: 'POST'
  });
}

export async function deleteNotification(id: string): Promise<any> {
  return fetchApi(`/api/notifications/${id}`, {
    method: 'DELETE'
  });
}








