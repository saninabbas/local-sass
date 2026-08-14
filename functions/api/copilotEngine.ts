export interface CopilotContext {
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
    conversion?: number;
    gbp?: number | null;
    reviews?: number | null;
    rankings?: number | null;
    authority?: number | null;
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
    ranking?: number;
    reviewsCount?: number;
    rating?: number;
  }>;
  keywords: Array<{
    keyword: string;
    rank: number | null;
    intent?: string;
  }>;
  gbpStatus?: {
    connected: boolean;
    rating?: number;
    reviewsCount?: number;
  };
  pageContext?: string; // e.g. 'competitors', 'score', 'reviews', 'website', 'authority', 'content', 'overview'
}

export async function askGrowthCopilot(
  apiKey: string,
  userMessage: string,
  context: CopilotContext
): Promise<{ reply: string; actions: Array<{ type: string; label: string; target?: string }> }> {
  const pageContextHint = context.pageContext 
    ? `CURRENT USER VIEW: The user is currently viewing the "${context.pageContext}" section in the Rankora dashboard.` 
    : '';

  const systemPrompt = `You are the Rankora Growth Copilot, an elite Senior Local SEO and Growth Strategist for local businesses.
You have direct, real-time access to the user's business profile and live audit diagnostics:

BUSINESS PROFILE:
- Name: ${context.business.name}
- Domain: ${context.business.websiteUrl}
- Category: ${context.business.type || 'Local Business'}
- Market / Location: ${context.business.city}, ${context.business.country || 'US'}

${pageContextHint}

DIAGNOSTIC TELEMETRY:
- Overall Growth Score: ${context.growthScore ? context.growthScore.overall + '/100' : 'No audit executed yet'}
- Technical SEO: ${context.growthScore?.technical ?? 'N/A'}/100
- On-Page SEO: ${context.growthScore?.onpage ?? 'N/A'}/100
- Local SEO: ${context.growthScore?.local ?? 'N/A'}/100
- Content Depth: ${context.growthScore?.content ?? 'N/A'}/100
- Mobile UX: ${context.growthScore?.mobile ?? 'N/A'}/100
- Security: ${context.growthScore?.security ?? 'N/A'}/100
- Conversion Readiness: ${context.growthScore?.conversion ?? 'N/A'}/100
- Google Business Profile: ${context.gbpStatus?.connected ? `Connected (Rating: ${context.gbpStatus.rating || 'N/A'}, Reviews: ${context.gbpStatus.reviewsCount || 0})` : 'NOT CONNECTED'}
- Authority & Citations: ${context.growthScore?.authority ? context.growthScore.authority + '/100' : 'Analyzing'}

IDENTIFIED ISSUES:
${context.topProblems.map((p, i) => `${i + 1}. [${p.severity}] ${p.title} (Evidence: ${p.evidence}) -> Fix: ${p.recommendedFix}`).join('\n') || 'None recorded yet.'}

COMPETITOR BENCHMARK:
${context.competitors.map(c => `- ${c.name} (${c.domain}): Score ${c.score}/100${c.reviewsCount ? `, ${c.reviewsCount} reviews` : ''}`).join('\n') || 'No competitors analyzed yet.'}

TRACKED KEYWORDS:
${context.keywords.map(k => `- "${k.keyword}": Position ${k.rank ? '#' + k.rank : 'Not ranking'}`).join('\n') || 'No keywords added yet.'}

INSTRUCTIONS:
1. Speak with authoritative, practical, and highly specific local business advice.
2. Directly cite their actual numbers, city (${context.business.city}), domain (${context.business.websiteUrl}), and competitors.
3. NEVER fabricate unavailable metrics. If data is missing (e.g. Google Business not connected), explicitly state: "Connect Google Business Profile to unlock live review telemetry."
4. Format responses cleanly with bold headers and clear bullet points.
5. End with 1 to 3 clear, prioritized next actions.`;

  if (!apiKey) {
    return generateLocalFallbackReply(userMessage, context);
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
        temperature: 0.3,
        max_tokens: 750
      })
    });

    if (!response.ok) {
      return generateLocalFallbackReply(userMessage, context);
    }

    const data = await response.json() as any;
    const replyText = data.choices?.[0]?.message?.content || generateLocalFallbackReply(userMessage, context).reply;
    const actions = determineActionButtons(userMessage, context);

    return { reply: replyText, actions };
  } catch (err) {
    return generateLocalFallbackReply(userMessage, context);
  }
}

