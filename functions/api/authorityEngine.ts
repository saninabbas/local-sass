export interface Opportunity {
  name: string;
  url: string;
  type: 'directory' | 'sponsorship' | 'guest_post' | 'resource_page' | 'partnership' | 'other';
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
  
  const verifiedUrls: { title: string, link: string }[] = [];
  
  // 1. Fetch REAL local targets using SERP API if available
  if (serpApiKey) {
    try {
      const queries = [
        `"${city}" chamber of commerce`,
        `"${city}" business directory`,
        `"${city}" community guide local partners`
      ];
      for (const q of queries) {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serpApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, num: 3 })
        });
        if (response.ok) {
          const data = await response.json() as any;
          if (data.organic && Array.isArray(data.organic)) {
            verifiedUrls.push(...data.organic.map((res: any) => ({ title: res.title, link: res.link })));
          }
        }
      }
    } catch (e) {
      console.warn("SERP API fetch failed for Authority Builder:", e);
    }
  }

  // 2. Feed into NVIDIA LLM to filter, analyze, and generate high-impact local authority targets
  const verifiedContext = verifiedUrls.length > 0 
    ? `Here are REAL, live local websites discovered in ${city}:\n` + verifiedUrls.map(u => `- ${u.title}: ${u.link}`).join('\n') + `\n\nAnalyze these real links and mark them as VERIFIED. Supplement with realistic local high-authority prospect categories.`
    : `Generate realistic, localized white-hat link building targets for ${city}.`;

  const prompt = `You are an elite White-Hat Local SEO Link Building & Digital PR Strategist.
Identify 6 to 8 legitimate, high-authority backlink and local citation opportunities for a business named "${businessName}" operating in "${city}".

${verifiedContext}

CATEGORIES TO COVER:
1. Local Chamber of Commerce / Business Association (High Authority Directory)
2. City / Regional Community Guide & Verified Directory
3. Local Youth Sports, Charity, or Event Sponsorship Link
4. Local News / Lifestyle Feature or Expert Contributor Opportunity
5. Regional Business Journal or Trade Resource List

STRICT RULES:
- No PBNs, no link farms, no low-quality spam directories.
- Ensure every opportunity has a clear reason why it enhances local topical and geographic authority.
- Mark items as 'VERIFIED' only if their URL is in the real list provided; otherwise mark 'AI_PROSPECT'.

Output strictly valid JSON:
{
  "opportunities": [
    {
      "name": "Organization / Directory Name",
      "url": "https://example.com/directory",
      "type": "directory",
      "why_relevant": "Explains why having a backlink from this local authority strengthens search rankings in ${city}.",
      "difficulty": "Easy",
      "value": "High",
      "verification_level": "AI_PROSPECT"
    }
  ]
}`;

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
          { role: "system", content: "You are an expert Local SEO outreach and link acquisition consultant. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.35,
        max_tokens: 2200,
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json() as any;
      const parsed = JSON.parse(data.choices[0].message.content);
      if (Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0) {
        return parsed.opportunities;
      }
    }
  } catch (err) {
    console.error("NVIDIA Authority Generator Error:", err);
  }

  // Robust Fallback Opportunities
  return [
    {
      name: `${city} Chamber of Commerce`,
      url: `https://www.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}chamber.com`,
      type: "directory",
      why_relevant: `The official Chamber of Commerce directory in ${city} is one of the strongest local authority and trust signals Google uses to verify business legitimacy.`,
      difficulty: "Easy",
      value: "High",
      verification_level: "AI_PROSPECT"
    },
    {
      name: `${city} Regional Business Alliance`,
      url: `https://www.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}businessalliance.org`,
      type: "directory",
      why_relevant: `Regional business listing that provides strong co-citation with top-tier local service providers in ${city}.`,
      difficulty: "Easy",
      value: "High",
      verification_level: "AI_PROSPECT"
    },
    {
      name: `${city} Youth Sports & Community Sponsorship`,
      url: `https://www.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}communitysports.org/sponsors`,
      type: "sponsorship",
      why_relevant: `Local team or charity sponsorship pages provide high-trust '.org' backlinks and generate genuine community brand goodwill in ${city}.`,
      difficulty: "Medium",
      value: "High",
      verification_level: "AI_PROSPECT"
    },
    {
      name: `Better Business Bureau (${city} Region)`,
      url: "https://www.bbb.org",
      type: "directory",
      why_relevant: "BBB profile provides a high Domain Authority (DA 90+) citation with NAP verification for Google Local algorithm.",
      difficulty: "Easy",
      value: "High",
      verification_level: "AI_PROSPECT"
    },
    {
      name: `${city} Local News & Community Guide Contributor`,
      url: `https://www.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}localguide.com/expert-contributors`,
      type: "guest_post",
      why_relevant: `Publishing helpful consumer advice articles on local media platforms builds topical authority and referral traffic from ${city} residents.`,
      difficulty: "Hard",
      value: "High",
      verification_level: "AI_PROSPECT"
    }
  ];
}

export async function generateOutreachEmail(
  apiKey: string,
  opportunityId: string,
  opportunityName: string,
  whyRelevant: string,
  businessName?: string
): Promise<OutreachEmail> {
  const biz = businessName || "Our Business";
  const prompt = `You are a professional Digital PR & Partnerships Director for "${biz}".
Write a highly personalized, warm, and concise outreach email to the coordinator or webmaster of "${opportunityName}".

Context / Value Proposition:
${whyRelevant}

REQUIREMENTS:
- Friendly, professional, and respectful of their time (under 120 words).
- Clearly explain who "${biz}" is and how a collaboration / listing / sponsorship benefits their audience.
- Include a clear, non-pushy next step (e.g., "Let me know the best link to submit our details or if you have a sponsorship package available.").
- Provide a compelling subject line.

Output strictly valid JSON:
{
  "subject": "Clear, engaging subject line mentioning ${opportunityName} and ${biz}",
  "body": "Hi there,\\n\\nI hope you're having a great week...\\n\\nBest regards,\\n[Your Name]\\n${biz}"
}`;

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
          { role: "system", content: "You write high-converting, professional outreach emails. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json() as any;
      const parsed = JSON.parse(data.choices[0].message.content);
      return parsed as OutreachEmail;
    }
  } catch (err) {
    console.error("NVIDIA Outreach Email Error:", err);
  }

  return {
    subject: `Partnership & Directory Inquiry — ${biz} & ${opportunityName}`,
    body: `Hello,\n\nI hope this note finds you well.\n\nI'm reaching out from ${biz}. We are an active local service provider in the area and have been following the great work you do at ${opportunityName}.\n\nWe would love to explore how we can support your organization or be listed in your local directory to help residents find trusted services.\n\nCould you please let us know the best process or point of contact for this?\n\nThank you for your time and help!\n\nBest regards,\n${biz} Team`
  };
}
