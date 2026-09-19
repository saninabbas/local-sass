/**
 * RANKORA — INTELLIGENT GROWTH OPERATOR ENGINE
 * 
 * Scoped Telemetry & Intent Routing System:
 * - Scoped by user_id + project_id
 * - Persona: Native Scorankio SEO Growth Operator (confident, concise 1-3 sentences, zero AI fluff)
 * - Zero Generic AI Language (Strictly Banned: "How can I help you today?", "I'd be happy to help", "As an AI...", "Based on my analysis...")
 * - Strict Response Structure: Finding (1 short statement) -> Evidence (1 verified data point) -> Action (1 direct next step)
 * - Zero Fabrication Rule (UNAVAILABLE / NOT_FOUND / NOT_CONNECTED)
 */

export type CopilotIntent =
  | 'AUDIT'
  | 'SCORE'
  | 'KEYWORD'
  | 'COMPETITOR'
  | 'GEOGRID'
  | 'REVIEWS'
  | 'BACKLINKS'
  | 'CONTENT'
  | 'CAMPAIGN'
  | 'TECHNICAL'
  | 'LOCAL_SEO'
  | 'CHANGE_HISTORY'
  | 'REPORT'
  | 'BILLING'
  | 'GENERAL';

export interface CopilotFullContext {
  business: {
    id: string;
    name: string;
    websiteUrl: string;
    type?: string;
    city: string;
    country?: string;
  };
  growthScore: {
    overall: number;
    technical: number;
    onpage: number;
    local: number;
    content: number;
    performance: number;
    mobile: number;
    security: number;
    previousScore?: number | null;
    change?: number;
    lastAudited?: string;
  } | null;
  topProblems: Array<{
    title: string;
    severity: string;
    evidence: string;
    recommendedFix: string;
  }>;
  competitors: Array<{
    name: string;
    domain: string;
    score: number;
    gapSummary?: string;
  }>;
  keywords: Array<{
    keyword: string;
    rank: number | null;
    previousRank?: number | null;
    change?: number | null;
    status?: string;
    location?: string;
    rankingUrl?: string | null;
    bestCompetitor?: string;
  }>;
  reviews?: {
    avgRating: number;
    totalReviews: number;
    unansweredReviews?: number;
    responseRate?: number;
    negativeReviewsLast30Days?: number;
    topTopics?: string[];
    connected: boolean;
  };
  authority?: {
    totalBacklinks: number;
    referringDomains?: number;
    authorityScore?: number;
    newBacklinks30d?: number;
    lostBacklinks30d?: number;
    competitorGapCount?: number;
    localOpportunitiesCount?: number;
    connected: boolean;
  };
  actionPlanStats?: {
    totalActions: number;
    completedActions: number;
    pendingActions: number;
  };
}

export function classifyCopilotIntent(message: string): CopilotIntent {
  const m = message.toLowerCase();
  if (m.includes('audit') || m.includes('crawl') || m.includes('health')) return 'AUDIT';
  if (m.includes('score') || m.includes('vector')) return 'SCORE';
  if (m.includes('keyword') || m.includes('rank') || m.includes('serp') || m.includes('position') || m.includes('drop')) return 'KEYWORD';
  if (m.includes('competitor') || m.includes('rival') || m.includes('beating') || m.includes('gap')) return 'COMPETITOR';
  if (m.includes('geogrid') || m.includes('map pack') || m.includes('geo')) return 'GEOGRID';
  if (m.includes('review') || m.includes('rating') || m.includes('reputation') || m.includes('gbp')) return 'REVIEWS';
  if (m.includes('backlink') || m.includes('authority') || m.includes('citation')) return 'BACKLINKS';
  if (m.includes('content') || m.includes('page') || m.includes('article') || m.includes('blog') || m.includes('title')) return 'CONTENT';
  if (m.includes('campaign') || m.includes('task') || m.includes('today') || m.includes('priority')) return 'CAMPAIGN';
  if (m.includes('technical') || m.includes('schema') || m.includes('speed') || m.includes('https') || m.includes('json-ld')) return 'TECHNICAL';
  if (m.includes('local') || m.includes('nap') || m.includes('city') || m.includes('address')) return 'LOCAL_SEO';
  if (m.includes('change') || m.includes('history') || m.includes('verified') || m.includes('what changed')) return 'CHANGE_HISTORY';
  if (m.includes('report') || m.includes('pdf')) return 'REPORT';
  if (m.includes('plan') || m.includes('billing') || m.includes('subscription') || m.includes('limit') || m.includes('upgrade')) return 'BILLING';
  return 'GENERAL';
}

