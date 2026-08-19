const https = require('https');

function request(url, options = {}, postData = null) {
  return new Promise((resolve) => {
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
        try { json = JSON.parse(data); } catch {}
        resolve({ statusCode: res.statusCode, headers: res.headers, data: json || data });
      });
    });

    req.on('error', err => resolve({ statusCode: 0, error: err.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

async function inspect() {
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

  const endpoints = [
    { name: 'GET /api/authority/score', url: 'https://local-sass.pages.dev/api/authority/score' },
    { name: 'GET /api/authority/tasks', url: 'https://local-sass.pages.dev/api/authority/tasks' },
    { name: 'GET /api/authority/backlinks', url: 'https://local-sass.pages.dev/api/authority/backlinks' },
    { name: 'GET /api/authority/domains', url: 'https://local-sass.pages.dev/api/authority/domains' },
    { name: 'GET /api/authority/competitors', url: 'https://local-sass.pages.dev/api/authority/competitors' },
    { name: 'GET /api/gbp/health', url: 'https://local-sass.pages.dev/api/gbp/health' },
    { name: 'GET /api/gbp/local-score', url: 'https://local-sass.pages.dev/api/gbp/local-score' },
    { name: 'GET /api/gbp/recommendations', url: 'https://local-sass.pages.dev/api/gbp/recommendations' },
    { name: 'GET /api/gbp/reviews', url: 'https://local-sass.pages.dev/api/gbp/reviews' },
  ];

  for (const ep of endpoints) {
    const res = await request(ep.url, { headers: authHeaders });
    console.log(`\n=== ${ep.name} (Status: ${res.statusCode}) ===`);
    console.log(JSON.stringify(res.data, null, 2));
  }
}

inspect().catch(console.error);
