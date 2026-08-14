export interface User {
  id: string;
  name: string;
  email: string;
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