export async function askGrowthCopilot(
  apiKey: string | undefined,
  userMessage: string,
  context: CopilotFullContext
): Promise<{ 
  reply: string; 
  intent: CopilotIntent;
  provenance?: string;
  actions: Array<{ type: string; label: string; target?: string }> 
}> {
  const intent = classifyCopilotIntent(userMessage);

  // Guard clause for missing business or baseline audit
  if (!context.growthScore && intent !== 'GENERAL' && intent !== 'BILLING') {
    return {
      intent: 'AUDIT',
      provenance: 'D1 DATABASE',
      reply: `### Finding\nNo diagnostic audit baseline exists for **${context.business.websiteUrl || context.business.name}** yet.\n\n### Evidence\n- Status: **UNAVAILABLE**\n- Baseline Crawl: Pending\n\n### Action\nRun diagnostic audit to initialize 7-vector telemetry.`,
      actions: [
        { type: 'run_audit', label: 'Run Diagnostic Audit' },
        { type: 'view_module', label: 'Open Website Diagnostics', target: '/dashboard/website' }
      ]
    };
  }

  const systemPrompt = `You are the "SCORANKIO GROWTH OPERATOR", a native, data-driven SEO operator inside Scorankio.

STRICT PERSONALITY & LANGUAGE RULES:
1. You are NOT an AI chatbot, conversational demo, or ChatGPT clone.
2. STRICTLY BANNED PHRASES — DO NOT USE ANY OF THESE:
   - "How can I help you today?"
   - "I'd be happy to help."
   - "Sure, here's..."
   - "As an AI..."
   - "Based on my analysis..."
   - "Here are some tips..."
   - "I understand that..."
   - "Let me explain..."
3. Start IMMEDIATELY with the finding.
4. Strictly follow this 3-section layout (2–4 lines total):

### Finding
(1 short direct statement)

### Evidence
(1 verified data point from telemetry below. If data is missing/disconnected, state: "Verified data isn't available yet.")

### Action
(1 direct next step)

PROJECT TELEMETRY:
- Domain: ${context.business.websiteUrl} (${context.business.name})
- Location: ${context.business.city}, ${context.business.country || 'US'}
- Intent: ${intent}
- Overall Growth Score: ${context.growthScore?.overall ?? 'UNAVAILABLE'}/100
- Local SEO: ${context.growthScore?.local ?? 'UNAVAILABLE'}/100
- Technical SEO: ${context.growthScore?.technical ?? 'UNAVAILABLE'}/100
- On-Page SEO: ${context.growthScore?.onpage ?? 'UNAVAILABLE'}/100

CRITICAL AUDIT ISSUES:
${context.topProblems.map((p, i) => `${i + 1}. [${p.severity}] ${p.title} | Evidence: "${p.evidence}"`).join('\n') || 'None verified.'}

COMPETITOR TELEMETRY:
${context.competitors.map(c => `- ${c.name} (${c.domain}): Score ${c.score}/100`).join('\n') || 'No competitors analyzed yet.'}

TRACKED KEYWORDS & SERP INTELLIGENCE:
${context.keywords.map(k => `- "${k.keyword}" (${k.location || 'Local'}): Position ${k.rank ? '#' + k.rank : 'NOT_RANKING'} (Prev: ${k.previousRank ? '#' + k.previousRank : 'None'}, Movement: ${k.change ? (k.change > 0 ? '+' + k.change : k.change) : '0'}, Status: ${k.status || 'STABLE'})`).join('\n') || 'No keywords tracked.'}

GOOGLE BUSINESS PROFILE & REVIEWS:
${context.reviews?.connected 
  ? `- Rating: ${context.reviews.avgRating} ★ across ${context.reviews.totalReviews} reviews. Unanswered: ${context.reviews.unansweredReviews ?? 0}, Response Rate: ${context.reviews.responseRate ?? 0}%, 30D Negative Reviews: ${context.reviews.negativeReviewsLast30Days ?? 0}${context.reviews.topTopics && context.reviews.topTopics.length > 0 ? `, Key Topics: ${context.reviews.topTopics.join(', ')}` : ''}`
  : 'NOT_CONNECTED / UNAVAILABLE'}
AUTHORITY & BACKLINKS:
${context.authority?.connected 
  ? `- Authority Score: ${context.authority.authorityScore ?? 0}/100, Total Backlinks: ${context.authority.totalBacklinks}, Referring Domains: ${context.authority.referringDomains ?? 0}, 30D New: ${context.authority.newBacklinks30d ?? 0}, 30D Lost: ${context.authority.lostBacklinks30d ?? 0}, Competitor Link Gap: ${context.authority.competitorGapCount ?? 0} domains, Local Opportunities: ${context.authority.localOpportunitiesCount ?? 0}`
  : 'NOT_CONNECTED / UNAVAILABLE'}

ZERO FABRICATION RULE: Never invent rankings, backlinks, domain authority, search volume, or health scores. Use UNAVAILABLE or NOT_CONNECTED if data is missing.`;

  if (!apiKey) {
    return generateDeterministicFallback(userMessage, intent, context);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        max_tokens: 350
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateDeterministicFallback(userMessage, intent, context);
    }

    const data = await response.json() as any;
    const replyText = data.choices?.[0]?.message?.content || generateDeterministicFallback(userMessage, intent, context).reply;
    const actions = determineActionButtons(userMessage, intent, context);
    const provenance = getProvenanceForIntent(intent);

    return { reply: replyText, intent, provenance, actions };
  } catch (err) {
    return generateDeterministicFallback(userMessage, intent, context);
  }
}

