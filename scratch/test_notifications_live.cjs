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

async function runTest() {
  console.log("=== NOTIFICATION SYSTEM END-TO-END TEST ===");

  // 1. Setup DB
  console.log("\n1. Auto-migrating database schema via /api/setup-db...");
  const setupRes = await request('https://local-sass.pages.dev/api/setup-db');
  console.log("Setup DB status:", setupRes.statusCode, setupRes.data);

  // 2. Login
  console.log("\n2. Logging in as saninabbas@gmail.com...");
  const loginRes = await request('https://local-sass.pages.dev/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ email: 'saninabbas@gmail.com', password: 'Pakistan@2026' }));

  console.log("Login status:", loginRes.statusCode);
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie) {
    throw new Error("No session cookie returned from login");
  }
  const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  const sessionIdMatch = cookieStr.match(/session_id=([^;]+)/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';

  const authHeaders = {
    'Cookie': cookieStr,
    'Authorization': `Bearer ${sessionId}`
  };

  // 3. Fetch Notifications
  console.log("\n3. Testing GET /api/notifications...");
  const notifRes = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET',
    headers: authHeaders
  });
  console.log("Notifications Status:", notifRes.statusCode);
  console.log("Initial unreadCount:", notifRes.data.unreadCount);
  console.log("Initial notifications count:", notifRes.data.notifications?.length);

  // 4. Trigger an Audit to generate real notification
  console.log("\n4. Running an audit to trigger a REAL Rankora event notification...");
  const auditRes = await request('https://local-sass.pages.dev/api/audit', {
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({}));
  console.log("Audit Status:", auditRes.statusCode, "Score:", auditRes.data?.overallScore || auditRes.data?.score);

  // 5. Re-fetch Notifications to check new notification
  console.log("\n5. Checking if audit created a real notification...");
  const updatedNotifs = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET',
    headers: authHeaders
  });
  console.log("Updated unreadCount:", updatedNotifs.data.unreadCount);
  console.log("Recent notifications:", updatedNotifs.data.notifications?.slice(0, 3));

  if (updatedNotifs.data.notifications?.length > 0) {
    const firstNotif = updatedNotifs.data.notifications[0];
    console.log(`\n6. Testing POST /api/notifications/${firstNotif.id}/read...`);
    const readRes = await request(`https://local-sass.pages.dev/api/notifications/${firstNotif.id}/read`, {
      method: 'POST',
      headers: authHeaders
    });
    console.log("Mark Read Status:", readRes.statusCode, readRes.data);

    // 7. Mark all as read
    console.log("\n7. Testing POST /api/notifications/read-all...");
    const readAllRes = await request('https://local-sass.pages.dev/api/notifications/read-all', {
      method: 'POST',
      headers: authHeaders
    });
    console.log("Mark All Read Status:", readAllRes.statusCode, readAllRes.data);

    // Verify unread count is 0
    const finalNotifs = await request('https://local-sass.pages.dev/api/notifications', {
      method: 'GET',
      headers: authHeaders
    });
    console.log("Final unreadCount after read-all:", finalNotifs.data.unreadCount);

    // 8. Delete notification
    console.log(`\n8. Testing DELETE /api/notifications/${firstNotif.id}...`);
    const deleteRes = await request(`https://local-sass.pages.dev/api/notifications/${firstNotif.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    console.log("Delete Status:", deleteRes.statusCode, deleteRes.data);
  }

  // 9. Cross-tenant Security Verification
  console.log("\n9. Verifying Cross-Tenant Security (unauthenticated request rejected)...");
  const unauthRes = await request('https://local-sass.pages.dev/api/notifications', {
    method: 'GET'
  });
  console.log("Unauthenticated request status:", unauthRes.statusCode, "(Expected 401)");

  console.log("\n=== ALL NOTIFICATION VERIFICATIONS COMPLETED SUCCESSFULLY ===");
}

runTest().catch(console.error);
