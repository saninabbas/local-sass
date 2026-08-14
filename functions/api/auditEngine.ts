export async function fetchWithTimeout(url: string, timeoutMs: number = 7000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Rankora-Auditor/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export class Extractor {
  title: string = '';
  titleCount: number = 0;
  metaDescription: string = '';
  metaDescCount: number = 0;
  h1: string = '';
  h1Count: number = 0;
  h2Count: number = 0;
  h3Count: number = 0;
  h2List: string[] = [];
  h3List: string[] = [];
  headingsCount: number = 0;
  scriptCount: number = 0;
  stylesheetCount: number = 0;
  imageCount: number = 0;
  imagesWithAlt: number = 0;
  linkCount: number = 0;
  
  httpStatus: number = 200;
  isHttps: boolean = false;
  securityHeaders: Record<string, string> = {};

  robots: string = '';
  canonical: string = '';
  language: string = '';
  charset: string = '';
  viewport: string = '';

  bodyText: string = '';
  links: Array<{ href: string; text: string }> = [];

  get handlers() {
    return {
      html: {
        element: (e: any) => { this.language = e.getAttribute('lang') || ''; }
      },
      title: {
        text: (t: any) => { this.title += t.text; },
        element: () => { this.titleCount++; }
      },
      meta: {
        element: (e: any) => {
          const name = e.getAttribute('name')?.toLowerCase() || e.getAttribute('property')?.toLowerCase();
          const content = e.getAttribute('content') || '';
          
          if (name === 'description' || name === 'og:description') {
            if (!this.metaDescription) this.metaDescription = content;
            this.metaDescCount++;
          } else if (name === 'robots') {
            this.robots = content;
          } else if (name === 'viewport') {
            this.viewport = content;
          }
          
          const charset = e.getAttribute('charset');
          if (charset) {
            this.charset = charset;
          }
        }
      },
      link: {
        element: (e: any) => {
          const rel = e.getAttribute('rel')?.toLowerCase();
          if (rel === 'canonical') {
            this.canonical = e.getAttribute('href') || '';
          } else if (rel === 'stylesheet') {
            this.stylesheetCount++;
          }
        }
      },
      a: {
        element: (e: any) => {
          this.linkCount++;
          const href = e.getAttribute('href');
          if (href && this.links.length < 25) {
            this.links.push({ href, text: '' });
          }
        }
      },
      h1: {
        text: (t: any) => { this.h1 += t.text; },
        element: () => { this.h1Count++; }
      },
      h2: {
        text: (t: any) => {
          const text = t.text.trim();
          if (text && this.h2List.length < 10) {
            this.h2List.push(text);
          }
        },
        element: () => { this.h2Count++; }
      },
      h3: {
        text: (t: any) => {
          const text = t.text.trim();
          if (text && this.h3List.length < 10) {
            this.h3List.push(text);
          }
        },
        element: () => { this.h3Count++; }
      },
      heading: {
        element: () => { this.headingsCount++; }
      },
      script: {
        element: () => { this.scriptCount++; }
      },
      img: {
        element: (e: any) => { 
          this.imageCount++;
          if (e.getAttribute('alt')) {
            this.imagesWithAlt++;
          }
        }
      },
      body: {
        text: (t: any) => { this.bodyText += t.text + ' '; }
      }
    };
  }
}

/**
 * Automatically extracts business information, services, keywords, and weaknesses from website HTML.
 */
export function extractBusinessDiscovery(extractor: Extractor, websiteUrl: string, existingData?: any) {
  const domain = websiteUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  const cleanTitle = extractor.title.trim();
  const cleanH1 = extractor.h1.trim();
  const bodyLower = extractor.bodyText.toLowerCase();

  // 1. Determine Business Name
  let discoveredName = existingData?.name || '';
  if (!discoveredName) {
    if (cleanTitle) {
      const parts = cleanTitle.split(/[-|–:•]/);
      discoveredName = parts[0].trim();
      if (discoveredName.length < 3 || discoveredName.length > 50) {
        discoveredName = parts[parts.length - 1].trim();
      }
    }
    if (!discoveredName || discoveredName.length < 3 || discoveredName.length > 50) {
      discoveredName = domain.split('.')[0];
      discoveredName = discoveredName.charAt(0).toUpperCase() + discoveredName.slice(1);
    }
  }

  // 2. Determine Industry / Category
  let discoveredType = existingData?.type || '';
  if (!discoveredType) {
    const industryMap: Record<string, string[]> = {
      'Dentist': ['dentist', 'dental', 'teeth', 'orthodont', 'oral', 'invisalign', 'implants'],
      'Plumber': ['plumb', 'drain', 'pipe', 'water heater', 'leak repair', 'sewer', 'clog'],
      'HVAC': ['hvac', 'air conditioning', 'heating', 'furnace', 'duct', 'cooling', 'heat pump'],
      'Lawyer': ['lawyer', 'attorney', 'legal', 'law firm', 'litigation', 'counsel'],
      'Clinic': ['clinic', 'doctor', 'medical', 'physician', 'health', 'pediatric', 'dermatolog'],
      'MedSpa': ['medspa', 'med spa', 'botox', 'laser', 'facial', 'skincare', 'aesthetics'],
      'Roofing': ['roofing', 'roof repair', 'shingle', 'gutter', 'siding', 'metal roof'],
      'Real Estate': ['real estate', 'realtor', 'homes for sale', 'property management', 'broker'],
      'Restaurant': ['restaurant', 'dining', 'bistro', 'cafe', 'bar & grill', 'menu', 'takeout'],
      'Salon': ['salon', 'haircut', 'hairstylist', 'barber', 'hair salon', 'beauty bar'],
      'Gym': ['gym', 'fitness', 'personal training', 'crossfit', 'workout', 'bodybuilding'],
      'Auto Repair': ['auto repair', 'mechanic', 'brake repair', 'oil change', 'car service', 'transmission'],
      'Accounting': ['accounting', 'cpa', 'bookkeeping', 'tax preparation', 'accountant'],
      'Veterinarian': ['vet', 'veterinary', 'animal hospital', 'pet care', 'pet clinic']
    };

    const combinedText = (cleanTitle + ' ' + cleanH1 + ' ' + extractor.metaDescription + ' ' + bodyLower.slice(0, 3000)).toLowerCase();
    for (const [ind, keywords] of Object.entries(industryMap)) {
      if (keywords.some(k => combinedText.includes(k))) {
        discoveredType = ind;
        break;
      }
    }
    if (!discoveredType) discoveredType = 'Local Service';
  }

  // 3. Extract Main Services
  const detectedServices: string[] = [];
  extractor.h2List.forEach(h => {
    const clean = h.trim();
    if (clean.length > 3 && clean.length < 50 && !/about|contact|reviews|testimonials|welcome|home|faq/i.test(clean)) {
      detectedServices.push(clean);
    }
  });
  if (detectedServices.length === 0 && extractor.h3List.length > 0) {
    extractor.h3List.slice(0, 5).forEach(h => {
      const clean = h.trim();
      if (clean.length > 3 && clean.length < 50 && !/about|contact|reviews/i.test(clean)) {
        detectedServices.push(clean);
      }
    });
  }

  // 4. Determine City / Location
  let discoveredCity = existingData?.city || '';
  if (!discoveredCity) {
    // Check if title or H1 has a location pattern like "in Chicago", "Dallas, TX", etc.
    const locMatch = (cleanTitle + ' ' + cleanH1 + ' ' + extractor.metaDescription).match(/(?:in|serving|near)\s+([A-Z][a-zA-Z\s]{2,20})(?:,\s*([A-Z]{2}))?/);
    if (locMatch && locMatch[1]) {
      discoveredCity = locMatch[1].trim();
    }
  }

  // 5. Generate Primary Keywords
  const primaryKeywords: string[] = [];
  const serviceTerm = discoveredType || 'Services';
  const cityTerm = discoveredCity || 'Local Area';

  primaryKeywords.push(`${serviceTerm} in ${cityTerm}`);
  primaryKeywords.push(`Best ${serviceTerm} ${cityTerm}`);
  primaryKeywords.push(`Top rated ${serviceTerm} near me`);
  if (detectedServices.length > 0) {
    primaryKeywords.push(`${detectedServices[0]} in ${cityTerm}`);
  }

  // 6. Detect Key Weaknesses
  const weaknesses: string[] = [];
  if (!extractor.isHttps) weaknesses.push('Missing HTTPS SSL security encryption');
  if (extractor.h1Count === 0) weaknesses.push('Missing primary H1 heading on homepage');
  if (extractor.h1Count > 1) weaknesses.push(`Multiple H1 headings detected (${extractor.h1Count} found), diluting ranking signal`);
  if (!extractor.metaDescription) weaknesses.push('Missing meta description tag for search snippets');
  if (!extractor.viewport) weaknesses.push('Missing mobile viewport configuration');
  if (discoveredCity && !bodyLower.includes(discoveredCity.toLowerCase())) {
    weaknesses.push(`Target city "${discoveredCity}" is missing from body text and headings`);
  }
  const hasPhone = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(extractor.bodyText);
  if (!hasPhone) {
    weaknesses.push('No direct click-to-call phone number detected on homepage');
  }

  return {
    name: discoveredName,
    type: discoveredType,
    city: discoveredCity,
    domain,
    services: detectedServices.slice(0, 6),
    primaryKeywords: primaryKeywords.slice(0, 5),
    weaknesses,
    hasPhone
  };
}

/**
 * Computes all 11 Growth Sub-scores (0-100) and composite Overall Growth Score.
 */
export function computeScores(
  extractor: Extractor, 
  url: string, 
  businessOrTelemetry?: any
) {
  const business = businessOrTelemetry?.business || businessOrTelemetry || {};
  const liveTelemetry = businessOrTelemetry?.telemetry || {};

  // 1. Technical SEO (0-100)
  let technical = 0;
  if (extractor.isHttps) technical += 25;
  if (extractor.robots && !extractor.robots.toLowerCase().includes('noindex')) technical += 20;
  else if (!extractor.robots) technical += 20; 
  if (extractor.canonical) technical += 20;
  if (extractor.charset || extractor.language) technical += 15;
  if (extractor.viewport) technical += 20;
  const technicalScore = Math.min(100, Math.max(10, technical));

  // 2. On-Page SEO (0-100)
  let onpage = 0;
  const cleanTitle = extractor.title.trim();
  if (cleanTitle.length >= 15 && cleanTitle.length <= 65) onpage += 25;
  else if (cleanTitle.length > 0) onpage += 10;

  const cleanDesc = extractor.metaDescription.trim();
  if (cleanDesc.length >= 50 && cleanDesc.length <= 160) onpage += 25;
  else if (cleanDesc.length > 0) onpage += 10;

  if (extractor.h1Count === 1) onpage += 20;
  else if (extractor.h1Count > 1) onpage += 10;

  if (extractor.h2Count >= 2) onpage += 15;
  else if (extractor.h2Count >= 1) onpage += 10;

  if (extractor.imageCount === 0 || (extractor.imagesWithAlt / (extractor.imageCount || 1)) >= 0.7) onpage += 15;
  else onpage += 5;
  const onpageScore = Math.min(100, Math.max(10, onpage));

  // 3. Local SEO (0-100)
  let local = 0;
  const contentToSearch = (extractor.title + ' ' + extractor.metaDescription + ' ' + extractor.bodyText).toLowerCase();
  let localSignalsFound = 0;
  let totalLocalSignals = 0;

  if (business.city) { 
    totalLocalSignals++; 
    if (contentToSearch.includes(business.city.toLowerCase())) localSignalsFound++; 
  }
  if (business.name) { 
    totalLocalSignals++; 
    if (contentToSearch.includes(business.name.toLowerCase())) localSignalsFound++; 
  }
  if (business.type) { 
    totalLocalSignals++; 
    if (contentToSearch.includes(business.type.toLowerCase())) localSignalsFound++; 
  }

  const hasPhonePattern = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(extractor.bodyText);
  totalLocalSignals++;
  if (hasPhonePattern) localSignalsFound++;

  local = totalLocalSignals > 0 ? Math.round((localSignalsFound / totalLocalSignals) * 100) : 60;
  const localScore = Math.min(100, Math.max(10, local));

  // 4. Content Depth (0-100)
  let contentScore = 0;
  const words = extractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1);
  const wordCount = words.length;
  if (wordCount >= 700) contentScore += 40;
  else if (wordCount >= 400) contentScore += 25;
  else if (wordCount >= 150) contentScore += 15;

  if (extractor.h1Count >= 1) contentScore += 20;
  if (extractor.h2Count >= 3) contentScore += 20;
  else if (extractor.h2Count >= 1) contentScore += 10;
  if (extractor.h3Count >= 1) contentScore += 10;
  if (extractor.imageCount >= 1) contentScore += 10;
  const finalContentScore = Math.min(100, Math.max(10, contentScore));

  // 5. Mobile UX (0-100)
  let mobile = 0;
  if (extractor.viewport && extractor.viewport.includes('width=device-width')) mobile += 70;
  else if (extractor.viewport) mobile += 40;
  if (extractor.isHttps) mobile += 30;
  const mobileScore = Math.min(100, Math.max(10, mobile));

  // 6. Security (0-100)
  let security = 0;
  if (extractor.isHttps) security += 50;
  if (extractor.securityHeaders['strict-transport-security']) security += 20;
  if (extractor.securityHeaders['x-content-type-options']) security += 15;
  if (extractor.securityHeaders['x-frame-options']) security += 15;
  if (security === 0 && extractor.isHttps) security = 70;
  const securityScore = Math.min(100, Math.max(10, security));

  // 7. Conversion Readiness (0-100)
  let conversion = 0;
  if (hasPhonePattern) conversion += 35;
  if (/contact|book|schedule|appointment|call|quote|consultation/i.test(extractor.bodyText)) conversion += 35;
  if (extractor.linkCount >= 5) conversion += 15;
  if (extractor.metaDescription) conversion += 15;
  const conversionScore = Math.min(100, Math.max(15, conversion));

  // 8. Performance / Resource Score (0-100)
  let performance = 100;
  if (extractor.scriptCount > 25) performance -= 25;
  else if (extractor.scriptCount > 15) performance -= 15;
  if (extractor.stylesheetCount > 12) performance -= 20;
  else if (extractor.stylesheetCount > 6) performance -= 10;
  if (extractor.imageCount > 40) performance -= 20;
  const performanceScore = Math.min(100, Math.max(20, performance));

  // 9. Google Business Profile Score (0-100 or -1 if unavailable)
  let gbpScore = -1;
  if (liveTelemetry.gbpConnected) {
    let score = 50;
    if (liveTelemetry.gbpRating >= 4.5) score += 25;
    else if (liveTelemetry.gbpRating >= 4.0) score += 15;
    if (liveTelemetry.gbpReviewCount >= 50) score += 25;
    else if (liveTelemetry.gbpReviewCount >= 10) score += 15;
    gbpScore = Math.min(100, score);
  } else {
    // Check if website has Google Maps or GBP embed
    if (/maps\.google|google\.com\/maps|localbusiness/i.test(extractor.bodyText)) {
      gbpScore = 55;
    }
  }

  // 10. Reviews & Reputation Score (0-100 or -1 if unavailable)
  let reviewsScore = -1;
  if (liveTelemetry.totalReviews !== undefined && liveTelemetry.totalReviews > 0) {
    let score = 30;
    const avg = liveTelemetry.avgRating || 0;
    if (avg >= 4.8) score += 40;
    else if (avg >= 4.2) score += 30;
    else if (avg >= 3.5) score += 15;
    if (liveTelemetry.responseRate >= 80) score += 30;
    else if (liveTelemetry.responseRate >= 50) score += 15;
    reviewsScore = Math.min(100, score);
  }

  // 11. Local Rankings Score (0-100 or -1 if unavailable)
  let rankingsScore = -1;
  if (liveTelemetry.trackedKeywordsCount && liveTelemetry.trackedKeywordsCount > 0) {
    let score = 20;
    const top3 = liveTelemetry.top3Count || 0;
    const top10 = liveTelemetry.top10Count || 0;
    score += Math.min(50, top3 * 20);
    score += Math.min(30, top10 * 10);
    rankingsScore = Math.min(100, score);
  }

  // 12. Authority Score (0-100 or -1 if unavailable)
  let authorityScore = -1;
  if (liveTelemetry.verifiedCitationsCount !== undefined && liveTelemetry.verifiedCitationsCount > 0) {
    authorityScore = Math.min(100, 30 + (liveTelemetry.verifiedCitationsCount * 15));
  } else {
    authorityScore = 45; // baseline directory readiness
  }

  // Composite Overall Growth Score (Weighted average across available dimensions)
  const coreScores = [
    { score: technicalScore, weight: 0.20 },
    { score: onpageScore, weight: 0.20 },
    { score: localScore, weight: 0.20 },
    { score: finalContentScore, weight: 0.15 },
    { score: mobileScore, weight: 0.10 },
    { score: conversionScore, weight: 0.10 },
    { score: securityScore, weight: 0.05 }
  ];

  let totalWeight = 0;
  let weightedSum = 0;
  coreScores.forEach(s => {
    weightedSum += s.score * s.weight;
    totalWeight += s.weight;
  });

  const overall = Math.round(weightedSum / totalWeight);

  return {
    technical: technicalScore,
    onpage: onpageScore,
    local: localScore,
    content: finalContentScore,
    mobile: mobileScore,
    security: securityScore,
    conversion: conversionScore,
    performance: performanceScore,
    gbp: gbpScore,
    reviews: reviewsScore,
    rankings: rankingsScore,
    authority: authorityScore,
    overall: Math.min(100, Math.max(15, overall)),
    seo: onpageScore,
    website: technicalScore,
    visibility: localScore,
    wordCount
  };
}

