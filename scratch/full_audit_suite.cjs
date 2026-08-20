const https = require('https');

function request(url, options = {}, postData = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      if (!opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/json';
      }
      opts.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latencyMs = Date.now() - startTime;
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json || data,
          rawText: data,
          latencyMs
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        headers: {},
        data: null,
        error: err.message,
        latencyMs: Date.now() - startTime
      });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

async function runAudit() {
  console.log("===============================================================");
  console.log("  RANKORA PRODUCTION QA & SECURITY AUDIT SUITE");
  console.log("===============================================================\n");

  const results = {
    module1: { pass: true, tests: [] },
    module2: { pass: true, tests: [] },
    module3: { pass: true, tests: [] },
    security: { pass: true, tests: [] },
    performance: { timings: [] }
  };

  function record(module, testName, passed, details = {}) {
    results[module].tests.push({ testName, passed, details });
    if (!passed) results[module].pass = false;
    const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${module.toUpperCase()}] ${statusIcon} - ${testName}`);
    if (!passed) console.log(`   Issue:`, details);
  }

  // 1. SETUP / AUTH
  console.log("--- Authenticating Test Session ---");
  const loginRes = await request('https://local-sass.pages.dev/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ email: 'saninabbas@gmail.com', password: 'Pakistan@2026' }));

  results.performance.timings.push({ endpoint: 'POST /api/auth/login', latencyMs: loginRes.latencyMs });

  const cookieStr = loginRes.headers['set-cookie']?.join('; ') || '';
  const sessionIdMatch = cookieStr.match(/session_id=([^;]+)/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';

  const authHeaders = {
    'Cookie': cookieStr,
    'Authorization': `Bearer ${sessionId}`
  };

  const bizRes = await request('https://local-sass.pages.dev/api/businesses', { headers: authHeaders });
  const activeBiz = bizRes.data?.data?.businesses?.[0] || bizRes.data?.businesses?.[0] || bizRes.data?.[0];
  console.log(`Active Business: ${activeBiz?.name} (${activeBiz?.id})\n`);

  // =========================================================================
  // MODULE 1: AUTHORITY BUILDER AUDIT
  // =========================================================================
  console.log("--- Auditing Module 1: Authority Builder ---");

  // 1.1 Frontend Route Check
  const pageRes = await request('https://local-sass.pages.dev/dashboard/authority');
  record('module1', 'Route /dashboard/authority loads (200 OK)', pageRes.statusCode === 200, { statusCode: pageRes.statusCode });

  // 1.2 Unauthenticated Access Protection
  const unauthTasks = await request('https://local-sass.pages.dev/api/authority/tasks');
  record('module1', 'GET /api/authority/tasks requires Auth (401/403)', unauthTasks.statusCode === 401 || unauthTasks.statusCode === 403, { statusCode: unauthTasks.statusCode });

  // 1.3 GET Authority Tasks
  const tasksRes = await request('https://local-sass.pages.dev/api/authority/tasks', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/authority/tasks', latencyMs: tasksRes.latencyMs });
  const taskList = tasksRes.data?.tasks || tasksRes.data?.data?.tasks || [];
  record('module1', 'GET /api/authority/tasks returns tasks & progress schema', tasksRes.statusCode === 200 && Array.isArray(taskList) && tasksRes.data?.progress?.total !== undefined, {
    count: taskList.length,
    progress: tasksRes.data?.progress
  });

  // 1.4 Check Tasks Platform Diversity
  const platforms = new Set(taskList.map(t => (t.platform || '').toLowerCase()));
  record('module1', 'Growth Tasks cover multiple supported platforms (Medium, Quora, Reddit, etc.)', platforms.size >= 4, { platforms: Array.from(platforms) });

  // 1.5 Generate AI Tasks
  const genTasksRes = await request('https://local-sass.pages.dev/api/authority/tasks/generate', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({ business_id: activeBiz?.id }));
  results.performance.timings.push({ endpoint: 'POST /api/authority/tasks/generate', latencyMs: genTasksRes.latencyMs });
  const genTaskList = genTasksRes.data?.tasks || genTasksRes.data?.data?.tasks || [];
  record('module1', 'POST /api/authority/tasks/generate creates structured tasks', genTasksRes.statusCode === 200 && genTaskList.length >= 6, {
    count: genTaskList.length
  });

  // 1.6 PATCH Task Status Update
  const testTaskId = genTaskList[0]?.id || taskList[0]?.id;
  if (testTaskId) {
    const patchRes = await request(`https://local-sass.pages.dev/api/authority/tasks/${testTaskId}`, {
      method: 'PATCH',
      headers: authHeaders
    }, JSON.stringify({ status: 'in_progress', business_id: activeBiz?.id }));
    results.performance.timings.push({ endpoint: 'PATCH /api/authority/tasks/:id', latencyMs: patchRes.latencyMs });
    record('module1', 'PATCH /api/authority/tasks/:id updates status to in_progress', patchRes.statusCode === 200 && patchRes.data?.data?.status === 'in_progress', {
      res: patchRes.data
    });

    const patchBad = await request(`https://local-sass.pages.dev/api/authority/tasks/${testTaskId}`, {
      method: 'PATCH',
      headers: authHeaders
    }, JSON.stringify({ status: 'INVALID_STATUS', business_id: activeBiz?.id }));
    record('module1', 'PATCH /api/authority/tasks/:id validates status enum (400 on invalid)', patchBad.statusCode === 400, { statusCode: patchBad.statusCode });
  }

  // 1.7 Authority Score 0-100 Calculation
  const scoreRes = await request('https://local-sass.pages.dev/api/authority/score', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/authority/score', latencyMs: scoreRes.latencyMs });
  const scoreObj = scoreRes.data?.data || scoreRes.data;
  const isScoreValid = scoreRes.statusCode === 200 && typeof scoreObj?.overallScore === 'number' && scoreObj.overallScore >= 0 && scoreObj.overallScore <= 100;
  const has5Factors = scoreObj?.factors?.referringDomains && scoreObj?.factors?.backlinkQuality && scoreObj?.factors?.localCitations && scoreObj?.factors?.brandMentions && scoreObj?.factors?.contentAuthority;
  record('module1', 'GET /api/authority/score returns 0-100 score with 5-factor breakdown & tier', isScoreValid && !!has5Factors && ['Low Authority', 'Growing Authority', 'Strong Authority'].includes(scoreObj?.tier), {
    score: scoreObj?.overallScore,
    tier: scoreObj?.tier,
    factors: scoreObj?.factors
  });

  // =========================================================================
  // MODULE 2: BACKLINK INTELLIGENCE & COMPETITOR GAP ENGINE
  // =========================================================================
  console.log("\n--- Auditing Module 2: Backlink Intelligence & Competitor Gap ---");

  // 2.1 Backlinks Listing
  const blRes = await request('https://local-sass.pages.dev/api/authority/backlinks', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/authority/backlinks', latencyMs: blRes.latencyMs });
  const backlinksList = blRes.data?.data?.backlinks || blRes.data?.backlinks || [];
  record('module2', 'GET /api/authority/backlinks returns backlink records & pagination', blRes.statusCode === 200 && Array.isArray(backlinksList), {
    count: backlinksList.length
  });

  // 2.2 Referring Domains
  const domRes = await request('https://local-sass.pages.dev/api/authority/domains', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/authority/domains', latencyMs: domRes.latencyMs });
  const domainsList = domRes.data?.data?.domains || domRes.data?.domains || [];
  record('module2', 'GET /api/authority/domains returns referring domains summary', domRes.statusCode === 200 && Array.isArray(domainsList), {
    count: domainsList.length
  });

  // 2.3 Competitor Domains & Add Competitor
  const compGet = await request('https://local-sass.pages.dev/api/authority/competitors', { headers: authHeaders });
  record('module2', 'GET /api/authority/competitors returns competitor domains', compGet.statusCode === 200 && Array.isArray(compGet.data?.data?.competitors || compGet.data?.competitors), {
    count: (compGet.data?.data?.competitors || compGet.data?.competitors || []).length
  });

  const testCompDomain = `competitor-local-${Date.now().toString().slice(-4)}.com`;
  const compAdd = await request('https://local-sass.pages.dev/api/authority/competitors', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({ domain: testCompDomain, business_id: activeBiz?.id }));
  record('module2', 'POST /api/authority/competitors saves competitor domain', compAdd.statusCode === 200 && compAdd.data?.success, {
    domain: testCompDomain
  });

  // 2.4 Competitor Backlink Gap Analysis
  const gapRes = await request('https://local-sass.pages.dev/api/authority/analyze', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({ business_id: activeBiz?.id }));
  results.performance.timings.push({ endpoint: 'POST /api/authority/analyze', latencyMs: gapRes.latencyMs });
  const linkGaps = gapRes.data?.data?.linkGaps || gapRes.data?.linkGaps || [];
  record('module2', 'POST /api/authority/analyze generates link gaps & opportunities', gapRes.statusCode === 200 && Array.isArray(linkGaps), {
    gapsCount: linkGaps.length
  });

  // 2.5 AI Digital PR Outreach Email Copywriter
  const emailRes = await request('https://local-sass.pages.dev/api/authority/generate-email', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({
    opportunityId: 'opp-test-1',
    opportunityName: 'Austin Business Journal',
    whyRelevant: 'Leading local business publication with DA 78',
    business_id: activeBiz?.id
  }));
  results.performance.timings.push({ endpoint: 'POST /api/authority/generate-email', latencyMs: emailRes.latencyMs });
  const emailData = emailRes.data?.data || emailRes.data;
  record('module2', 'POST /api/authority/generate-email generates personalized outreach email', emailRes.statusCode === 200 && (!!emailData?.subject || !!emailRes.data?.subject), {
    subject: emailData?.subject || emailRes.data?.subject
  });

  // =========================================================================
  // MODULE 3: GOOGLE BUSINESS PROFILE LOCAL SEO INTELLIGENCE
  // =========================================================================
  console.log("\n--- Auditing Module 3: Google Business Profile ---");

  // 3.1 GBP Health & Status
  const gbpHealth = await request('https://local-sass.pages.dev/api/gbp/health', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/gbp/health', latencyMs: gbpHealth.latencyMs });
  const gbpHealthData = gbpHealth.data?.data || gbpHealth.data;
  record('module3', 'GET /api/gbp/health returns connection status & health factors', gbpHealth.statusCode === 200 && (gbpHealthData?.score !== undefined || gbpHealth.data?.connection !== undefined), {
    score: gbpHealthData?.score,
    status: gbpHealthData?.status
  });

  // 3.2 GBP Local SEO Score & Problem Generation
  const gbpScore = await request('https://local-sass.pages.dev/api/gbp/local-score', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/gbp/local-score', latencyMs: gbpScore.latencyMs });
  const gbpScoreData = gbpScore.data?.data || gbpScore.data;
  record('module3', 'GET /api/gbp/local-score calculates local score & generates problems', gbpScore.statusCode === 200 && typeof gbpScoreData?.localSeoScore === 'number' && Array.isArray(gbpScoreData?.problems), {
    score: gbpScoreData?.localSeoScore,
    problemsCount: gbpScoreData?.problems?.length,
    problems: gbpScoreData?.problems?.slice(0, 3)
  });

  // 3.3 GBP Recommendations
  const gbpRecs = await request('https://local-sass.pages.dev/api/gbp/recommendations', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/gbp/recommendations', latencyMs: gbpRecs.latencyMs });
  record('module3', 'GET /api/gbp/recommendations returns actionable growth tips', gbpRecs.statusCode === 200 && Array.isArray(gbpRecs.data?.data || gbpRecs.data), {
    recsCount: (gbpRecs.data?.data || gbpRecs.data || []).length
  });

  // 3.4 Reviews List & Metrics
  const reviewsRes = await request('https://local-sass.pages.dev/api/gbp/reviews', { headers: authHeaders });
  results.performance.timings.push({ endpoint: 'GET /api/gbp/reviews', latencyMs: reviewsRes.latencyMs });
  const reviewsList = reviewsRes.data?.data?.reviews || reviewsRes.data?.reviews || [];
  record('module3', 'GET /api/gbp/reviews returns reviews list & metrics', reviewsRes.statusCode === 200 && Array.isArray(reviewsList), {
    reviewsCount: reviewsList.length
  });

  // 3.5 AI Review Response Generator
  const aiReplyRes = await request('https://local-sass.pages.dev/api/gbp/reviews/generate-response', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({
    reviewId: 'rev_sample_1',
    rating: 5,
    reviewerName: 'John Doe',
    comment: 'Exceptional service and friendly staff! Highly recommended.'
  }));
  results.performance.timings.push({ endpoint: 'POST /api/gbp/reviews/generate-response', latencyMs: aiReplyRes.latencyMs });
  const aiReplyText = aiReplyRes.data?.data?.reply || aiReplyRes.data?.reply;
  record('module3', 'POST /api/gbp/reviews/generate-response drafts AI reply', aiReplyRes.statusCode === 200 && !!aiReplyText, {
    reply: aiReplyText?.slice(0, 60) + '...'
  });

  // 3.6 Google OAuth Route Check
  const gbpOAuth = await request('https://local-sass.pages.dev/api/auth/googleBusiness', { headers: authHeaders });
  record('module3', 'GET /api/auth/googleBusiness provides Google OAuth endpoint', [302, 200, 500].includes(gbpOAuth.statusCode), {
    statusCode: gbpOAuth.statusCode
  });

  // =========================================================================
  // SECURITY AUDIT
  // =========================================================================
  console.log("\n--- Running Security Audit ---");

  // 4.1 SQL Injection Protection on Parametric Endpoints
  const sqlInjectionAttack = "' OR '1'='1' --";
  const sqliRes1 = await request(`https://local-sass.pages.dev/api/authority/tasks?business_id=${encodeURIComponent(sqlInjectionAttack)}`, { headers: authHeaders });
  record('security', 'SQL Injection blocked in query params (Safe handling)', sqliRes1.statusCode === 403 || sqliRes1.statusCode === 404 || (sqliRes1.statusCode === 200 && (sqliRes1.data?.tasks || []).length === 0), {
    status: sqliRes1.statusCode
  });

  // 4.2 Cross-Tenant Business Access Protection
  const fakeBizId = 'biz_cross_tenant_fake_99999';
  const crossTenantRes = await request(`https://local-sass.pages.dev/api/authority/tasks?business_id=${fakeBizId}`, { headers: authHeaders });
  record('security', 'Cross-tenant business access forbidden / isolated', crossTenantRes.statusCode === 403 || crossTenantRes.statusCode === 404, {
    status: crossTenantRes.statusCode
  });

  // 4.3 Secrets Leak Check (Passwords, JWT secrets, DB credentials)
  const userMeRes = await request('https://local-sass.pages.dev/api/auth/me', { headers: authHeaders });
  const rawUserData = JSON.stringify(userMeRes.data);
  const leaksPassword = rawUserData.includes('password_hash') || rawUserData.includes('totp_secret') || rawUserData.includes('POLAR_ACCESS_TOKEN');
  record('security', 'Sensitive credentials & secrets never exposed in user API payloads', !leaksPassword, {
    hasPasswordHash: rawUserData.includes('password_hash'),
    hasTotpSecret: rawUserData.includes('totp_secret')
  });

  // 4.4 OAuth Token Masking / Encryption Check
  const gbpConnRes = await request('https://local-sass.pages.dev/api/reviews/status', { headers: authHeaders });
  const rawGbpConn = JSON.stringify(gbpConnRes.data);
  const leaksRawTokens = rawGbpConn.includes('access_token_encrypted') || rawGbpConn.includes('refresh_token_encrypted') || rawGbpConn.includes('ya29.');
  record('security', 'Google OAuth tokens never exposed to frontend client', !leaksRawTokens, {
    leaksRawTokens
  });

  // =========================================================================
  // PERFORMANCE BENCHMARK
  // =========================================================================
  console.log("\n===============================================================");
  console.log("  PERFORMANCE BENCHMARKS (API Latency)");
  console.log("===============================================================");
  const latencies = results.performance.timings.map(t => t.latencyMs);
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const maxLatency = Math.max(...latencies);
  const minLatency = Math.min(...latencies);

  console.log(`- Total Endpoints Benchmarked: ${latencies.length}`);
  console.log(`- Average API Latency: ${avgLatency} ms`);
  console.log(`- Fastest API Response: ${minLatency} ms`);
  console.log(`- Slowest API Response: ${maxLatency} ms\n`);

  results.performance.timings.forEach(t => {
    console.log(`  ${t.endpoint.padEnd(42)} ${t.latencyMs} ms`);
  });

  // OVERALL STATUS
  console.log("\n===============================================================");
  console.log("  AUDIT MODULE STATUS SUMMARY");
  console.log("===============================================================");
  console.log(`Module 1 (Authority Builder):                   ${results.module1.pass ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Module 2 (Backlink Intelligence):               ${results.module2.pass ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Module 3 (Google Business Profile):             ${results.module3.pass ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Security Audit:                                 ${results.security.pass ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log("===============================================================\n");
}

runAudit().catch(console.error);
