export interface Opportunity {
  name: string;
  url: string;
  type: 'directory' | 'sponsorship' | 'guest_post' | 'resource_page' | 'other';
  why_relevant: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  value: 'Low' | 'Medium' | 'High';
  verification_level: 'VERIFIED' | 'AI_PROSPECT';
}

export interface OutreachEmail {
  subject: string;
  body: string;
}

export async function generateOpportunities(
  apiKey: string,
  businessId: string,
  businessName: string,
  city: string,
  serpApiKey?: string
): Promise<Opportunity[]> {
  
  let verifiedUrls: { title: string, link: string }[] = [];
  
  // 1. Fetch REAL local targets using SERP API
  if (serpApiKey) {
    try {
      const queries = [`"${city}" chamber of commerce`, `"${city}" business directory`, `"${city}" local news`];
      for (const q of queries) {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serpApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, num: 3 })
        });
        if (response.ok) {
          const data = await response.json() as any;
          if (data.organic) {
            verifiedUrls.push(...data.organic.map((res: any) => ({ title: res.title, link: res.link })));
          }
        }
      }
    } catch (e) {
      console.warn("SERP API failed for Authority Builder:", e);
    }
  }

  // 2. Feed into NVIDIA LLM to filter, analyze, and generate AI prospects
  const verifiedContext = verifiedUrls.length > 0 
    ? `Here are REAL, verified local websites found on Google:\n` + verifiedUrls.map(u => `- ${u.title}: ${u.link}`).join('\n') + `\n\nAnalyze these and output them as VERIFIED opportunities.`
    : `No real URLs were provided, so output AI brainstormed ideas as AI_PROSPECT.`;

  const prompt = `You are a Local SEO Expert.
Find white-hat local link building opportunities for a business named "${businessName}" in "${city}".
Do NOT suggest spammy links or PBNs. 
${verifiedContext}

Provide a JSON response strictly in this format:
{
  "opportunities": [
    {
      "name": "Name of the website/organization",
      "url": "https://url-of-the-opportunity.com (or empty string if unknown)",
      "type": "directory|sponsorship|guest_post|resource_page|other",
      "why_relevant": "Brief explanation of why this link makes sense for a business in this city",
      "difficulty": "Easy|Medium|Hard",
      "value": "Low|Medium|High",
      "verification_level": "VERIFIED|AI_PROSPECT"
    }
  ]
}
Note: Set verification_level to VERIFIED ONLY if the URL was in the provided real list. Otherwise set it to AI_PROSPECT.`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.opportunities;
}

export async function generateOutreachEmail(
  apiKey: string,
  opportunityId: string,
  opportunityName: string,
  whyRelevant: string
): Promise<OutreachEmail> {
  const prompt = `You are an Outreach Specialist.
Write a personalized, concise, and non-spammy outreach email to the webmaster of "${opportunityName}".
The reason for reaching out is: ${whyRelevant}.

Provide a JSON response strictly in this format:
{
  "subject": "Compelling but honest email subject line",
  "body": "The plain text body of the email. Keep it professional, friendly, and concise."
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
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`NVIDIA API Error: ${response.status}`);
  }

  const data = await response.json() as any;
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed as OutreachEmail;
}
