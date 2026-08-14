export async function fetchWithTimeout(url: string, timeoutMs: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Rankora-Auditor/1.0' }
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
  headingsCount: number = 0;
  scriptCount: number = 0;
  stylesheetCount: number = 0;
  imageCount: number = 0;
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
          const name = e.getAttribute('name')?.toLowerCase();
          const content = e.getAttribute('content') || '';
          
          if (name === 'description') {
            this.metaDescription += content;
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
        element: () => { this.linkCount++; }
      },
      h1: {
        text: (t: any) => { this.h1 += t.text; },
        element: () => { this.h1Count++; }
      },
      h2: {
        element: () => { this.h2Count++; }
      },
      h3: {
        element: () => { this.h3Count++; }
      },
      heading: {
        element: () => { this.headingsCount++; }
      },
      script: {
        element: () => { this.scriptCount++; }
      },
      img: {
        element: () => { this.imageCount++; }
      },
      body: {
        text: (t: any) => { this.bodyText += t.text + ' '; }
      }
    };
  }
}

export function computeScores(extractor: Extractor, url: string, cityOrBusiness: any) {
  const business = typeof cityOrBusiness === 'string' ? { city: cityOrBusiness } : cityOrBusiness;

  let technical = 0;
  if (extractor.isHttps) technical += 20;
  if (extractor.robots && !extractor.robots.includes('noindex')) technical += 20;
  else if (!extractor.robots) technical += 20; 
  if (extractor.canonical) technical += 20;
  if (extractor.charset) technical += 20;
  if (extractor.viewport) technical += 20;
  
  let onpage = 0;
  if (extractor.title.length > 10 && extractor.title.length < 70 && extractor.titleCount === 1) onpage += 20;
  if (extractor.metaDescription.length > 50 && extractor.metaDescCount === 1) onpage += 20;
  if (extractor.h1Count === 1) onpage += 20;
  if (extractor.h2Count > 0) onpage += 15;
  if (extractor.h3Count > 0) onpage += 15;
  if (extractor.canonical) onpage += 10;
  
  let local = 0;
  const contentToSearch = (extractor.title + ' ' + extractor.metaDescription + ' ' + extractor.bodyText).toLowerCase();
  
  let localTotal = 0;
  let localScoreAmt = 0;
  if (business.city) { localTotal++; if (contentToSearch.includes(business.city.toLowerCase())) localScoreAmt++; }
  if (business.name) { localTotal++; if (contentToSearch.includes(business.name.toLowerCase())) localScoreAmt++; }
  if (business.address) { localTotal++; if (contentToSearch.includes(business.address.toLowerCase())) localScoreAmt++; }
  if (business.phone) { localTotal++; if (contentToSearch.includes(business.phone.toLowerCase())) localScoreAmt++; }
  
  local = localTotal > 0 ? Math.floor((localScoreAmt / localTotal) * 100) : 50;

  let contentScore = 0;
  const wordCount = extractor.bodyText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount > 500) contentScore += 40;
  else if (wordCount > 200) contentScore += 20;
  if (extractor.h1Count > 0) contentScore += 20;
  if (extractor.h2Count > 0) contentScore += 20;
  if (extractor.imageCount > 0) contentScore += 20;

  let performance = 100;
  if (extractor.scriptCount > 20) performance -= 20;
  if (extractor.stylesheetCount > 10) performance -= 20;
  if (extractor.imageCount > 30) performance -= 20;
  performance = Math.max(0, performance);
  
  let mobile = 0;
  if (extractor.viewport && extractor.viewport.includes('width=device-width')) mobile += 100;
  else if (extractor.viewport) mobile += 50;

  let security = 0;
  if (extractor.isHttps) security += 50;
  if (extractor.securityHeaders['strict-transport-security']) security += 20;
  if (extractor.securityHeaders['x-content-type-options']) security += 15;
  if (extractor.securityHeaders['x-frame-options']) security += 15;

  const technicalScore = Math.min(100, technical);
  const onpageScore = Math.min(100, onpage);
  const localScore = Math.min(100, local);
  const finalContentScore = Math.min(100, contentScore);
  const performanceScore = Math.min(100, performance);
  const mobileScore = Math.min(100, mobile);
  const securityScore = Math.min(100, security);

  const overall = Math.floor(
    (technicalScore * 0.20) +
    (onpageScore * 0.20) +
    (localScore * 0.20) +
    (finalContentScore * 0.15) +
    (performanceScore * 0.10) +
    (mobileScore * 0.10) +
    (securityScore * 0.05)
  );

  return {
    technical: technicalScore,
    onpage: onpageScore,
    local: localScore,
    content: finalContentScore,
    performance: performanceScore,
    mobile: mobileScore,
    security: securityScore,
    overall,
    seo: onpageScore,
    website: technicalScore,
    visibility: localScore
  };
}

export async function askNVIDIA(
  apiKey: string, 
  business: any, 
  extractor: Extractor, 
  scores: any
) {
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
      "difficulty": "Easy|Medium|Hard",
      "estimatedMinutes": 15,
      "seo_impact": "High|Medium|Low",
      "local_visibility_impact": "High|Medium|Low",
      "conversion_impact": "High|Medium|Low",
      "business_outcome": "Expected outcome"
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

export async function compareWithNVIDIA(
  apiKey: string,
  myExtractor: Extractor,
  myScores: any,
  compExtractor: Extractor,
  compScores: any
) {
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

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
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

export async function generateBlogWithNVIDIA(
  apiKey: string,
  businessName: string,
  city: string,
  topic: string
) {
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

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export function getFallbackRecommendations() {
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

export async function generateReviewReplyWithNVIDIA(
  apiKey: string,
  businessName: string,
  reviewerName: string,
  rating: number,
  reviewText: string
): Promise<string> {
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
  
  const prompt = `You are a professional customer service representative for a local business called "${businessName}".
A customer named "${reviewerName}" left a ${rating}-star (${sentiment}) review:

"${reviewText}"

Write a professional, warm, and authentic reply to this review.

Rules:
- Keep it under 100 words
- Be genuine and specific to what the customer said
- If positive: thank them sincerely and mention you look forward to serving them again
- If neutral: acknowledge their feedback, thank them, and mention you are always improving
- If negative: apologize sincerely, do NOT argue, show empathy, invite them to contact you directly to resolve the issue
- Do NOT use generic corporate language
- Do NOT start with "Dear" 
- Sign off with the business name
- Output ONLY the reply text, no JSON, no quotes around it`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content.trim();
}
