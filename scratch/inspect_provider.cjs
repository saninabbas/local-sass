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

async function inspectProvider() {
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const healthRes = await request('POST', '/api/authority/health', {}, authHeaders);
  console.log("Health check result:", JSON.stringify(healthRes.data, null, 2));

  // Let's also check overview
  const bizRes = await request('GET', '/api/businesses', null, authHeaders);
  const businesses = bizRes.data?.data?.businesses || [];
  const biz = businesses[0];

  const overviewRes = await request('GET', `/api/authority/overview?business_id=${biz?.id}`, null, authHeaders);
  console.log("Overview result:", JSON.stringify(overviewRes.data, null, 2));

  const backlinksRes = await request('GET', `/api/authority/backlinks?business_id=${biz?.id}`, null, authHeaders);
  console.log("Backlinks result:", JSON.stringify(backlinksRes.data, null, 2));

  const oppsRes = await request('GET', `/api/authority/opportunities?business_id=${biz?.id}`, null, authHeaders);
  console.log("Opportunities result:", JSON.stringify(oppsRes.data, null, 2));
}

inspectProvider().catch(console.error);