export async function askNVIDIA(
  apiKey: string, 
  business: any, 
  extractor: Extractor, 
  scores: any
) {
  const wordCount = (extractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1)).length;
  const cleanTitle = extractor.title.trim() || 'Missing Title';
  const cleanMeta = extractor.metaDescription.trim() || 'Missing Meta Description';
  const cleanH1 = extractor.h1.trim() || 'Missing H1 Heading';
  const sampleH2s = extractor.h2List.slice(0, 4).join(' | ') || 'None found';

  const diagnostics = [
    `Title Tag: "${cleanTitle}" (${cleanTitle.length} chars) - ${cleanTitle.length >= 15 && cleanTitle.length <= 65 ? 'Optimal length' : 'Needs optimization'}`,
    `Meta Description: "${cleanMeta}" (${cleanMeta.length} chars) - ${cleanMeta.length >= 50 && cleanMeta.length <= 160 ? 'Good' : 'Missing or improper length'}`,
    `Primary H1: "${cleanH1}" (Count: ${extractor.h1Count})`,
    `Subheadings H2 Count: ${extractor.h2Count} (Sample: ${sampleH2s})`,
    `Total Word Count: ${wordCount} words - ${wordCount < 350 ? 'Thin content alert' : 'Healthy length'}`,
    `Images: ${extractor.imageCount} total (${extractor.imagesWithAlt} have alt tags)`,
    `Local Signals: City "${business.city || 'Unknown'}" in content: ${extractor.bodyText.toLowerCase().includes((business.city || '').toLowerCase()) ? 'Yes' : 'NO - Critical Local SEO Gap'}`,
    `Mobile Viewport: ${extractor.viewport ? 'Configured' : 'Missing'}`,
    `HTTPS Secure: ${extractor.isHttps ? 'Yes' : 'NO'}`
  ].join('\n');

  const prompt = `You are Rankora's Lead Local Business SEO & Growth Strategist.
Analyze this real business website audit and provide 5-7 deeply specific, high-ROI actionable recommendations to boost their local rankings, Google Business visibility, and lead conversions.

BUSINESS PROFILE:
Name: ${business.name || 'Local Business'}
Category / Industry: ${business.type || 'Local Services'}
Target City & Country: ${business.city || 'Local Area'}, ${business.country || ''}
Website URL: ${business.website_url}

AUDIT DIAGNOSTICS & SCORES:
- Overall Health Score: ${scores.overall}/100
- Technical SEO: ${scores.technical}/100
- On-Page Optimization: ${scores.onpage}/100
- Local Relevance: ${scores.local}/100
- Content Depth: ${scores.content}/100
- Mobile & Performance: ${scores.mobile}/100
- Conversion Readiness: ${scores.conversion}/100

TECHNICAL AUDIT FINDINGS:
${diagnostics}

INSTRUCTIONS:
1. Provide highly specific advice referencing their exact business category ("${business.type}"), city ("${business.city}"), and the weaknesses found in their audit.
2. Avoid vague advice like "improve SEO". Instead provide exact steps like "Rewrite H1 to include '${business.type} in ${business.city}'", "Add 450 words explaining your service process and emergency callout terms", "Embed Google Maps & local phone number schema in footer".
3. Provide 5 to 7 prioritized recommendations with realistic time estimates, difficulty, impact, and measurable business outcomes.

Provide your response strictly in valid JSON format:
{
  "summary": "3-4 concise sentences detailing the website's current strengths, primary ranking bottlenecks, and the highest-leverage growth opportunities in ${business.city}.",
  "recommendations": [
    {
      "title": "Action-oriented title (e.g. Optimize H1 and Meta Title for ${business.city} ${business.type})",
      "description": "Step-by-step specific instructions on what to change on the website or marketing channels.",
      "priority": "high",
      "difficulty": "Easy",
      "estimatedMinutes": 15,
      "seo_impact": "High",
      "local_visibility_impact": "High",
      "conversion_impact": "Medium",
      "business_outcome": "Estimated measurable outcome (e.g. +30% boost in local 3-pack search impressions and direct inquiries)",
      "timeframe": "today"
    }
  ]
}`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { 
          role: "system", 
          content: "You are an elite Local SEO consultant specializing in actionable technical audits and conversion rate optimization for local service businesses. Output only valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.25,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response from NVIDIA");
  
  return JSON.parse(content);
}

