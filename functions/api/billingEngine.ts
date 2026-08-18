// ============================================================================
// RANKORA POLAR BILLING PRODUCTION ENGINE
// Centralized server-side plan definitions, Polar API client,
// Webhook signature verification, and deterministic entitlement enforcement.
// ============================================================================

export interface PolarPlanConfig {
  key: 'starter' | 'growth' | 'agency_pro';
  name: string;
  priceMonthly: number;
  websiteLimit: number | null; // null = unlimited
  keywordsLimit: number;
  auditLimit: number;
  envVar: string;
  fallbackProductId: string;
}

export const POLAR_PLANS: Record<string, PolarPlanConfig> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    priceMonthly: 5,
    websiteLimit: 1,
    keywordsLimit: 25,
    auditLimit: 25,
    envVar: 'POLAR_STARTER_PRODUCT_ID',
    fallbackProductId: 'polar_starter_5usd'
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    priceMonthly: 30,
    websiteLimit: 5,
    keywordsLimit: 100,
    auditLimit: 100,
    envVar: 'POLAR_GROWTH_PRODUCT_ID',
    fallbackProductId: '7594755d-5580-4b77-86ae-90baae0e20d8'
  },
  agency_pro: {
    key: 'agency_pro',
    name: 'Agency Pro',
    priceMonthly: 80,
    websiteLimit: null, // Unlimited
    keywordsLimit: 1000,
    auditLimit: 500,
    envVar: 'POLAR_AGENCY_PRO_PRODUCT_ID',
    fallbackProductId: 'b39f379a-bf3b-4861-a083-d5951ff81561'
  }
};

/**
 * Normalizes plan key strings (supports aliases like 'agency', 'pro' -> 'agency_pro')
 */
export function normalizePlanKey(plan?: string | null): 'starter' | 'growth' | 'agency_pro' {
  if (!plan) return 'starter';
  const clean = plan.toLowerCase().trim().replace(/[-\s]/g, '_');
  if (clean === 'growth') return 'growth';
  if (clean === 'agency_pro' || clean === 'agency' || clean === 'pro' || clean === 'enterprise') return 'agency_pro';
  return 'starter';
}

/**
 * Resolves the configured Polar Product ID for a given plan from Cloudflare environment variables
 */
export function resolvePolarProductId(planKey: string, env: any): string {
  const normKey = normalizePlanKey(planKey);
  const plan = POLAR_PLANS[normKey];

  if (normKey === 'starter' && env.POLAR_STARTER_PRODUCT_ID) {
    return env.POLAR_STARTER_PRODUCT_ID;
  }
  if (normKey === 'growth' && (env.POLAR_GROWTH_PRODUCT_ID || env.POLAR_PRODUCT_ID)) {
    return env.POLAR_GROWTH_PRODUCT_ID || env.POLAR_PRODUCT_ID;
  }
  if (normKey === 'agency_pro' && env.POLAR_AGENCY_PRO_PRODUCT_ID) {
    return env.POLAR_AGENCY_PRO_PRODUCT_ID;
  }

  return plan.fallbackProductId;
}

/**
 * Resolves Rankora Plan Key from an incoming Polar Product ID
 */
export function resolvePlanFromPolarProductId(productId?: string | null, env?: any): 'starter' | 'growth' | 'agency_pro' {
  if (!productId) return 'growth';

  if (env) {
    if (env.POLAR_STARTER_PRODUCT_ID && productId === env.POLAR_STARTER_PRODUCT_ID) return 'starter';
    if (env.POLAR_GROWTH_PRODUCT_ID && productId === env.POLAR_GROWTH_PRODUCT_ID) return 'growth';
    if (env.POLAR_AGENCY_PRO_PRODUCT_ID && productId === env.POLAR_AGENCY_PRO_PRODUCT_ID) return 'agency_pro';
  }

  if (productId === POLAR_PLANS.starter.fallbackProductId) return 'starter';
  if (productId === POLAR_PLANS.growth.fallbackProductId) return 'growth';
  if (productId === POLAR_PLANS.agency_pro.fallbackProductId) return 'agency_pro';

  return 'growth';
}

/**
 * Calculates website limit based on plan, subscription status, and role
 */
export function getUserPlanLimit(subscriptionTier?: string | null, subscriptionStatus?: string | null, role?: string | null): number {
  if (role === 'admin') return 9999;
  
  // If subscription is past_due or canceled, enforce current plan tier limits (non-destructive)
  const normPlan = normalizePlanKey(subscriptionTier || subscriptionStatus);
  const planConfig = POLAR_PLANS[normPlan];
  
  if (planConfig.websiteLimit === null) {
    return 9999; // Unlimited for Agency Pro
  }
  return planConfig.websiteLimit;
}

/**
 * Feature gate check for backend route enforcement
 */
