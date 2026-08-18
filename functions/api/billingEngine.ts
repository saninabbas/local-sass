// ============================================================================
// RANKORA POLAR BILLING PRODUCTION ENGINE
// Centralized server-side plan definitions, Polar API client,
// Dynamic product discovery & auto-healing, Webhook signature verification,
// and deterministic entitlement enforcement.
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
    priceMonthly: 15,
    websiteLimit: 1,
    keywordsLimit: 25,
    auditLimit: 25,
    envVar: 'POLAR_STARTER_PRODUCT_ID',
    fallbackProductId: 'f19a4c82-a816-47b3-b0ba-c72a6b2f46cc' // Rankora.Starter
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    priceMonthly: 30,
    websiteLimit: 5,
    keywordsLimit: 100,
    auditLimit: 100,
    envVar: 'POLAR_GROWTH_PRODUCT_ID',
    fallbackProductId: '71c9c886-3ebb-4790-a87b-438694f22463' // Rankora.Growth
  },
  agency_pro: {
    key: 'agency_pro',
    name: 'Agency Pro',
    priceMonthly: 80,
    websiteLimit: null, // Unlimited
    keywordsLimit: 1000,
    auditLimit: 500,
    envVar: 'POLAR_AGENCY_PRO_PRODUCT_ID',
    fallbackProductId: '47bdc1ba-789c-4a0c-88de-b7a7b5e43d21' // Rankora.Agency Pro
  }
};

export interface PolarProductItem {
  id: string;
  name: string;
  description?: string;
  is_recurring?: boolean;
  is_archived?: boolean;
  prices?: Array<{ id: string; price_amount: number; price_currency: string }>;
}

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
 * Fetches all active products from Polar API v1
 */