export async function compareWithNVIDIA(
  apiKey: string,
  myExtractor: Extractor,
  myScores: any,
  compExtractor: Extractor,
  compScores: any,
  myBusiness?: any
) {
  const myWordCount = myExtractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1).length;
  const compWordCount = compExtractor.bodyText.trim().split(/\s+/).filter(w => w.length > 1).length;

  const prompt = `You are a Competitive SEO Specialist.
Perform a comprehensive competitive gap analysis between my website and my direct competitor's website. Provide a clear tactical roadmap on how to outrank them in local search results.

MY WEBSITE:
- Title: "${myExtractor.title || 'Missing'}"
- H1: "${myExtractor.h1 || 'Missing'}"
- Word Count: ${myWordCount} words
- Headings: ${myExtractor.h2Count} H2s
- Overall Score: ${myScores.overall || myScores.seo}/100
- Technical: ${myScores.technical}/100, On-Page: ${myScores.onpage}/100, Local: ${myScores.local}/100

COMPETITOR WEBSITE:
- Title: "${compExtractor.title || 'Missing'}"
- H1: "${compExtractor.h1 || 'Missing'}"
- Word Count: ${compWordCount} words
- Headings: ${compExtractor.h2Count} H2s
- Overall Score: ${compScores.overall || compScores.seo}/100
- Technical: ${compScores.technical}/100, On-Page: ${compScores.onpage}/100, Local: ${compScores.local}/100

INSTRUCTIONS:
1. Compare content depth, heading keyword optimization, speed/asset efficiency, and local relevance.
2. Outline exactly where the competitor has an advantage and where my site is falling short.
3. Provide 4 to 6 specific tactical actions to outrank them.

Output strictly valid JSON:
{
  "summary": "3-4 sentences comparing both sites, highlighting the competitor's key ranking advantage and your biggest opportunity to overtake them in ${myBusiness?.city || 'your market'}.",
  "why_they_win": [
    "Competitor has deeper local service pages",
    "Stronger on-page H1/H2 keyword targeting"
  ],
  "how_to_beat_them": [
    "Publish dedicated service pages",
    "Optimize H1 and add schema markup"
  ],
  "action_plan": [
    {
      "title": "Tactical Action Title",
      "description": "Exact step-by-step instructions to implement the competitive improvement."
    }
  ]
}`;

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
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  return JSON.parse(data.choices[0].message.content);
}