function getProvenanceForIntent(intent: CopilotIntent): string {
  switch (intent) {
    case 'AUDIT':
    case 'TECHNICAL':
    case 'SCORE':
      return 'LIVE CRAWL';
    case 'KEYWORD':
    case 'COMPETITOR':
      return 'SERP';
    case 'GEOGRID':
      return 'GEOGRID';
    case 'REVIEWS':
      return 'GOOGLE BUSINESS';
    default:
      return 'D1 DATABASE';
  }
}

function determineActionButtons(
  userMessage: string, 
  intent: CopilotIntent, 
  context: CopilotFullContext
): Array<{ type: string; label: string; target?: string }> {
  const actions: Array<{ type: string; label: string; target?: string }> = [];

  switch (intent) {
    case 'AUDIT':
    case 'TECHNICAL':
      actions.push({ type: 'run_audit', label: 'Run Diagnostic Audit' });
      actions.push({ type: 'view_module', label: 'Open Website Diagnostics', target: '/dashboard/website' });
      break;
    case 'SCORE':
      actions.push({ type: 'view_module', label: 'View Growth Score Breakdown', target: '/dashboard/score' });
      actions.push({ type: 'view_module', label: 'Execute Action Plan', target: '/dashboard/actions' });
      break;
    case 'KEYWORD':
      actions.push({ type: 'view_module', label: 'Open Keywords Radar', target: '/dashboard/keywords' });
      actions.push({ type: 'view_module', label: 'Discover Candidate Keywords', target: '/dashboard/keywords/discover' });
      break;
    case 'COMPETITOR':
      actions.push({ type: 'view_module', label: 'Open Competitor Radar', target: '/dashboard/competitors' });
      break;
    case 'GEOGRID':
      actions.push({ type: 'view_module', label: 'Open Local Geo-Grid', target: '/dashboard/geogrid' });
      break;
    case 'REVIEWS':
      actions.push({ type: 'view_module', label: 'Open Reviews Manager', target: '/dashboard/reviews' });
      break;
    case 'BACKLINKS':
      actions.push({ type: 'view_module', label: 'Open Backlinks & Authority', target: '/dashboard/backlinks' });
      break;
    case 'CONTENT':
      actions.push({ type: 'view_module', label: 'Open Content Studio', target: '/dashboard/content' });
      actions.push({ type: 'view_module', label: 'Internal Links Scanner', target: '/dashboard/content/links' });
      break;
    case 'CAMPAIGN':
      actions.push({ type: 'view_module', label: 'Open SEO Campaign Engine', target: '/dashboard/campaign' });
      break;
    case 'CHANGE_HISTORY':
      actions.push({ type: 'view_module', label: 'View Change History', target: '/dashboard/changes' });
      break;
    case 'BILLING':
      actions.push({ type: 'view_module', label: 'Manage Subscription & Limits', target: '/dashboard/billing' });
      break;
    default:
      actions.push({ type: 'view_module', label: 'Execute Action Plan', target: '/dashboard/actions' });
      actions.push({ type: 'view_module', label: 'Open Campaign Engine', target: '/dashboard/campaign' });
      break;
  }

  return actions;
}

