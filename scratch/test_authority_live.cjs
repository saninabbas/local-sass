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

async function testLiveAuthority() {
  console.log("=== VERIFYING RANKORA AUTHORITY BUILDER ON PRODUCTION ===");

  // 1. Trigger setup-db to ensure tables
  console.log("\n1. Calling GET /api/setup-db...");
  const setupRes = await request('https://local-sass.pages.dev/api/setup-db');
  console.log("Setup DB Status:", setupRes.statusCode, JSON.stringify(setupRes.data));

  // 2. Login
  console.log("\n2. Logging in...");
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

  // 3. Test GET /api/authority/score
  console.log("\n3. Testing GET /api/authority/score...");
  const scoreRes = await request('https://local-sass.pages.dev/api/authority/score', { headers: authHeaders });
  console.log("Score Status:", scoreRes.statusCode);
  console.log("Score Data:", JSON.stringify(scoreRes.data, null, 2));

  // 4. Test GET /api/authority/tasks
  console.log("\n4. Testing GET /api/authority/tasks...");
  const tasksRes = await request('https://local-sass.pages.dev/api/authority/tasks', { headers: authHeaders });
  console.log("Tasks Status:", tasksRes.statusCode);
  console.log(`Tasks Count: ${tasksRes.data?.tasks?.length || 0}, Progress:`, JSON.stringify(tasksRes.data?.progress));

  // 5. Test POST /api/authority/tasks/generate
  console.log("\n5. Testing POST /api/authority/tasks/generate...");
  const genTasksRes = await request('https://local-sass.pages.dev/api/authority/tasks/generate', {
    method: 'POST',
    headers: authHeaders
  });
  console.log("Generate Tasks Status:", genTasksRes.statusCode);
  console.log(`Generated: ${genTasksRes.data?.tasks?.length || 0} tasks`);

  // 6. Test PATCH /api/authority/tasks/:id
  const firstTask = genTasksRes.data?.tasks?.[0] || tasksRes.data?.tasks?.[0];
  if (firstTask) {
    console.log(`\n6. Testing PATCH /api/authority/tasks/${firstTask.id} (Marking in_progress)...`);
    const patchRes = await request(`https://local-sass.pages.dev/api/authority/tasks/${firstTask.id}`, {
      method: 'PATCH',
      headers: authHeaders
    }, JSON.stringify({ status: 'in_progress' }));
    console.log("Patch Status:", patchRes.statusCode, JSON.stringify(patchRes.data));

    console.log(`\n7. Testing PATCH /api/authority/tasks/${firstTask.id} (Marking completed)...`);
    const patchDone = await request(`https://local-sass.pages.dev/api/authority/tasks/${firstTask.id}`, {
      method: 'PATCH',
      headers: authHeaders
    }, JSON.stringify({ status: 'completed' }));
    console.log("Patch Done Status:", patchDone.statusCode, JSON.stringify(patchDone.data));
  }

  // 7. Verify updated score
  console.log("\n8. Re-checking Authority Score after task completion...");
  const scoreAfter = await request('https://local-sass.pages.dev/api/authority/score', { headers: authHeaders });
  console.log("Updated Score Data:", JSON.stringify(scoreAfter.data, null, 2));
}

testLiveAuthority().catch(console.error);
