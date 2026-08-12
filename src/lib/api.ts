import type { DashboardData } from '../types';
import { mockDashboardData } from '../data/mockDashboard';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'An API error occurred');
  }
  
  return json.data;
}

// -----------------------------------------------------------------------------
// AUTH
// -----------------------------------------------------------------------------
export const signup = (data: any) => fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: any) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => fetchApi('/api/auth/logout', { method: 'POST' });
export const getCurrentUser = () => fetchApi('/api/auth/me');

// -----------------------------------------------------------------------------
// BUSINESS & DASHBOARD
// -----------------------------------------------------------------------------
export const createBusiness = (data: any) => fetchApi('/api/business', { method: 'POST', body: JSON.stringify(data) });

export async function getDashboard(): Promise<DashboardData> {
  try {
    return await fetchApi('/api/dashboard');
  } catch (error: any) {
    if (error.message === 'Unauthorized') throw error; // Let AuthContext handle 401s
    
    // Fallback to dev data ONLY if the backend is down (not for unauthorized)
    console.warn("Failed to fetch from API, falling back to mock data.", error);
    await delay(800);
    return mockDashboardData;
  }
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
