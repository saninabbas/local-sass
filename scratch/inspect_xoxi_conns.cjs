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

async function inspectXoxiConnections() {
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const xoxiRes = await request('GET', '/api/admin/users/usr_885886999d1240b3b335547deff38e80', null, authHeaders);
  const data = xoxiRes.data?.data;
  console.log("Xoxi Businesses:", JSON.stringify(data?.businesses, null, 2));
  console.log("Xoxi Connections:", JSON.stringify(data?.connections, null, 2));
  console.log("Xoxi SEO Changes:", JSON.stringify(data?.seoChanges, null, 2));
}

inspectXoxiConnections().catch(console.error);