export async function generateBlogWithNVIDIA(
  apiKey: string,
  businessName: string,
  city: string,
  topic?: string,
  businessType?: string
) {
  const effectiveTopic = topic && topic.trim().length > 0 
    ? topic.trim() 
    : `Top Reasons to Choose a Professional ${businessType || 'Local Service'} in ${city}`;

  const prompt = `You are an expert SEO Content Strategist and Copywriter for local businesses.
Write an authoritative, highly engaging, and complete 600-800 word local SEO blog article for "${businessName}", a ${businessType || 'local service provider'} serving "${city}".

TOPIC: ${effectiveTopic}

REQUIREMENTS:
1. Craft a high-converting, local SEO optimized H1 title.
2. Naturally integrate the target city "${city}" and service keywords throughout headings, intro, body paragraphs, and call to action.
3. Format the body content in rich, clean semantic HTML using <h2>, <h3>, <p>, <ul>, <li>, and <strong> tags.
4. Include a "Key Takeaways" bulleted section and an "Frequently Asked Questions" section with 2-3 common local customer questions.
5. End with a compelling Call-to-Action inviting readers in ${city} to contact ${businessName}.
6. Generate focus SEO keywords, a 155-character meta description, a clean URL slug, and an estimated reading time.

Provide your response strictly in valid JSON format:
{
  "title": "Compelling, SEO-Optimized Article Title",
  "meta_description": "Engaging 150-160 character meta description containing the city and primary keyword.",
  "slug": "url-friendly-slug-with-keywords",
  "focus_keywords": ["keyword 1", "keyword 2", "keyword 3 in ${city}"],
  "read_time_minutes": 4,
  "excerpt": "A concise 2-sentence summary of the article.",
  "html_content": "<h2>Why Quality Matters in ${city}</h2><p>Article content here...</p><h3>Key Takeaways</h3><ul><li>Point 1</li><li>Point 2</li></ul>"
}`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: "You are a professional Local SEO copywriter. Output only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.65,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  return JSON.parse(data.choices[0].message.content);
}

