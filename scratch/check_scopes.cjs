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

async function checkTokenScopes() {
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Fetch connections to get token
  const connsRes = await request('GET', '/api/connections', null, authHeaders);
  console.log("Connections found:", JSON.stringify(connsRes.data, null, 2));

  // Let's test a direct repo query
  const testRepoRes = await request('GET', '/api/github/repositories?owner=saninabbas&repo=z7777', null, authHeaders);
  console.log("Direct repo query result for z7777:", JSON.stringify(testRepoRes.data, null, 2));
}

checkTokenScopes().catch(console.error);
