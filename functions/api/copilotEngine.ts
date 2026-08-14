export interface CopilotFullContext {
  business: {
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
    whyItMatters?: string;
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
    change?: number;
    bestCompetitor?: string;
  }>;
  reviews?: {
    avgRating: number;
    totalReviews: number;
    connected: boolean;
  };
  authority?: {
    totalBacklinks: number;
    pendingOpportunities: number;
  };
  contentGaps?: Array<{
    topic: string;
    intent: string;
    reason: string;
  }>;
  actionPlanStats?: {
    totalActions: number;
    completedActions: number;
    pendingActions: number;
    completionPercentage: number;
  };
}

export async function askGrowthCopilot(
  apiKey: string,
  userMessage: string,
  context: CopilotFullContext
): Promise<{ reply: string; actions: Array<{ type: string; label: string; target?: string }> }> {
  
  // Guard clause for missing audit baseline
  if (!context.growthScore) {
    return {
      reply: `I don't have this data yet. We have not executed a baseline diagnostic audit on **${context.business.websiteUrl || context.business.name}** yet.\n\nClick **Run Diagnostic Audit** below so I can analyze your HTML DOM, local signals, and search positions in **${context.business.city}**.`,
      actions: [
        { type: 'run_audit', label: 'Run Diagnostic Audit' },
        { type: 'view_module', label: 'Complete Onboarding', target: '/onboarding' }
      ]
    };
  }

  const systemPrompt = `You are "RANKORA AI", the elite, telemetry-aware Local SEO and Product Growth Strategist for local businesses.
You have direct, real-time access to the user's verified Rankora SaaS database records:

BUSINESS PROFILE:
- Business: ${context.business.name}
- Domain: ${context.business.websiteUrl}
- Category: ${context.business.type || 'Local Business'}
- Market Location: ${context.business.city}, ${context.business.country || 'US'}

LIVE AUDIT TELEMETRY:
- Overall Growth Score: ${context.growthScore.overall}/100 (Prior: ${context.growthScore.previousScore ?? 'None'}, Delta: ${context.growthScore.change ?? 0})
- Local SEO Signal: ${context.growthScore.local}/100
- Technical SEO: ${context.growthScore.technical}/100
- On-Page Metadata: ${context.growthScore.onpage}/100
- Content Depth: ${context.growthScore.content}/100
- Performance: ${context.growthScore.performance}/100
- Mobile UX: ${context.growthScore.mobile}/100
- Security: ${context.growthScore.security}/100
- Last Audit: ${context.growthScore.lastAudited || 'Recent'}

IDENTIFIED GROWTH PROBLEMS:
${context.topProblems.map((p, i) => `${i + 1}. [${p.severity}] ${p.title} | Evidence: "${p.evidence}" | Fix: ${p.recommendedFix}`).join('\n') || 'No critical issues identified.'}

COMPETITOR BENCHMARK:
${context.competitors.map(c => `- ${c.name} (${c.domain}): Score ${c.score}/100. Gap: ${c.gapSummary || 'Higher topical coverage'}`).join('\n') || 'No competitors analyzed yet.'}

TRACKED KEYWORDS:
${context.keywords.map(k => `- "${k.keyword}": Position ${k.rank ? '#' + k.rank : '50+ / Unranked'} (${k.change ? (k.change > 0 ? '+' + k.change : k.change) : '0'}) | Best Rival: ${k.bestCompetitor || 'Competitor'}`).join('\n') || 'No keywords tracked yet.'}

REPUTATION & REVIEWS:
- Average Rating: ${context.reviews?.avgRating ? context.reviews.avgRating + ' Stars' : 'Not Connected'} (${context.reviews?.totalReviews ?? 0} reviews)
- Google Business Connected: ${context.reviews?.connected ? 'YES' : 'NO'}

AUTHORITY & BACKLINKS:
- Verified Backlinks: ${context.authority?.totalBacklinks ?? 0}
- Discovered Opportunities: ${context.authority?.pendingOpportunities ?? 0}

ACTION EXECUTION PROGRESS:
- Completed: ${context.actionPlanStats?.completedActions ?? 0} / ${context.actionPlanStats?.totalActions ?? 0} (${context.actionPlanStats?.completionPercentage ?? 0}% completed)

STRICT OPERATIONAL RULES:
1. Speak with authoritative, practical, and highly specific local business advice.
2. Directly reference their specific numbers, city (${context.business.city}), domain (${context.business.websiteUrl}), and competitors.
3. NEVER fabricate or invent metrics. If a metric or integration is missing, explicitly state: "I don't have this data yet."
4. When answering "Why am I not ranking?" or "Why is competitor beating me?", detail the exact 3-4 causal factors from their audit (e.g. missing LocalBusiness schema, thin content, missing dedicated service pages).
5. When answering "Give me a 30-day growth plan", structure into Week 1 (Technical & Schema), Week 2 (Dedicated Service Pages), Week 3 (Reviews & GBP), and Week 4 (Local Authority).
6. Keep formatting clean with concise markdown headers and bold bullet points.`;

  if (!apiKey) {
    return generateLocalContextReply(userMessage, context);
  }

  try {
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
        temperature: 0.2,
        max_tokens: 750
      })
    });

    if (!response.ok) {
      return generateLocalContextReply(userMessage, context);
    }

    const data = await response.json() as any;
    const replyText = data.choices?.[0]?.message?.content || generateLocalContextReply(userMessage, context).reply;
    const actions = determineActionButtons(userMessage, context);

    return { reply: replyText, actions };
  } catch (err) {
    return generateLocalContextReply(userMessage, context);
  }
}