export function getFallbackRecommendations(business?: any, scores?: any) {
  const bizName = business?.name || 'Your Business';
  const city = business?.city || 'your local area';
  const bizType = business?.type || 'services';

  return {
    summary: `Based on your website audit scores for ${bizName}, here is a prioritized growth action plan to improve your search presence and local visibility in ${city}.`,
    recommendations: [
      {
        title: `Optimize Homepage H1 Heading for ${city} ${bizType}`,
        description: `Update your primary H1 heading to explicitly mention your main service and location (e.g. "Premier ${bizType} in ${city}"). This is one of the strongest on-page ranking signals.`,
        priority: "high",
        difficulty: "Easy",
        estimatedMinutes: 15,
        seo_impact: "High",
        local_visibility_impact: "High",
        conversion_impact: "Medium",
        business_outcome: "+20% boost in localized keyword rankings",
        timeframe: "today"
      },
      {
        title: "Add NAP (Name, Address, Phone) & Google Maps Embed",
        description: "Ensure your exact business name, local address, and clickable phone number are prominently displayed in the website footer and contact page with LocalBusiness Schema markup.",
        priority: "high",
        difficulty: "Medium",
        estimatedMinutes: 30,
        seo_impact: "High",
        local_visibility_impact: "High",
        conversion_impact: "High",
        business_outcome: "Eligible for Google Local 3-Pack rankings",
        timeframe: "today"
      },
      {
        title: "Expand Core Service Content (Target 500+ Words)",
        description: "Add detailed descriptions of your main offerings, customer FAQs, and common problems you solve. Comprehensive content significantly increases search visibility and time-on-site.",
        priority: "medium",
        difficulty: "Medium",
        estimatedMinutes: 45,
        seo_impact: "High",
        local_visibility_impact: "Medium",
        conversion_impact: "High",
        business_outcome: "Rank for 5-10 long-tail buyer intent queries",
        timeframe: "this_week"
      },
      {
        title: "Implement High-Conversion Call-to-Action Buttons",
        description: "Add sticky 'Call Now' and 'Book Consultation' buttons for mobile visitors to convert search traffic into direct calls and leads immediately.",
        priority: "high",
        difficulty: "Easy",
        estimatedMinutes: 20,
        seo_impact: "Low",
        local_visibility_impact: "Low",
        conversion_impact: "High",
        business_outcome: "+25% to +40% increase in mobile inquiry conversion rate",
        timeframe: "this_week"
      },
      {
        title: "Improve Image Alt Tags & Asset Compression",
        description: "Add descriptive alt attributes containing relevant keywords to all images and compress assets to ensure sub-2-second load times on mobile devices.",
        priority: "medium",
        difficulty: "Easy",
        estimatedMinutes: 20,
        seo_impact: "Medium",
        local_visibility_impact: "Low",
        conversion_impact: "Medium",
        business_outcome: "Faster mobile load speeds and better Google Image ranking",
        timeframe: "this_month"
      }
    ]
  };
}

