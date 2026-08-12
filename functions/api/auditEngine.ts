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
  metaDescription: string = '';
  h1: string = '';
  headingsCount: number = 0;
  scriptCount: number = 0;
  linkCount: number = 0;

  get handlers() {
    return {
      title: {
        text: (t: any) => { this.title += t.text; }
      },
      meta: {
        element: (e: any) => {
          if (e.getAttribute('name')?.toLowerCase() === 'description') {
            this.metaDescription = e.getAttribute('content') || '';
          }
        }
      },
      h1: {
        text: (t: any) => { this.h1 += t.text; }
      },
      heading: {
        element: () => { this.headingsCount++; }
      },
      script: {
        element: () => { this.scriptCount++; }
      },
      a: {
        element: () => { this.linkCount++; }
      }
    };
  }
}

export function computeScores(extractor: Extractor, url: string, city: string) {
  let seo = 50;
  if (extractor.title.length > 10 && extractor.title.length < 70) seo += 20;
  if (extractor.metaDescription.length > 50) seo += 20;
  if (extractor.h1.trim().length > 0) seo += 10;

  let website = 60;
  if (url.startsWith('https')) website += 20;
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
      "impact": "high|medium|low",
      "estimatedMinutes": 15
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
