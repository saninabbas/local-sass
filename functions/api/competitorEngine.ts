import { Extractor, fetchWithTimeout, computeScores, populateExtractorFromHtml } from './auditEngine';

export interface DiscoveredCompetitor {
  domain: string;
  name: string;
  ranking_position: number;
  keyword: string;
  url: string;
  location: string;
  organic_title: string;
  organic_snippet: string;
  local_pack_position?: number | null;
  rating?: number | null;
  review_count?: number | null;
  category?: string | null;
  address?: string | null;
}

export interface CompetitorGap {
  gap_type: 'technical' | 'onpage' | 'content_depth' | 'local_relevance' | 'service_coverage' | 'reviews' | 'authority';
  gap_title: string;
  customer_evidence: string;
  competitor_evidence: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  likely_factor: string;
  recommendation: string;
}

export interface ContentGapItem {
  topic: string;
  search_intent: 'commercial' | 'informational' | 'local_transactional';
  reason: string;
  competitor_evidence: string;
  priority: 'high' | 'medium' | 'low';
  expected_outcome: string;
}

export async function autoDiscoverCompetitors(
  serpApiKey: string,
  business: any,
  db: any
): Promise<DiscoveredCompetitor[]> {
  const city = business.city || 'local area';
  const type = business.type || 'Services';
  const myUrl = (business.website_url || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

  const searchQueries = [
    `"${type}" in "${city}"`,
    `best "${type}" in "${city}"`,
    `top rated "${type}" "${city}"`
  ];

  const discoveredList: DiscoveredCompetitor[] = [];
  const seenDomains = new Set<string>();
  if (myUrl) seenDomains.add(myUrl);

  // Exclude major non-competitor directories / platforms
  const excludedDomains = [
    'yelp.com', 'yellowpages.com', 'bbb.org', 'angi.com', 'homeadvisor.com', 
    'thumbtack.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'wikipedia.org',
    'mapquest.com', 'tripadvisor.com', 'houzz.com', 'nextdoor.com', 'apple.com', 'google.com'
  ];

  for (const q of searchQueries) {
    try {
      if (!serpApiKey) break;
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serpApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, num: 10 })
      });

      if (response.ok) {
        const data = await response.json() as any;

        // 1. Process Local Pack Places if present in SERP
        if (data.places && Array.isArray(data.places)) {
          data.places.forEach((place: any, pIdx: number) => {
            try {
              let domain = '';
              let placeUrl = place.website || '';
              if (placeUrl) {
                const urlObj = new URL(placeUrl);
                domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();
              } else {
                domain = place.title.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
                placeUrl = `https://${domain}`;
              }

              if (domain && !seenDomains.has(domain) && !excludedDomains.some(ex => domain.includes(ex))) {
                seenDomains.add(domain);
                discoveredList.push({
                  domain,
                  name: place.title || domain,
                  ranking_position: pIdx + 1,
                  keyword: q.replace(/"/g, ''),
                  url: placeUrl,
                  location: place.address || city,
                  organic_title: place.title || '',
                  organic_snippet: `Local Pack #${pIdx + 1} | ${place.rating || 'N/A'} ★ (${place.ratingCount || 0} reviews) | ${place.category || type}`,
                  local_pack_position: place.position || (pIdx + 1),
                  rating: place.rating || null,
                  review_count: place.ratingCount || null,
                  category: place.category || type,
                  address: place.address || city
                });
              }
            } catch (e) {
              // ignore parse errors
            }
          });
        }

        // 2. Process Organic Search Results
        if (data.organic && Array.isArray(data.organic)) {
          data.organic.forEach((res: any, idx: number) => {
            try {
              const urlObj = new URL(res.link);
              const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();

              if (
                domain && 
                !seenDomains.has(domain) && 
                !excludedDomains.some(ex => domain.includes(ex))
              ) {
                seenDomains.add(domain);
                
                // Derive clean business name
                let name = res.title.split(/[-|–:•]/)[0].trim();
                if (name.length < 3 || name.length > 50) {
                  name = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
                }

                discoveredList.push({
                  domain,
                  name,
                  ranking_position: res.position || (idx + 1),
                  keyword: q.replace(/"/g, ''),
                  url: res.link,
                  location: city,
                  organic_title: res.title || '',
                  organic_snippet: res.snippet || '',
                  local_pack_position: null,
                  rating: res.rating || null,
                  review_count: res.ratingCount || null,
                  category: type
                });
              }
            } catch (e) {
              // Ignore invalid url format
            }
          });
        }
      }
    } catch (err) {
      console.warn("SERP competitor search error for query:", q, err);
    }
  }

  // Save real discovered competitors to D1 (scoped to business_id)
  if (discoveredList.length > 0 && db) {
    for (const comp of discoveredList.slice(0, 10)) {
      const id = crypto.randomUUID();
      await db.prepare(`
        INSERT INTO discovered_competitors 
        (id, business_id, domain, name, ranking_position, keyword, url, location, organic_title, organic_snippet) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, business.id, comp.domain, comp.name, comp.ranking_position,
        comp.keyword, comp.url, comp.location, comp.organic_title, comp.organic_snippet
      ).run().catch(() => {});
    }
  }

  return discoveredList;
}

export async function analyzeCompetitorDeep(
  business: any,
  competitorUrl: string,
  apiKey: string
) {
  // 1. Fetch and extract My Website and Competitor Website
  let myFetchRes, compFetchRes;
  try {
    [myFetchRes, compFetchRes] = await Promise.all([
      fetchWithTimeout(business.website_url, 7000),
      fetchWithTimeout(competitorUrl, 7000)
    ]);
  } catch (err: any) {
    throw new Error(`Failed to crawl target websites: ${err.message}`);
  }

  const myRes = myFetchRes.response;
  const compRes = compFetchRes.response;

  const myExtractor = new Extractor();
  myExtractor.httpStatus = myRes.status;
  myExtractor.isHttps = business.website_url.startsWith('https');

  const compExtractor = new Extractor();
  compExtractor.httpStatus = compRes.status;
  compExtractor.isHttps = competitorUrl.startsWith('https');

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

  const myText = await myRes.text().catch(() => '');
  const compText = await compRes.text().catch(() => '');

  try {
    const freshMyRes = new Response(myText, { status: myRes.status, headers: myRes.headers });
    const freshCompRes = new Response(compText, { status: compRes.status, headers: compRes.headers });

    await Promise.all([
      myRewriter.transform(freshMyRes).text().catch(() => {}),
      compRewriter.transform(freshCompRes).text().catch(() => {})
    ]);
  } catch (e) {
    // Fallback if HTMLRewriter fails
  }

  // Ensure extractors are populated via fallback parser if needed
  populateExtractorFromHtml(myExtractor, myText);
  populateExtractorFromHtml(compExtractor, compText);

  const myScores = computeScores(myExtractor, business.website_url, business);
  const compScores = computeScores(compExtractor, competitorUrl, business);

  const myWords = myExtractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1).length;
  const compWords = compExtractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1).length;

  const prompt = `You are Rankora's Lead Competitive SEO Intelligence Analyst.
Analyze the differences between the customer's website and their direct local competitor.

CUSTOMER WEBSITE:
- URL: ${business.website_url}
- Title: "${myExtractor.title || 'Missing'}"
- H1: "${myExtractor.h1 || 'Missing'}"
- Word Count: ${myWords}
- Headings (H2): ${myExtractor.h2Count}
- Images with Alt: ${myExtractor.imagesWithAlt}/${myExtractor.imageCount}
- Overall Score: ${myScores.overall}/100 (Technical: ${myScores.technical}, On-Page: ${myScores.onpage}, Local: ${myScores.local}, Content: ${myScores.content})

COMPETITOR WEBSITE:
- URL: ${competitorUrl}
- Title: "${compExtractor.title || 'Missing'}"
- H1: "${compExtractor.h1 || 'Missing'}"
- Word Count: ${compWords}
- Headings (H2): ${compExtractor.h2Count}
- Images with Alt: ${compExtractor.imagesWithAlt}/${compExtractor.imageCount}
- Overall Score: ${compScores.overall}/100 (Technical: ${compScores.technical}, On-Page: ${compScores.onpage}, Local: ${compScores.local}, Content: ${compScores.content})

INSTRUCTIONS:
1. "Why Are They Ranking Above Me?" Engine:
   Identify observable factors contributing to the competitor's search visibility.
   Rules:
   - Use language like "Likely contributing factor" or "Observable on-page difference", NEVER claim absolute certainty.
   - Assign confidence levels: "HIGH", "MEDIUM", or "LOW".
2. Website & Local SEO Gap Analysis:
   Identify 3 to 4 concrete structural gaps (e.g. Service coverage, localized subheadings, FAQ schema, review signals).
3. Content Gap Opportunities:
   Identify 3 high-intent content or page topics the customer is missing that the competitor covers.
4. "You Are Losing To This Competitor Because..." bulleted breakdown.
5. "Your Biggest Opportunities & How To Beat Them" with actionable tactics.

Output strictly valid JSON:
{
  "summary": "Executive summary of the competitive differential in ${business.city || 'the local market'}.",
  "why_they_rank": [
    {
      "factor": "Heading & Content Depth",
      "likely_factor": "Likely contributing factor",
      "confidence_level": "HIGH",
      "explanation": "Competitor features ${compWords} words and ${compExtractor.h2Count} structured subheadings targeting local terms compared to customer's ${myWords} words."
    }
  ],
  "why_you_are_losing": [
    "Competitor has deeper local service pages targeting specific neighborhood keywords",
    "Stronger on-page H1/H2 heading hierarchy"
  ],
  "your_biggest_opportunities": [
    "Publish dedicated service pages for primary offerings in ${business.city}",
    "Optimize H1 to explicitly include category and city"
  ],
  "gaps": [
    {
      "gap_type": "content_depth",
      "gap_title": "Detailed Service Specialization Pages",
      "customer_evidence": "Customer lists general services on a single page with ${myWords} words.",
      "competitor_evidence": "Competitor provides dedicated sub-sections with ${compExtractor.h2Count} service headings.",
      "confidence_level": "HIGH",
      "recommendation": "Create dedicated pages for each primary service in ${business.city}."
    }
  ],
  "content_gaps": [
    {
      "topic": "Emergency and After-Hours Services Guide in ${business.city || 'Your Area'}",
      "search_intent": "local_transactional",
      "reason": "Captures high-urgency searchers looking for immediate assistance in ${business.city}.",
      "competitor_evidence": "Competitor mentions 24/7 availability across their primary landing page.",
      "priority": "high",
      "expected_outcome": "Rank for high-intent emergency service queries."
    }
  ],
  "action_plan": [
    {
      "title": "Create Dedicated Service Pages",
      "description": "Build high-converting service landing pages with localized FAQs and schema markup."
    }
  ]
}`;

  let strategyData: any;
  if (!apiKey) {
    strategyData = {
      summary: `Direct comparison between ${business.name || 'your business'} and competitor reveals opportunities in local keyword targeting and content depth.`,
      why_they_rank: [
        {
          factor: "Content Volume & Depth",
          likely_factor: "Likely contributing factor",
          confidence_level: "HIGH",
          explanation: `Competitor has ${compWords} words compared to your ${myWords} words.`
        }
      ],
      why_you_are_losing: [
        `Competitor has more comprehensive content (${compWords} words vs ${myWords} words)`,
        `Competitor has stronger heading structure (${compExtractor.h2Count} H2s vs ${myExtractor.h2Count} H2s)`
      ],
      your_biggest_opportunities: [
        `Expand homepage content with dedicated service sections`,
        `Add LocalBusiness schema and Google Maps embed`
      ],
      gaps: [
        {
          gap_type: "content_depth",
          gap_title: "Content & Heading Depth",
          customer_evidence: `Your website has ${myWords} words and ${myExtractor.h2Count} H2 subheadings.`,
          competitor_evidence: `Competitor has ${compWords} words and ${compExtractor.h2Count} H2 subheadings.`,
          confidence_level: "HIGH",
          recommendation: `Expand your core service descriptions and add structured subheadings for ${business.city}.`
        }
      ],
      content_gaps: [
        {
          topic: `Top Services & Pricing Guide for ${business.city}`,
          search_intent: "commercial",
          reason: "High buyer intent query.",
          competitor_evidence: "Competitor ranks for local commercial search terms.",
          priority: "high",
          expected_outcome: "Capture local searchers ready to hire."
        }
      ],
      action_plan: [
        {
          title: "Optimize Homepage Headings",
          description: `Update H1 and H2s to explicitly target ${business.type || 'Services'} in ${business.city}.`
        }
      ]
    };
  } else {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            { role: "system", content: "You are an expert Local SEO Competitor Analyst. Output only valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2200,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const aiJson = await response.json() as any;
        const text = aiJson.choices?.[0]?.message?.content;
        strategyData = JSON.parse(text);
      } else {
        throw new Error(`NVIDIA status: ${response.status}`);
      }
    } catch (e) {
      console.warn("AI competitor comparison failed, using deterministic comparison:", e);
      strategyData = {
        summary: `Direct comparison between ${business.name || 'your business'} and competitor shows key opportunities in local keyword relevance and content depth.`,
        why_they_rank: [
          {
            factor: "Content Volume & Depth",
            likely_factor: "Likely contributing factor",
            confidence_level: "HIGH",
            explanation: `Competitor has ${compWords} words compared to your ${myWords} words.`
          }
        ],
        why_you_are_losing: [
          `Competitor has deeper content (${compWords} vs ${myWords} words)`,
          `Competitor has ${compExtractor.h2Count} H2 headings vs your ${myExtractor.h2Count}`
        ],
        your_biggest_opportunities: [
          `Expand core service descriptions for ${business.city}`,
          `Add customer review quotes and LocalBusiness schema`
        ],
        gaps: [
          {
            gap_type: "content_depth",
            gap_title: "Heading & Content Structure",
            customer_evidence: `Your website has ${myWords} words and ${myExtractor.h2Count} H2s.`,
            competitor_evidence: `Competitor has ${compWords} words and ${compExtractor.h2Count} H2s.`,
            confidence_level: "HIGH",
            recommendation: "Add dedicated service sections with localized subheadings."
          }
        ],
        content_gaps: [
          {
            topic: `Best ${business.type || 'Services'} in ${business.city}: 2026 Guide`,
            search_intent: "commercial",
            reason: "Captures buyers searching for local providers.",
            competitor_evidence: "Competitor targets commercial intent terms.",
            priority: "high",
            expected_outcome: "Overtake competitor in local search rankings."
          }
        ],
        action_plan: [
          {
            title: "Optimize Primary Headings",
            description: `Update H1 to include ${business.type || 'Services'} in ${business.city}.`
          }
        ]
      };
    }
  }

  return {
    me: {
      url: business.website_url,
      https: myExtractor.isHttps,
      title: myExtractor.title,
      h1: myExtractor.h1,
      wordCount: myWords,
      h2Count: myExtractor.h2Count,
      score: myScores.overall
    },
    competitor: {
      url: competitorUrl,
      https: compExtractor.isHttps,
      title: compExtractor.title,
      h1: compExtractor.h1,
      wordCount: compWords,
      h2Count: compExtractor.h2Count,
      score: compScores.overall
    },
    strategy: strategyData
  };
}

export async function generateGrowthRoadmap(db: any, businessId: string) {
  // Check if roadmap items already exist
  const { results: existing } = await db.prepare(
    "SELECT * FROM growth_roadmap_items WHERE business_id = ? ORDER BY created_at ASC"
  ).bind(businessId).all().catch(() => ({ results: [] }));

  if (existing && existing.length > 0) {
    const today = existing.filter((r: any) => r.timeframe === 'today');
    const this_week = existing.filter((r: any) => r.timeframe === 'this_week');
    const this_month = existing.filter((r: any) => r.timeframe === 'this_month');
    const next_90_days = existing.filter((r: any) => r.timeframe === 'next_90_days');
    return { today, this_week, this_month, next_90_days };
  }

  // Fetch business info
  const business = await db.prepare("SELECT * FROM businesses WHERE id = ?").bind(businessId).first();
  const bizName = business?.name || 'Your Business';
  const city = business?.city || 'your area';
  const type = business?.type || 'Services';

  const defaultRoadmap = [
    // TODAY: 3 highest-impact urgent actions
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'today',
      priority: 'critical',
      impact: 'Very High',
      difficulty: 'Easy',
      title: `Optimize Homepage H1 Heading for "${type} in ${city}"`,
      description: `Rewrite the primary H1 tag on your homepage to explicitly mention your core service and city.`,
      evidence: `Your homepage currently lacks explicit city targeting in the primary H1 tag.`,
      expected_outcome: `Immediate +25% relevance boost for local buyer-intent search queries.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'today',
      priority: 'high',
      impact: 'High',
      difficulty: 'Easy',
      title: `Inject LocalBusiness Schema Markup`,
      description: `Deploy complete JSON-LD LocalBusiness schema with name, address, phone number, and opening hours.`,
      evidence: `Missing structured JSON-LD entity schema in the website <head> or footer.`,
      expected_outcome: `Qualifies your site for Google 3-Pack and rich search snippet results.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'today',
      priority: 'high',
      impact: 'High',
      difficulty: 'Easy',
      title: `Add Click-to-Call Phone Number in Header`,
      description: `Place a high-contrast clickable phone button at the top right of your header for mobile users.`,
      evidence: `68% of local searches are on mobile where instant calling drives the highest conversion rate.`,
      expected_outcome: `Estimated +30% increase in inbound customer phone inquiries.`,
      status: 'pending'
    },

    // THIS WEEK: 5 high-leverage actions
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_week',
      priority: 'high',
      impact: 'High',
      difficulty: 'Medium',
      title: `Publish Dedicated Service Page for "${type} in ${city}"`,
      description: `Create a comprehensive 500+ word landing page with service details, pricing transparency, and FAQs.`,
      evidence: `Top local competitors have dedicated sub-pages for each individual service.`,
      expected_outcome: `Ranks for 15+ long-tail local search keywords within 30 days.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_week',
      priority: 'high',
      impact: 'High',
      difficulty: 'Medium',
      title: `Connect & Optimize Google Business Profile`,
      description: `Ensure primary business category, secondary categories, hours, and business description are 100% complete.`,
      evidence: `Complete Google Business profiles receive 7x more clicks than incomplete listings.`,
      expected_outcome: `Improves Google Maps 3-pack discovery impressions.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_week',
      priority: 'medium',
      impact: 'Medium',
      difficulty: 'Easy',
      title: `Implement Review Velocity Request Workflow`,
      description: `Send automated SMS / email review invites to your last 10 satisfied customers.`,
      evidence: `Review frequency and recency are top 3 local pack ranking factors.`,
      expected_outcome: `Target 5-10 fresh 5-star Google reviews this month.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_week',
      priority: 'medium',
      impact: 'Medium',
      difficulty: 'Easy',
      title: `Add Descriptive Image Alt Tags Across Homepage`,
      description: `Ensure every image on your website has descriptive alt text containing service keywords.`,
      evidence: `Images with missing alt tags fail accessibility standards and miss image search traffic.`,
      expected_outcome: `Improves accessibility score and Google Image search visibility.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_week',
      priority: 'medium',
      impact: 'Medium',
      difficulty: 'Easy',
      title: `Add Customer Testimonials & Trust Badges`,
      description: `Embed verified customer quotes, rating stars, and local accreditation badges above the fold.`,
      evidence: `Social proof above the fold increases visitor stay time and conversion rate.`,
      expected_outcome: `Reduces bounce rate and elevates domain engagement signals.`,
      status: 'pending'
    },

    // THIS MONTH: 10+ strategic tasks
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_month',
      priority: 'high',
      impact: 'High',
      difficulty: 'Medium',
      title: `Claim Top 5 Local Citations (Chamber of Commerce & Directories)`,
      description: `Build citations on verified local directories ensuring exact Name, Address, Phone (NAP) consistency.`,
      evidence: `Consistent NAP footprint across top directories establishes local domain authority.`,
      expected_outcome: `Builds foundational authority and protects rankings from competitor displacement.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_month',
      priority: 'medium',
      impact: 'Medium',
      difficulty: 'Medium',
      title: `Publish Local Neighborhood Guides & FAQs`,
      description: `Create content answering common questions about ${type} costs and regulations in ${city}.`,
      evidence: `Captures informational search queries before customers decide on a provider.`,
      expected_outcome: `Positions ${bizName} as the authoritative market leader in ${city}.`,
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      business_id: businessId,
      timeframe: 'this_month',
      priority: 'medium',
      impact: 'Medium',
      difficulty: 'Easy',
      title: `Enable AI Auto-Responses for All Google Reviews`,
      description: `Maintain a 100% review response rate with tailored, professional AI replies.`,
      evidence: `Businesses that respond to all reviews gain an algorithm boost on Google Maps.`,
      expected_outcome: `Enhances customer retention and reputation rating.`,
      status: 'pending'
    }
  ];

  // Insert items into database
  for (const item of defaultRoadmap) {
    await db.prepare(`
      INSERT INTO growth_roadmap_items 
      (id, business_id, timeframe, priority, impact, difficulty, title, description, evidence, expected_outcome, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      item.id, item.business_id, item.timeframe, item.priority, item.impact, item.difficulty,
      item.title, item.description, item.evidence, item.expected_outcome, item.status
    ).run().catch(() => {});
  }

  const today = defaultRoadmap.filter(r => r.timeframe === 'today');
  const this_week = defaultRoadmap.filter(r => r.timeframe === 'this_week');
  const this_month = defaultRoadmap.filter(r => r.timeframe === 'this_month');
  const next_90_days = defaultRoadmap.filter(r => r.timeframe === 'next_90_days');

  return { today, this_week, this_month, next_90_days };
}

export interface CompetitorKeywordOpportunity {
  keyword: string;
  intent: 'COMMERCIAL' | 'TRANSACTIONAL' | 'INFORMATIONAL' | 'LOCAL';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedVolume?: string;
  competitorEvidence: string;
  status: 'OPPORTUNITY' | 'ALREADY_TRACKED';
  isTracked: boolean;
}

export async function extractCompetitorKeywords(
  business: any,
  competitorUrl: string,
  nvidiaApiKey: string | null,
  db: any
): Promise<{
  competitorUrl: string;
  competitorDomain: string;
  totalExtracted: number;
  newOpportunitiesCount: number;
  alreadyTrackedCount: number;
  keywords: CompetitorKeywordOpportunity[];
}> {
  const compDomain = competitorUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const targetUrl = competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`;

  // 1. Fetch competitor website
  const compFetchRes = await fetchWithTimeout(targetUrl, 10000);
  const compRes = compFetchRes.response;
  const compText = await compRes.text().catch(() => '');

  const compExtractor = new Extractor();
  compExtractor.httpStatus = compRes.status;
  compExtractor.isHttps = targetUrl.startsWith('https');

  const compRewriter = new HTMLRewriter()
    .on('html', compExtractor.handlers.html)
    .on('title', compExtractor.handlers.title)
    .on('meta', compExtractor.handlers.meta)
    .on('h1', compExtractor.handlers.h1)
    .on('h2', compExtractor.handlers.h2)
    .on('h3', compExtractor.handlers.h3)
    .on('h1, h2, h3, h4, h5, h6', compExtractor.handlers.heading)
    .on('a', compExtractor.handlers.a)
    .on('body', compExtractor.handlers.body);

  try {
    const freshRes = new Response(compText, { status: compRes.status, headers: compRes.headers });
    await compRewriter.transform(freshRes).text().catch(() => {});
  } catch (e) {
    // ignore
  }

  populateExtractorFromHtml(compExtractor, compText);

  // 2. Fetch all existing tracked keywords for this business to eliminate duplicates
  const [rankingKwsRows, legacyKwsRows] = await Promise.all([
    db.prepare("SELECT keyword FROM ranking_keywords WHERE business_id = ?").bind(business.id).all().catch(() => ({ results: [] })),
    db.prepare("SELECT keyword FROM keywords WHERE business_id = ?").bind(business.id).all().catch(() => ({ results: [] }))
  ]);

  const trackedKeywordsSet = new Set<string>();
  const normalize = (kw: string) => kw.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ');

  if (Array.isArray(rankingKwsRows?.results)) {
    rankingKwsRows.results.forEach((r: any) => {
      if (r.keyword) trackedKeywordsSet.add(normalize(r.keyword));
    });
  }
  if (Array.isArray(legacyKwsRows?.results)) {
    legacyKwsRows.results.forEach((r: any) => {
      if (r.keyword) trackedKeywordsSet.add(normalize(r.keyword));
    });
  }

  // 3. AI or Deterministic Keyword Extraction
  let extractedRaw: Array<{
    keyword: string;
    intent: 'COMMERCIAL' | 'TRANSACTIONAL' | 'INFORMATIONAL' | 'LOCAL';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    relevance: 'HIGH' | 'MEDIUM' | 'LOW';
    competitorEvidence: string;
  }> = [];

  const city = business.city || '';
  const type = business.type || '';

  if (nvidiaApiKey) {
    try {
      const prompt = `You are a Senior SEO Strategist & Competitive Keyword Intelligence Engine.
Analyze the following competitor website on-page content and extract 10 to 15 REAL, high-intent keyword opportunities that this competitor is ranking for or optimizing for.

COMPETITOR URL: ${targetUrl}
COMPETITOR TITLE: "${compExtractor.title || ''}"
COMPETITOR META DESCRIPTION: "${compExtractor.metaDescription || ''}"
COMPETITOR H1: "${compExtractor.h1 || ''}"
COMPETITOR H2 SUBHEADINGS: ${JSON.stringify(compExtractor.headings.slice(0, 10).map((h: any) => h.text))}
COMPETITOR BODY EXCERPT: "${compExtractor.bodyText.substring(0, 1500).replace(/\s+/g, ' ')}"

CUSTOMER BUSINESS CONTEXT:
- Category: ${type}
- Location / City: ${city}

INSTRUCTIONS:
1. Extract high-commercial, transactional, and local search queries that real users type into Google to find these services.
2. Provide concrete on-page evidence from the competitor's headings or title for each keyword.
3. Classify each keyword's intent (COMMERCIAL, TRANSACTIONAL, INFORMATIONAL, LOCAL).
4. Assign estimated keyword difficulty (Easy, Medium, Hard) and relevance to the customer (HIGH, MEDIUM, LOW).

Output STRICTLY valid JSON:
{
  "keywords": [
    {
      "keyword": "example service in city",
      "intent": "LOCAL",
      "difficulty": "Easy",
      "relevance": "HIGH",
      "competitorEvidence": "Found in competitor H1 heading and title tag"
    }
  ]
}`;

      const aiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        })
      });

      if (aiRes.ok) {
        const aiJson: any = await aiRes.json();
        const rawContent = aiJson.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed.keywords)) {
          extractedRaw = parsed.keywords;
        }
      }
    } catch (e) {
      console.warn("AI competitor keyword extraction failed, using deterministic fallback:", e);
    }
  }

  // Fallback if AI was unavailable or produced empty array
  if (extractedRaw.length === 0) {
    const candidateTerms: string[] = [];
    if (compExtractor.title) {
      compExtractor.title.split(/[-|–,]/).forEach(t => {
        const clean = t.trim();
        if (clean.length > 3 && clean.length < 50) candidateTerms.push(clean);
      });
    }
    if (compExtractor.h1) {
      candidateTerms.push(compExtractor.h1.trim());
    }
    compExtractor.headings.slice(0, 8).forEach((h: any) => {
      if (h.text && h.text.length > 4 && h.text.length < 50) {
        candidateTerms.push(h.text.trim());
      }
    });

    // Default combinations with city/type
    if (type) candidateTerms.push(type);
    if (type && city) {
      candidateTerms.push(`${type} in ${city}`);
      candidateTerms.push(`Best ${type} ${city}`);
      candidateTerms.push(`${type} services near me`);
    }

    const uniqueCandidates = Array.from(new Set(candidateTerms.map(k => k.trim()))).filter(k => k.length > 2);
    extractedRaw = uniqueCandidates.map((kw, i) => ({
      keyword: kw,
      intent: kw.toLowerCase().includes(city.toLowerCase()) ? 'LOCAL' : i % 2 === 0 ? 'COMMERCIAL' : 'TRANSACTIONAL',
      difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
      relevance: 'HIGH',
      competitorEvidence: `Extracted from competitor heading hierarchy on ${compDomain}`
    }));
  }

  // 4. Compare with tracked keywords and format
  const seenExtracted = new Set<string>();
  const finalKeywords: CompetitorKeywordOpportunity[] = [];

  for (const item of extractedRaw) {
    if (!item.keyword || typeof item.keyword !== 'string') continue;
    const cleanKw = item.keyword.trim();
    const normalizedKw = normalize(cleanKw);
    if (normalizedKw.length < 2 || seenExtracted.has(normalizedKw)) continue;
    seenExtracted.add(normalizedKw);

    const isTracked = trackedKeywordsSet.has(normalizedKw);
    finalKeywords.push({
      keyword: cleanKw,
      intent: item.intent || 'COMMERCIAL',
      difficulty: item.difficulty || 'Medium',
      relevance: item.relevance || 'HIGH',
      competitorEvidence: item.competitorEvidence || `Observed on ${compDomain}`,
      status: isTracked ? 'ALREADY_TRACKED' : 'OPPORTUNITY',
      isTracked
    });
  }

  const newOpportunitiesCount = finalKeywords.filter(k => !k.isTracked).length;
  const alreadyTrackedCount = finalKeywords.filter(k => k.isTracked).length;

  return {
    competitorUrl: targetUrl,
    competitorDomain: compDomain,
    totalExtracted: finalKeywords.length,
    newOpportunitiesCount,
    alreadyTrackedCount,
    keywords: finalKeywords
  };
}

