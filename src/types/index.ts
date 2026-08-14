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
    starter: number;
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
}

export interface GrowthScore {
  overall: number;
  seo: number;
  reviews: number;
  website: number;
  visibility: number;
  previousScore: number;
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
}

export interface Audit {
  id: string;
  businessId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  score?: number;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardData {
  user: User;
  business: Business | null;
  growthScore: GrowthScore | null;
  recommendations: Recommendation[];
}