export async function fetchPolarProducts(polarToken: string): Promise<PolarProductItem[]> {
  try {
    const res = await fetch('https://api.polar.sh/v1/products/?is_archived=false', {
      headers: {
        'Authorization': `Bearer ${polarToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("Polar products query returned non-200:", res.status, errText);
      return [];
    }
    const data = await res.json() as any;
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.error("Error querying Polar products API:", err);
    return [];
  }
}

/**
 * Resolves the configured Polar Product ID for a given plan from Cloudflare environment variables
 * or dynamically from Polar's live product catalog.
 */
export async function resolvePolarProductIdAsync(planKey: string, env: any, polarToken?: string): Promise<string> {
  const normKey = normalizePlanKey(planKey);
  const plan = POLAR_PLANS[normKey];

  // 1. Explicit environment variable overrides
  if (normKey === 'starter' && env.POLAR_STARTER_PRODUCT_ID) {
    return env.POLAR_STARTER_PRODUCT_ID;
  }
  if (normKey === 'growth' && (env.POLAR_GROWTH_PRODUCT_ID || env.POLAR_PRODUCT_ID)) {
    return env.POLAR_GROWTH_PRODUCT_ID || env.POLAR_PRODUCT_ID;
  }
  if (normKey === 'agency_pro' && env.POLAR_AGENCY_PRO_PRODUCT_ID) {
    return env.POLAR_AGENCY_PRO_PRODUCT_ID;
  }

  // 2. Query Polar live product catalog for automatic discovery
  const token = polarToken || env.POLAR_ACCESS_TOKEN || (env as any).POLAR_API_KEY || (env as any).POLAR_TOKEN;
  if (token) {
    const products = await fetchPolarProducts(token);
    if (products.length > 0) {
      // Match by name keyword
      const matched = products.find(p => {
        const name = p.name.toLowerCase();
        if (normKey === 'starter') return name.includes('starter') || name.includes('basic') || name.includes('tier 1') || name.includes('small');
        if (normKey === 'growth') return name.includes('growth') || name.includes('standard') || name.includes('tier 2') || (name.includes('pro') && !name.includes('agency'));
        if (normKey === 'agency_pro') return name.includes('agency') || name.includes('enterprise') || name.includes('tier 3') || name.includes('unlimited');
        return false;
      });

      if (matched) {
        return matched.id;
      }

      // If only 1 product exists in the Polar organization, use it
      if (products.length === 1) {
        return products[0].id;
      }

      // If multiple products exist, sort by price ascending and match tier
      const sorted = [...products].sort((a, b) => {
        const priceA = a.prices?.[0]?.price_amount ?? 0;
        const priceB = b.prices?.[0]?.price_amount ?? 0;
        return priceA - priceB;
      });

      if (normKey === 'starter') return sorted[0].id;
      if (normKey === 'growth') return sorted[Math.min(1, sorted.length - 1)].id;
      if (normKey === 'agency_pro') return sorted[sorted.length - 1].id;
    }
  }

  return plan.fallbackProductId;
}

/**
 * Synchronous resolver (fallback for legacy calls)
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

    const payloadsToTest: string[] = [];
    if (webhookId && webhookTimestamp) {
      payloadsToTest.push(`${webhookId}.${webhookTimestamp}.${rawBody}`);
    }
    payloadsToTest.push(rawBody);

    const signaturesInHeader = webhookSignature.split(' ').flatMap(s => s.split(','));

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
 * Creates Polar Checkout Session via Polar API v1 with automatic product discovery and fallback healing.
 */
export async function createPolarCheckoutSession(params: {
  polarToken: string;
  productId: string;
  customerEmail: string;
  customerName?: string;
  userId: string;
  planKey: string;
  successUrl: string;
}): Promise<{ success: boolean; checkoutUrl?: string; error?: string; availableProducts?: PolarProductItem[] }> {
  try {
    let currentProductId = params.productId;

    let response = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.polarToken}`
      },
      body: JSON.stringify({
        product_id: currentProductId,
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

    let lastErrText = '';
    // If product does not exist, attempt auto-discovery from live Polar catalog
    if (!response.ok && response.status === 422) {
      lastErrText = await response.text();
      if (lastErrText.includes("Product does not exist") || lastErrText.includes("product_id")) {
        console.warn(`Polar Product ID '${currentProductId}' not found. Discovering active products in Polar account...`);
        const liveProducts = await fetchPolarProducts(params.polarToken);
        
        if (liveProducts.length > 0) {
          const normKey = normalizePlanKey(params.planKey);
          let alternative = liveProducts.find(p => {
            const name = p.name.toLowerCase();
            if (normKey === 'starter') return name.includes('starter') || name.includes('basic');
            if (normKey === 'growth') return name.includes('growth') || (name.includes('pro') && !name.includes('agency'));
            if (normKey === 'agency_pro') return name.includes('agency') || name.includes('enterprise');
            return false;
          });

          if (!alternative) {
            alternative = liveProducts[0];
          }

          if (alternative && alternative.id !== currentProductId) {
            console.log(`Auto-healing checkout with discovered Polar product: '${alternative.name}' (${alternative.id})`);
            currentProductId = alternative.id;

            response = await fetch('https://api.polar.sh/v1/checkouts/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${params.polarToken}`
              },
              body: JSON.stringify({
                product_id: currentProductId,
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
            // Reset lastErrText since we have a new response
            lastErrText = '';
          }
        }
      }
    }

    if (!response.ok) {
      const errText = lastErrText || await response.text();
      let errorMsg = `Polar API Error (${response.status}): ${errText}`;
      
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail && Array.isArray(parsed.detail)) {
          const detailMsgs = parsed.detail.map((d: any) => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', ');
          errorMsg = `Polar Configuration Notice: ${detailMsgs}`;
        }
      } catch {}

      const availableProducts = await fetchPolarProducts(params.polarToken);
      if (availableProducts.length > 0) {
        const prodList = availableProducts.map(p => `• ${p.name} (ID: ${p.id})`).join('\n');
        errorMsg += `\n\nDiscovered live products in your Polar organization:\n${prodList}\n\nTo bind these products, add them to Cloudflare Pages Settings -> Environment Variables:\n- POLAR_STARTER_PRODUCT_ID\n- POLAR_GROWTH_PRODUCT_ID\n- POLAR_AGENCY_PRO_PRODUCT_ID`;
      } else {
        errorMsg += `\n\nNo products found in your Polar account. Please log in to https://polar.sh/dashboard and create your subscription products under the Products tab.`;
      }

      return {
        success: false,
        error: errorMsg,
        availableProducts
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
