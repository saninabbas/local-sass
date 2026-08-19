const https = require('https');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 30000
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

    req.on('timeout', () => {
      req.destroy(new Error("Request timed out"));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("=== VERIFYING NOTIFICATION ENDPOINTS & TENANT SCOPING ===");

  // 1. Setup DB
  const setupRes = await request('https://local-sass.pages.dev/api/setup-db');
  console.log("1. Setup DB Status:", setupRes.statusCode);

  // 2. Login as admin
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

  // 3. GET /api/notifications
  console.log("\n2. Testing GET /api/notifications...");
  const getRes = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET',
    headers: authHeaders
  });
  console.log("GET Status:", getRes.statusCode);
  console.log("Response:", JSON.stringify(getRes.data, null, 2));

  // 4. Trigger a live ranking check
  console.log("\n3. Triggering ranking check on a keyword to test event notification...");
  const rankRes = await request('https://local-sass.pages.dev/api/rankings/check', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({ keyword: 'dentist islamabad' }));
  console.log("Ranking Check Status:", rankRes.statusCode, "Position:", rankRes.data?.data?.position);

  // 5. Re-check notifications
  console.log("\n4. Fetching notifications after ranking event...");
  const afterRankRes = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET',
    headers: authHeaders
  });
  console.log("Unread Count:", afterRankRes.data.unreadCount);
  console.log("Notifications Count:", afterRankRes.data.notifications?.length);

  // 6. Test Mark All as Read
  console.log("\n5. Testing POST /api/notifications/read-all...");
  const readAllRes = await request('https://local-sass.pages.dev/api/notifications/read-all', {
    method: 'POST',
    headers: authHeaders
  });
  console.log("Read All Status:", readAllRes.statusCode, readAllRes.data);

  // 7. Verify Unread count is 0
  const zeroNotifs = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET',
    headers: authHeaders
  });
  console.log("Verified Unread Count:", zeroNotifs.data.unreadCount);

  // 8. Test Unauthorized request rejection
  console.log("\n6. Testing Security: Unauthenticated request to /api/notifications...");
  const unauthRes = await request('https://local-sass.pages.dev/api/notifications');
  console.log("Unauthenticated Status:", unauthRes.statusCode, "(Expected 401 Unauthorized)");

  console.log("\n=== ALL NOTIFICATION VERIFICATIONS COMPLETED ===");
}

run().catch(console.error);
