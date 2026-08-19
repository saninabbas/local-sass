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

async function testGh() {
  console.log("=== TESTING GITHUB HEALTH CHECK VIA API ===");

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

  // Test connection health check
  console.log("\nCalling GET /api/connections/health?provider=github...");
  const healthRes = await request('https://local-sass.pages.dev/api/connections/health?provider=github', {
    headers: authHeaders
  });
  console.log("Health Status:", healthRes.statusCode, JSON.stringify(healthRes.data, null, 2));

  // Test repositories list
  console.log("\nCalling GET /api/connections/github/branches...");
  const branchesRes = await request('https://local-sass.pages.dev/api/connections/github/branches', {
    headers: authHeaders
  });
  console.log("Branches Status:", branchesRes.statusCode, JSON.stringify(branchesRes.data, null, 2));
}

testGh().catch(console.error);
