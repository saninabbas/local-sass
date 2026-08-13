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

    // Helper to get authenticated user
    const authenticate = async () => {
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionId = cookies['session_id'];
      if (!sessionId) return null;

      const session = await env.DB.prepare(
        "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
      ).bind(sessionId).first();

      if (!session) return null;

      const user = await env.DB.prepare(
        "SELECT id, name, email FROM users WHERE id = ?"
      ).bind(session.user_id).first();

      return user;
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

      // --- SETUP DB (Temporary endpoint to fix schema) ---
      if (url.pathname === '/api/setup-db') {
        try {
          await env.DB.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN polar_customer_id TEXT").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'").run().catch(() => {});
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))").run().catch(() => {});
          return jsonResponse({ success: true, message: "Database tables updated successfully!" });
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

        await sendVerificationEmail(email, verificationToken, env);
        return jsonResponse({ success: true, message: "User created. Please verify email." });
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
        return jsonResponse({ success: true, data: { id: user.id, name: user.name, email: user.email } }, 200, { 'Set-Cookie': cookie });
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

        if (!verifyTOTP(code, user.totp_secret as string)) {
          return errorResponse("Invalid 2FA code", 401);
        }

        await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
        const newSess = generateId('sess');
        await env.DB.prepare(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
        ).bind(newSess, user.id).run();

        const cookie = `session_id=${newSess}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
        return jsonResponse({ success: true, data: { id: user.id, name: user.name, email: user.email } }, 200, { 'Set-Cookie': cookie });
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

      // --- AUTH: ME ---
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const user = await authenticate();
        if (!user) return errorResponse("Unauthorized", 401);
        return jsonResponse({ success: true, data: user });
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

        const auditId = generateId('aud');
        
        // Start audit
        await env.DB.prepare(
          "INSERT INTO audits (id, business_id, status) VALUES (?, ?, 'running')"
        ).bind(auditId, business.id as string).run();

        // Run the audit process asynchronously, but since we want to return the result, we await it.
        // In a production serverless environment with strict timeouts, we might queue this.
        // But for this MVP, we await it directly (within the 30s Cloudflare limit).
        try {
          const { fetchWithTimeout, Extractor, computeScores, askNVIDIA, getFallbackRecommendations } = await import('./auditEngine');
          
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
            .on('title', extractor.handlers.title)
            .on('meta', extractor.handlers.meta)
            .on('h1', extractor.handlers.h1)
            .on('h1, h2, h3, h4, h5, h6', extractor.handlers.heading)
            .on('script', extractor.handlers.script)
            .on('a', extractor.handlers.a);

          await rewriter.transform(websiteResponse).text(); // consumes the stream

          const scores = computeScores(extractor, websiteUrl, business.city as string);

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
          await env.DB.prepare(
            `INSERT INTO growth_scores 
             (id, audit_id, business_id, overall_score, seo_score, reviews_score, website_score, visibility_score, previous_score, score_change) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            scoreId, auditId, business.id, scores.overall, scores.seo, -1, scores.website, scores.visibility, null, 0
          ).run();

          // Save Recommendations
          const insertRec = env.DB.prepare(
            "INSERT INTO recommendations (id, audit_id, business_id, priority, priority_color, title, description, impact, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
              rec.estimatedMinutes || 15
            );
          });
          
          if (batch.length > 0) {
            await env.DB.batch(batch);
          }

          // Complete Audit
          await env.DB.prepare(
            "UPDATE audits SET status = 'completed', score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(scores.overall, auditId).run();

          return jsonResponse({ success: true, data: { status: 'completed' } });

        } catch (auditError: any) {
          console.error("Audit failed:", auditError);
          await env.DB.prepare(
            "UPDATE audits SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(auditId).run();
          return errorResponse("Audit failed to complete: " + (auditError.message || "Unknown error"), 500);
        }
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
            .on('title', extractor.handlers.title)
            .on('meta', extractor.handlers.meta)
            .on('h1', extractor.handlers.h1)
            .on('h1, h2, h3, h4, h5, h6', extractor.handlers.heading)
            .on('script', extractor.handlers.script)
            .on('a', extractor.handlers.a);

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
          const compExtractor = new Extractor();

          const myRewriter = new HTMLRewriter()
            .on('title', myExtractor.handlers.title)
            .on('meta', myExtractor.handlers.meta)
            .on('h1', myExtractor.handlers.h1)
            .on('h1, h2, h3, h4, h5, h6', myExtractor.handlers.heading)
            .on('script', myExtractor.handlers.script)
            .on('a', myExtractor.handlers.a);

          const compRewriter = new HTMLRewriter()
            .on('title', compExtractor.handlers.title)
            .on('meta', compExtractor.handlers.meta)
            .on('h1', compExtractor.handlers.h1)
            .on('h1, h2, h3, h4, h5, h6', compExtractor.handlers.heading)
            .on('script', compExtractor.handlers.script)
            .on('a', compExtractor.handlers.a);

          await Promise.all([
            myRewriter.transform(myRes.value).text(),
            compRewriter.transform(compRes.value).text()
          ]);

          const myScores = computeScores(myExtractor, business.website_url as string, (business.city as string) || '');
          const compScores = computeScores(compExtractor, payload.competitorUrl, (business.city as string) || '');

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

      // --- BACKGROUND CRON AUDITS ---
      if (url.pathname === '/api/cron/run-audits' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        const expectedSecret = env.CRON_SECRET;

        // Security: Prevent unauthorized execution
        if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
          return errorResponse("Unauthorized cron request", 401);
        }

        try {
          const { fetchWithTimeout, Extractor, computeScores } = await import('./auditEngine');
          
          // Get all businesses with a website
          const { results: businesses } = await env.DB.prepare(
            "SELECT id, website_url, city FROM businesses WHERE website_url IS NOT NULL"
          ).all();

          const auditResults = [];

          for (const business of businesses) {
            try {
              const websiteResponse = await fetchWithTimeout(business.website_url as string, 5000);
              
              if (websiteResponse.ok && websiteResponse.headers.get('content-type')?.includes('text/html')) {
                const extractor = new Extractor();
                const rewriter = new HTMLRewriter()
                  .on('title', extractor.handlers.title)
                  .on('meta', extractor.handlers.meta)
                  .on('h1', extractor.handlers.h1)
                  .on('h1, h2, h3, h4, h5, h6', extractor.handlers.heading)
                  .on('script', extractor.handlers.script)
                  .on('a', extractor.handlers.a);

                await rewriter.transform(websiteResponse).text();

                // Compute fresh scores
                const scores = computeScores(extractor, business.website_url as string, (business.city as string) || '');
                
                // Save new scores to DB
                await env.DB.prepare(`
                  INSERT INTO growth_scores (business_id, overall_score, seo_score, local_visibility_score, website_score, reviews_score)
                  VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                  business.id, 
                  scores.overall, 
                  scores.seo, 
                  scores.visibility, 
                  scores.website, 
                  70 // Default placeholder for reviews
                ).run();

                auditResults.push({ id: business.id, status: 'success', scores });
              } else {
                auditResults.push({ id: business.id, status: 'failed', reason: 'Invalid response' });
              }
            } catch (error: any) {
              auditResults.push({ id: business.id, status: 'failed', reason: error.message });
            }
          }

          return jsonResponse({ success: true, processed: businesses.length, results: auditResults });
        } catch (error: any) {
          return errorResponse("Cron execution failed: " + error.message, 500);
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
              previousScore: growthScore.previous_score,
              change: growthScore.score_change,
              progressHistory: [72, 73, 74, 76, 78],
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
              actionLink: r.action_link
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
            actionLink: r.action_link
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
            if (product_id === '47bdc1ba-789c-4a0c-88de-b7a7b5e43d21') {
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