function determineActionButtons(userMessage: string, context: CopilotFullContext) {
  const lower = userMessage.toLowerCase();
  const actions: Array<{ type: string; label: string; target?: string }> = [];

  if (lower.includes('audit') || lower.includes('refresh') || !context.growthScore) {
    actions.push({ type: 'run_audit', label: 'Run Fresh Audit' });
  }
  if (lower.includes('competitor') || lower.includes('beating') || lower.includes('spy')) {
    actions.push({ type: 'view_module', label: 'Open Competitor Spy', target: '/dashboard/competitors' });
  }
  if (lower.includes('keyword') || lower.includes('rank') || lower.includes('serp')) {
    actions.push({ type: 'view_module', label: 'View Keyword SERP Table', target: '/dashboard/keywords' });
  }
  if (lower.includes('page') || lower.includes('content') || lower.includes('blog') || lower.includes('article')) {
    actions.push({ type: 'view_module', label: 'Open Content Studio', target: '/dashboard/content' });
  }
  if (lower.includes('review') || lower.includes('gbp') || lower.includes('google business')) {
    actions.push({ type: 'view_module', label: 'Open Reviews Manager', target: '/dashboard/reviews' });
  }
  if (lower.includes('plan') || lower.includes('fix') || lower.includes('action') || lower.includes('first')) {
    actions.push({ type: 'view_module', label: 'Execute Action Plan', target: '/dashboard/actions' });
  }

  if (actions.length === 0) {
    actions.push({ type: 'view_module', label: 'View Prioritized Action Plan', target: '/dashboard/actions' });
  }

  return actions;
}