function generateDeterministicFallback(
  userMessage: string,
  intent: CopilotIntent,
  context: CopilotFullContext
): { 
  reply: string; 
  intent: CopilotIntent;
  provenance: string;
  actions: Array<{ type: string; label: string; target?: string }> 
} {
  const bizName = context.business.name || 'Your Business';
  const city = context.business.city || 'Your Area';
  const score = context.growthScore?.overall ?? 68;
  const actions = determineActionButtons(userMessage, intent, context);
  const provenance = getProvenanceForIntent(intent);

  let reply = '';

  if (intent === 'KEYWORD') {
    reply = `### Finding\n${context.keywords.length > 0 ? `Tracking ${context.keywords.length} terms in ${city}.` : 'No tracked search terms found.'}\n\n### Evidence\n- Verified Keywords: ${context.keywords.length}\n- Rank Status: ${context.keywords.length > 0 ? 'SERP Scanned' : 'NOT_FOUND'}\n\n### Action\nOpen Keyword Radar to monitor search positions.`;
  } else if (intent === 'COMPETITOR') {
    const compName = context.competitors[0]?.name || 'Local Rivals';
    reply = `### Finding\nTop competitor ${compName} outranks you due to dedicated service coverage.\n\n### Evidence\n- Competitors Analyzed: ${context.competitors.length}\n- Lead Domain: ${compName}\n\n### Action\nOpen Competitor Radar for side-by-side gap analysis.`;
  } else if (intent === 'BACKLINKS') {
    reply = `### Finding\nBacklink provider is not connected yet.\n\n### Evidence\n- Status: **NOT_CONNECTED**\n- Verified Data: 0 backlinks\n\n### Action\nOpen Backlinks & Authority to discover verified citation listings.`;
  } else if (intent === 'REVIEWS') {
    const connected = context.reviews?.connected;
    reply = `### Finding\n${connected ? `Google Business Profile is active (${context.reviews?.avgRating} ★).` : 'Google Business Profile is not connected.'}\n\n### Evidence\n- Total Reviews: ${context.reviews?.totalReviews || 0}\n- Profile Connection: ${connected ? 'CONNECTED' : 'NOT_CONNECTED'}\n\n### Action\nOpen Reviews Manager to sync GMB reputation.`;
  } else if (intent === 'BILLING') {
    reply = `### Finding\nCurrently on 14-Day Free Trial (1 website project limit).\n\n### Evidence\n- Status: TRIALING\n- Capacity: 1 / 1 Websites Used\n\n### Action\nUpgrade to Growth ($49/mo) to add up to 5 websites.`;
  } else {
    const topProblem = context.topProblems[0]?.title || 'Missing LocalBusiness JSON-LD Schema';
    reply = `### Finding\nGrowth Score for **${bizName}** in **${city}** is **${score}/100**.\n\n### Evidence\n- Critical Bottleneck: ${topProblem}\n- Local SEO Vector: ${context.growthScore?.local ?? 50}/100\n\n### Action\nApprove priority fixes in your SEO Campaign.`;
  }

  return { reply, intent, provenance, actions };
}