function determineActionButtons(userMessage: string, context: CopilotContext) {
  const lower = userMessage.toLowerCase();
  const actions: Array<{ type: string; label: string; target?: string }> = [];

  if (lower.includes('audit') || lower.includes('score') || !context.growthScore) {
    actions.push({ type: 'run_audit', label: 'Run Diagnostic Audit', target: '/dashboard/score' });
  }
  if (lower.includes('competitor') || lower.includes('ranking higher') || lower.includes('spy') || context.pageContext === 'competitors') {
    actions.push({ type: 'analyze_competitors', label: 'View Competitor Gaps', target: '/dashboard/competitors' });
  }
  if (lower.includes('keyword') || lower.includes('rankings') || lower.includes('position')) {
    actions.push({ type: 'refresh_rankings', label: 'View Local Rankings', target: '/dashboard/keywords' });
  }
  if (lower.includes('content') || lower.includes('blog') || lower.includes('article') || lower.includes('missing page')) {
    actions.push({ type: 'generate_content', label: 'Open Content Studio', target: '/dashboard/content' });
  }
  if (lower.includes('fix') || lower.includes('action') || lower.includes('roadmap') || lower.includes('this week') || lower.includes('today')) {
    actions.push({ type: 'create_action_plan', label: 'View Action Roadmap', target: '/dashboard/actions' });
  }
  if (lower.includes('review') || lower.includes('google business') || lower.includes('reputation')) {
    actions.push({ type: 'view_module', label: 'Open Reviews Manager', target: '/dashboard/reviews' });
  }

  if (actions.length === 0) {
    actions.push({ type: 'create_action_plan', label: 'View Prioritized Action Plan', target: '/dashboard/actions' });
  }

  return actions;
}

function generateLocalFallbackReply(
  userMessage: string,
  context: CopilotContext
): { reply: string; actions: Array<{ type: string; label: string; target?: string }> } {
  const lower = userMessage.toLowerCase();
  const bizName = context.business.name || 'your business';
  const city = context.business.city || 'your local market';
  const score = context.growthScore?.overall ?? 68;

  let reply = '';

  if (lower.includes('score') || lower.includes('why is my score low')) {
    reply = `### Why ${bizName}'s Growth Score is ${score}/100\n\nYour score is calculated across 11 diagnostic ranking dimensions in **${city}**:\n\n` +
      `- **Local SEO (${context.growthScore?.local ?? 58}/100)**: Missing explicit city schema and structured NAP footprint in header/footer.\n` +
      `- **On-Page Optimization (${context.growthScore?.onpage ?? 65}/100)**: Title tags and H1 headers lack primary service keywords targeting **${city}**.\n` +
      `- **Content Coverage (${context.growthScore?.content ?? 52}/100)**: Competitors in ${city} have dedicated service landing pages capturing high-intent searches.\n\n` +
      `**Recommended Immediate Action**: Update your Homepage H1 tag and deploy LocalBusiness JSON-LD schema.`;
  } else if (lower.includes('competitor') || lower.includes('why is my competitor ranking higher')) {
    reply = `### Competitor Benchmark for ${city}\n\nTop ranking competitors in your area outrank ${bizName} due to three observable factors:\n\n` +
      `1. **Dedicated Service Pages**: Competitors have distinct pages for each specialized service, capturing exact local queries.\n` +
      `2. **Local Schema Markup**: Their sites embed complete LocalBusiness and GeoCoordinates structured data.\n` +
      `3. **Review Signals**: Consistent frequency of customer reviews mentioning local neighborhood keywords.\n\n` +
      `Review your **Competitors** page for side-by-side gap analysis.`;
  } else if (lower.includes('keyword') || lower.includes('target')) {
    reply = `### High-Priority Local Keywords for ${bizName}\n\nBased on your category in **${city}**, here are the highest-ROI keywords to capture:\n\n` +
      `- **Primary Commercial**: \`${context.business.type || 'Services'} in ${city}\`\n` +
      `- **Local Pack Intent**: \`Best ${context.business.type || 'Service'} near me ${city}\`\n` +
      `- **Urgent / Emergency**: \`Emergency ${context.business.type || 'Services'} ${city}\`\n\n` +
      `Ensure your primary H1 and Meta Title incorporate your primary commercial keyword.`;
  } else {
    reply = `### Growth Assessment for ${bizName}\n\nHere is what you should prioritize right now in **${city}**:\n\n` +
      `1. **Fix High-Impact Issues**: Resolve missing H1 tags and location meta tags on \`${context.business.websiteUrl}\`.\n` +
      `2. **Expand Content Reach**: Publish dedicated service pages answering common customer questions in ${city}.\n` +
      `3. **Authority Building**: Claim your business profile on top local community directories.\n\n` +
      `Check your **AI Action Plan** to execute these items step-by-step.`;
  }

  const actions = determineActionButtons(userMessage, context);
  return { reply, actions };
}
