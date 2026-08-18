/**
 * RANKORA 2.0 — CENTRALIZED PRICING & PLAN CONFIGURATION
 * 
 * Single source of truth for plans, pricing, website limits, and feature gating.
 */

export interface PlanConfig {
  id: 'starter' | 'growth' | 'agency_pro';
  name: string;
  price: number;
  currency: string;
  period: string;
  websiteLimit: number | null; // null means unlimited
  description: string;
  who: string;
  badge?: string;
  popular?: boolean;
  cta: string;
  features: string[];
  restrictedFeatures?: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'STARTER',
    price: 15,
    currency: 'USD',
    period: '/month',
    websiteLimit: 1,
    description: 'Basic Website SEO Audit, Technical checks, On-page SEO, Basic Local SEO & AI Recommendations.',
    who: 'For small businesses starting with Rankora.',
    cta: 'Start Starter',
    features: [
      '1 Website',
      'Basic Website SEO Audit',
      'Technical SEO checks',
      'On-page SEO checks',
      'Basic Local SEO',
      'Basic SEO Recommendations',
      'Basic Dashboard',
      'Basic AI Recommendations',
      'Basic keyword tracking',
      'Basic review monitoring'
    ],
    restrictedFeatures: [
      'Deep Website Audit',
      'Real SERP Rankings',
      'AI Copilot',
      'SEO Execution Engine (WP/Shopify/GitHub)',
      'Agency Reports'
    ]
  },
  growth: {
    id: 'growth',
    name: 'GROWTH',
    price: 30,
    currency: 'USD',
    period: '/month',
    websiteLimit: 5,
    badge: 'MOST POPULAR',
    popular: true,
    description: 'Full SEO suite with Real SERP Rankings, GBP Review AI, Backlink Intelligence & Execution Engine.',
    who: 'For growing businesses and professionals managing multiple websites.',
    cta: 'Start Growth',
    features: [
      'Up to 5 Websites',
      'Deep Website Audit',
      'Technical & On-Page SEO',
      'Local SEO & Real SERP Rankings',
      'Keyword Tracking',
      'Google Business Profile & Review Intelligence',
      'AI Sentiment Analysis & AI Review Responses',
      'Authority & Backlink Intelligence',
      'Competitor & Backlink Gap Analysis',
      'AI Recommendations & AI Copilot',
      'Before / After SEO Tracking & Change History',
      'SEO Execution Engine (WP, Shopify, GitHub)'
    ]
  },
  agency_pro: {
    id: 'agency_pro',
    name: 'AGENCY PRO',
    price: 80,
    currency: 'USD',
    period: '/month',
    websiteLimit: null, // Unlimited websites
    badge: 'For Agencies',
    description: 'Unlimited websites, high-limit keyword tracking, advanced competitor intelligence, agency reports.',
    who: 'For agencies, consultants and professional SEO teams.',
    cta: 'Start Agency Pro',
    features: [
      'Unlimited Websites',
      'Everything in Growth',
      'Unlimited/High-limit Keyword Tracking',
      'Advanced SERP & Competitor Intelligence',
      'Advanced Authority Intelligence',
      'Backlink Gap & Lost Backlink Monitoring',
      'Advanced AI Recommendations & AI Copilot',
      'SEO Execution Engine (WP, Shopify, GitHub)',
      'Multi-site Management & Advanced Change History',
      'Advanced Executive Reporting',
      'Agency Dashboard & Priority Support'
    ]
  }
};

export function canUseFeature(planId: string, featureKey: string): boolean {
  const plan = PLANS[planId] || PLANS.starter;
  if (planId === 'agency_pro') return true;
  if (planId === 'growth') {
    return featureKey !== 'agency_reports' && featureKey !== 'unlimited_websites';
  }
  // Starter restrictions
  const restricted = ['deep_audit', 'real_serp', 'ai_copilot', 'seo_execution', 'agency_reports', 'backlink_gap'];
  return !restricted.includes(featureKey);
}
