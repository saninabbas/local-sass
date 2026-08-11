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

// .wrangler/tmp/bundle-7F7CWA/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-7F7CWA/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// worker/auditEngine.ts
var auditEngine_exports = {};
__export(auditEngine_exports, {
  Extractor: () => Extractor,
  askNVIDIA: () => askNVIDIA,
  computeScores: () => computeScores,
  fetchWithTimeout: () => fetchWithTimeout,
  getFallbackRecommendations: () => getFallbackRecommendations
});
async function fetchWithTimeout(url, timeoutMs = 5e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "LocalGrowthAI-Auditor/1.0" }
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
  const prompt = `You are a Local Business Growth Analyst. 
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
  "worker/auditEngine.ts"() {
    init_checked_fetch();
    init_modules_watch_stub();
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
        const self = this;
        return {
          title: {
            text(t) {
              self.title += t.text;
            }
          },
          meta: {
            element(e) {
              if (e.getAttribute("name")?.toLowerCase() === "description") {
                self.metaDescription = e.getAttribute("content") || "";
              }
            }
          },
          h1: {
            text(t) {
              self.h1 += t.text;
            }
          },
          heading: {
            element() {
              self.headingsCount++;
            }
          },
          script: {
            element() {
              self.scriptCount++;
            }
          },
          a: {
            element() {
              self.linkCount++;
            }
          }
        };
      }
    };
    __name(computeScores, "computeScores");
    __name(askNVIDIA, "askNVIDIA");
    __name(getFallbackRecommendations, "getFallbackRecommendations");
  }
});

// .wrangler/tmp/bundle-7F7CWA/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-7F7CWA/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// worker/index.ts
init_checked_fetch();
init_modules_watch_stub();
var buf2hex = /* @__PURE__ */ __name((buffer) => [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join(""), "buf2hex");
var hex2buf = /* @__PURE__ */ __name((hex) => new Uint8Array((hex.match(/[\da-f]{2}/gi) || []).map((h) => parseInt(h, 16))).buffer, "hex2buf");
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
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;
  const attemptHash = await hashPassword(password, saltHex);
  return attemptHash === storedHash;
}
__name(verifyPassword, "verifyPassword");
var generateId = /* @__PURE__ */ __name((prefix) => `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`, "generateId");
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("=").map(decodeURIComponent))
  );
}
__name(parseCookies, "parseCookies");
var worker_default = {
  async fetch(request, env, ctx) {
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
      if (url.pathname === "/api/auth/signup" && request.method === "POST") {
        const { name, email, password } = await request.json();
        if (!name || !email || !password || password.length < 8) {
          return errorResponse("Invalid input. Password must be at least 8 characters.", 400);
        }
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) return errorResponse("Email already in use", 400);
        const hashedPassword = await hashPassword(password);
        const userId = generateId("usr");
        await env.DB.prepare(
          "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
        ).bind(userId, name, email, hashedPassword).run();
        const sessionId = generateId("sess");
        await env.DB.prepare(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
        ).bind(sessionId, userId).run();
        const cookie = `session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
        return jsonResponse({ success: true, data: { id: userId, name, email } }, 200, { "Set-Cookie": cookie });
      }
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const { email, password } = await request.json();
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (!user) return errorResponse("Invalid credentials", 401);
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) return errorResponse("Invalid credentials", 401);
        const sessionId = generateId("sess");
        await env.DB.prepare(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
        ).bind(sessionId, user.id).run();
        const cookie = `session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
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
          } catch (e) {
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
          return jsonResponse({ success: true, data: { status: "completed" } });
        } catch (auditError) {
          console.error("Audit failed:", auditError);
          await env.DB.prepare(
            "UPDATE audits SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(auditId).run();
          return errorResponse("Audit failed to complete: " + (auditError.message || "Unknown error"), 500);
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
      return errorResponse("Not found", 404);
    } catch (err) {
      console.error(err);
      return errorResponse(err.message || "Internal Server Error");
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-7F7CWA/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-7F7CWA/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
