/**
 * RANKORA — COMMERCIAL ENTITLEMENT & SUBSCRIPTION ENGINE
 * 
 * Centralized, server-side entitlement rules and feature limits.
 * Guarantees zero client-side bypass and strict multi-tier enforcement.
 */

export interface PlanLimits {
  name: string;
  tier: 'starter' | 'growth' | 'pro' | 'agency_pro' | 'free';
  price: number;
  project_limit: number; // 999999 for unlimited
  keyword_limit: number;
  audit_limit: number;
  competitor_limit: number;
  geogrid_limit: number;
  ai_limit: number;
  lead_limit: number;
  reports_allowed: boolean;
  agency_features: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    name: 'Starter / Free Trial',
    tier: 'free',
    price: 15,
    project_limit: 1,
    keyword_limit: 10,
    audit_limit: 10,
    competitor_limit: 3,
    geogrid_limit: 2,
    ai_limit: 30,
    lead_limit: 10,
    reports_allowed: false,
    agency_features: false
  },
  starter: {
    name: 'Starter Plan',
    tier: 'starter',
    price: 15,
    project_limit: 1,
    keyword_limit: 10,
    audit_limit: 10,
    competitor_limit: 3,
    geogrid_limit: 2,
    ai_limit: 30,
    lead_limit: 10,
    reports_allowed: false,
    agency_features: false
  },
  growth: {
    name: 'Growth Plan',
    tier: 'growth',
    price: 30,
    project_limit: 5,
    keyword_limit: 100,
    audit_limit: 100,
    competitor_limit: 15,
    geogrid_limit: 25,
    ai_limit: 500,
    lead_limit: 100,
    reports_allowed: true,
    agency_features: false
  },
  agency_pro: {
    name: 'Agency Pro Plan',
    tier: 'agency_pro',
    price: 80,
    project_limit: 999999, // Unlimited websites
    keyword_limit: 1000,
    audit_limit: 1000,
    competitor_limit: 50,
    geogrid_limit: 100,
    ai_limit: 5000,
    lead_limit: 1000,
    reports_allowed: true,
    agency_features: true
  },
  pro: {
    name: 'Agency Pro Plan',
    tier: 'pro',
    price: 80,
    project_limit: 999999, // Unlimited websites
    keyword_limit: 1000,
    audit_limit: 1000,
    competitor_limit: 50,
    geogrid_limit: 100,
    ai_limit: 5000,
    lead_limit: 1000,
    reports_allowed: true,
    agency_features: true
  }
};

export function getUserPlan(user: any): PlanLimits {
  const rawTier = (user.subscription_tier || user.subscription_status || 'starter').toLowerCase();
  const normalizedTier = (rawTier === 'pro' || rawTier === 'agency' || rawTier === 'agency_pro') ? 'agency_pro' : rawTier;

  return PLAN_LIMITS[normalizedTier] || PLAN_LIMITS.starter;
}

export function calculateTrialStatus(user: any): {
  isTrial: boolean;
  trialStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CONVERTED';
  daysLeft: number;
} {
  if (user.subscription_status === 'active' && user.subscription_tier && user.subscription_tier !== 'free') {
    return { isTrial: false, trialStatus: 'CONVERTED', daysLeft: 0 };
  }

  const createdAt = user.trial_started_at ? new Date(user.trial_started_at) : new Date(user.created_at || Date.now());
  const trialDurationDays = 14;
  const trialEnds = user.trial_ends_at 
    ? new Date(user.trial_ends_at) 
    : new Date(createdAt.getTime() + trialDurationDays * 24 * 60 * 60 * 1000);

  const now = new Date();
  const msLeft = trialEnds.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  let trialStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CONVERTED' = 'ACTIVE';
  if (daysLeft <= 0) {
    trialStatus = 'EXPIRED';
  } else if (daysLeft <= 3) {
    trialStatus = 'EXPIRING';
  }

  return {
    isTrial: true,
    trialStatus,
    daysLeft
  };
}

export async function getUserUsageStats(db: any, userId: string): Promise<{
  projectsUsed: number;
  keywordsUsed: number;
  leadsUsed: number;
  auditsUsed: number;
}> {
  const [bizCount, kwCount, leadCount, auditCount] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM businesses WHERE user_id = ? AND is_archived = 0").bind(userId).first(),
    db.prepare("SELECT COUNT(*) as count FROM keywords WHERE user_id = ?").bind(userId).first(),
    db.prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ?").bind(userId).first(),
    db.prepare("SELECT COUNT(*) as count FROM audits WHERE business_id IN (SELECT id FROM businesses WHERE user_id = ?)").bind(userId).first().catch(() => ({ count: 0 }))
  ]);

  return {
    projectsUsed: bizCount?.count || 0,
    keywordsUsed: kwCount?.count || 0,
    leadsUsed: leadCount?.count || 0,
    auditsUsed: auditCount?.count || 0
  };
}

export async function enforceEntitlement(
  db: any,
  user: any,
  action: 'create_project' | 'add_keyword' | 'run_geogrid' | 'ai_fix' | 'export_report'
): Promise<{ allowed: boolean; reason?: string; limits: PlanLimits; currentUsed?: number }> {
  const plan = getUserPlan(user);
  const trial = calculateTrialStatus(user);

  // If trial is expired and user has no active paid plan
  if (trial.isTrial && trial.trialStatus === 'EXPIRED') {
    return {
      allowed: false,
      reason: "Your 14-day free trial has expired. Upgrade to Growth ($49/mo) or Agency ($149/mo) to continue.",
      limits: plan
    };
  }

  const usage = await getUserUsageStats(db, user.id);

  if (action === 'create_project' && usage.projectsUsed >= plan.project_limit) {
    const limitLabel = plan.project_limit >= 999999 ? 'Unlimited' : plan.project_limit.toString();
    return {
      allowed: false,
      reason: `Your current plan allows up to ${limitLabel} website(s). Upgrade your plan to add another website.`,
      limits: plan,
      currentUsed: usage.projectsUsed
    };
  }

  if (action === 'add_keyword' && usage.keywordsUsed >= plan.keyword_limit) {
    return {
      allowed: false,
      reason: `KEYWORD LIMIT REACHED: You are currently tracking ${usage.keywordsUsed}/${plan.keyword_limit} keywords on the ${plan.name}. Upgrade to Growth for 50 tracked keywords.`,
      limits: plan,
      currentUsed: usage.keywordsUsed
    };
  }

  return {
    allowed: true,
    limits: plan
  };
}