export function canUseFeature(plan: string, feature: string): boolean {
  const norm = normalizePlanKey(plan);
  
  const featureMatrix: Record<string, string[]> = {
    starter: ['serp_tracking', 'website_audit', 'action_plan'],
    growth: ['serp_tracking', 'website_audit', 'action_plan', 'geogrid', 'gbp', 'authority', 'competitor_radar', 'ai_copilot'],
    agency_pro: ['serp_tracking', 'website_audit', 'action_plan', 'geogrid', 'gbp', 'authority', 'competitor_radar', 'ai_copilot', 'seo_execution', 'internal_links', 'campaigns', 'white_label_reports', 'lead_gen_widget']
  };

  const allowed = featureMatrix[norm] || featureMatrix.starter;
  return allowed.includes(feature);
}

/**
 * Converts ArrayBuffer to Hex String
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies Polar Webhook signature.
 * Supports standard Polar HMAC-SHA256 and Standard Webhooks specification.
 */
export async function verifyPolarWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret?: string | null
): Promise<{ isValid: boolean; reason?: string }> {
  if (!secret || !secret.trim()) {
    // If webhook secret is not configured in env, allow in dev/staging with warning
    return { isValid: true, reason: 'NO_SECRET_CONFIGURED' };
  }

  const webhookId = headers.get('webhook-id') || headers.get('polar-webhook-id') || '';
  const webhookTimestamp = headers.get('webhook-timestamp') || headers.get('polar-webhook-timestamp') || '';
  const webhookSignature = headers.get('webhook-signature') || headers.get('polar-webhook-signature') || headers.get('x-polar-signature') || '';

  if (!webhookSignature) {
    return { isValid: false, reason: 'MISSING_SIGNATURE_HEADER' };
  }

  try {
    const encoder = new TextEncoder();
    let cleanSecret = secret.trim();
    if (cleanSecret.startsWith('whsec_')) {
      cleanSecret = cleanSecret.replace('whsec_', '');
    }

    // Try payload formats:
    // 1. Standard Webhook format: `${webhookId}.${webhookTimestamp}.${rawBody}`
    // 2. Direct rawBody HMAC
    const payloadsToTest: string[] = [];
    if (webhookId && webhookTimestamp) {
      payloadsToTest.push(`${webhookId}.${webhookTimestamp}.${rawBody}`);
    }
    payloadsToTest.push(rawBody);

    const signaturesInHeader = webhookSignature.split(' ').flatMap(s => s.split(','));

    // Compute HMAC
    const keyData = encoder.encode(cleanSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    for (const payload of payloadsToTest) {
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
      const hexSignature = bufferToHex(signatureBuffer);
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

      for (const rawSig of signaturesInHeader) {
        const cleanSig = rawSig.replace(/^v1=/, '').replace(/^v1,/, '').trim();
        if (cleanSig === hexSignature || cleanSig === base64Signature) {
          return { isValid: true };
        }
      }
    }

    return { isValid: false, reason: 'SIGNATURE_MISMATCH' };
  } catch (err: any) {
    console.error("Webhook signature verification error:", err);
    return { isValid: false, reason: err.message };
  }
}

/**
 * Creates Polar Checkout Session via Polar API v1
 */
export async function createPolarCheckoutSession(params: {
  polarToken: string;
  productId: string;
  customerEmail: string;
  customerName?: string;
  userId: string;
  planKey: string;
  successUrl: string;
}): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    const response = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.polarToken}`
      },
      body: JSON.stringify({
        product_id: params.productId,
        customer_email: params.customerEmail,
        customer_name: params.customerName || undefined,
        customer_external_id: params.userId,
        metadata: {
          user_id: params.userId,
          plan: params.planKey
        },
        success_url: params.successUrl
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Polar API Error (${response.status}): ${errText}`
      };
    }

    const data = await response.json() as any;
    const checkoutUrl = data.url || data.checkout_url;

    if (!checkoutUrl) {
      return { success: false, error: 'Polar did not return a valid checkout URL.' };
    }

    return { success: true, checkoutUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to Polar API.' };
  }
}

/**
 * Creates Polar Customer Portal Session via Polar API v1
 */
export async function createPolarCustomerPortalSession(params: {
  polarToken: string;
  customerId?: string | null;
  externalCustomerId?: string | null;
}): Promise<{ success: boolean; portalUrl?: string; error?: string }> {
  try {
    const payload: any = {};
    if (params.customerId) {
      payload.customer_id = params.customerId;
    } else if (params.externalCustomerId) {
      payload.external_customer_id = params.externalCustomerId;
    } else {
      return { success: false, error: 'Customer ID or External User ID is required.' };
    }

    const response = await fetch('https://api.polar.sh/v1/customer-sessions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.polarToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Polar Customer Session Error (${response.status}): ${errText}`
      };
    }

    const data = await response.json() as any;
    const portalUrl = data.customer_portal_url || data.url;

    return { success: true, portalUrl: portalUrl || 'https://polar.sh' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to Polar portal API.' };
  }
}
