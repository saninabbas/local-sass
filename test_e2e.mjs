

const BASE_URL = 'http://127.0.0.1:8787';

async function runTests() {
  let failed = false;
  
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    console.log("=== STARTING END-TO-END TESTS ===\n");

    // 1. Verify Health
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    const health = await resHealth.json();
    assert(health.success === true, "GET /api/health works");

    // 2. Create User
    const email = `test_${Date.now()}@example.com`;
    const resSignup = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
    });
    const signupData = await resSignup.json();
    assert(signupData.success === true, "User signed up successfully");
    
    const cookie = resSignup.headers.get('set-cookie');
    assert(!!cookie, "Session cookie received");

    // 3. Create Business
    const resBiz = await fetch(`${BASE_URL}/api/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({
        name: 'Cloudflare Inc',
        type: 'Tech',
        city: 'San Francisco',
        country: 'USA',
        websiteUrl: 'https://example.com'
      })
    });
    const bizData = await resBiz.json();
    assert(bizData.success === true, "Business created with real URL");

    // 4. Start Audit
    console.log("Running audit (this may take a few seconds)...");
    const resAudit = await fetch(`${BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    const auditData = await resAudit.json();
    assert(auditData.success === true, "Audit endpoint succeeded");

    // 5. Verify Dashboard Data (Scores, Recommendations, Status)
    const resDash = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Cookie': cookie }
    });
    const dashData = await resDash.json();
    assert(dashData.success === true, "Dashboard fetched successfully");
    
    const { growthScore, recommendations } = dashData.data;
    assert(growthScore !== null, "Growth score was generated and saved to D1");
    assert(typeof growthScore.seo === 'number', `Deterministic SEO score calculated: ${growthScore.seo}`);
    assert(typeof growthScore.website === 'number', `Deterministic Website score calculated: ${growthScore.website}`);
    assert(recommendations.length > 0, "AI Recommendations generated and saved to D1");
    assert(recommendations[0].priority !== undefined, "Recommendations have structured JSON format");

    // 6. Test Unauthenticated Request
    const resUnauth = await fetch(`${BASE_URL}/api/audit`, { method: 'POST' });
    assert(resUnauth.status === 401, "Unauthenticated audit request blocked");

    // 7. Test Invalid Website URL
    // Create new user for invalid website
    const email2 = `test_invalid_${Date.now()}@example.com`;
    const resSignup2 = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test 2', email: email2, password: 'password123' })
    });
    const cookie2 = resSignup2.headers.get('set-cookie');

    await fetch(`${BASE_URL}/api/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie2 },
      body: JSON.stringify({
        name: 'Bad URL', type: 'Tech', city: 'NY', country: 'USA',
        websiteUrl: 'https://this-website-does-not-exist-123456789.com'
      })
    });

    const resAuditInvalid = await fetch(`${BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Cookie': cookie2 }
    });
    const auditInvalidData = await resAuditInvalid.json();
    assert(resAuditInvalid.status === 500, "Invalid website returns 500 cleanly");
    assert(auditInvalidData.error.includes("fetch failed"), "Error message handled gracefully without stack trace");

    console.log("\n=== E2E TESTS FINISHED ===");
    if (failed) process.exit(1);
    
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