export async function generateReviewReplyWithNVIDIA(
  apiKey: string,
  businessName: string,
  reviewerName: string,
  rating: number,
  reviewText: string,
  tone: string = 'professional'
): Promise<string> {
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
  
  let toneGuidance = 'Professional, polite, and reassuring.';
  if (tone === 'warm') {
    toneGuidance = 'Warm, friendly, personal, and enthusiastic.';
  } else if (tone === 'apologetic') {
    toneGuidance = 'Deeply empathetic, humble, sincere, and focused on resolution.';
  } else if (tone === 'direct') {
    toneGuidance = 'Concise, clear, and action-oriented.';
  }

  const prompt = `You are a dedicated Customer Relations Manager for "${businessName}".
A customer named "${reviewerName || 'Customer'}" left a ${rating}-star (${sentiment}) review:

"${reviewText || 'No text provided with rating'}"

Desired Tone: ${toneGuidance}

RULES:
- Length: 50 to 90 words.
- Specificity: Directly reference any specific details or compliments/concerns mentioned in their review.
- If 4-5 stars: Warmly thank them, express pride in serving them, and invite them back.
- If 3 stars: Thank them for the balanced feedback, acknowledge areas for improvement, and invite them to share more details.
- If 1-2 stars: Apologize sincerely without defensiveness, show genuine care, and provide a clear direct invite to contact management privately so the issue can be resolved.
- Do NOT use robotic corporate clichés like "Your feedback is important to us".
- Do NOT start with "Dear [Name]".
- Sign off authentically with the business team (e.g. "— The ${businessName} Team").
- Output ONLY the finished reply text. No quotes, no preamble.`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: "You write authentic, high-converting review replies for local businesses. Output plain text only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 350
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content.trim();
}
