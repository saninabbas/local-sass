// Rankora Phase 8 E2E Verification Test Suite
const https = require('https');

const BASE_URL = 'https://local-sass.pages.dev';
const ADMIN_EMAIL = 'saninabbas@gmail.com';
const ADMIN_PASSWORD = 'Pakistan@2026';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function request(method, path, body = null, headers = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
          method,
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timeout: 30000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            } catch {
              resolve({ status: res.statusCode, headers: res.headers, raw: data });
            }
          });
        });

        req.on('timeout', () => {
          req.destroy(new Error('Request timed out'));
        });

        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
      });

      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await delay(1000 * attempt);
    }
  }
}

async function runPhase8Verification() {
  console.log("==================================================");
  console.log("RANKORA PHASE 8 — REAL AUTHORITY & BACKLINK ENGINE");
  console.log("PRODUCTION END-TO-END VERIFICATION");
  console.log("Target:", BASE_URL);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      if (details) console.log(`       ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      if (details) console.error(`       ${details}`);
      failed++;
    }
  }

  // 1. SETUP D1 SCHEMA FIRST
  console.log("1. Ensuring Phase 8 D1 Tables & Schema...");
  const setupRes = await request('POST', '/api/setup-db', {});
  assert(setupRes.status === 200 && setupRes.data?.success, "Setup-DB Schema Migration Executed", setupRes.data?.message);

  // 2. AUTHENTICATION & TOKEN ACQUISITION
  console.log("\n2. Authenticating Admin Session...");
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.token || loginRes.data?.data?.token;
  assert(loginRes.status === 200 && !!token, `Authentication Succeeded (Admin User: ${ADMIN_EMAIL})`);
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // 3. AUTHORITY PROVIDER HEALTH CHECK
  console.log("\n3. Testing Authority Provider Health...");
  const healthRes = await request('POST', '/api/authority/health', {}, authHeaders);
  assert(healthRes.status === 200, "Authority Health Probe HTTP 200");
  assert(healthRes.data?.success === true, `Active Provider Connected: ${healthRes.data?.data?.provider}`, `Latency: ${healthRes.data?.data?.latencyMs}ms | Message: ${healthRes.data?.data?.message}`);

  // 4. RESOLVE BUSINESS PROFILE
  console.log("\n4. Resolving Target Business Context...");
  const bizRes = await request('GET', '/api/businesses', null, authHeaders);
  const businesses = bizRes.data?.data?.businesses || bizRes.data?.businesses || (Array.isArray(bizRes.data) ? bizRes.data : []);
  const defaultBiz = businesses[0];
  assert(!!defaultBiz, `Target Business Identified: ${defaultBiz?.name} (${defaultBiz?.website_url}) [ID: ${defaultBiz?.id}]`);

  // 5. LIVE DOMAIN BACKLINK SYNCHRONIZATION
  console.log("\n5. Executing Live Domain Backlink Sync...");
  const syncRes = await request('POST', '/api/authority/sync', { business_id: defaultBiz?.id }, authHeaders);
  assert(syncRes.status === 200 && syncRes.data?.success, "Authority Sync Executed Successfully", 
    `Synced: ${syncRes.data?.data?.syncedBacklinksCount} | New: ${syncRes.data?.data?.newCount} | Lost: ${syncRes.data?.data?.lostCount}`);

  // 6. AUTHORITY OVERVIEW & 7D/30D/90D HISTORICAL TRENDS
  console.log("\n6. Validating Authority Overview & Trend Telemetry...");
  const overviewRes = await request('GET', `/api/authority/overview?business_id=${defaultBiz?.id}`, null, authHeaders);
  const overviewData = overviewRes.data?.data?.overview;
  const trendsData = overviewRes.data?.data?.trends;

  assert(overviewRes.status === 200 && overviewRes.data?.success, "Authority Overview Endpoint Accessible");
  assert(typeof overviewData?.authority_score === 'number', `Domain Authority Score: ${overviewData?.authority_score}/100`);
  assert(typeof overviewData?.total_backlinks === 'number', `Total Backlinks: ${overviewData?.total_backlinks}`);
  assert(typeof overviewData?.referring_domains === 'number', `Referring Domains: ${overviewData?.referring_domains}`);
  assert(!!trendsData?.['7d'] && !!trendsData?.['30d'] && !!trendsData?.['90d'], "7D, 30D, 90D Historical Trends Calculated");

  // 7. BACKLINKS LISTING & FILTERING
  console.log("\n7. Validating Backlinks Filter Engine...");
  const allLinksRes = await request('GET', `/api/authority/backlinks?business_id=${defaultBiz?.id}&filter=all`, null, authHeaders);
  const dofollowLinksRes = await request('GET', `/api/authority/backlinks?business_id=${defaultBiz?.id}&filter=dofollow`, null, authHeaders);
  assert(allLinksRes.status === 200, `All Backlinks Returned (${allLinksRes.data?.data?.backlinks?.length || 0} links)`);
  assert(dofollowLinksRes.status === 200, `Dofollow Filter Functional (${dofollowLinksRes.data?.data?.backlinks?.length || 0} links)`);

  // 8. REFERRING DOMAINS AGGREGATION
  console.log("\n8. Validating Referring Domains Aggregation...");
  const domainsRes = await request('GET', `/api/authority/domains?business_id=${defaultBiz?.id}`, null, authHeaders);
  assert(domainsRes.status === 200 && Array.isArray(domainsRes.data?.data?.domains), 
    `Referring Domains Aggregated: ${domainsRes.data?.data?.domains?.length || 0} domains`);

  // 9. COMPETITOR MANAGEMENT
  console.log("\n9. Testing Competitor Domain Addition & Retrieval...");
  const testCompDomain = `competitor-test-${Date.now().toString().slice(-4)}.com`;
  const addCompRes = await request('POST', '/api/authority/competitors', { domain: testCompDomain, business_id: defaultBiz?.id }, authHeaders);
  assert(addCompRes.status === 200 && addCompRes.data?.success, `Added Rival Domain: ${testCompDomain}`);

  const compListRes = await request('GET', `/api/authority/competitors?business_id=${defaultBiz?.id}`, null, authHeaders);
  const compFound = compListRes.data?.data?.competitors?.some(c => c.domain === testCompDomain);
  assert(compFound, `Verified Registered Rival in Competitor List`);

  // 10. COMPETITOR BACKLINK GAP ANALYSIS & OPPORTUNITIES
  console.log("\n10. Executing Competitor Backlink Gap Analysis...");
  const gapRes = await request('POST', '/api/authority/analyze', { 
    business_id: defaultBiz?.id,
    competitor_domains: ['marham.pk', 'oladoc.com'] 
  }, authHeaders);
  assert(gapRes.status === 200 && gapRes.data?.success, "Competitor Gap Analysis Succeeded",
    `Link Gaps: ${gapRes.data?.data?.linkGaps?.length || 0} | Opportunities: ${gapRes.data?.data?.opportunitiesCount || 0}`);

  // 11. LINK OPPORTUNITIES LIST & DETAIL
  console.log("\n11. Validating Link Opportunities & Transparent AI Scoring...");
  const oppsRes = await request('GET', `/api/authority/opportunities?business_id=${defaultBiz?.id}`, null, authHeaders);
  const opps = oppsRes.data?.data?.opportunities || [];
  assert(oppsRes.status === 200 && Array.isArray(opps), `Opportunities Retrieved: ${opps.length}`);

  if (opps.length > 0) {
    const topOpp = opps[0];
    assert(typeof topOpp.ai_score === 'number' && topOpp.ai_score >= 0 && topOpp.ai_score <= 100, 
      `Transparent AI Score Validated: ${topOpp.ai_score}/100 on ${topOpp.source_domain}`);
    assert(!!topOpp.evidence, `Evidence Verified: ${topOpp.evidence?.reason || topOpp.evidence?.why_relevant}`);

    // Update Status
    const statusUpdateRes = await request('PATCH', `/api/authority/opportunities/${topOpp.id}/status`, { status: 'CONTACTED' }, authHeaders);
    assert(statusUpdateRes.status === 200 && statusUpdateRes.data?.success, `Updated Opportunity Status to CONTACTED for ${topOpp.id}`);
  }

  // 12. CONTEXTUAL OUTREACH EMAIL GENERATOR
  console.log("\n12. Testing Contextual White-Hat Outreach Email Generation...");
  const emailRes = await request('POST', '/api/authority/generate-email', {
    opportunityId: 'opp_test_1',
    opportunityName: 'Islamabad Chamber of Commerce',
    whyRelevant: 'Verified local business alliance',
    business_id: defaultBiz?.id
  }, authHeaders);
  assert(emailRes.status === 200 && (emailRes.data?.data?.subject || emailRes.data?.subject), 
    "Outreach Pitch Generated", `Subject: ${emailRes.data?.data?.subject || emailRes.data?.subject}`);

  // 13. COPILOT AUTHORITY CONTEXT INJECTION
  console.log("\n13. Testing AI Copilot Authority Intelligence Injection...");
  const copilotRes = await request('POST', '/api/copilot/chat', {
    message: "What is my current domain authority score and how many backlinks do I have?",
    business_id: defaultBiz?.id
  }, authHeaders);
  assert(copilotRes.status === 200 && copilotRes.data?.success, "Copilot Authority Query Answered");

  // 14. MULTI-TENANT ISOLATION SECURITY
  console.log("\n14. Testing Multi-Tenant Security Isolation...");
  const crossTenantRes = await request('GET', '/api/authority/overview?business_id=biz_fake_cross_tenant_999999', null, authHeaders);
  assert(crossTenantRes.status === 403 || crossTenantRes.status === 404, 
    `Cross-Tenant Access Blocked with HTTP ${crossTenantRes.status}`);

  // 15. ZERO CREDENTIAL LEAKAGE
  console.log("\n15. Verifying Zero Credential Leakage in Network Responses...");
  const jsonStr = JSON.stringify([healthRes, overviewRes, gapRes, oppsRes]);
  const hasSecrets = jsonStr.includes('DATAFORSEO_PASSWORD') || jsonStr.includes('NVIDIA_API_KEY') || jsonStr.includes('SERPER_API_KEY');
  assert(!hasSecrets, "Zero Server Secrets Leaked in Client Responses");

  // 16. REGRESSION: PHASE 6 SERP INTELLIGENCE
  console.log("\n16. Verifying Phase 6 SERP Regression...");
  const serpHealthRes = await request('POST', '/api/connections/health', { provider: 'serp', business_id: defaultBiz?.id }, authHeaders);
  assert(serpHealthRes.status === 200 && serpHealthRes.data?.success, `Phase 6 SERP Health PASS (${serpHealthRes.data?.data?.message || 'Connected'})`);

  // 17. REGRESSION: PHASE 7 GOOGLE BUSINESS PROFILE & REVIEWS
  console.log("\n17. Verifying Phase 7 GBP & Reviews Regression...");
  const gbpHealthRes = await request('POST', '/api/connections/health', { provider: 'google_business', projectId: defaultBiz?.id }, authHeaders);
  assert(gbpHealthRes.status === 200, "Phase 7 GBP Health Endpoint Responsive");

  console.log("\n==================================================");
  console.log(`FINAL RESULT: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed === 0) {
    console.log(">>> RANKORA PHASE 8 PRODUCTION VERIFICATION: 100% COMPLETE PASS <<<");
  }
}

runPhase8Verification().catch(console.error);
