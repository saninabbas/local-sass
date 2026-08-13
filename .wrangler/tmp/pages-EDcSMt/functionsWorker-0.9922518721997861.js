var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../src/lib/email.ts
async function sendVerificationEmail(email, token, env) {
  const apiKey = env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("SENDGRID_API_KEY not set \u2013 skipping email send");
    return;
  }
  const baseUrl = env.BASE_URL || "https://local-sass.pages.dev";
  const verificationLink = `${baseUrl}/verify?token=${token}`;
  const payload = {
    personalizations: [{ to: [{ email }] }],
    from: { email: "no-reply@local-sass.pages.dev", name: "Rankora" },
    subject: "Verify your Rankora account",
    content: [
      {
        type: "text/html",
        value: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Welcome to Rankora!</h2>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <p style="margin: 25px 0;">
              <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </p>
            <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${verificationLink}">${verificationLink}</a></p>
          </div>
        `
      }
    ]
  };
  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error("Failed to send verification email:", e);
  }
}
var init_email = __esm({
  "../src/lib/email.ts"() {
    init_functionsRoutes_0_6772971772079237();
    __name(sendVerificationEmail, "sendVerificationEmail");
  }
});

// ../src/lib/totp.ts
function base32ToBuf(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output = new Uint8Array(Math.floor(clean.length * 5 / 8));
  let index = 0;
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    value = value << 5 | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = value >>> bits - 8 & 255;
      bits -= 8;
    }
  }
  return output;
}
async function generateTOTPCode(secret, timeStep = 30) {
  const keyBuf = base32ToBuf(secret);
  const epoch = Math.floor(Date.now() / 1e3);
  const time = Math.floor(epoch / timeStep);
  const timeBuf = new ArrayBuffer(8);
  const view = new DataView(timeBuf);
  view.setUint32(4, time, false);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf.buffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, timeBuf);
  const sigBytes = new Uint8Array(sig);
  const offset = sigBytes[sigBytes.length - 1] & 15;
  const binary = (sigBytes[offset] & 127) << 24 | (sigBytes[offset + 1] & 255) << 16 | (sigBytes[offset + 2] & 255) << 8 | sigBytes[offset + 3] & 255;
  const otp = (binary % 1e6).toString().padStart(6, "0");
  return otp;
}
async function verifyTOTP(code, secret) {
  const currentCode = await generateTOTPCode(secret);
  return currentCode === code;
}
var init_totp = __esm({
  "../src/lib/totp.ts"() {
    init_functionsRoutes_0_6772971772079237();
    __name(base32ToBuf, "base32ToBuf");
    __name(generateTOTPCode, "generateTOTPCode");
    __name(verifyTOTP, "verifyTOTP");
  }
});

// api/auditEngine.ts
var auditEngine_exports = {};
__export(auditEngine_exports, {
  Extractor: () => Extractor,
  askNVIDIA: () => askNVIDIA,
  compareWithNVIDIA: () => compareWithNVIDIA,
  computeScores: () => computeScores,
  fetchWithTimeout: () => fetchWithTimeout,
  generateBlogWithNVIDIA: () => generateBlogWithNVIDIA,
  getFallbackRecommendations: () => getFallbackRecommendations
});
async function fetchWithTimeout(url, timeoutMs = 5e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Rankora-Auditor/1.0" }
    });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
function computeScores(extractor, url, city) {
  let seo = 50;
  if (extractor.title.length > 10 && extractor.title.length < 70) seo += 20;
  if (extractor.metaDescription.length > 50) seo += 20;
  if (extractor.h1.trim().length > 0) seo += 10;
  let website = 60;
  if (url.startsWith("https")) website += 20;
  if (extractor.scriptCount < 30) website += 10;
  if (extractor.linkCount > 5) website += 10;
  let visibility = 50;
  const contentToSearch = (extractor.title + extractor.metaDescription + extractor.h1).toLowerCase();
  if (contentToSearch.includes(city.toLowerCase())) visibility += 30;
  if (extractor.headingsCount > 2) visibility += 20;
  const overall = Math.floor((seo + website + visibility) / 3);
  return {
    seo: Math.min(100, seo),
    website: Math.min(100, website),
    visibility: Math.min(100, visibility),
    overall
  };
}
async function askNVIDIA(apiKey, business, extractor, scores) {
  const prompt = `You are Rankora's Local Business Growth Analyst. 
Analyze the following local business website and provide specific, actionable growth recommendations.
Business: ${business.name}
Type: ${business.type}
Location: ${business.city}, ${business.country}
Website: ${business.website_url}

Website Data Extracted:
Title: ${extractor.title}
Meta Description: ${extractor.metaDescription}
H1: ${extractor.h1}
Scores - SEO: ${scores.seo}/100, Website: ${scores.website}/100, Visibility: ${scores.visibility}/100

Provide a JSON response strictly in this format:
{
  "summary": "2-3 sentences summarizing the website's digital presence.",
  "recommendations": [
    {
      "title": "Clear action title",
      "description": "Specific instruction on what to do.",
      "priority": "high|medium|low",
      "impact": "high|medium|low",
      "estimatedMinutes": 15
    }
  ]
}`;
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
async function compareWithNVIDIA(apiKey, myExtractor, myScores, compExtractor, compScores) {
  const prompt = `You are an expert SEO Competitor Analyst.
Compare my website data against a competitor's website and provide a strategic plan to beat them.

My Website:
Title: ${myExtractor.title}
H1: ${myExtractor.h1}
Scores: SEO ${myScores.seo}/100, Tech ${myScores.website}/100

Competitor's Website:
Title: ${compExtractor.title}
H1: ${compExtractor.h1}
Scores: SEO ${compScores.seo}/100, Tech ${compScores.website}/100

Provide a JSON response strictly in this format:
{
  "summary": "2-3 sentences summarizing why the competitor might be doing better or worse.",
  "action_plan": [
    {
      "title": "Clear action title",
      "description": "Specific instruction on what I need to change to beat them."
    }
  ]
}`;
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
async function generateBlogWithNVIDIA(apiKey, businessName, city, topic) {
  const prompt = `You are an expert SEO Content Writer for local businesses.
Write a highly engaging, professional, and SEO-optimized blog article for a business named "${businessName}" located in "${city}".

Topic: ${topic}

Requirements:
- The article must be around 400-600 words.
- It must naturally include the city name ("${city}") for local SEO.
- Format the output EXACTLY in HTML using <h2>, <h3>, <p>, and <ul> tags where appropriate. Do NOT include <html>, <head>, or <body> tags, just the content itself.
- Ensure the tone is professional and engaging, ending with a call to action to contact the business.
- Output ONLY valid JSON in the exact format requested below.

Provide a JSON response strictly in this format:
{
  "title": "A catchy, SEO-optimized H1 title",
  "html_content": "The formatted HTML string containing the article content."
}`;
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2e3,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
function getFallbackRecommendations() {
  return {
    summary: "We were unable to fully process your website with AI, but here is a standard growth plan.",
    recommendations: [
      {
        title: "Claim your Google Business Profile",
        description: "Ensure your business is verified on Google and all information is accurate.",
        priority: "high",
        impact: "high",
        estimatedMinutes: 30
      },
      {
        title: "Add local keywords to your homepage",
        description: "Make sure your city and primary service are mentioned in the main heading of your website.",
        priority: "medium",
        impact: "medium",
        estimatedMinutes: 15
      }
    ]
  };
}
var Extractor;
var init_auditEngine = __esm({
  "api/auditEngine.ts"() {
    init_functionsRoutes_0_6772971772079237();
    __name(fetchWithTimeout, "fetchWithTimeout");
    Extractor = class {
      static {
        __name(this, "Extractor");
      }
      title = "";
      metaDescription = "";
      h1 = "";
      headingsCount = 0;
      scriptCount = 0;
      linkCount = 0;
      get handlers() {
        return {
          title: {
            text: /* @__PURE__ */ __name((t) => {
              this.title += t.text;
            }, "text")
          },
          meta: {
            element: /* @__PURE__ */ __name((e) => {
              if (e.getAttribute("name")?.toLowerCase() === "description") {
                this.metaDescription = e.getAttribute("content") || "";
              }
            }, "element")
          },
          h1: {
            text: /* @__PURE__ */ __name((t) => {
              this.h1 += t.text;
            }, "text")
          },
          heading: {
            element: /* @__PURE__ */ __name(() => {
              this.headingsCount++;
            }, "element")
          },
          script: {
            element: /* @__PURE__ */ __name(() => {
              this.scriptCount++;
            }, "element")
          },
          a: {
            element: /* @__PURE__ */ __name(() => {
              this.linkCount++;
            }, "element")
          }
        };
      }
    };
    __name(computeScores, "computeScores");
    __name(askNVIDIA, "askNVIDIA");
    __name(compareWithNVIDIA, "compareWithNVIDIA");
    __name(generateBlogWithNVIDIA, "generateBlogWithNVIDIA");
    __name(getFallbackRecommendations, "getFallbackRecommendations");
  }
});

// api/[[route]].ts
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const saltBuf = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const newSaltHex = saltHex || buf2hex(saltBuf);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuf, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `${newSaltHex}:${buf2hex(hashBuffer)}`;
}
async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;
  const attemptHash = await hashPassword(password, saltHex);
  return attemptHash === storedHash;
}
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("=").map(decodeURIComponent))
  );
}
var buf2hex, hex2buf, generateId, onRequest;
var init_route = __esm({
  "api/[[route]].ts"() {
    init_functionsRoutes_0_6772971772079237();
    init_email();
    init_totp();
    buf2hex = /* @__PURE__ */ __name((buffer) => [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join(""), "buf2hex");
    hex2buf = /* @__PURE__ */ __name((hex) => new Uint8Array((hex.match(/[\da-f]{2}/gi) || []).map((h) => parseInt(h, 16))).buffer, "hex2buf");
    __name(hashPassword, "hashPassword");
    __name(verifyPassword, "verifyPassword");
    generateId = /* @__PURE__ */ __name((prefix) => `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`, "generateId");
    __name(parseCookies, "parseCookies");
    onRequest = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const url = new URL(request.url);
      const jsonResponse = /* @__PURE__ */ __name((data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...headers }
      }), "jsonResponse");
      const errorResponse = /* @__PURE__ */ __name((error, status = 500) => jsonResponse({ success: false, error }, status), "errorResponse");
      const authenticate = /* @__PURE__ */ __name(async () => {
        const cookies = parseCookies(request.headers.get("Cookie"));
        const sessionId = cookies["session_id"];
        if (!sessionId) return null;
        const session = await env.DB.prepare(
          "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
        ).bind(sessionId).first();
        if (!session) return null;
        const user = await env.DB.prepare(
          "SELECT id, name, email FROM users WHERE id = ?"
        ).bind(session.user_id).first();
        return user;
      }, "authenticate");
      const executeAudit = /* @__PURE__ */ __name(async (business) => {
        if (!business.website_url) throw new Error("Business has no website URL");
        const auditId = generateId("aud");
        await env.DB.prepare(
          "INSERT INTO audits (id, business_id, status) VALUES (?, ?, 'running')"
        ).bind(auditId, business.id).run();
        try {
          const { fetchWithTimeout: fetchWithTimeout2, Extractor: Extractor2, computeScores: computeScores2, askNVIDIA: askNVIDIA2, getFallbackRecommendations: getFallbackRecommendations2 } = await Promise.resolve().then(() => (init_auditEngine(), auditEngine_exports));
          const websiteUrl = business.website_url;
          let websiteResponse;
          try {
            websiteResponse = await fetchWithTimeout2(websiteUrl, 1e4);
          } catch {
            throw new Error("Website fetch failed or timed out.");
          }
          if (!websiteResponse.ok || !websiteResponse.headers.get("content-type")?.includes("text/html")) {
            throw new Error("Invalid or non-HTML website response.");
          }
          const extractor = new Extractor2();
          const rewriter = new HTMLRewriter().on("title", extractor.handlers.title).on("meta", extractor.handlers.meta).on("h1", extractor.handlers.h1).on("h1, h2, h3, h4, h5, h6", extractor.handlers.heading).on("script", extractor.handlers.script).on("a", extractor.handlers.a);
          await rewriter.transform(websiteResponse).text();
          const scores = computeScores2(extractor, websiteUrl, business.city);
          let aiResult;
          try {
            if (!env.NVIDIA_API_KEY) throw new Error("Missing NVIDIA_API_KEY");
            aiResult = await askNVIDIA2(env.NVIDIA_API_KEY, business, extractor, scores);
          } catch (aiErr) {
            console.error("AI Error:", aiErr);
            aiResult = getFallbackRecommendations2();
          }
          const scoreId = generateId("score");
          await env.DB.prepare(
            `INSERT INTO growth_scores 
           (id, audit_id, business_id, overall_score, seo_score, reviews_score, website_score, visibility_score, previous_score, score_change) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            scoreId,
            auditId,
            business.id,
            scores.overall,
            scores.seo,
            -1,
            scores.website,
            scores.visibility,
            null,
            0
          ).run();
          const insertRec = env.DB.prepare(
            "INSERT INTO recommendations (id, audit_id, business_id, priority, priority_color, title, description, impact, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          );
          const batch = aiResult.recommendations.map((rec) => {
            const colorMap = { high: "red", medium: "yellow", low: "gray" };
            return insertRec.bind(
              generateId("rec"),
              auditId,
              business.id,
              rec.priority || "medium",
              colorMap[rec.priority?.toLowerCase()] || "blue",
              rec.title,
              rec.description,
              rec.impact || "medium",
              rec.estimatedMinutes || 15
            );
          });
          if (batch.length > 0) {
            await env.DB.batch(batch);
          }
          await env.DB.prepare(
            "UPDATE audits SET status = 'completed', score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(scores.overall, auditId).run();
          return { auditId, score: scores.overall };
        } catch (auditError) {
          console.error("Audit failed:", auditError);
          await env.DB.prepare(
            "UPDATE audits SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(auditId).run();
          throw auditError;
        }
      }, "executeAudit");
      try {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type"
            }
          });
        }
        if (url.pathname === "/api/health") {
          await env.DB.prepare("SELECT 1").first();
          return jsonResponse({ success: true, worker: "ok", database: "ok" });
        }
        if (url.pathname === "/api/setup-db") {
          try {
            await env.DB.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run().catch(() => {
            });
            await env.DB.prepare("ALTER TABLE users ADD COLUMN polar_customer_id TEXT").run().catch(() => {
            });
            await env.DB.prepare("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'").run().catch(() => {
            });
            await env.DB.prepare("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0").run().catch(() => {
            });
            await env.DB.prepare("ALTER TABLE users ADD COLUMN verification_token TEXT").run().catch(() => {
            });
            await env.DB.prepare("ALTER TABLE users ADD COLUMN totp_secret TEXT").run().catch(() => {
            });
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))").run().catch(() => {
            });
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT, email TEXT NOT NULL, website TEXT, captured_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))").run().catch(() => {
            });
            return jsonResponse({ success: true, message: "Database schema updated successfully!" });
          } catch (e) {
            return jsonResponse({ success: false, error: e.message });
          }
        }
        if (url.pathname === "/api/auth/signup" && request.method === "POST") {
          const { name, email, password } = await request.json();
          if (!name || !email || !password || password.length < 8) {
            return errorResponse("Invalid input. Password must be at least 8 characters.", 400);
          }
          const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
          if (existing) return errorResponse("Email already in use", 400);
          const hashedPassword = await hashPassword(password);
          const userId = generateId("usr");
          const verificationToken = crypto.randomUUID();
          await env.DB.prepare(
            "INSERT INTO users (id, name, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)"
          ).bind(userId, name, email, hashedPassword, verificationToken).run();
          const verificationLink = `/verify?token=${verificationToken}`;
          await sendVerificationEmail(email, verificationToken, env);
          return jsonResponse({
            success: true,
            message: "User created. Please verify email.",
            verificationLink
          });
        }
        if (url.pathname === "/api/auth/verify") {
          let token = url.searchParams.get("token");
          if (!token && request.method === "POST") {
            const body = await request.json().catch(() => ({}));
            token = body.token;
          }
          if (!token) return errorResponse("Verification token missing", 400);
          const user = await env.DB.prepare("SELECT id FROM users WHERE verification_token = ?").bind(token).first();
          if (!user) return errorResponse("Invalid or expired token", 400);
          await env.DB.prepare("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?").bind(user.id).run();
          return jsonResponse({ success: true, message: "Email verified successfully!" });
        }
        if (url.pathname === "/api/auth/login" && request.method === "POST") {
          const { email, password } = await request.json();
          const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
          if (!user) return errorResponse("Invalid credentials", 401);
          if (!user.email_verified) return errorResponse("Please verify your email first", 403);
          const isValid = await verifyPassword(password, user.password_hash);
          if (!isValid) return errorResponse("Invalid credentials", 401);
          if (user.totp_secret) {
            const tmpSess = generateId("sess_tmp");
            await env.DB.prepare(
              "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+5 minutes'))"
            ).bind(tmpSess, user.id).run();
            const cookie2 = `session_id=${tmpSess}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${5 * 60}`;
            return jsonResponse({ success: true, require2FA: true, tempToken: tmpSess }, 200, { "Set-Cookie": cookie2 });
          }
          const sessionId = generateId("sess");
          await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
          ).bind(sessionId, user.id).run();
          const cookie = `session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
          return jsonResponse({ success: true, data: { id: user.id, name: user.name, email: user.email } }, 200, { "Set-Cookie": cookie });
        }
        if (url.pathname === "/api/auth/2fa" && request.method === "POST") {
          const { token, code } = await request.json();
          const tmp = await env.DB.prepare(
            "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
          ).bind(token).first();
          if (!tmp) return errorResponse("Session expired or invalid", 401);
          const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(tmp.user_id).first();
          if (!user?.totp_secret) return errorResponse("2FA not set up", 400);
          if (!await verifyTOTP(code, user.totp_secret)) {
            return errorResponse("Invalid 2FA code", 401);
          }
          await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
          const newSess = generateId("sess");
          await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
          ).bind(newSess, user.id).run();
          const cookie = `session_id=${newSess}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
          return jsonResponse({ success: true, data: { id: user.id, name: user.name, email: user.email } }, 200, { "Set-Cookie": cookie });
        }
        if (url.pathname === "/api/auth/logout" && request.method === "POST") {
          const cookies = parseCookies(request.headers.get("Cookie"));
          if (cookies["session_id"]) {
            await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(cookies["session_id"]).run();
          }
          const cookie = `session_id=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
          return jsonResponse({ success: true }, 200, { "Set-Cookie": cookie });
        }
        if (url.pathname === "/api/audits" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
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
        `).bind(business.id).all();
          return jsonResponse({ success: true, data: audits });
        }
        if (url.pathname === "/api/audit/latest" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return errorResponse("No business found", 404);
          const audit = await env.DB.prepare(
            "SELECT * FROM audits WHERE business_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 1"
          ).bind(business.id).first();
          if (!audit) return jsonResponse({ success: true, data: null });
          const scores = await env.DB.prepare(
            "SELECT * FROM growth_scores WHERE audit_id = ?"
          ).bind(audit.id).first();
          const { results: recommendations } = await env.DB.prepare(
            "SELECT * FROM recommendations WHERE audit_id = ? ORDER BY created_at DESC"
          ).bind(audit.id).all();
          return jsonResponse({
            success: true,
            data: {
              audit,
              scores,
              recommendations
            }
          });
        }
        if (url.pathname === "/api/auth/me" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          return jsonResponse({ success: true, data: user });
        }
        if (url.pathname === "/api/business" && request.method === "POST") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const { name, type, city, country, websiteUrl } = await request.json();
          const bizId = generateId("biz");
          await env.DB.prepare(
            "INSERT INTO businesses (id, user_id, name, type, city, country, website_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(bizId, user.id, name, type, city, country, websiteUrl).run();
          return jsonResponse({ success: true, data: { id: bizId } });
        }
        if (url.pathname === "/api/audit" && request.method === "POST") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return errorResponse("No business found", 404);
          if (!business.website_url) return errorResponse("Business has no website URL", 400);
          const runningAudit = await env.DB.prepare(
            "SELECT id FROM audits WHERE business_id = ? AND status = 'running'"
          ).bind(business.id).first();
          if (runningAudit) {
            return errorResponse("An audit is already running for this business", 429);
          }
          try {
            await executeAudit(business);
            return jsonResponse({ success: true, data: { status: "completed" } });
          } catch (auditError) {
            return errorResponse("Audit failed to complete: " + (auditError.message || "Unknown error"), 500);
          }
        }
        if (url.pathname === "/api/cron/weekly-audits") {
          const secret = url.searchParams.get("secret");
          if (!secret || secret !== env.CRON_SECRET) {
            return errorResponse("Unauthorized", 401);
          }
          const { results: businesses } = await env.DB.prepare(
            "SELECT * FROM businesses WHERE subscription_tier IN ('growth', 'pro')"
          ).all();
          const results = [];
          for (const business of businesses) {
            const lastAudit = await env.DB.prepare(
              "SELECT completed_at FROM audits WHERE business_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1"
            ).bind(business.id).first();
            let shouldAudit = true;
            if (lastAudit && lastAudit.completed_at) {
              const lastAuditTime = new Date(lastAudit.completed_at).getTime();
              const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1e3;
              if (lastAuditTime > oneWeekAgo) {
                shouldAudit = false;
              }
            }
            if (shouldAudit) {
              try {
                const res = await executeAudit(business);
                results.push({ businessId: business.id, name: business.name, status: "success", score: res.score });
              } catch (err) {
                results.push({ businessId: business.id, name: business.name, status: "failed", error: err.message });
              }
            } else {
              results.push({ businessId: business.id, name: business.name, status: "skipped", reason: "Audited in last 7 days" });
            }
          }
          return jsonResponse({ success: true, results });
        }
        if (url.pathname === "/api/website/analyze" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return errorResponse("No business found", 404);
          if (!business.website_url) return errorResponse("Business has no website URL", 400);
          try {
            const { fetchWithTimeout: fetchWithTimeout2, Extractor: Extractor2 } = await Promise.resolve().then(() => (init_auditEngine(), auditEngine_exports));
            const websiteUrl = business.website_url;
            let websiteResponse;
            try {
              websiteResponse = await fetchWithTimeout2(websiteUrl, 1e4);
            } catch {
              throw new Error("Website fetch failed or timed out.");
            }
            if (!websiteResponse.ok || !websiteResponse.headers.get("content-type")?.includes("text/html")) {
              throw new Error("Invalid or non-HTML website response.");
            }
            const extractor = new Extractor2();
            const rewriter = new HTMLRewriter().on("title", extractor.handlers.title).on("meta", extractor.handlers.meta).on("h1", extractor.handlers.h1).on("h1, h2, h3, h4, h5, h6", extractor.handlers.heading).on("script", extractor.handlers.script).on("a", extractor.handlers.a);
            await rewriter.transform(websiteResponse).text();
            const data = {
              url: websiteUrl,
              https: websiteUrl.startsWith("https://"),
              title: extractor.title.trim(),
              metaDescription: extractor.metaDescription.trim(),
              h1: extractor.h1.trim(),
              headingsCount: extractor.headingsCount,
              scriptCount: extractor.scriptCount,
              linkCount: extractor.linkCount
            };
            return jsonResponse({ success: true, data });
          } catch (error) {
            return errorResponse("Failed to analyze website: " + error.message, 500);
          }
        }
        if (url.pathname === "/api/content/generate" && request.method === "POST") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          let payload;
          try {
            payload = await request.json();
          } catch {
            return errorResponse("Invalid JSON", 400);
          }
          const topic = payload.topic || "The importance of our services in the local community";
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return errorResponse("Business not found", 404);
          if (!env.NVIDIA_API_KEY) {
            return errorResponse("AI is not configured on the server.", 500);
          }
          try {
            const { generateBlogWithNVIDIA: generateBlogWithNVIDIA2 } = await Promise.resolve().then(() => (init_auditEngine(), auditEngine_exports));
            const businessName = business.name || "Our Local Business";
            const city = business.city || "our city";
            const blogData = await generateBlogWithNVIDIA2(env.NVIDIA_API_KEY, businessName, city, topic);
            return jsonResponse({ success: true, data: blogData });
          } catch (error) {
            return errorResponse("Failed to generate blog content: " + error.message, 500);
          }
        }
        if (url.pathname === "/api/competitors/analyze" && request.method === "POST") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          let payload;
          try {
            payload = await request.json();
          } catch {
            return errorResponse("Invalid JSON", 400);
          }
          if (!payload.competitorUrl) return errorResponse("Competitor URL required", 400);
          const business = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business || !business.website_url) return errorResponse("You must have a website to compare against", 400);
          try {
            const { fetchWithTimeout: fetchWithTimeout2, Extractor: Extractor2, computeScores: computeScores2, compareWithNVIDIA: compareWithNVIDIA2 } = await Promise.resolve().then(() => (init_auditEngine(), auditEngine_exports));
            const [myRes, compRes] = await Promise.allSettled([
              fetchWithTimeout2(business.website_url, 8e3),
              fetchWithTimeout2(payload.competitorUrl, 8e3)
            ]);
            if (myRes.status === "rejected" || compRes.status === "rejected") {
              throw new Error("Failed to fetch one or both websites.");
            }
            const myExtractor = new Extractor2();
            const compExtractor = new Extractor2();
            const myRewriter = new HTMLRewriter().on("title", myExtractor.handlers.title).on("meta", myExtractor.handlers.meta).on("h1", myExtractor.handlers.h1).on("h1, h2, h3, h4, h5, h6", myExtractor.handlers.heading).on("script", myExtractor.handlers.script).on("a", myExtractor.handlers.a);
            const compRewriter = new HTMLRewriter().on("title", compExtractor.handlers.title).on("meta", compExtractor.handlers.meta).on("h1", compExtractor.handlers.h1).on("h1, h2, h3, h4, h5, h6", compExtractor.handlers.heading).on("script", compExtractor.handlers.script).on("a", compExtractor.handlers.a);
            await Promise.all([
              myRewriter.transform(myRes.value).text(),
              compRewriter.transform(compRes.value).text()
            ]);
            const myScores = computeScores2(myExtractor, business.website_url, business.city || "");
            const compScores = computeScores2(compExtractor, payload.competitorUrl, business.city || "");
            let aiStrategy = null;
            if (env.NVIDIA_API_KEY) {
              try {
                aiStrategy = await compareWithNVIDIA2(env.NVIDIA_API_KEY, myExtractor, myScores, compExtractor, compScores);
              } catch (e) {
                console.error("NVIDIA AI failed for competitor analysis", e);
              }
            }
            const responseData = {
              me: {
                url: business.website_url,
                https: business.website_url.startsWith("https://"),
                title: myExtractor.title.trim(),
                h1: myExtractor.h1.trim(),
                score: myScores.overall
              },
              competitor: {
                url: payload.competitorUrl,
                https: payload.competitorUrl.startsWith("https://"),
                title: compExtractor.title.trim(),
                h1: compExtractor.h1.trim(),
                score: compScores.overall
              },
              strategy: aiStrategy || { summary: "AI currently unavailable.", action_plan: [] }
            };
            return jsonResponse({ success: true, data: responseData });
          } catch (error) {
            return errorResponse("Failed to analyze competitor: " + error.message, 500);
          }
        }
        if (url.pathname === "/api/cron/run-audits" && request.method === "POST") {
          const authHeader = request.headers.get("Authorization");
          const expectedSecret = env.CRON_SECRET;
          if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
            return errorResponse("Unauthorized cron request", 401);
          }
          try {
            const { fetchWithTimeout: fetchWithTimeout2, Extractor: Extractor2, computeScores: computeScores2 } = await Promise.resolve().then(() => (init_auditEngine(), auditEngine_exports));
            const { results: businesses } = await env.DB.prepare(
              "SELECT id, website_url, city FROM businesses WHERE website_url IS NOT NULL"
            ).all();
            const auditResults = [];
            for (const business of businesses) {
              try {
                const websiteResponse = await fetchWithTimeout2(business.website_url, 5e3);
                if (websiteResponse.ok && websiteResponse.headers.get("content-type")?.includes("text/html")) {
                  const extractor = new Extractor2();
                  const rewriter = new HTMLRewriter().on("title", extractor.handlers.title).on("meta", extractor.handlers.meta).on("h1", extractor.handlers.h1).on("h1, h2, h3, h4, h5, h6", extractor.handlers.heading).on("script", extractor.handlers.script).on("a", extractor.handlers.a);
                  await rewriter.transform(websiteResponse).text();
                  const scores = computeScores2(extractor, business.website_url, business.city || "");
                  await env.DB.prepare(`
                  INSERT INTO growth_scores (business_id, overall_score, seo_score, local_visibility_score, website_score, reviews_score)
                  VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                    business.id,
                    scores.overall,
                    scores.seo,
                    scores.visibility,
                    scores.website,
                    70
                    // Default placeholder for reviews
                  ).run();
                  auditResults.push({ id: business.id, status: "success", scores });
                } else {
                  auditResults.push({ id: business.id, status: "failed", reason: "Invalid response" });
                }
              } catch (error) {
                auditResults.push({ id: business.id, status: "failed", reason: error.message });
              }
            }
            return jsonResponse({ success: true, processed: businesses.length, results: auditResults });
          } catch (error) {
            return errorResponse("Cron execution failed: " + error.message, 500);
          }
        }
        if (url.pathname === "/api/dashboard" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const businessInfo = await env.DB.prepare(
            "SELECT * FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!businessInfo) {
            return jsonResponse({
              success: true,
              data: { user, business: null, growthScore: null, recommendations: [] }
            });
          }
          const growthScore = await env.DB.prepare(
            "SELECT * FROM growth_scores WHERE business_id = ? ORDER BY created_at DESC LIMIT 1"
          ).bind(businessInfo.id).first();
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
          ).bind(businessInfo.id).all();
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
                lastAudited: (/* @__PURE__ */ new Date(growthScore.created_at + "Z")).toLocaleString()
              },
              recommendations: recommendations.map((r) => ({
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
        if (url.pathname === "/api/recommendations" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare(
            "SELECT id FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return jsonResponse({ success: true, data: [] });
          const { results: recommendations } = await env.DB.prepare(
            "SELECT * FROM recommendations WHERE business_id = ? ORDER BY created_at DESC"
          ).bind(business.id).all();
          return jsonResponse({
            success: true,
            data: recommendations.map((r) => ({
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
        if (url.pathname.startsWith("/api/recommendations/") && request.method === "PATCH") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const id = url.pathname.split("/").pop();
          if (!id) return errorResponse("Invalid ID", 400);
          const { status } = await request.json();
          if (!status || !["pending", "in-progress", "completed"].includes(status)) {
            return errorResponse("Invalid status", 400);
          }
          const business = await env.DB.prepare(
            "SELECT id FROM businesses WHERE user_id = ? LIMIT 1"
          ).bind(user.id).first();
          if (!business) return errorResponse("Unauthorized", 401);
          const result = await env.DB.prepare(
            "UPDATE recommendations SET status = ? WHERE id = ? AND business_id = ?"
          ).bind(status, id, business.id).run();
          if (result.meta.changes === 0) {
            return errorResponse("Recommendation not found or unauthorized", 404);
          }
          return jsonResponse({ success: true, data: { id, status } });
        }
        if (url.pathname === "/api/billing/checkout" && request.method === "POST") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const { productId } = await request.json();
          if (!productId) return errorResponse("Product ID is required", 400);
          if (!env.POLAR_ACCESS_TOKEN) {
            return errorResponse("Billing is not configured on the server.", 500);
          }
          try {
            const polarRes = await fetch("https://api.polar.sh/v1/checkouts/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.POLAR_ACCESS_TOKEN}`
              },
              body: JSON.stringify({
                product_id: productId,
                customer_email: user.email,
                customer_name: user.name,
                metadata: {
                  user_id: user.id
                },
                success_url: `${url.origin}/dashboard/settings?checkout=success`
              })
            });
            if (!polarRes.ok) {
              const errorText = await polarRes.text();
              console.error("Polar API error:", errorText);
              return errorResponse(`Failed to generate checkout session: ${errorText}`, 500);
            }
            const checkoutData = await polarRes.json();
            return jsonResponse({ success: true, data: { url: checkoutData.url } });
          } catch (e) {
            console.error("Polar fetch error:", e);
            return errorResponse("Failed to communicate with billing provider", 500);
          }
        }
        if (url.pathname === "/api/webhooks/polar" && request.method === "POST") {
          const payload = await request.json();
          if (payload.type === "order.created" || payload.type === "subscription.created") {
            const { metadata, customer_id, product_id } = payload.data;
            if (metadata && metadata.user_id) {
              let plan = "pro";
              if (product_id === "7594755d-5580-4b77-86ae-90baae0e20d8") {
                plan = "growth";
              }
              try {
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
        if (url.pathname === "/api/widget/capture" && request.method === "POST") {
          try {
            const payload = await request.json();
            if (!payload.businessId || !payload.email || !payload.name) {
              return errorResponse("Missing required fields", 400);
            }
            const business = await env.DB.prepare("SELECT id FROM businesses WHERE id = ?").bind(payload.businessId).first();
            if (!business) return errorResponse("Business not found", 404);
            const leadId = crypto.randomUUID();
            await env.DB.prepare(
              "INSERT INTO leads (id, business_id, name, email, website_url) VALUES (?, ?, ?, ?, ?)"
            ).bind(leadId, payload.businessId, payload.name, payload.email, payload.websiteUrl || "").run();
            return new Response(JSON.stringify({ success: true }), {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
              }
            });
          } catch (error) {
            return new Response(JSON.stringify({ success: false, error: error.message }), {
              status: 500,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        }
        if (url.pathname === "/api/widget/capture" && request.method === "OPTIONS") {
          return new Response(null, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type"
            }
          });
        }
        if (url.pathname === "/api/leads" && request.method === "GET") {
          const user = await authenticate();
          if (!user) return errorResponse("Unauthorized", 401);
          const business = await env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
          if (!business) return jsonResponse({ success: true, data: [] });
          const { results } = await env.DB.prepare(
            "SELECT id, name, email, website_url, created_at FROM leads WHERE business_id = ? ORDER BY created_at DESC"
          ).bind(business.id).all();
          return jsonResponse({ success: true, data: results });
        }
        if (url.pathname === "/api/debug/env") {
          const keys = Object.keys(env);
          return jsonResponse({
            success: true,
            data: {
              keys,
              hasPolarToken: !!env.POLAR_ACCESS_TOKEN,
              hasPolarWebhook: !!env.POLAR_WEBHOOK_SECRET,
              typeOfPolarToken: typeof env.POLAR_ACCESS_TOKEN
            }
          });
        }
        return errorResponse("Not found", 404);
      } catch (err) {
        console.error(err);
        return errorResponse(err.message || "Internal Server Error");
      }
    }, "onRequest");
  }
});

// ../.wrangler/tmp/pages-EDcSMt/functionsRoutes-0.6772971772079237.mjs
var routes;
var init_functionsRoutes_0_6772971772079237 = __esm({
  "../.wrangler/tmp/pages-EDcSMt/functionsRoutes-0.6772971772079237.mjs"() {
    init_route();
    routes = [
      {
        routePath: "/api/:route*",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      }
    ];
  }
});

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_6772971772079237();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_6772971772079237();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
