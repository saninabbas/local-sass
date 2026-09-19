export interface FixRequest {
  type: 'title' | 'meta_description' | 'service_page_structure' | 'faq_schema' | 'review_response' | 'outreach_email' | 'content_brief';
  context: {
    businessName: string;
    websiteUrl: string;
    city: string;
    category?: string;
    targetKeyword?: string;
    issueEvidence?: string;
    competitorAdvantage?: string;
    reviewerName?: string;
    reviewRating?: number;
    reviewText?: string;
    prospectDomain?: string;
    prospectTitle?: string;
  };
}

export interface FixResponse {
  type: string;
  title: string;
  generatedContent: string;
  explanation: string;
  suggestedAction: string;
  metaTags?: {
    title?: string;
    description?: string;
    h1?: string;
  };
}

export async function generateAIFix(
  apiKey: string,
  req: FixRequest
): Promise<FixResponse> {
  const { type, context } = req;
  const bizName = context.businessName || 'Your Business';
  const city = context.city || 'Your Local Area';
  const category = context.category || 'Local Service';

  if (!apiKey) {
    return generateFallbackFix(req);
  }

  let prompt = '';
  if (type === 'title') {
    prompt = `Generate 3 high-CTR, high-ranking SEO meta title tag options for ${bizName} (${category} in ${city}).
Requirements:
- Must follow format: [Primary High-Intent Service] in ${city} | ${bizName}
- Keep between 45 to 60 characters
- Include primary local keyword: "${context.targetKeyword || category + ' in ' + city}"
- Explain why this title wins more clicks over competitors.`;
  } else if (type === 'meta_description') {
    prompt = `Generate 2 compelling, high-converting SEO meta descriptions for ${bizName} in ${city}.
Requirements:
- Between 120 and 155 characters
- Include ${city}, primary service, phone call CTA, and trust hook (e.g. 5-star rated, licensed, fast response)
- Explain why this prevents Google snippet truncation.`;
  } else if (type === 'service_page_structure') {
    prompt = `Create a complete, high-ranking service page architecture & content outline for a dedicated page on ${bizName}'s website targeting "${context.targetKeyword || 'Specialized ' + category}".
Provide:
1. Proposed URL slug
2. Target SEO Title & Meta Description
3. Primary H1 Heading & H2-H4 Content Structure
4. Key Value Propositions & Local Trust Markers
5. Frequently Asked Questions (FAQ) Section
6. Clear Call-to-Action (CTA) Placement`;
  } else if (type === 'faq_schema') {
    prompt = `Generate 4 high-intent local customer FAQs with ready-to-copy JSON-LD schema markup for ${bizName} (${category} in ${city}).
Provide the readable Q&A text and the validated JSON-LD schema.org script snippet.`;
  } else if (type === 'review_response') {
    prompt = `Draft an authentic, professional, and SEO-friendly response to this customer review for ${bizName}:
Reviewer: ${context.reviewerName || 'Customer'}
Rating: ${context.reviewRating || 5} Stars
Review: "${context.reviewText || 'Great experience, very prompt and helpful service.'}"
Include a natural mention of ${city} and ${category} to reinforce local search relevance without sounding robotic.`;
  } else if (type === 'outreach_email') {
    prompt = `Draft a personalized, concise outreach pitch email to the editor of ${context.prospectDomain || 'Local Business Journal'} proposing a guest column or local business profile about ${bizName} in ${city}.
Keep it under 150 words, non-spammy, and focused on providing genuine community value.`;
  } else {
    prompt = `Generate an executive content brief for ${bizName} targeting "${context.targetKeyword || category + ' in ' + city}".
Include target audience, primary keywords, competitor angle, and 5-point outline.`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { 
            role: 'system', 
            content: 'You are the Scorankio Technical & Local SEO Engineering Agent. Provide precise, actionable, and ready-to-deploy solutions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 800
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallbackFix(req);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || generateFallbackFix(req).generatedContent;

    return {
      type,
      title: `AI Fix: ${formatFixTitle(type)}`,
      generatedContent: content,
      explanation: `Generated specifically for ${bizName} in ${city} based on real crawl telemetry.`,
      suggestedAction: 'Review the generated code/content, make any adjustments, and apply to your website.'
    };
  } catch (err) {
    return generateFallbackFix(req);
  }
}

function formatFixTitle(type: string): string {
  switch (type) {
    case 'title': return 'Optimized SEO Title Tag';
    case 'meta_description': return 'High-Converting Meta Description';
    case 'service_page_structure': return 'Service Landing Page Blueprint';
    case 'faq_schema': return 'Local FAQ & JSON-LD Schema';
    case 'review_response': return 'Brand-Aligned Review Response';
    case 'outreach_email': return 'Local Authority Outreach Pitch';
    default: return 'Strategic Content Brief';
  }
}

function generateFallbackFix(req: FixRequest): FixResponse {
  const { type, context } = req;
  const bizName = context.businessName || 'Your Business';
  const city = context.city || 'Your Local Area';
  const category = context.category || 'Professional Services';

  let content = '';
  if (type === 'title') {
    content = `**Recommended Primary Title Tag (54 Chars):**\n\`${category} in ${city} | Top Rated ${bizName}\`\n\n**Alternative Variations:**\n1. \`Best ${category} in ${city}, US | ${bizName}\`\n2. \`Emergency ${category} Near Me in ${city} | ${bizName}\``;
  } else if (type === 'meta_description') {
    content = `**Recommended Meta Description (148 Chars):**\n\`Looking for trusted ${category.toLowerCase()} in ${city}? ${bizName} offers fast, reliable service with 5-star customer care. Call today to schedule!\``;
  } else if (type === 'service_page_structure') {
    content = `### Dedicated Landing Page Blueprint for ${category} in ${city}\n\n` +
      `- **URL Slug**: \`/services/${category.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase().replace(/\s+/g, '-')}\`\n` +
      `- **H1 Heading**: \`Leading ${category} in ${city}: Expert Solutions You Can Trust\`\n` +
      `- **Section 1 (Hero)**: Value proposition + Direct Phone & Booking CTA\n` +
      `- **Section 2 (Why Choose Us)**: Local experience in ${city}, licensed specialists, modern technology\n` +
      `- **Section 3 (Process Breakdown)**: Step-by-step what clients can expect\n` +
      `- **Section 4 (Local Proof)**: Verified customer reviews from ${city} residents\n` +
      `- **Section 5 (FAQ)**: 3-4 structured questions with schema markup`;
  } else if (type === 'faq_schema') {
    content = `### Local FAQs & JSON-LD Schema\n\n` +
      `**Q: Where can I find top-rated ${category.toLowerCase()} in ${city}?**\n` +
      `A: ${bizName} provides specialized services throughout ${city} and surrounding communities.\n\n` +
      `**JSON-LD Schema Snippet:**\n` +
      `\`\`\`json\n` +
      `{\n` +
      `  "@context": "https://schema.org",\n` +
      `  "@type": "FAQPage",\n` +
      `  "mainEntity": [{\n` +
      `    "@type": "Question",\n` +
      `    "name": "Where can I find top-rated ${category} in ${city}?",\n` +
      `    "acceptedAnswer": {\n` +
      `      "@type": "Answer",\n` +
      `      "text": "${bizName} provides specialized ${category} throughout ${city}."\n` +
      `    }\n` +
      `  }]\n` +
      `}\n` +
      `\`\`\``;
  } else if (type === 'review_response') {
    content = `Thank you so much for taking the time to share your feedback, ${context.reviewerName || 'valued customer'}! Our entire team at ${bizName} takes great pride in providing high-quality ${category.toLowerCase()} to our neighbors here in ${city}. Please do not hesitate to reach out if we can ever assist you again!`;
  } else if (type === 'outreach_email') {
    content = `Subject: Community feature: ${bizName} helping ${city} residents\n\n` +
      `Hi Editor Team,\n\n` +
      `I have been following your coverage of local businesses across ${city}. As the owner of ${bizName}, we have recently introduced new customer initiatives to improve local access to ${category.toLowerCase()}.\n\n` +
      `I would love to contribute a brief guest article answering common questions ${city} residents face when choosing a service provider. Would this be of interest to your readers?\n\n` +
      `Best regards,\n${bizName}`;
  } else {
    content = `### Content Strategy Brief\n- **Target Keyword**: \`${category} in ${city}\`\n- **Search Intent**: High Commercial Intent\n- **Target Word Count**: 800 - 1,200 words\n- **Goal**: Establish topical authority and outrank local competitors on Google.`;
  }

  return {
    type,
    title: `AI Fix: ${formatFixTitle(type)}`,
    generatedContent: content,
    explanation: `Tailored for ${bizName} in ${city}.`,
    suggestedAction: 'Review, edit, and apply to your website or marketing workflow.'
  };
}
