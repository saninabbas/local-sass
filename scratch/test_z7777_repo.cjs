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

async function testZ7777Repo() {
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Get repository branches and tree for saninabbas/z7777
  const branchesRes = await request('GET', '/api/github/branches?owner=saninabbas&repo=z7777', null, authHeaders);
  console.log("Branches response for saninabbas/z7777:", JSON.stringify(branchesRes.data, null, 2));

  const treeRes = await request('GET', '/api/github/tree?owner=saninabbas&repo=z7777&branch=main', null, authHeaders);
  console.log("Tree response for saninabbas/z7777:", JSON.stringify(treeRes.data, null, 2));
}

testZ7777Repo().catch(console.error);
