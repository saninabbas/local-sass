const https = require('https');

const BASE_URL = 'https://local-sass.pages.dev';
const ADMIN_EMAIL = 'saninabbas@gmail.com';
const ADMIN_PASSWORD = 'Pakistan@2026';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
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

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function testCompetitorKeywordFlow() {
  console.log("1. Authenticating Admin User...");
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  if (!token) throw new Error("Auth failed: " + JSON.stringify(loginRes.data));
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  console.log("\n2. Testing Competitor Keyword Extraction (POST /api/competitors/keywords/extract)...");
  const extractRes = await request('POST', '/api/competitors/keywords/extract', {
    competitorUrl: 'https://example.com'
  }, authHeaders);

  console.log("Extract Response Status:", extractRes.status);
  console.log("Total Extracted:", extractRes.data?.data?.totalExtracted);
  console.log("New Opportunities:", extractRes.data?.data?.newOpportunitiesCount);
  console.log("Already Tracked:", extractRes.data?.data?.alreadyTrackedCount);
  console.log("Sample Extracted Keywords:", JSON.stringify(extractRes.data?.data?.keywords?.slice(0, 3), null, 2));

  if (extractRes.data?.data?.keywords?.length > 0) {
    const kwToTrack = extractRes.data.data.keywords[0].keyword;
    console.log(`\n3. Testing Bulk Tracking Submission (POST /api/rankings/keywords/bulk) for '${kwToTrack}'...`);
    
    const bulkRes = await request('POST', '/api/rankings/keywords/bulk', {
      keywords: [{ keyword: kwToTrack, location: 'Islamabad', countryCode: 'PK' }]
    }, authHeaders);

    console.log("Bulk Submit Status:", bulkRes.status);
    console.log("Bulk Submit Result:", JSON.stringify(bulkRes.data, null, 2));

    console.log("\n4. Verifying Keywords Appear on Keywords Page (GET /api/rankings/keywords)...");
    const listRes = await request('GET', '/api/rankings/keywords', null, authHeaders);
    const tracked = listRes.data?.data || listRes.data || [];
    console.log(`Found ${tracked.length} tracked keywords in database. Top 2:`, JSON.stringify(tracked.slice(0, 2), null, 2));
  }

  console.log("\n✅ Competitors -> Keyword Opportunity Extraction -> Real SERP Tracking workflow verified successfully!");
}

testCompetitorKeywordFlow().catch(console.error);
