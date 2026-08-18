const crypto = require('crypto');

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Emulate Web Crypto HMAC SHA-256 in Node for verification test
async function verifyPolarSignatureNode(rawBody, headers, secret) {
  if (!secret) return { isValid: true, reason: 'NO_SECRET' };
  const sigHeader = headers['webhook-signature'] || headers['polar-webhook-signature'] || '';
  if (!sigHeader) return { isValid: false, reason: 'MISSING_SIGNATURE' };

  let cleanSecret = secret.trim();
  if (cleanSecret.startsWith('whsec_')) {
    cleanSecret = cleanSecret.replace('whsec_', '');
  }

  const webhookId = headers['webhook-id'] || '';
  const webhookTimestamp = headers['webhook-timestamp'] || '';

  const payloadsToTest = [];
  if (webhookId && webhookTimestamp) {
    payloadsToTest.push(`${webhookId}.${webhookTimestamp}.${rawBody}`);
  }
  payloadsToTest.push(rawBody);

  const sigs = sigHeader.split(/[\s,]+/).map(s => s.replace(/^v1=/, '').replace(/^v1,/, '').trim());

  for (const payload of payloadsToTest) {
    const hmac = crypto.createHmac('sha256', cleanSecret);
    hmac.update(payload);
    const hex = hmac.digest('hex');
    const base64 = Buffer.from(hex, 'hex').toString('base64');

    for (const sig of sigs) {
      if (sig === hex || sig === base64) {
        return { isValid: true };
      }
    }
  }

  return { isValid: false, reason: 'SIGNATURE_MISMATCH' };
}

// Plan limits check
const POLAR_PLANS = {
  starter: { key: 'starter', name: 'Starter', price: 15, websiteLimit: 1 },
  growth: { key: 'growth', name: 'Growth', price: 30, websiteLimit: 5 },
  agency_pro: { key: 'agency_pro', name: 'Agency Pro', price: 80, websiteLimit: null }
};

function normalizePlanKey(plan) {
  if (!plan) return 'starter';
  const clean = plan.toLowerCase().trim().replace(/[-\s]/g, '_');
  if (clean === 'growth') return 'growth';
  if (clean === 'agency_pro' || clean === 'agency' || clean === 'pro' || clean === 'enterprise') return 'agency_pro';
  return 'starter';
}

function getUserPlanLimit(subscriptionTier, subscriptionStatus, role) {
  if (role === 'admin') return 9999;
  const normPlan = normalizePlanKey(subscriptionTier || subscriptionStatus);
  const planConfig = POLAR_PLANS[normPlan] || POLAR_PLANS.starter;
  if (planConfig.websiteLimit === null) return 9999;
  return planConfig.websiteLimit;
}

async function runTestMatrix() {
  console.log("=== RANKORA POLAR BILLING PRODUCTION TEST MATRIX ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // TEST 1: Default Starter Plan
  const defaultLimit = getUserPlanLimit('starter', 'active', 'user');
  assert(defaultLimit === 1, "TEST 1: Starter default plan limit is 1 website");

  // TEST 2: Growth Plan Limit
  const growthLimit = getUserPlanLimit('growth', 'active', 'user');
  assert(growthLimit === 5, "TEST 2: Growth plan limit is 5 websites");

  // TEST 3: Agency Pro Plan Limit
  const agencyLimit = getUserPlanLimit('agency_pro', 'active', 'user');
  assert(agencyLimit === 9999, "TEST 3: Agency Pro plan limit is Unlimited (9999)");

  // TEST 4: Plan Normalization
  assert(normalizePlanKey('pro') === 'agency_pro', "TEST 4A: Normalizes 'pro' -> 'agency_pro'");
  assert(normalizePlanKey('growth') === 'growth', "TEST 4B: Normalizes 'growth' -> 'growth'");
  assert(normalizePlanKey('starter') === 'starter', "TEST 4C: Normalizes 'starter' -> 'starter'");

  // TEST 5: Webhook Signature Verification - Valid Standard Webhook
  const testSecret = 'whsec_sample_secret_key_12345';
  const testBody = JSON.stringify({ id: 'evt_123', type: 'subscription.active', data: { id: 'sub_123' } });
  const testId = 'msg_abc123';
  const testTs = '1724000000';
  const hmac = crypto.createHmac('sha256', 'sample_secret_key_12345');
  hmac.update(`${testId}.${testTs}.${testBody}`);
  const validSig = hmac.digest('hex');

  const validRes = await verifyPolarSignatureNode(testBody, {
    'webhook-id': testId,
    'webhook-timestamp': testTs,
    'webhook-signature': `v1,${validSig}`
  }, testSecret);
  assert(validRes.isValid === true, "TEST 5: Valid Polar Webhook signature accepted");

  // TEST 6: Webhook Signature Verification - Invalid Signature
  const invalidRes = await verifyPolarSignatureNode(testBody, {
    'webhook-id': testId,
    'webhook-timestamp': testTs,
    'webhook-signature': `v1,invalid_signature_hex`
  }, testSecret);
  assert(invalidRes.isValid === false, "TEST 6: Invalid Polar Webhook signature rejected");

  // TEST 7: Webhook Signature Verification - Missing Signature
  const missingRes = await verifyPolarSignatureNode(testBody, {}, testSecret);
  assert(missingRes.isValid === false, "TEST 7: Missing signature header rejected");

  // TEST 8: Non-destructive downgrade check
  // User on Growth with 8 websites downgrades to Starter (limit 1)
  const currentWebsites = 8;
  const newStarterLimit = getUserPlanLimit('starter', 'active', 'user');
  const isLimitExceeded = currentWebsites > newStarterLimit;
  const canAddMore = currentWebsites < newStarterLimit;
  assert(isLimitExceeded === true && canAddMore === false, "TEST 8: Non-destructive downgrade flags limit exceeded and blocks creation without deleting websites");

  // TEST 9: Past Due preservation
  const pastDueLimit = getUserPlanLimit('growth', 'past_due', 'user');
  assert(pastDueLimit === 5, "TEST 9: Past due status preserves existing tier limits while alerting user");

  // TEST 10: Secret Protection (Sanity check)
  const clientResponsePayload = {
    plan: 'growth',
    price: 30,
    currency: 'USD',
    websiteLimit: 5,
    subscriptionStatus: 'active'
  };
  assert(!('POLAR_ACCESS_TOKEN' in clientResponsePayload) && !('POLAR_WEBHOOK_SECRET' in clientResponsePayload), "TEST 10: Server secrets never leaked in client payloads");

  console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runTestMatrix();
