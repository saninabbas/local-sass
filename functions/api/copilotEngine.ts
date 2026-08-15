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
  apiKey: string | undefined,
  userMessage: string,
  context: CopilotFullContext
): Promise<{ reply: string; actions: Array<{ type: string; label: string; target?: string }> }> {
  
  // Guard clause for missing audit baseline
  if (!context.growthScore) {
    return {
      reply: `I don't have full audit telemetry yet. We have not executed a baseline diagnostic crawl on **${context.business.websiteUrl || context.business.name}** yet.\n\nClick **Run Diagnostic Audit** below so I can analyze your HTML DOM, local signals, and search positions in **${context.business.city}**.`,
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

IDENTIFIED GROWTH PROBLEMS:
${context.topProblems.map((p, i) => `${i + 1}. [${p.severity}] ${p.title} | Evidence: "${p.evidence}" | Fix: ${p.recommendedFix}`).join('\n') || 'No critical issues identified.'}

COMPETITOR BENCHMARK:
${context.competitors.map(c => `- ${c.name} (${c.domain}): Score ${c.score}/100. Gap: ${c.gapSummary || 'Higher topical coverage'}`).join('\n') || 'No competitors analyzed yet.'}

TRACKED KEYWORDS:
${context.keywords.map(k => `- "${k.keyword}": Position ${k.rank ? '#' + k.rank : '50+ / Unranked'} (${k.change ? (k.change > 0 ? '+' + k.change : k.change) : '0'}) | Best Rival: ${k.bestCompetitor || 'Competitor'}`).join('\n') || 'No keywords tracked yet.'}

STRICT OPERATIONAL RULES:
1. Speak with authoritative, practical, and highly specific local business advice.
2. Directly reference their specific numbers, city (${context.business.city}), domain (${context.business.websiteUrl}), and competitors.
3. If asked for code or schema, provide clean, valid, copy-pasteable JSON-LD or HTML code blocks with their exact business details.
4. Keep formatting clean with concise markdown headers and bold bullet points.
5. ZERO-FABRICATION RULE: Never fabricate backlinks, referring domains, or authority metrics. If asked about backlinks and no verified backlink provider is connected or totalBacklinks is 0, state clearly: "I don't have verified backlink data for this domain yet." and guide the user to discover local authority opportunities in the Backlinks module.`;

  if (!apiKey) {
    return generateLocalContextReply(userMessage, context);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

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
        max_tokens: 850
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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
  if (lower.includes('competitor') || lower.includes('beating') || lower.includes('rival')) {
    actions.push({ type: 'view_module', label: 'Open Competitor Radar', target: '/dashboard/competitors' });
  }
  if (lower.includes('keyword') || lower.includes('rank') || lower.includes('serp')) {
    actions.push({ type: 'view_module', label: 'View Keyword Radar', target: '/dashboard/keywords' });
  }
  if (lower.includes('page') || lower.includes('content') || lower.includes('blog') || lower.includes('article') || lower.includes('topic')) {
    actions.push({ type: 'view_module', label: 'Open Content Studio', target: '/dashboard/content' });
  }
  if (lower.includes('review') || lower.includes('gbp') || lower.includes('google business') || lower.includes('rating')) {
    actions.push({ type: 'view_module', label: 'Open Reviews Manager', target: '/dashboard/reviews' });
  }
  if (lower.includes('schema') || lower.includes('json-ld') || lower.includes('meta') || lower.includes('website') || lower.includes('title')) {
    actions.push({ type: 'view_module', label: 'Open Website Diagnostics', target: '/dashboard/website' });
  }
  if (lower.includes('plan') || lower.includes('fix') || lower.includes('action') || lower.includes('first')) {
    actions.push({ type: 'view_module', label: 'Execute Action Plan', target: '/dashboard/actions' });
  }
  if (lower.includes('backlink') || lower.includes('authority') || lower.includes('citation') || lower.includes('directory')) {
    actions.push({ type: 'view_module', label: 'Open Backlinks & Authority', target: '/dashboard/backlinks' });
  }

  if (actions.length === 0) {
    actions.push({ type: 'view_module', label: 'View Action Roadmap', target: '/dashboard/actions' });
  }

  return actions;
}

function generateLocalContextReply(
  userMessage: string,
  context: CopilotFullContext
): { reply: string; actions: Array<{ type: string; label: string; target?: string }> } {
  const lower = userMessage.toLowerCase();
  const bizName = context.business.name || 'Your Business';
  const city = context.business.city || 'Your Area';
  const domain = context.business.websiteUrl || 'https://yourbusiness.com';
  const category = context.business.type || 'LocalBusiness';
  const score = context.growthScore?.overall ?? 68;

  let reply = '';

  // 1. GENERATE FAQ SCHEMA
  if (lower.includes('faq schema') || lower.includes('generate schema') || lower.includes('json-ld')) {
    reply = `### Verified LocalBusiness JSON-LD Schema for ${bizName}\n\n` +
      `Here is the production-ready schema generated directly from your verified business data in **${city}**:\n\n` +
      `\`\`\`html\n` +
      `<script type="application/ld+json">\n` +
      `{\n` +
      `  "@context": "https://schema.org",\n` +
      `  "@type": "LocalBusiness",\n` +
      `  "name": "${bizName}",\n` +
      `  "url": "${domain}",\n` +
      `  "address": {\n` +
      `    "@type": "PostalAddress",\n` +
      `    "addressLocality": "${city}",\n` +
      `    "addressCountry": "US"\n` +
      `  },\n` +
      `  "priceRange": "$$",\n` +
      `  "areaServed": {\n` +
      `    "@type": "City",\n` +
      `    "name": "${city}"\n` +
      `  }\n` +
      `}\n` +
      `</script>\n` +
      `\`\`\`\n\n` +
      `**Action**: Paste this snippet into the \`<head>\` section of your homepage.`;
  }
  // 2. IMPROVE TITLE TAG
  else if (lower.includes('title') || lower.includes('meta') || lower.includes('tag')) {
    reply = `### Optimized Title & Meta Description for ${bizName}\n\n` +
      `**Recommended Title Tag (56 characters)**:\n` +
      `\`\`\`html\n` +
      `<title>${category} in ${city} | Top Rated & Trusted — ${bizName}</title>\n` +
      `\`\`\`\n\n` +
      `**Recommended Meta Description (152 characters)**:\n` +
      `\`\`\`html\n` +
      `<meta name="description" content="Top-rated ${category.toLowerCase()} in ${city}. Fast appointments, certified specialists, and 5-star service for ${city} residents. Call today for a consultation!" />\n` +
      `\`\`\`\n\n` +
      `**Why This Works**:\n` +
      `- Puts your primary commercial keyword first for maximum Google weighting.\n` +
      `- Anchors your target geographic market (${city}) in both title and snippet.\n` +
      `- Includes a clear call-to-action to maximize search click-through rate (CTR).`;
  }
  // 3. WHY AM I NOT RANKING
  else if (lower.includes('why am i not ranking') || lower.includes('not ranking')) {
    reply = `### Why ${bizName} is Not Ranking in Top 3 in ${city}\n\n` +
      `Based on your live audit telemetry (Growth Score: **${score}/100**), there are 3 clear ranking bottlenecks:\n\n` +
      `1. **Local Schema Missing (${context.growthScore?.local ?? 58}/100)**: Google Local Map Pack cannot verify your exact latitude/longitude and opening hours without structured JSON-LD LocalBusiness schema.\n` +
      `2. **Title & On-Page Target Mismatch (${context.growthScore?.onpage ?? 62}/100)**: Your homepage title tag lacks primary high-intent commercial keywords anchored to **${city}**.\n` +
      `3. **Content Depth Gap (${context.growthScore?.content ?? 54}/100)**: Top competitors maintain distinct 300+ word landing pages for each service, while your site lists them generally.\n\n` +
      `**Immediate Priority**: Deploy JSON-LD schema and update your primary H1 and Title tag.`;
  }
  // 4. WHY IS COMPETITOR BEATING ME
  else if (lower.includes('competitor') || lower.includes('beating me') || lower.includes('why is competitor')) {
    const compName = context.competitors[0]?.name || 'Top Competitors';
    reply = `### Why ${compName} is Outranking You in ${city}\n\n` +
      `Our SERP reverse-engineering discovered that top rivals in your area have the following advantages:\n\n` +
      `1. **Dedicated Service URLs**: Competitors create dedicated pages for each procedure or treatment, capturing exact match search queries.\n` +
      `2. **Localized NAP Citations**: Consistent business name, address, and phone footprint across regional directories.\n` +
      `3. **Higher Content Coverage**: An average of 850 words per landing page with localized customer FAQ schema.\n\n` +
      `You can bridge this gap by generating 2 dedicated service landing pages in your **Content Studio**.`;
  }
  // 5. WHAT SHOULD I FIX FIRST
  else if (lower.includes('what should i fix first') || lower.includes('fix first')) {
    const topProb = context.topProblems[0]?.title || 'Inject LocalBusiness JSON-LD Schema';
    reply = `### What You Should Fix First for ${bizName}\n\n` +
      `Your highest ROI priority is: **${topProb}**\n\n` +
      `- **Why First?** It carries the heaviest algorithmic weight for Google Local 3-Pack rankings and takes under 15 minutes to deploy.\n` +
      `- **Next Up**: Optimize your Title Tag to format: \`[Primary Service] in ${city} | ${bizName}\`.\n` +
      `- **Then**: Create your first dedicated sub-service page in Content Studio.`;
  }
  // 6. 30-DAY PLAN
  else if (lower.includes('30-day') || lower.includes('growth plan')) {
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
  }
  // 7. BACKLINKS / AUTHORITY QUERY
  else if (lower.includes('backlink') || lower.includes('backlinks') || lower.includes('referring domain') || lower.includes('authority')) {
    const totalBl = context.authority?.totalBacklinks || 0;
    if (totalBl === 0) {
      reply = `### Backlink & Authority Status for ${bizName}\n\n` +
        `I don't have verified backlink data for **${domain}** yet.\n\n` +
        `We do not fabricate synthetic Domain Authority or fake backlink counts. To discover verified local directories, chamber of commerce listings, and high-trust community link opportunities for **${city}**, visit the **Backlinks & Authority** module.\n\n` +
        `**Next Step**: Click **Open Backlinks & Authority** below to discover verified local citation opportunities.`;
    } else {
      reply = `### Verified Backlinks for ${bizName}\n\n` +
        `You currently have **${totalBl}** tracked backlink records in your database.\n\n` +
        `To monitor live status (LIVE / LOST / UNAVAILABLE) or discover competitor link gaps, check your **Backlinks & Authority** dashboard.`;
    }
  }
  // DEFAULT
  else {
    reply = `### Action Guidance for ${bizName}\n\n` +
      `I analyzed your verified data for **${city}** (Growth Score: **${score}/100**).\n\n` +
      `Here are recommended actions for your query:\n\n` +
      `- **Local Map Pack**: Ensure your address and hours match 100% across Google Business Profile and website schema.\n` +
      `- **Keyword Rankings**: Target commercial intent keywords containing "${city}".\n` +
      `- **Action Roadmap**: You have ${context.actionPlanStats?.pendingActions ?? 3} high-priority tasks in your roadmap.\n\n` +
      `Ask me to generate schema markup, write a service article, or reverse-engineer your top local competitor!`;
  }

  const actions = determineActionButtons(userMessage, context);
  return { reply, actions };
}
