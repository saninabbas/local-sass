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
    throw new Error(json?.error || `An API error occurred (${response.status})`);
  }
  
  return json?.data;
}

// -----------------------------------------------------------------------------
// AUTH
// -----------------------------------------------------------------------------
export const signup = (data: any) => fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: any) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => fetchApi('/api/auth/logout', { method: 'POST' });
export const getCurrentUser = () => fetchApi('/api/auth/me');
export const updateProfile = (data: { name: string }) => fetchApi('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

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

export async function analyzeCompetitor(competitorUrl: string): Promise<any> {
  return fetchApi('/api/competitors/analyze', { method: 'POST', body: JSON.stringify({ competitorUrl }) });
}

export async function generateBlogArticle(topic?: string): Promise<any> {
  return fetchApi('/api/content/generate', { method: 'POST', body: JSON.stringify({ topic }) });
}

export async function fetchLeads(): Promise<any> {
  return fetchApi('/api/leads');
}

export async function fetchIntegrationStatus(): Promise<any> {
  return fetchApi('/api/integrations/status');
}

export async function connectGoogleSearchConsole(): Promise<void> {
  // Redirect to OAuth
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
