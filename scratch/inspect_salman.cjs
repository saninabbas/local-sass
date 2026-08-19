const https = require('https');

const BASE_URL = 'https://local-sass.pages.dev';

// Admin to query D1 database via API or we can check
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

async function inspectSalmanAccount() {
  const loginRes = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Get admin user detail or check connections
  const usersRes = await request('GET', '/api/admin/users', null, authHeaders);
  const users = usersRes.data?.data?.users || usersRes.data?.users || [];
  const salmanUser = users.find(u => u.email === 'salmanali1202008@gmail.com');
  console.log("Salman User:", JSON.stringify(salmanUser, null, 2));

  if (salmanUser) {
    const userDetail = await request('GET', `/api/admin/users/${salmanUser.id}`, null, authHeaders);
    console.log("Salman User Detail & Connections:", JSON.stringify(userDetail.data, null, 2));
  }
}

inspectSalmanAccount().catch(console.error);
