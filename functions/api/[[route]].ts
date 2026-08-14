import { sendVerificationEmail } from '../../src/lib/email';
import { verifyTOTP } from '../../src/lib/totp';

export interface Env {
  DB: D1Database;
  NVIDIA_API_KEY: string;
  POLAR_ACCESS_TOKEN?: string;
  POLAR_WEBHOOK_SECRET?: string;
  SENDGRID_API_KEY?: string;
  BASE_URL?: string;
}

// -----------------------------------------------------------------------------
// CRYPTO HELPERS
// -----------------------------------------------------------------------------
const buf2hex = (buffer: ArrayBuffer) => 
  [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');

const hex2buf = (hex: string) => 
  new Uint8Array((hex.match(/[\da-f]{2}/gi) || []).map(h => parseInt(h, 16))).buffer;

async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBuf = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const newSaltHex = saltHex || buf2hex(saltBuf);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuf, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  
  return `${newSaltHex}:${buf2hex(hashBuffer)}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;
  
  const attemptHash = await hashPassword(password, saltHex);
  return attemptHash === storedHash;
}

// -----------------------------------------------------------------------------
// SESSION HELPERS
// -----------------------------------------------------------------------------
const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

// -----------------------------------------------------------------------------
// MAIN WORKER
// -----------------------------------------------------------------------------
export const onRequest = async (context: any) => {
    const { request, env } = context;
    const url = new URL(request.url);

    const jsonResponse = (data: any, status = 200, headers: HeadersInit = {}) => 
      new Response(JSON.stringify(data), { 
        status, 
        headers: { 'Content-Type': 'application/json', ...headers } 
      });
      
    const errorResponse = (error: string, status = 500) =>
      jsonResponse({ success: false, error }, status);

    // Helper to ensure admin user exists and schema is up to date
    const ensureAdminUser = async () => {
      try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run().catch(() => {});
        const adminEmail = "saninabbas@gmail.com";
        const adminPasswordHash = await hashPassword("Pakistan@2026");
        const existing = await env.DB.prepare("SELECT id, role FROM users WHERE email = ?").bind(adminEmail).first();
        if (!existing) {
          const adminId = "usr_admin_sanin";
          await env.DB.prepare(
            "INSERT INTO users (id, name, email, password_hash, email_verified, role, subscription_status) VALUES (?, ?, ?, ?, 1, 'admin', 'enterprise')"
          ).bind(adminId, "Sanin Abbas", adminEmail, adminPasswordHash).run();
        } else {
          await env.DB.prepare(
            "UPDATE users SET role = 'admin', email_verified = 1, password_hash = ? WHERE email = ?"
          ).bind(adminPasswordHash, adminEmail).run();
        }
      } catch (e) {
        console.error("ensureAdminUser error:", e);
      }
    };

    // Helper to get authenticated user
    const authenticate = async () => {
      const cookies = parseCookies(request.headers.get('Cookie'));
      let sessionId = cookies['session_id'];
      
      if (!sessionId) {
        const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          sessionId = authHeader.substring(7).trim();
        }
      }
      
      if (!sessionId) return null;

      const session = await env.DB.prepare(
        "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
      ).bind(sessionId).first();

      if (!session) return null;

      let user: any = await env.DB.prepare(
        "SELECT id, name, email, subscription_status, role FROM users WHERE id = ?"
      ).bind(session.user_id).first().catch(async () => {
        return await env.DB.prepare(
          "SELECT id, name, email, subscription_status FROM users WHERE id = ?"
        ).bind(session.user_id).first();
      });

      if (user && !user.role && user.email === 'saninabbas@gmail.com') {
        user.role = 'admin';
      }

      return user;
    };

    const executeAudit = async (business: any) => {
      if (!business.website_url) throw new Error("Business has no website URL");

      const auditId = generateId('aud');
      
      // Start audit
      await env.DB.prepare(
        "INSERT INTO audits (id, business_id, status) VALUES (?, ?, 'running')"
      ).bind(auditId, business.id).run();

      try {
        const { fetchWithTimeout, Extractor, computeScores, askNVIDIA, getFallbackRecommendations } = await import('./auditEngine');
        
        const websiteUrl = business.website_url;
        let websiteResponse: Response;
        try {
          websiteResponse = await fetchWithTimeout(websiteUrl, 10000);
        } catch {
          throw new Error("Website fetch failed or timed out.");
        }

        if (!websiteResponse.ok || !websiteResponse.headers.get('content-type')?.includes('text/html')) {
          throw new Error("Invalid or non-HTML website response.");
        }

        const extractor = new Extractor();
        extractor.httpStatus = websiteResponse.status;
        extractor.isHttps = websiteUrl.startsWith('https');
        extractor.securityHeaders = {
          'strict-transport-security': websiteResponse.headers.get('strict-transport-security') || '',
          'x-content-type-options': websiteResponse.headers.get('x-content-type-options') || '',
          'x-frame-options': websiteResponse.headers.get('x-frame-options') || ''
        };

        const rewriter = new HTMLRewriter()
          .on('html', extractor.handlers.html)
          .on('title', extractor.handlers.title)
          .on('meta', extractor.handlers.meta)
          .on('link', extractor.handlers.link)
          .on('h1', extractor.handlers.h1)
          .on('h2', extractor.handlers.h2)
          .on('h3', extractor.handlers.h3)
          .on('h1, h2, h3, h4, h5, h6', extractor.handlers.heading)
          .on('script', extractor.handlers.script)
          .on('a', extractor.handlers.a)
          .on('img', extractor.handlers.img)
          .on('body', extractor.handlers.body);

        await rewriter.transform(websiteResponse).text(); // consumes the stream

        const scores = computeScores(extractor, websiteUrl, business);

        let aiResult;
        try {
          if (!env.NVIDIA_API_KEY) throw new Error("Missing NVIDIA_API_KEY");
          aiResult = await askNVIDIA(env.NVIDIA_API_KEY, business, extractor, scores);
        } catch (aiErr: any) {
          console.error("AI Error:", aiErr);
          aiResult = getFallbackRecommendations();
        }

        // Save Results
        const scoreId = generateId('score');
        
        // Fetch previous score
        const previousScoreRow = await env.DB.prepare(
          "SELECT overall_score FROM growth_scores WHERE business_id = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(business.id).first();
        
        const previousScore = previousScoreRow ? previousScoreRow.overall_score : null;
        const scoreChange = previousScore ? scores.overall - (previousScore as number) : 0;

        await env.DB.prepare(
          `INSERT INTO growth_scores 
           (id, audit_id, business_id, overall_score, seo_score, reviews_score, website_score, visibility_score, previous_score, score_change, technical_score, onpage_score, local_score, content_score, performance_score, mobile_score, security_score) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          scoreId, auditId, business.id, scores.overall, scores.seo, -1, scores.website, scores.visibility, previousScore, scoreChange,
          scores.technical, scores.onpage, scores.local, scores.content, scores.performance, scores.mobile, scores.security
        ).run();

        // Save Recommendations
        const insertRec = env.DB.prepare(
          "INSERT INTO recommendations (id, audit_id, business_id, priority, priority_color, title, description, impact, estimated_minutes, difficulty, seo_impact, local_visibility_impact, conversion_impact, business_outcome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        const batch = aiResult.recommendations.map((rec: any) => {
          const colorMap: Record<string, string> = { high: 'red', medium: 'yellow', low: 'gray' };
          return insertRec.bind(
            generateId('rec'),
            auditId,
            business.id,
            rec.priority || 'medium',
            colorMap[rec.priority?.toLowerCase()] || 'blue',
            rec.title,
            rec.description,
            rec.impact || 'medium',
            rec.estimatedMinutes || 15,
            rec.difficulty || 'Medium',
            rec.seo_impact || 'Medium',
            rec.local_visibility_impact || 'Medium',
            rec.conversion_impact || 'Medium',
            rec.business_outcome || ''
          );
        });
        
        if (batch.length > 0) {
          await env.DB.batch(batch);
        }

        // Complete Audit
        await env.DB.prepare(
          "UPDATE audits SET status = 'completed', score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(scores.overall, auditId).run();

        return { auditId, score: scores.overall };

      } catch (auditError: any) {
        console.error("Audit failed:", auditError);
        await env.DB.prepare(
          "UPDATE audits SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(auditId).run();
        throw auditError;
      }
    };

    try {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      // --- HEALTH ---
      if (url.pathname === '/api/health') {
        await env.DB.prepare("SELECT 1").first();
        return jsonResponse({ success: true, worker: "ok", database: "ok" });
      }

      // --- SETUP DB (Auto-migration endpoint) ---
      if (url.pathname === '/api/setup-db') {
        try {
          await env.DB.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN polar_customer_id TEXT").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN verification_token TEXT").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN totp_secret TEXT").run().catch(() => {});
          
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))").run().catch(() => {});
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT, email TEXT NOT NULL, website TEXT, captured_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))").run().catch(() => {});
          
          await ensureAdminUser();

          return jsonResponse({ success: true, message: "Database schema updated and admin seeded successfully!" });
        } catch (e: any) {
          return jsonResponse({ success: false, error: e.message });
        }
      }

      // --- AUTH: SIGNUP ---
      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        const { name, email, password } = await request.json() as any;
        
        if (!name || !email || !password || password.length < 8) {
          return errorResponse("Invalid input. Password must be at least 8 characters.", 400);
        }

        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) return errorResponse("Email already in use", 400);

        const hashedPassword = await hashPassword(password);
        const userId = generateId('usr');
        const verificationToken = crypto.randomUUID();

        await env.DB.prepare(
          "INSERT INTO users (id, name, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)"
        ).bind(userId, name, email, hashedPassword, verificationToken).run();

        const verificationLink = `/verify?token=${verificationToken}`;
        await sendVerificationEmail(email, verificationToken, env);
        return jsonResponse({ 
          success: true, 
          message: "User created. Please verify email.",
          verificationLink: verificationLink
        });
      }

      // --- AUTH: VERIFY EMAIL ---
      if (url.pathname === '/api/auth/verify') {
        let token = url.searchParams.get('token');
        if (!token && request.method === 'POST') {
          const body = await request.json().catch(() => ({})) as any;
          token = body.token;
        }
        if (!token) return errorResponse("Verification token missing", 400);

        const user = await env.DB.prepare("SELECT id FROM users WHERE verification_token = ?").bind(token).first();
        if (!user) return errorResponse("Invalid or expired token", 400);
        await env.DB.prepare("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?").bind(user.id).run();
        return jsonResponse({ success: true, message: "Email verified successfully!" });
      }

      // --- AUTH: LOGIN ---
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const { email, password } = await request.json() as any;

        if (email === 'saninabbas@gmail.com') {
          await ensureAdminUser();
        }

        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (!user) return errorResponse("Invalid credentials", 401);
        if (!user.email_verified) return errorResponse("Please verify your email first", 403);

        const isValid = await verifyPassword(password, user.password_hash as string);
        if (!isValid) return errorResponse("Invalid credentials", 401);

        if (user.totp_secret) {
          const tmpSess = generateId('sess_tmp');
          await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+5 minutes'))"
          ).bind(tmpSess, user.id).run();

          const cookie = `session_id=${tmpSess}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${5 * 60}`;
          return jsonResponse({ success: true, require2FA: true, tempToken: tmpSess }, 200, { 'Set-Cookie': cookie });
        }

        const sessionId = generateId('sess');
        await env.DB.prepare(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
        ).bind(sessionId, user.id).run();

        const cookie = `session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
        return jsonResponse({ 
          success: true, 
          data: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role || (user.email === 'saninabbas@gmail.com' ? 'admin' : 'user'),
            subscription_status: user.subscription_status || 'free' 
          } 
        }, 200, { 'Set-Cookie': cookie });
      }

      // --- AUTH: 2FA VERIFY ---
      if (url.pathname === '/api/auth/2fa' && request.method === 'POST') {
        const { token, code } = await request.json() as any;
        const tmp = await env.DB.prepare(
          "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
        ).bind(token).first();
        if (!tmp) return errorResponse("Session expired or invalid", 401);

        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(tmp.user_id).first();
        if (!user?.totp_secret) return errorResponse("2FA not set up", 400);

        if (!await verifyTOTP(code, user.totp_secret as string)) {
          return errorResponse("Invalid 2FA code", 401);
        }

        await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
        const newSess = generateId('sess');
        await env.DB.prepare(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
        ).bind(newSess, user.id).run();

        const cookie = `session_id=${newSess}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
        return jsonResponse({ success: true, data: { id: user.id, name: user.name, email: user.email, subscription_status: user.subscription_status || 'free' } }, 200, { 'Set-Cookie': cookie });
      }

      // --- AUTH: LOGOUT ---
      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        const cookies = parseCookies(request.headers.get('Cookie'));
        if (cookies['session_id']) {
          await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(cookies['session_id']).run();
        }
        const cookie = `session_id=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
        return jsonResponse({ success: true }, 200, { 'Set-Cookie': cookie });
      }

      // --- AUDIT HISTORY ---
      if (url.pathname === '/api/audits' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("No business found", 404);

        const { results: audits } = await env.DB.prepare(`
          SELECT 
            a.id, 
            a.created_at, 
            a.status,
            g.overall_score,
            g.seo_score,
            g.website_score,
            g.visibility_score
          FROM audits a
          LEFT JOIN growth_scores g ON g.audit_id = a.id
          WHERE a.business_id = ?
          ORDER BY a.created_at DESC
        `).bind(business.id as string).all();

        return jsonResponse({ success: true, data: audits });
      }

      // --- LATEST AUDIT ---
      if (url.pathname === '/api/audit/latest' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("No business found", 404);

        const audit = await env.DB.prepare(
          "SELECT * FROM audits WHERE business_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 1"
        ).bind(business.id as string).first();

        if (!audit) return jsonResponse({ success: true, data: null });

        const scores = await env.DB.prepare(
          "SELECT * FROM growth_scores WHERE audit_id = ?"
        ).bind(audit.id as string).first();

        const { results: recommendations } = await env.DB.prepare(
          "SELECT * FROM recommendations WHERE audit_id = ? ORDER BY created_at DESC"
        ).bind(audit.id as string).all();

        return jsonResponse({
          success: true,
          data: {
            audit,
            scores,
            recommendations
          }
        });
      }

      // --- PUBLIC AUDIT ---
      if (url.pathname.startsWith('/api/public/audit/') && request.method === 'GET') {
        const auditId = url.pathname.split('/').pop();
        if (!auditId) return errorResponse("Audit ID required", 400);

        const audit = await env.DB.prepare(
          "SELECT * FROM audits WHERE id = ? AND status = 'completed'"
        ).bind(auditId).first();

        if (!audit) return errorResponse("Audit not found", 404);

        const business = await env.DB.prepare(
          "SELECT name, website_url, city, country, type FROM businesses WHERE id = ?"
        ).bind(audit.business_id as string).first();

        const scores = await env.DB.prepare(
          "SELECT * FROM growth_scores WHERE audit_id = ?"
        ).bind(auditId).first();

        const { results: recommendations } = await env.DB.prepare(
          "SELECT * FROM recommendations WHERE audit_id = ? ORDER BY created_at DESC"
        ).bind(auditId).all();

        return jsonResponse({
          success: true,
          data: {
            audit,
            business,
            scores,
            recommendations
          }
        });
      }

      // --- AUTH: ME ---
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);
        return jsonResponse({ success: true, data: user });
      }

      // --- AUTH: UPDATE PROFILE ---
      if (url.pathname === '/api/auth/profile' && request.method === 'PUT') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { name } = await request.json() as any;
        if (!name || !name.trim()) return errorResponse("Name is required", 400);

        await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name.trim(), user.id).run();
        return jsonResponse({ success: true, message: "Profile updated successfully" });
      }

      // --- BUSINESS: GET CURRENT ---
      if (url.pathname === '/api/business' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT id, name, type, city, country, website_url FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        return jsonResponse({ success: true, data: business || null });
      }

      // --- BUSINESS: CREATE ---
      if (url.pathname === '/api/business' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { name, type, city, country, websiteUrl } = await request.json() as any;
        const bizId = generateId('biz');

        await env.DB.prepare(
          "INSERT INTO businesses (id, user_id, name, type, city, country, website_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(bizId, user.id, name, type, city, country, websiteUrl).run();

        return jsonResponse({ success: true, data: { id: bizId } });
      }

      // --- BUSINESS: UPDATE ---
      if (url.pathname === '/api/business' && request.method === 'PUT') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { name, type, city, country, websiteUrl } = await request.json() as any;
        if (!name || !name.trim()) return errorResponse("Business name is required", 400);

        const existing = await env.DB.prepare(
          "SELECT id FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (existing) {
          await env.DB.prepare(
            "UPDATE businesses SET name = ?, type = ?, city = ?, country = ?, website_url = ? WHERE user_id = ?"
          ).bind(name.trim(), type || '', city || '', country || '', websiteUrl || '', user.id).run();
        } else {
          const bizId = generateId('biz');
          await env.DB.prepare(
            "INSERT INTO businesses (id, user_id, name, type, city, country, website_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(bizId, user.id, name.trim(), type || '', city || '', country || '', websiteUrl || '').run();
        }

        return jsonResponse({ success: true, message: "Business details updated successfully" });
      }

      // --- AUDIT ---
      if (url.pathname === '/api/audit' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("No business found", 404);
        if (!business.website_url) return errorResponse("Business has no website URL", 400);

        // Check if an audit is already running
        const runningAudit = await env.DB.prepare(
          "SELECT id FROM audits WHERE business_id = ? AND status = 'running'"
        ).bind(business.id as string).first();
        
        if (runningAudit) {
          return errorResponse("An audit is already running for this business", 429);
        }

        try {
          await executeAudit(business);
          return jsonResponse({ success: true, data: { status: 'completed' } });
        } catch (auditError: any) {
          return errorResponse("Audit failed to complete: " + (auditError.message || "Unknown error"), 500);
        }
      }

      // --- CRON: WEEKLY AUDITS ---
      if (url.pathname === '/api/cron/weekly-audits') {
        const secret = url.searchParams.get('secret');
        if (!secret || secret !== env.CRON_SECRET) {
          return errorResponse("Unauthorized", 401);
        }

        // Get paid businesses (growth/pro)
        const { results: businesses } = await env.DB.prepare(
          "SELECT * FROM businesses WHERE subscription_tier IN ('growth', 'pro')"
        ).all();

        const results = [];
        for (const business of businesses as any[]) {
          // Check if there is already an audit in the last 7 days
          const lastAudit = await env.DB.prepare(
            "SELECT completed_at FROM audits WHERE business_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1"
          ).bind(business.id).first();

          let shouldAudit = true;
          if (lastAudit && lastAudit.completed_at) {
            const lastAuditTime = new Date(lastAudit.completed_at as string).getTime();
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (lastAuditTime > oneWeekAgo) {
              shouldAudit = false;
            }
          }

          if (shouldAudit) {
            try {
              const res = await executeAudit(business);
              results.push({ businessId: business.id, name: business.name, status: 'success', score: res.score });
            } catch (err: any) {
              results.push({ businessId: business.id, name: business.name, status: 'failed', error: err.message });
            }
          } else {
            results.push({ businessId: business.id, name: business.name, status: 'skipped', reason: 'Audited in last 7 days' });
          }
        }

        return jsonResponse({ success: true, results });
      }

      // --- WEBSITE LIVE ANALYSIS ---
      if (url.pathname === '/api/website/analyze' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("No business found", 404);
        if (!business.website_url) return errorResponse("Business has no website URL", 400);

        try {
          const { fetchWithTimeout, Extractor } = await import('./auditEngine');
          
          const websiteUrl = business.website_url as string;
          let websiteResponse: Response;
          try {
            websiteResponse = await fetchWithTimeout(websiteUrl, 10000);
          } catch {
            throw new Error("Website fetch failed or timed out.");
          }

          if (!websiteResponse.ok || !websiteResponse.headers.get('content-type')?.includes('text/html')) {
            throw new Error("Invalid or non-HTML website response.");
          }

          const extractor = new Extractor();
          const rewriter = new HTMLRewriter()
            .on('html', extractor.handlers.html)
            .on('title', extractor.handlers.title)
            .on('meta', extractor.handlers.meta)
            .on('link', extractor.handlers.link)
            .on('h1', extractor.handlers.h1)
            .on('h2', extractor.handlers.h2)
            .on('h3', extractor.handlers.h3)
            .on('h1, h2, h3, h4, h5, h6', extractor.handlers.heading)
            .on('script', extractor.handlers.script)
            .on('a', extractor.handlers.a)
            .on('img', extractor.handlers.img)
            .on('body', extractor.handlers.body);

          await rewriter.transform(websiteResponse).text();

          const data = {
            url: websiteUrl,
            https: websiteUrl.startsWith('https://'),
            title: extractor.title.trim(),
            metaDescription: extractor.metaDescription.trim(),
            h1: extractor.h1.trim(),
            headingsCount: extractor.headingsCount,
            scriptCount: extractor.scriptCount,
            linkCount: extractor.linkCount,
          };

          return jsonResponse({ success: true, data });
        } catch (error: any) {
          return errorResponse("Failed to analyze website: " + error.message, 500);
        }
      }

      // --- AI BLOG GENERATOR ---
      if (url.pathname === '/api/content/generate' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        let payload;
        try { payload = await request.json(); } catch { return errorResponse("Invalid JSON", 400); }
        const topic = payload.topic || "The importance of our services in the local community";

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("Business not found", 404);

        if (!env.NVIDIA_API_KEY) {
          return errorResponse("AI is not configured on the server.", 500);
        }

        try {
          const { generateBlogWithNVIDIA } = await import('./auditEngine');
          const businessName = (business.name as string) || "Our Local Business";
          const city = (business.city as string) || "our city";

          const blogData = await generateBlogWithNVIDIA(env.NVIDIA_API_KEY, businessName, city, topic);
          
          return jsonResponse({ success: true, data: blogData });
        } catch (error: any) {
          return errorResponse("Failed to generate blog content: " + error.message, 500);
        }
      }

      // --- COMPETITOR ANALYSIS ---
      if (url.pathname === '/api/competitors/analyze' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        let payload;
        try { payload = await request.json(); } catch { return errorResponse("Invalid JSON", 400); }
        if (!payload.competitorUrl) return errorResponse("Competitor URL required", 400);

        const business = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business || !business.website_url) return errorResponse("You must have a website to compare against", 400);

        try {
          const { fetchWithTimeout, Extractor, computeScores, compareWithNVIDIA } = await import('./auditEngine');
          
          // Fetch both concurrently
          const [myRes, compRes] = await Promise.allSettled([
            fetchWithTimeout(business.website_url as string, 8000),
            fetchWithTimeout(payload.competitorUrl, 8000)
          ]);

          if (myRes.status === 'rejected' || compRes.status === 'rejected') {
            throw new Error("Failed to fetch one or both websites.");
          }

          const myExtractor = new Extractor();
          myExtractor.httpStatus = myRes.value.status;
          myExtractor.isHttps = (business.website_url as string).startsWith('https');
          
          const compExtractor = new Extractor();
          compExtractor.httpStatus = compRes.value.status;
          compExtractor.isHttps = payload.competitorUrl.startsWith('https');

          const myRewriter = new HTMLRewriter()
            .on('html', myExtractor.handlers.html)
            .on('title', myExtractor.handlers.title)
            .on('meta', myExtractor.handlers.meta)
            .on('link', myExtractor.handlers.link)
            .on('h1', myExtractor.handlers.h1)
            .on('h2', myExtractor.handlers.h2)
            .on('h3', myExtractor.handlers.h3)
            .on('h1, h2, h3, h4, h5, h6', myExtractor.handlers.heading)
            .on('script', myExtractor.handlers.script)
            .on('a', myExtractor.handlers.a)
            .on('img', myExtractor.handlers.img)
            .on('body', myExtractor.handlers.body);

          const compRewriter = new HTMLRewriter()
            .on('html', compExtractor.handlers.html)
            .on('title', compExtractor.handlers.title)
            .on('meta', compExtractor.handlers.meta)
            .on('link', compExtractor.handlers.link)
            .on('h1', compExtractor.handlers.h1)
            .on('h2', compExtractor.handlers.h2)
            .on('h3', compExtractor.handlers.h3)
            .on('h1, h2, h3, h4, h5, h6', compExtractor.handlers.heading)
            .on('script', compExtractor.handlers.script)
            .on('a', compExtractor.handlers.a)
            .on('img', compExtractor.handlers.img)
            .on('body', compExtractor.handlers.body);

          await Promise.all([
            myRewriter.transform(myRes.value).text(),
            compRewriter.transform(compRes.value).text()
          ]);

          const myScores = computeScores(myExtractor, business.website_url as string, business);
          const compScores = computeScores(compExtractor, payload.competitorUrl, business);

          // Get AI strategy
          let aiStrategy = null;
          if (env.NVIDIA_API_KEY) {
            try {
              aiStrategy = await compareWithNVIDIA(env.NVIDIA_API_KEY, myExtractor, myScores, compExtractor, compScores);
            } catch (e) {
              console.error("NVIDIA AI failed for competitor analysis", e);
            }
          }

          const responseData = {
            me: {
              url: business.website_url,
              https: (business.website_url as string).startsWith('https://'),
              title: myExtractor.title.trim(),
              h1: myExtractor.h1.trim(),
              score: myScores.overall
            },
            competitor: {
              url: payload.competitorUrl,
              https: payload.competitorUrl.startsWith('https://'),
              title: compExtractor.title.trim(),
              h1: compExtractor.h1.trim(),
              score: compScores.overall
            },
            strategy: aiStrategy || { summary: "AI currently unavailable.", action_plan: [] }
          };

          return jsonResponse({ success: true, data: responseData });
        } catch (error: any) {
          return errorResponse("Failed to analyze competitor: " + error.message, 500);
        }
      }



      // --- DASHBOARD ---
      if (url.pathname === '/api/dashboard' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const businessInfo = await env.DB.prepare(
          "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        // New User State: No business yet
        if (!businessInfo) {
          return jsonResponse({
            success: true,
            data: { user, business: null, growthScore: null, recommendations: [] }
          });
        }

        const growthScore = await env.DB.prepare(
          "SELECT * FROM growth_scores WHERE business_id = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(businessInfo.id as string).first();

        // New User State: Business exists, but no audit/score yet
        if (!growthScore) {
          return jsonResponse({
            success: true,
            data: {
              user,
              business: {
                id: businessInfo.id,
                name: businessInfo.name,
                type: businessInfo.type,
                city: businessInfo.city,
                country: businessInfo.country,
                websiteUrl: businessInfo.website_url
              },
              growthScore: null,
              recommendations: []
            }
          });
        }

        const { results: recommendations } = await env.DB.prepare(
          "SELECT * FROM recommendations WHERE business_id = ? AND status = 'pending' ORDER BY created_at DESC"
        ).bind(businessInfo.id as string).all();

        return jsonResponse({
          success: true,
          data: {
            user,
            business: {
              id: businessInfo.id,
              name: businessInfo.name,
              type: businessInfo.type,
              city: businessInfo.city,
              country: businessInfo.country,
              websiteUrl: businessInfo.website_url
            },
            growthScore: {
              overall: growthScore.overall_score,
              seo: growthScore.seo_score,
              reviews: growthScore.reviews_score === -1 ? null : growthScore.reviews_score,
              website: growthScore.website_score,
              visibility: growthScore.visibility_score,
              technical: growthScore.technical_score,
              onpage: growthScore.onpage_score,
              local: growthScore.local_score,
              content: growthScore.content_score,
              performance: growthScore.performance_score,
              mobile: growthScore.mobile_score,
              security: growthScore.security_score,
              previousScore: growthScore.previous_score,
              change: growthScore.score_change,
              progressHistory: [72, 73, 74, 76, 78], // Still mocked for history chart UI
              lastAudited: new Date((growthScore.created_at as string) + 'Z').toLocaleString()
            },
            recommendations: recommendations.map((r: any) => ({
              id: r.id,
              title: r.title,
              priority: r.priority,
              priorityColor: r.priority_color,
              description: r.description,
              impact: r.impact,
              estimatedTime: r.estimated_minutes,
              status: r.status,
              actionLink: r.action_link,
              difficulty: r.difficulty,
              seoImpact: r.seo_impact,
              localImpact: r.local_visibility_impact,
              conversionImpact: r.conversion_impact,
              businessOutcome: r.business_outcome
            }))
          }
        });
      }
      
      // --- RECOMMENDATIONS: GET ALL ---
      if (url.pathname === '/api/recommendations' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare(
          "SELECT id FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return jsonResponse({ success: true, data: [] });

        const { results: recommendations } = await env.DB.prepare(
          "SELECT * FROM recommendations WHERE business_id = ? ORDER BY created_at DESC"
        ).bind(business.id as string).all();

        return jsonResponse({
          success: true,
          data: recommendations.map((r: any) => ({
            id: r.id,
            title: r.title,
            priority: r.priority,
            priorityColor: r.priority_color,
            description: r.description,
            impact: r.impact,
            estimatedTime: r.estimated_minutes,
            status: r.status,
            actionLink: r.action_link,
            difficulty: r.difficulty,
            seoImpact: r.seo_impact,
            localImpact: r.local_visibility_impact,
            conversionImpact: r.conversion_impact,
            businessOutcome: r.business_outcome
          }))
        });
      }

      // --- RECOMMENDATIONS: UPDATE STATUS ---
      if (url.pathname.startsWith('/api/recommendations/') && request.method === 'PATCH') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const id = url.pathname.split('/').pop();
        if (!id) return errorResponse("Invalid ID", 400);

        const { status } = await request.json() as any;
        if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
          return errorResponse("Invalid status", 400);
        }

        // Ensure the recommendation belongs to the user's business
        const business = await env.DB.prepare(
          "SELECT id FROM businesses WHERE user_id = ? LIMIT 1"
        ).bind(user.id as string).first();

        if (!business) return errorResponse("Unauthorized", 401);

        const result = await env.DB.prepare(
          "UPDATE recommendations SET status = ? WHERE id = ? AND business_id = ?"
        ).bind(status, id, business.id as string).run();

        if (result.meta.changes === 0) {
          return errorResponse("Recommendation not found or unauthorized", 404);
        }

        return jsonResponse({ success: true, data: { id, status } });
      }

      // --- BILLING: CHECKOUT ---
      if (url.pathname === '/api/billing/checkout' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { productId } = await request.json() as any;
        if (!productId) return errorResponse("Product ID is required", 400);

        if (!env.POLAR_ACCESS_TOKEN) {
          // Fallback if no token is provided: redirect to a static Polar checkout link if possible
          // But since we need dynamic sessions for user metadata, we fail if no token.
          return errorResponse("Billing is not configured on the server.", 500);
        }

        try {
          const polarRes = await fetch('https://api.polar.sh/v1/checkouts/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              product_id: productId,
              customer_email: user.email,
              customer_name: user.name,
              metadata: {
                user_id: user.id
              },
              success_url: `${url.origin}/dashboard/settings?checkout=success`,
            })
          });

          if (!polarRes.ok) {
            const errorText = await polarRes.text();
            console.error("Polar API error:", errorText);
            return errorResponse(`Failed to generate checkout session: ${errorText}`, 500);
          }

          const checkoutData = await polarRes.json() as any;
          return jsonResponse({ success: true, data: { url: checkoutData.url } });
        } catch (e: any) {
          console.error("Polar fetch error:", e);
          return errorResponse("Failed to communicate with billing provider", 500);
        }
      }

      // --- BILLING: POLAR WEBHOOK ---
      if (url.pathname === '/api/webhooks/polar' && request.method === 'POST') {
        const payload = await request.json() as any;

        // Polar sends a `type` for the event
        if (payload.type === 'order.created' || payload.type === 'subscription.created') {
          const { metadata, customer_id, product_id } = payload.data;
          
          if (metadata && metadata.user_id) {
            let plan = 'pro';
            // Growth Package Product ID
            if (product_id === '7594755d-5580-4b77-86ae-90baae0e20d8') {
              plan = 'growth';
            }

            try {
              // Update user's subscription in businesses table
              await env.DB.prepare(
                "UPDATE businesses SET subscription_tier = ?, polar_customer_id = ? WHERE user_id = ?"
              ).bind(plan, customer_id, metadata.user_id).run();
            } catch (e) {
              console.error("Failed to update business billing status:", e);
            }
          }
        }

        return jsonResponse({ success: true, received: true });
      }

      // --- WIDGET CAPTURE (PUBLIC) ---
      // Expected payload: { businessId: string, name: string, email: string, websiteUrl?: string }
      if (url.pathname === '/api/widget/capture' && request.method === 'POST') {
        // Handle CORS preflight in actual Cloudflare settings or append headers, but for basic implementation:
        try {
          const payload = await request.json() as any;
          if (!payload.businessId || !payload.email || !payload.name) {
            return errorResponse("Missing required fields", 400);
          }
          
          // Verify business exists
          const business = await env.DB.prepare("SELECT id FROM businesses WHERE id = ?").bind(payload.businessId).first();
          if (!business) return errorResponse("Business not found", 404);

          const leadId = crypto.randomUUID();
          await env.DB.prepare(
            "INSERT INTO leads (id, business_id, name, email, website_url) VALUES (?, ?, ?, ?, ?)"
          ).bind(leadId, payload.businessId, payload.name, payload.email, payload.websiteUrl || '').run();

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      // Handle OPTIONS request for widget capture (CORS)
      if (url.pathname === '/api/widget/capture' && request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      // --- GET LEADS (PROTECTED) ---
      if (url.pathname === '/api/leads' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return jsonResponse({ success: true, data: [] });

        const { results } = await env.DB.prepare(
          "SELECT id, name, email, website_url, created_at FROM leads WHERE business_id = ? ORDER BY created_at DESC"
        ).bind(business.id).all();

        return jsonResponse({ success: true, data: results });
      }

      // --- INTEGRATIONS (Google Search Console) ---
      if (url.pathname === '/api/integrations/google/auth' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const clientId = env.GOOGLE_CLIENT_ID;
        if (!clientId) return errorResponse("Google OAuth not configured", 500);

        const redirectUri = `${url.origin}/api/integrations/google/callback`;
        const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
        // Pass userId in state to associate the callback with the user
        const state = encodeURIComponent(JSON.stringify({ userId: user.id }));
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

        return Response.redirect(authUrl, 302);
      }

      if (url.pathname === '/api/integrations/google/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const stateStr = url.searchParams.get('state');
        if (!code || !stateStr) return errorResponse("Missing parameters", 400);

        try {
          const state = JSON.parse(decodeURIComponent(stateStr));
          const userId = state.userId;
          if (!userId) throw new Error("Invalid state");

          const redirectUri = `${url.origin}/api/integrations/google/callback`;
          
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: env.GOOGLE_CLIENT_ID,
              client_secret: env.GOOGLE_CLIENT_SECRET,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code'
            }).toString()
          });

          if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error("Token exchange failed:", err);
            return errorResponse("Failed to authenticate with Google", 500);
          }

          const tokens = await tokenRes.json() as any;
          
          // Upsert integration
          const id = crypto.randomUUID();
          await env.DB.prepare(`
            INSERT INTO integrations (id, user_id, provider, access_token, refresh_token, status)
            VALUES (?, ?, 'google_search_console', ?, ?, 'active')
            ON CONFLICT(user_id, provider) DO UPDATE SET
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, integrations.refresh_token),
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
          `).bind(id, userId, tokens.access_token, tokens.refresh_token || null).run();

          return Response.redirect(`${url.origin}/dashboard/settings?integration=success`, 302);
        } catch (e: any) {
          console.error("Callback error", e);
          return Response.redirect(`${url.origin}/dashboard/settings?integration=error`, 302);
        }
      }

      if (url.pathname === '/api/integrations/status' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const integrations = await env.DB.prepare("SELECT provider, status, property_id FROM integrations WHERE user_id = ?").bind(user.id).all();
        return jsonResponse({ success: true, data: integrations.results });
      }

      // --- AUTHORITY BUILDER ---
      if (url.pathname === '/api/authority/opportunities' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        // Normally we'd use an external API like DataForSEO or similar, here we mock high-quality legitimate opps
        let opps = await env.DB.prepare("SELECT * FROM authority_opportunities WHERE user_id = ? ORDER BY created_at DESC").bind(user.id).all();
        
        if (!opps.results || opps.results.length === 0) {
          // Seed some legitimate local opportunities based on business data
          const business = await env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(user.id).first();
          const city = business?.city || 'your city';
          const type = business?.type || 'local business';

          const seeds = [
            { id: crypto.randomUUID(), type: 'directory', name: `${city} Chamber of Commerce`, url: `https://chamberofcommerce.com/${city}`, difficulty: 'Medium', value: 'High', why_relevant: `Local businesses in ${city} gain significant trust signals from the Chamber.` },
            { id: crypto.randomUUID(), type: 'sponsorship', name: 'Local Little League', url: '', difficulty: 'Easy', value: 'Medium', why_relevant: 'Sponsoring local community teams often results in high-authority local community links.' },
            { id: crypto.randomUUID(), type: 'guest_post', name: `${type} Industry Blog`, url: '', difficulty: 'Hard', value: 'High', why_relevant: 'Demonstrating expertise in your field builds topical authority.' }
          ];

          for (const s of seeds) {
            await env.DB.prepare(
              "INSERT INTO authority_opportunities (id, user_id, name, url, type, difficulty, value, why_relevant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(s.id, user.id, s.name, s.url, s.type, s.difficulty, s.value, s.why_relevant).run();
          }
          opps = await env.DB.prepare("SELECT * FROM authority_opportunities WHERE user_id = ? ORDER BY created_at DESC").bind(user.id).all();
        }

        return jsonResponse({ success: true, data: opps.results });
      }

      if (url.pathname === '/api/authority/backlinks' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const links = await env.DB.prepare("SELECT * FROM backlinks WHERE user_id = ? ORDER BY discovered_at DESC").bind(user.id).all();
        return jsonResponse({ success: true, data: links.results });
      }

      if (url.pathname === '/api/authority/backlinks' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { source_url, target_url, anchor_text, status, notes } = await request.json() as any;
        const id = crypto.randomUUID();
        
        await env.DB.prepare(
          "INSERT INTO backlinks (id, user_id, source_url, target_url, anchor_text, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, user.id, source_url, target_url, anchor_text, status || 'Active', notes || '').run();

        return jsonResponse({ success: true, data: { id } });
      }

      // --- REVIEWS: CONNECTION STATUS ---
      if (url.pathname === '/api/reviews/status' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const connection = await env.DB.prepare(
          "SELECT * FROM review_connections WHERE user_id = ? AND provider = 'google_business' LIMIT 1"
        ).bind(user.id as string).first();

        return jsonResponse({ success: true, data: { connected: !!connection && connection.status === 'connected', connection: connection || null } });
      }

      // --- REVIEWS: LIST ---
      if (url.pathname === '/api/reviews' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const { results: reviews } = await env.DB.prepare(
          "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC"
        ).bind(user.id as string).all();

        // Calculate stats
        const totalReviews = reviews.length;
        let avgRating = 0;
        let respondedCount = 0;
        if (totalReviews > 0) {
          avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews;
          respondedCount = reviews.filter((r: any) => r.owner_reply && r.owner_reply.length > 0).length;
        }
        const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

        return jsonResponse({
          success: true,
          data: {
            reviews,
            stats: {
              avgRating: Math.round(avgRating * 10) / 10,
              totalReviews,
              responseRate
            }
          }
        });
      }

      // --- REVIEWS: AI REPLY ---
      if (url.pathname === '/api/reviews/reply' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const payload = await request.json() as any;
        if (!payload.reviewId || !payload.reviewText || !payload.rating) {
          return errorResponse("Missing required fields: reviewId, reviewText, rating", 400);
        }

        // Verify review belongs to user
        const review = await env.DB.prepare(
          "SELECT * FROM reviews WHERE id = ? AND user_id = ?"
        ).bind(payload.reviewId, user.id as string).first();

        if (!review) return errorResponse("Review not found", 404);

        if (!env.NVIDIA_API_KEY) {
          return errorResponse("AI is not configured on the server.", 500);
        }

        try {
          const business = await env.DB.prepare(
            "SELECT name FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id as string).first();

          const { generateReviewReplyWithNVIDIA } = await import('./auditEngine');
          const reply = await generateReviewReplyWithNVIDIA(
            env.NVIDIA_API_KEY,
            (business?.name as string) || 'Our Business',
            payload.reviewerName || 'Customer',
            payload.rating,
            payload.reviewText
          );

          // Save the reply to the database
          await env.DB.prepare(
            "UPDATE reviews SET owner_reply = ?, reply_status = 'draft' WHERE id = ? AND user_id = ?"
          ).bind(reply, payload.reviewId, user.id as string).run();

          return jsonResponse({ success: true, data: { reply } });
        } catch (error: any) {
          return errorResponse("Failed to generate AI reply: " + error.message, 500);
        }
      }

      // --- REVIEWS: SAVE REPLY ---
      if (url.pathname === '/api/reviews/save-reply' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const payload = await request.json() as any;
        if (!payload.reviewId || !payload.reply) {
          return errorResponse("Missing required fields: reviewId, reply", 400);
        }

        const result = await env.DB.prepare(
          "UPDATE reviews SET owner_reply = ?, reply_status = 'saved' WHERE id = ? AND user_id = ?"
        ).bind(payload.reply, payload.reviewId, user.id as string).run();

        if (result.meta.changes === 0) {
          return errorResponse("Review not found or unauthorized", 404);
        }

        return jsonResponse({ success: true, message: "Reply saved successfully" });
      }

      // --- KEYWORDS & RANKINGS ---
      if (url.pathname === '/api/keywords' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return jsonResponse({ success: true, data: [] });

        const { results } = await env.DB.prepare("SELECT * FROM keywords WHERE business_id = ? ORDER BY created_at DESC").bind(business.id).all();
        return jsonResponse({ success: true, data: results });
      }

      if (url.pathname === '/api/keywords' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return errorResponse("Business not found", 404);

        const payload = await request.json() as any;
        if (!payload.keyword) return errorResponse("Keyword is required", 400);

        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO keywords (id, business_id, keyword, location, intent) VALUES (?, ?, ?, ?, ?)"
        ).bind(id, business.id, payload.keyword, payload.location || '', payload.intent || '').run();

        // Trigger real SERP fetch immediately on creation
        let position = null;
        if (env.SERP_API_KEY && business.website_url) {
          const { fetchSERPData } = await import('./rankingEngine');
          // Extract just the domain for searching
          const domainMatch = (business.website_url as string).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          const result = await fetchSERPData(payload.keyword, payload.location || business.city || '', domainMatch, env.SERP_API_KEY);
          position = result.position;

          if (position !== null) {
            await env.DB.prepare(
              "INSERT INTO keyword_rankings (id, keyword_id, business_id, position, checked_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
            ).bind(crypto.randomUUID(), id, business.id, position).run();
          }
        }

        return jsonResponse({ success: true, data: { id, position } });
      }

      if (url.pathname.startsWith('/api/keywords/') && request.method === 'DELETE') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const id = url.pathname.split('/').pop();
        if (!id) return errorResponse("Invalid ID", 400);

        const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return errorResponse("Business not found", 404);

        await env.DB.prepare("DELETE FROM keywords WHERE id = ? AND business_id = ?").bind(id, business.id).run();
        return jsonResponse({ success: true });
      }

      if (url.pathname === '/api/keywords/refresh' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business || !business.website_url) return errorResponse("Business or website not found", 404);

        if (!env.SERP_API_KEY) {
          return errorResponse("SERP API is not configured", 503);
        }

        const { results: keywords } = await env.DB.prepare(
          "SELECT * FROM keywords WHERE business_id = ?"
        ).bind(business.id as string).all();

        const { fetchSERPData } = await import('./rankingEngine');
        const domainMatch = (business.website_url as string).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        
        const refreshed = [];
        for (const kw of keywords) {
          try {
            const result = await fetchSERPData(kw.keyword as string, (kw.location || business.city) as string, domainMatch, env.SERP_API_KEY);
            if (result.position !== null) {
              await env.DB.prepare(
                "INSERT INTO keyword_rankings (id, keyword_id, business_id, position, checked_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
              ).bind(crypto.randomUUID(), kw.id, business.id, result.position).run();
              refreshed.push({ id: kw.id, position: result.position });
            }
          } catch (e) {
            console.error(`Error refreshing keyword ${kw.keyword}:`, e);
          }
        }

        return jsonResponse({ success: true, refreshed: refreshed.length });
      }

      if (url.pathname === '/api/rankings/visibility' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return jsonResponse({ success: true, data: { score: 0, history: [] } });

        const { getRankingHistory, calculateLocalVisibilityScore } = await import('./rankingEngine');
        const history = await getRankingHistory(env.DB, business.id as string);
        const score = calculateLocalVisibilityScore(history);

        return jsonResponse({ success: true, data: { score, history } });
      }

      // --- GOOGLE BUSINESS PROFILE ---
      if (url.pathname === '/api/auth/googleBusiness' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        if (!env.GOOGLE_CLIENT_ID) return errorResponse("Google Client ID not configured", 500);

        const { getGoogleOAuthUrl } = await import('./googleBusiness');
        const redirectUri = `${url.origin}/api/auth/googleBusiness/callback`;
        const state = encodeURIComponent(JSON.stringify({ userId: user.id }));
        const authUrl = getGoogleOAuthUrl(env.GOOGLE_CLIENT_ID, redirectUri, state);

        return Response.redirect(authUrl, 302);
      }

      if (url.pathname === '/api/auth/googleBusiness/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const stateStr = url.searchParams.get('state');
        if (!code || !stateStr) return errorResponse("Missing parameters", 400);

        try {
          const state = JSON.parse(decodeURIComponent(stateStr));
          const userId = state.userId;
          if (!userId) throw new Error("Invalid state");

          const redirectUri = `${url.origin}/api/auth/googleBusiness/callback`;
          const { exchangeGoogleCodeForTokens } = await import('./googleBusiness');
          
          const tokens = await exchangeGoogleCodeForTokens(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, code, redirectUri);
          
          const id = crypto.randomUUID();
          await env.DB.prepare(`
            INSERT INTO integrations (id, user_id, provider, access_token, refresh_token, status)
            VALUES (?, ?, 'google_business', ?, ?, 'active')
            ON CONFLICT(user_id, provider) DO UPDATE SET
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, integrations.refresh_token),
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
          `).bind(id, userId, tokens.access_token, tokens.refresh_token || null).run();

          return Response.redirect(`${url.origin}/dashboard/reviews?integration=success`, 302);
        } catch (e: any) {
          console.error("Callback error", e);
          return Response.redirect(`${url.origin}/dashboard/reviews?integration=error`, 302);
        }
      }

      if (url.pathname === '/api/reviews/sync' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const connection = await env.DB.prepare(
          "SELECT access_token FROM integrations WHERE user_id = ? AND provider = 'google_business' AND status = 'active'"
        ).bind(user.id as string).first();

        if (!connection || !connection.access_token) {
          return errorResponse("Google Business Profile not connected", 400);
        }

        try {
          const { syncGoogleReviews, fetchGoogleLocations } = await import('./googleBusiness');
          
          // 1. Fetch authorized locations
          const locations = await fetchGoogleLocations(connection.access_token as string);
          if (!locations || locations.length === 0) {
            return errorResponse("No Google Business locations found for this account", 404);
          }
          
          // 2. Default to the first location for MVP
          const locationName = locations[0].name;
          
          // 3. Sync reviews
          const result = await syncGoogleReviews(env.DB, user.id as string, locationName, connection.access_token as string);
          
          // 4. Upsert review connection status
          await env.DB.prepare(`
            INSERT INTO review_connections (id, user_id, provider, location_id, location_name, status, connected_at)
            VALUES (?, ?, 'google_business', ?, ?, 'connected', CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, provider) DO UPDATE SET 
              status = 'connected',
              location_id = excluded.location_id,
              location_name = excluded.location_name,
              connected_at = CURRENT_TIMESTAMP
          `).bind(crypto.randomUUID(), user.id, locationName, locations[0].title || locationName).run();

          return jsonResponse({ success: true, message: "Synced successfully", data: result });
        } catch (e: any) {
          console.error("Sync failed:", e);
          return errorResponse("Sync failed: " + e.message, 500);
        }
      }

      // --- AUTHORITY AI GENERATION ---
      if (url.pathname === '/api/authority/generate-opportunities' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const business = await env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(user.id as string).first();
        if (!business) return errorResponse("Business not found", 404);

        if (!env.NVIDIA_API_KEY) return errorResponse("AI is not configured", 500);

        try {
          const { generateOpportunities } = await import('./authorityEngine');
          const opps = await generateOpportunities(
            env.NVIDIA_API_KEY as string,
            business.id as string,
            business.name as string,
            business.city as string,
            env.SERP_API_KEY as string | undefined
          );
          
          // Save them to DB
          for (const opp of opps) {
             const id = crypto.randomUUID();
             const status = opp.verification_level === 'VERIFIED' ? 'Verified' : 'Prospect';
             await env.DB.prepare(
               "INSERT INTO authority_opportunities (id, user_id, name, url, type, difficulty, value, why_relevant, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
             ).bind(id, user.id, opp.name, opp.url || '', opp.type, opp.difficulty, opp.value, opp.why_relevant, status).run();
          }

          return jsonResponse({ success: true, data: opps });
        } catch (e: any) {
          return errorResponse("Failed to generate opportunities: " + e.message, 500);
        }
      }

      if (url.pathname === '/api/authority/generate-email' && request.method === 'POST') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);

        const payload = await request.json() as any;
        if (!payload.opportunityId || !payload.opportunityName || !payload.whyRelevant) {
          return errorResponse("Missing required fields", 400);
        }

        if (!env.NVIDIA_API_KEY) return errorResponse("AI is not configured", 500);

        try {
          const { generateOutreachEmail } = await import('./authorityEngine');
          const email = await generateOutreachEmail(env.NVIDIA_API_KEY, payload.opportunityId, payload.opportunityName, payload.whyRelevant);
          
          return jsonResponse({ success: true, data: email });
        } catch (e: any) {
          return errorResponse("Failed to generate email: " + e.message, 500);
        }
      }

      // --- ADMIN: STATS ---
      if (url.pathname === '/api/admin/stats' && request.method === 'GET') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const totalUsersRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users").first<{ c: number }>();
        const verifiedUsersRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE email_verified = 1").first<{ c: number }>();
        const unverifiedUsersRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE email_verified = 0 OR email_verified IS NULL").first<{ c: number }>();
        const totalBusinessesRow = await env.DB.prepare("SELECT COUNT(*) as c FROM businesses").first<{ c: number }>();
        const totalAuditsRow = await env.DB.prepare("SELECT COUNT(*) as c FROM audits").first<{ c: number }>();
        
        let totalLeads = 0;
        try {
          const leadsRow = await env.DB.prepare("SELECT COUNT(*) as c FROM leads").first<{ c: number }>();
          totalLeads = leadsRow?.c || 0;
        } catch {
          totalLeads = 0;
        }

        let recent7d = 0;
        let recent30d = 0;
        try {
          const r7 = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now', '-7 days')").first<{ c: number }>();
          const r30 = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now', '-30 days')").first<{ c: number }>();
          recent7d = r7?.c || 0;
          recent30d = r30?.c || 0;
        } catch {
          recent7d = 0;
          recent30d = 0;
        }

        const freeRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'free' OR subscription_status IS NULL OR subscription_status = ''").first<{ c: number }>();
        const growthRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'growth' OR subscription_status = 'starter'").first<{ c: number }>();
        const proRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'pro'").first<{ c: number }>();
        const enterpriseRow = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE subscription_status = 'enterprise'").first<{ c: number }>();

        return jsonResponse({
          success: true,
          data: {
            totalUsers: totalUsersRow?.c || 0,
            verifiedUsers: verifiedUsersRow?.c || 0,
            unverifiedUsers: unverifiedUsersRow?.c || 0,
            totalBusinesses: totalBusinessesRow?.c || 0,
            totalAudits: totalAuditsRow?.c || 0,
            totalLeads: totalLeads,
            recentSignups7d: recent7d,
            recentSignups30d: recent30d,
            planBreakdown: {
              free: freeRow?.c || 0,
              growth: growthRow?.c || 0,
              pro: proRow?.c || 0,
              enterprise: enterpriseRow?.c || 0
            }
          }
        });
      }

      // --- ADMIN: USERS LIST ---
      if (url.pathname === '/api/admin/users' && request.method === 'GET') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const queryParam = url.searchParams.get('q')?.toLowerCase() || '';
        const planParam = url.searchParams.get('plan') || '';
        const roleParam = url.searchParams.get('role') || '';

        const usersResult = await env.DB.prepare(`
          SELECT 
            u.id,
            u.name,
            u.email,
            COALESCE(u.role, 'user') as role,
            COALESCE(u.subscription_status, 'free') as subscription_status,
            COALESCE(u.email_verified, 0) as email_verified,
            u.created_at,
            (SELECT COUNT(*) FROM businesses b WHERE b.user_id = u.id) as businessCount,
            (SELECT COUNT(*) FROM audits a JOIN businesses b ON a.business_id = b.id WHERE b.user_id = u.id) as auditCount,
            (SELECT name FROM businesses b WHERE b.user_id = u.id LIMIT 1) as businessName,
            (SELECT website_url FROM businesses b WHERE b.user_id = u.id LIMIT 1) as businessUrl
          FROM users u
          ORDER BY u.created_at DESC
        `).all();

        let list = (usersResult.results || []) as any[];

        if (queryParam) {
          list = list.filter(u => 
            (u.name && u.name.toLowerCase().includes(queryParam)) ||
            (u.email && u.email.toLowerCase().includes(queryParam)) ||
            (u.businessName && u.businessName.toLowerCase().includes(queryParam))
          );
        }

        if (planParam && planParam !== 'all') {
          list = list.filter(u => (u.subscription_status || 'free').toLowerCase() === planParam.toLowerCase());
        }

        if (roleParam && roleParam !== 'all') {
          list = list.filter(u => (u.role || 'user').toLowerCase() === roleParam.toLowerCase());
        }

        return jsonResponse({
          success: true,
          data: list
        });
      }

      // --- ADMIN: USER DETAILS ---
      const adminUserDetailMatch = url.pathname.match(/^\/api\/admin\/users\/([^\/]+)$/);
      if (adminUserDetailMatch && request.method === 'GET') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const targetUserId = adminUserDetailMatch[1];
        const targetUser = await env.DB.prepare(
          "SELECT id, name, email, role, subscription_status, email_verified, created_at FROM users WHERE id = ?"
        ).bind(targetUserId).first();

        if (!targetUser) return errorResponse("User not found", 404);

        const businesses = (await env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(targetUserId).all()).results || [];
        
        let audits: any[] = [];
        let growthScores: any[] = [];
        let recommendations: any[] = [];
        let leads: any[] = [];
        let backlinks: any[] = [];

        if (businesses.length > 0) {
          const bizIds = businesses.map((b: any) => b.id);
          const placeholders = bizIds.map(() => '?').join(',');
          
          audits = (await env.DB.prepare(`SELECT * FROM audits WHERE business_id IN (${placeholders}) ORDER BY created_at DESC`).bind(...bizIds).all()).results || [];
          growthScores = (await env.DB.prepare(`SELECT * FROM growth_scores WHERE business_id IN (${placeholders}) ORDER BY created_at DESC`).bind(...bizIds).all()).results || [];
          recommendations = (await env.DB.prepare(`SELECT * FROM recommendations WHERE business_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`).bind(...bizIds).all()).results || [];
        }

        try {
          leads = (await env.DB.prepare("SELECT * FROM leads WHERE user_id = ? ORDER BY captured_at DESC").bind(targetUserId).all()).results || [];
        } catch {}

        try {
          backlinks = (await env.DB.prepare("SELECT * FROM backlinks WHERE user_id = ? ORDER BY created_at DESC").bind(targetUserId).all()).results || [];
        } catch {}

        return jsonResponse({
          success: true,
          data: {
            user: targetUser,
            businesses,
            audits,
            growthScores,
            recommendations,
            leads,
            backlinks
          }
        });
      }

      // --- ADMIN: GRANT / UPDATE PLAN ---
      const adminPlanMatch = url.pathname.match(/^\/api\/admin\/users\/([^\/]+)\/plan$/);
      if (adminPlanMatch && request.method === 'POST') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const targetUserId = adminPlanMatch[1];
        const { plan } = await request.json() as any;
        const normalizedPlan = (plan || 'free').toLowerCase();

        await env.DB.prepare("UPDATE users SET subscription_status = ? WHERE id = ?").bind(normalizedPlan, targetUserId).run();
        await env.DB.prepare("UPDATE businesses SET subscription_status = ? WHERE user_id = ?").bind(normalizedPlan, targetUserId).run().catch(() => {});

        return jsonResponse({
          success: true,
          message: `Plan updated to ${normalizedPlan.toUpperCase()}`
        });
      }

      // --- ADMIN: REVOKE PLAN ---
      const adminRevokePlanMatch = url.pathname.match(/^\/api\/admin\/users\/([^\/]+)\/revoke-plan$/);
      if (adminRevokePlanMatch && request.method === 'POST') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const targetUserId = adminRevokePlanMatch[1];

        await env.DB.prepare("UPDATE users SET subscription_status = 'free' WHERE id = ?").bind(targetUserId).run();
        await env.DB.prepare("UPDATE businesses SET subscription_status = 'free' WHERE user_id = ?").bind(targetUserId).run().catch(() => {});

        return jsonResponse({
          success: true,
          message: "Plan revoked to FREE"
        });
      }

      // --- ADMIN: UPDATE ROLE ---
      const adminRoleMatch = url.pathname.match(/^\/api\/admin\/users\/([^\/]+)\/role$/);
      if (adminRoleMatch && request.method === 'POST') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const targetUserId = adminRoleMatch[1];
        const { role } = await request.json() as any;
        const targetUser = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(targetUserId).first<any>();
        
        if (targetUser?.email === 'saninabbas@gmail.com' && role !== 'admin') {
          return errorResponse("Cannot demote primary administrator", 400);
        }

        await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, targetUserId).run();
        return jsonResponse({
          success: true,
          message: `User role updated to ${role}`
        });
      }

      // --- ADMIN: DELETE USER ---
      const adminDeleteMatch = url.pathname.match(/^\/api\/admin\/users\/([^\/]+)$/);
      if (adminDeleteMatch && request.method === 'DELETE') {
        await ensureAdminUser();
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
          return errorResponse("Forbidden: Admin access required", 403);
        }

        const targetUserId = adminDeleteMatch[1];
        const targetUser = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(targetUserId).first<any>();
        if (!targetUser) return errorResponse("User not found", 404);

        if (targetUser.email === 'saninabbas@gmail.com' || targetUserId === user.id) {
          return errorResponse("Cannot delete primary administrator account", 400);
        }

        // Cascading deletion
        const userBusinesses = (await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(targetUserId).all()).results || [];
        for (const biz of userBusinesses) {
          const bid = (biz as any).id;
          await env.DB.prepare("DELETE FROM recommendations WHERE business_id = ?").bind(bid).run().catch(() => {});
          await env.DB.prepare("DELETE FROM growth_scores WHERE business_id = ?").bind(bid).run().catch(() => {});
          await env.DB.prepare("DELETE FROM audits WHERE business_id = ?").bind(bid).run().catch(() => {});
        }

        await env.DB.prepare("DELETE FROM businesses WHERE user_id = ?").bind(targetUserId).run().catch(() => {});
        await env.DB.prepare("DELETE FROM leads WHERE user_id = ?").bind(targetUserId).run().catch(() => {});
        await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(targetUserId).run().catch(() => {});
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();

        return jsonResponse({
          success: true,
          message: "User and all associated data deleted successfully"
        });
      }

      // --- DEBUG ENV ---
      if (url.pathname === '/api/debug/env') {
        const keys = Object.keys(env);
        return jsonResponse({
          success: true,
          data: {
            keys: keys,
            hasPolarToken: !!env.POLAR_ACCESS_TOKEN,
            hasPolarWebhook: !!env.POLAR_WEBHOOK_SECRET,
            typeOfPolarToken: typeof env.POLAR_ACCESS_TOKEN
          }
        });
      }

      return errorResponse("Not found", 404);

    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message || "Internal Server Error");
    }
};
