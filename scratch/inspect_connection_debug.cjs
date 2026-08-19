const https = require('https');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
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
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function debug() {
  console.log("=== DEBUGGING ACTIVE CONNECTION & FIX EXECUTION ===");

  // 1. Login as admin
  const loginRes = await request('https://local-sass.pages.dev/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ email: 'saninabbas@gmail.com', password: 'Pakistan@2026' }));

  const cookieStr = loginRes.headers['set-cookie']?.join('; ') || '';
  const sessionIdMatch = cookieStr.match(/session_id=([^;]+)/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';

  const authHeaders = {
    'Cookie': cookieStr,
    'Authorization': `Bearer ${sessionId}`
  };

  // 2. Get User & Businesses
  const userRes = await request('https://local-sass.pages.dev/api/auth/me', { headers: authHeaders });
  console.log("User:", userRes.data?.data?.email, "ID:", userRes.data?.data?.id);

  const bizRes = await request('https://local-sass.pages.dev/api/businesses', { headers: authHeaders });
  console.log("Businesses raw:", JSON.stringify(bizRes.data, null, 2));

  // 3. Get Connections for user
  const connsRes = await request('https://local-sass.pages.dev/api/connections', { headers: authHeaders });
  console.log("Connections (Default):", JSON.stringify(connsRes.data, null, 2));

  const bizList = Array.isArray(bizRes.data) ? bizRes.data : (bizRes.data?.data || bizRes.data?.businesses || []);
  for (const b of bizList) {
    const bConn = await request(`https://local-sass.pages.dev/api/connections?business_id=${b.id}`, { headers: authHeaders });
    console.log(`Connections for business ${b.name} (${b.id}):`, JSON.stringify(bConn.data, null, 2));
  }


  // 4. Test SEO change generation for LocalBusiness schema
  const activeBiz = bizRes.data?.data?.[0];
  if (activeBiz) {
    console.log(`\nGenerating SEO fix for business ${activeBiz.name}...`);
    const genRes = await request('https://local-sass.pages.dev/api/seo/changes/generate', {
      method: 'POST',
      headers: authHeaders
    }, JSON.stringify({
      pageUrl: activeBiz.website_url,
      changeType: 'LOCALBUSINESS_SCHEMA',
      currentValue: 'No schema found',
      issueDescription: 'LocalBusiness Structured Data (JSON-LD)',
      business_id: activeBiz.id
    }));
    console.log("Generate status:", genRes.statusCode, "ID:", genRes.data?.id || genRes.data?.data?.id);

    const changeId = genRes.data?.id || genRes.data?.data?.id;
    if (changeId) {
      // 5. Test execute universal
      console.log(`\nTesting POST /api/seo/changes/${changeId}/execute-universal...`);
      const execRes = await request(`https://local-sass.pages.dev/api/seo/changes/${changeId}/execute-universal`, {
        method: 'POST',
        headers: authHeaders
      }, JSON.stringify({
        targetFilePath: 'index.html',
        business_id: activeBiz.id
      }));
      console.log("Execute status:", execRes.statusCode);
      console.log("Execute Response:", JSON.stringify(execRes.data, null, 2));
    }
  }
}

debug().catch(console.error);
