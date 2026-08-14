import type { DashboardData } from '../types';

// -----------------------------------------------------------------------------
// BASE API FETCHER
// -----------------------------------------------------------------------------
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
export const updateProfile = (data: { name: string }) => fetchApi('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
export const forgotPassword = (email: string) => fetchApi('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (data: { email: string; token: string; password: string }) => fetchApi('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

// -----------------------------------------------------------------------------
// BUSINESS & DASHBOARD
// -----------------------------------------------------------------------------
export const getBusiness = () => fetchApi('/api/business', { method: 'GET' });
export const createBusiness = (data: any) => fetchApi('/api/business', { method: 'POST', body: JSON.stringify(data) });
export const updateBusiness = (data: any) => fetchApi('/api/business', { method: 'PUT', body: JSON.stringify(data) });

export async function getDashboard(): Promise<DashboardData> {
  return fetchApi('/api/dashboard');
}

export async function runAudit(): Promise<any> {
  return fetchApi('/api/audit', { method: 'POST' });
}

export async function getRecommendations(): Promise<any> {
  return fetchApi('/api/recommendations');
}

export async function updateRecommendationStatus(id: string, status: 'pending' | 'in-progress' | 'completed'): Promise<any> {
  return fetchApi(`/api/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function createCheckout(productId: string): Promise<{ url: string }> {
  return fetchApi('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ productId }) });
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

export async function fetchAuthorityOpportunities(): Promise<any> {
  return fetchApi('/api/authority/opportunities');
}

export async function fetchBacklinks(): Promise<any> {
  return fetchApi('/api/authority/backlinks');
}

export async function addBacklink(data: any): Promise<any> {
  return fetchApi('/api/authority/backlinks', { method: 'POST', body: JSON.stringify(data) });
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
// GOOGLE BUSINESS PROFILE & REPUTATION
// -----------------------------------------------------------------------------
export async function connectGoogleBusiness(): Promise<void> {
  window.location.href = (import.meta.env.VITE_API_BASE_URL || '') + '/api/auth/googleBusiness';
}

export async function fetchGbpLocations(): Promise<any[]> {
  return fetchApi('/api/gbp/locations');
}

export async function selectGbpLocation(locationData: { locationName: string; title?: string; address?: string; phone?: string; website?: string; category?: string }): Promise<any> {
  return fetchApi('/api/gbp/select-location', { method: 'POST', body: JSON.stringify(locationData) });
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