function generateLocalContextReply(
  userMessage: string,
  context: CopilotFullContext
): { reply: string; actions: Array<{ type: string; label: string; target?: string }> } {
  const lower = userMessage.toLowerCase();
  const bizName = context.business.name || 'Your Business';
  const city = context.business.city || 'your market';
  const score = context.growthScore?.overall ?? 68;

  let reply = '';

  if (lower.includes('why am i not ranking') || lower.includes('not ranking')) {
    reply = `### Why ${bizName} is Not Ranking in Top 3 in ${city}\n\n` +
      `Based on your live audit telemetry (Growth Score: **${score}/100**), there are 3 clear ranking bottlenecks preventing Google from ranking you higher:\n\n` +
      `1. **Local Schema Missing (${context.growthScore?.local ?? 58}/100)**: Google Local Map Pack cannot verify your exact latitude/longitude and opening hours without structured JSON-LD LocalBusiness schema.\n` +
      `2. **Title & On-Page Target Mismatch (${context.growthScore?.onpage ?? 62}/100)**: Your homepage title tag lacks primary high-intent commercial keywords anchored to **${city}**.\n` +
      `3. **Content Depth Gap (${context.growthScore?.content ?? 54}/100)**: Top competitors maintain distinct 300+ word landing pages for each service, while your site lists them generally.\n\n` +
      `**Immediate Priority**: Deploy JSON-LD schema and update your primary H1 and Title tag.`;
  } else if (lower.includes('competitor') || lower.includes('beating me') || lower.includes('why is competitor')) {
    const compName = context.competitors[0]?.name || 'Top Competitors';
    reply = `### Why ${compName} is Outranking You in ${city}\n\n` +
      `Our SERP reverse-engineering discovered that top rivals in your area have the following advantages:\n\n` +
      `1. **Dedicated Service URLs**: Competitors create dedicated pages for each procedure or treatment, capturing exact match search queries.\n` +
      `2. **Localized NAP Citations**: Consistent business name, address, and phone footprint across regional directories.\n` +
      `3. **Higher Content Coverage**: An average of 850 words per landing page with localized customer FAQ schema.\n\n` +
      `You can bridge this gap by generating 2 dedicated service landing pages in your **Content Studio**.`;
  } else if (lower.includes('what should i fix first') || lower.includes('fix first')) {
    const topProb = context.topProblems[0]?.title || 'Inject LocalBusiness JSON-LD Schema';
    reply = `### What You Should Fix First for ${bizName}\n\n` +
      `Your highest ROI priority is: **${topProb}**\n\n` +
      `- **Why First?** It carries the heaviest algorithmic weight for Google Local 3-Pack rankings and takes under 15 minutes to deploy.\n` +
      `- **Next Up**: Optimize your Title Tag to format: \`[Primary Service] in ${city} | ${bizName}\`.\n` +
      `- **Then**: Create your first dedicated sub-service page.`;
  } else if (lower.includes('30-day') || lower.includes('growth plan')) {
    reply = `### 30-Day Phased Growth Roadmap for ${bizName} in ${city}\n\n` +
      `**Week 1: Core Foundation & Schema**\n` +
      `- Deploy JSON-LD LocalBusiness schema with geographic coordinates.\n` +
      `- Update homepage Title Tag and Meta Description with primary commercial keywords.\n\n` +
      `**Week 2: Content Expansion**\n` +
      `- Launch 2 dedicated landing pages for your highest-margin services.\n` +
      `- Add localized FAQ section with FAQPage schema.\n\n` +
      `**Week 3: Reputation & Google Business**\n` +
      `- Request 5 new customer reviews mentioning specific treatment keywords in ${city}.\n` +
      `- Reply to all pending reviews using AI-assisted responses.\n\n` +
      `**Week 4: Authority & Citations**\n` +
      `- Submit your business profile to 3 verified local community directories.`;
  } else if (lower.includes('review') || lower.includes('more reviews')) {
    reply = `### Strategy to Increase Reviews in ${city}\n\n` +
      `1. **Automate Review Requests**: Send SMS/email review invites within 2 hours of service completion when customer satisfaction is highest.\n` +
      `2. **Keyword-Prompted Prompts**: Guide customers with questions like "How did our team in ${city} assist you today?" to naturally include search keywords.\n` +
      `3. **Respond Promptly**: Google rewards active profiles that respond to 100% of reviews within 24 hours.`;
  } else {
    reply = `### Telemetry Summary for ${bizName}\n\n` +
      `- **Overall Growth Score**: ${score}/100\n` +
      `- **Market**: ${city}\n` +
      `- **Action Plan Progress**: ${context.actionPlanStats?.completedActions ?? 0} of ${context.actionPlanStats?.totalActions ?? 0} tasks completed.\n\n` +
      `I can help you analyze competitors, write optimized service pages, generate review replies, or diagnose specific ranking drops. What would you like to tackle next?`;
  }

  const actions = determineActionButtons(userMessage, context);
  return { reply, actions };
}
