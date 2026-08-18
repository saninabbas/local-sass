import type { ReviewSentimentAnalysis, AiReplyOptions } from './types';

const COMMON_TOPICS = [
  'Staff',
  'Service',
  'Waiting Time',
  'Price',
  'Cleanliness',
  'Location',
  'Communication',
  'Quality'
];

export async function analyzeReviewSentiment(
  apiKey: string | undefined,
  reviewText: string,
  rating: number
): Promise<ReviewSentimentAnalysis> {
  const cleanText = (reviewText || '').toLowerCase();

  // Baseline rule-based topic extraction
  const topics: string[] = [];
  if (cleanText.includes('staff') || cleanText.includes('doctor') || cleanText.includes('nurse') || cleanText.includes('team') || cleanText.includes('reception')) topics.push('Staff');
  if (cleanText.includes('service') || cleanText.includes('experience') || cleanText.includes('care')) topics.push('Service');
  if (cleanText.includes('wait') || cleanText.includes('time') || cleanText.includes('delayed') || cleanText.includes('late') || cleanText.includes('appointment')) topics.push('Waiting Time');
  if (cleanText.includes('price') || cleanText.includes('cost') || cleanText.includes('expensive') || cleanText.includes('affordable') || cleanText.includes('charged')) topics.push('Price');
  if (cleanText.includes('clean') || cleanText.includes('hygiene') || cleanText.includes('dirty') || cleanText.includes('neat')) topics.push('Cleanliness');
  if (cleanText.includes('location') || cleanText.includes('parking') || cleanText.includes('area') || cleanText.includes('building')) topics.push('Location');
  if (cleanText.includes('communication') || cleanText.includes('explain') || cleanText.includes('rude') || cleanText.includes('polite')) topics.push('Communication');
  if (cleanText.includes('quality') || cleanText.includes('result') || cleanText.includes('best') || cleanText.includes('poor')) topics.push('Quality');

  if (topics.length === 0) {
    topics.push(rating >= 4 ? 'Service' : 'Quality');
  }

  // Baseline sentiment
  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL';
  let confidence = 0.85;

  if (cleanText.length > 5 && apiKey) {
    try {
      const prompt = `Analyze this Google customer review:
Rating: ${rating}/5 Stars
Review: "${reviewText}"

Output valid JSON only with this schema:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "confidence": 0.0 to 1.0,
  "topics": ["Staff", "Service", "Waiting Time", "Price", "Cleanliness", "Location", "Communication", "Quality"],
  "summary": "1 short sentence summary"
}`;

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            { role: 'system', content: 'You are an AI sentiment extraction engine. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 200
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return {
            sentiment: parsed.sentiment || sentiment,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : confidence,
            topics: Array.isArray(parsed.topics) && parsed.topics.length > 0 ? parsed.topics : topics,
            summary: parsed.summary || `${rating}-star customer feedback.`
          };
        }
      }
    } catch (e) {
      console.warn("AI review analysis fallback:", e);
    }
  }

  return {
    sentiment,
    confidence,
    topics,
    summary: `${rating}-star customer feedback regarding ${topics.join(', ')}.`
  };
}

export async function generateReviewReplyWithAI(
  apiKey: string | undefined,
  options: AiReplyOptions
): Promise<string> {
  const { businessName, reviewerName, rating, reviewText, tone = 'professional' } = options;

  if (apiKey) {
    try {
      const prompt = `You are the owner of "${businessName}". Write a personalized response to this customer review on Google Business Profile:
Customer Name: ${reviewerName}
Rating: ${rating}/5 Stars
Review Text: "${reviewText || 'No text provided with star rating'}"
Desired Tone: ${tone}

GUIDELINES:
- If 4-5 stars: Warmly thank them, reference specific positive points if mentioned, invite them back.
- If 1-3 stars: Empathetically acknowledge their experience, apologize sincerely without making legal admissions, and invite them to contact management directly to resolve.
- Keep it concise, genuine, and professional (2 to 4 sentences).
- Do not use generic AI greetings like "Dear customer" or robotic phrasing.
- Output ONLY the reply text, no quotes or commentary.`;

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            { role: 'system', content: 'You are an expert customer relationship and reputation manager. Output only the final response text.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 250
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text && text.length > 10) {
          return text.replace(/^["']|["']$/g, '');
        }
      }
    } catch (err) {
      console.warn("AI reply generation fallback:", err);
    }
  }

  // Deterministic fallback responses
  const cleanName = reviewerName || 'there';
  if (rating >= 4) {
    return `Hi ${cleanName}, thank you so much for the 5-star review! We're thrilled to hear you had a great experience with our team at ${businessName}. We look forward to serving you again soon!`;
  } else if (rating === 3) {
    return `Hi ${cleanName}, thank you for taking the time to share your feedback. We appreciate your honest review and are always striving to improve our service at ${businessName}. Please feel free to reach out to us directly so we can ensure your next visit is a 5-star experience.`;
  } else {
    return `Hi ${cleanName}, thank you for bringing this to our attention. We are deeply sorry that your experience with ${businessName} did not meet your expectations. We take customer satisfaction very seriously and would like the opportunity to make this right. Please contact our management team directly so we can resolve your concerns.`;
  }
}
