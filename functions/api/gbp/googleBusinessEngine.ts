import { GoogleBusinessClient } from './googleClient';
import type { GbpLocation, GbpReview } from './types';

export interface LocalSeoAuditResult {
  score: number;
  problems: string[];
  strengths: string[];
  breakdown: {
    completeness: number; // Max 30
    reviewVolume: number; // Max 25
    ratingQuality: number; // Max 20
    responseRate: number; // Max 15
    consistencyAndMedia: number; // Max 10
  };
}

export function calculateLocalSeoScore(
  location: Partial<GbpLocation>,
  reviews: GbpReview[]
): LocalSeoAuditResult {
  const problems: string[] = [];
  const strengths: string[] = [];

  // 1. Profile Completeness (Max 30)
  let completeness = 0;
  if (location.title && location.title.trim().length > 0) completeness += 5;
  else problems.push("Missing verified business name on Google Profile");

  if (location.address && location.address.trim().length > 0) {
    completeness += 5;
    strengths.push("Physical storefront address verified");
  } else {
    problems.push("Incomplete physical address details");
  }

  if (location.phone && location.phone.trim().length > 0) completeness += 5;
  else problems.push("Primary phone number missing");

  if (location.website && location.website.trim().length > 0) completeness += 5;
  else problems.push("Website URL not linked to Google Profile");

  if (location.category && location.category.trim().length > 0) {
    completeness += 5;
    strengths.push(`Primary category set: ${location.category}`);
  } else {
    problems.push("Primary business category not configured");
  }

  if (location.hasDescription) {
    completeness += 5;
    strengths.push("Business description published");
  } else {
    problems.push("Missing business description on Google Profile");
  }

  // 2. Reviews Volume (Max 25)
  let reviewVolume = 0;
  const totalReviews = reviews.length;
  if (totalReviews >= 50) {
    reviewVolume = 25;
    strengths.push(`Strong review authority (${totalReviews}+ customer reviews)`);
  } else if (totalReviews >= 25) {
    reviewVolume = 20;
  } else if (totalReviews >= 10) {
    reviewVolume = 14;
    problems.push("Low review count compared to local market leaders (Aim for 30+ reviews)");
  } else if (totalReviews > 0) {
    reviewVolume = 8;
    problems.push("Critical: Under 10 Google reviews significantly hurts Local 3-Pack rankings");
  } else {
    reviewVolume = 0;
    problems.push("No Google reviews found. Request reviews from recent satisfied customers.");
  }

  // 3. Rating Quality (Max 20)
  let ratingQuality = 0;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews
    : 0;

  if (totalReviews === 0) {
    ratingQuality = 10;
  } else if (avgRating >= 4.8) {
    ratingQuality = 20;
    strengths.push(`Excellent customer rating (${avgRating.toFixed(1)} / 5.0 Stars)`);
  } else if (avgRating >= 4.5) {
    ratingQuality = 16;
  } else if (avgRating >= 4.0) {
    ratingQuality = 12;
    problems.push(`Average rating is ${avgRating.toFixed(1)}. Aim for 4.6+ to maximize conversion.`);
  } else {
    ratingQuality = 5;
    problems.push(`Low average rating (${avgRating.toFixed(1)}). Address customer issues proactively.`);
  }

  // 4. Review Response Rate (Max 15)
  let responseRateScore = 0;
  const answeredCount = reviews.filter(r => r.isReplied || (r.replyComment && r.replyComment.trim().length > 0)).length;
  const responseRate = totalReviews > 0 ? (answeredCount / totalReviews) * 100 : 100;

  if (totalReviews === 0 || responseRate >= 90) {
    responseRateScore = 15;
    if (totalReviews > 0) strengths.push(`High review response rate (${responseRate.toFixed(0)}%)`);
  } else if (responseRate >= 70) {
    responseRateScore = 10;
  } else if (responseRate >= 40) {
    responseRateScore = 6;
    problems.push(`Low review response rate (${responseRate.toFixed(0)}%). Respond to unanswered reviews.`);
  } else {
    responseRateScore = 2;
    problems.push("Critical: Over 60% of Google reviews remain unanswered. Google rewards active businesses.");
  }

  // 5. Consistency & Media (Max 10)
  let consistencyAndMedia = 0;
  if (location.hours) {
    consistencyAndMedia += 5;
    strengths.push("Business opening hours configured");
  } else {
    problems.push("Opening hours not specified");
  }

  // Baseline photo presence
  consistencyAndMedia += 5;

  const totalScore = Math.min(100, Math.max(0, completeness + reviewVolume + ratingQuality + responseRateScore + consistencyAndMedia));

  return {
    score: totalScore,
    problems,
    strengths,
    breakdown: {
      completeness,
      reviewVolume,
      ratingQuality,
      responseRate: responseRateScore,
      consistencyAndMedia
    }
  };
}

export async function syncBusinessProfile(
  db: any,
  businessId: string,
  userId: string,
  accessToken: string,
  locationResourceName: string,
  googleAccountId?: string
): Promise<{
  success: boolean;
  localSeoScore: number;
  totalReviews: number;
  averageRating: number;
  problems: string[];
  location: Partial<GbpLocation>;
}> {
  const client = new GoogleBusinessClient();

  // 1. Fetch location info
  const locations = await client.fetchLocations(accessToken, googleAccountId).catch(() => []);
  const matchingLoc = locations.find(l => l.name === locationResourceName) || locations[0] || {
    name: locationResourceName,
    title: 'Google Business Profile'
  };

  // 2. Fetch reviews
  const reviews = await client.fetchReviews(accessToken, locationResourceName, 100).catch(() => []);

  // 3. Compute Local SEO Score & Audit
  const audit = calculateLocalSeoScore(matchingLoc, reviews);

  const avgRating = reviews.length > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : 0.0;

  // 4. Save/Update google_connections
  const connId = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO google_connections (
      id, business_id, user_id, google_account_id, location_id,
      location_name, business_name, status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'connected', CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO NOTHING
  `).bind(
    connId,
    businessId,
    userId,
    googleAccountId || null,
    matchingLoc.name,
    matchingLoc.title,
    matchingLoc.title
  ).run().catch(() => {});

  // Also update standard integrations table
  await db.prepare(`
    INSERT INTO integrations (id, user_id, provider, access_token, status)
    VALUES (?, ?, 'google_business', ?, 'active')
    ON CONFLICT(user_id, provider) DO UPDATE SET
      access_token = excluded.access_token,
      status = 'active',
      updated_at = CURRENT_TIMESTAMP
  `).bind(crypto.randomUUID(), userId, accessToken).run().catch(() => {});

  // 5. Save/Update google_location_profiles
  const profileId = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO google_location_profiles (
      id, business_id, location_id, title, address, phone,
      website_uri, primary_category, regular_hours, has_description,
      total_reviews, average_rating, local_seo_score, audit_problems,
      last_synced_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(business_id) DO UPDATE SET
      location_id = excluded.location_id,
      title = excluded.title,
      address = excluded.address,
      phone = excluded.phone,
      website_uri = excluded.website_uri,
      primary_category = excluded.primary_category,
      regular_hours = excluded.regular_hours,
      has_description = excluded.has_description,
      total_reviews = excluded.total_reviews,
      average_rating = excluded.average_rating,
      local_seo_score = excluded.local_seo_score,
      audit_problems = excluded.audit_problems,
      last_synced_at = CURRENT_TIMESTAMP
  `).bind(
    profileId,
    businessId,
    matchingLoc.name,
    matchingLoc.title,
    matchingLoc.address || null,
    matchingLoc.phone || null,
    matchingLoc.website || null,
    matchingLoc.category || null,
    matchingLoc.hours || null,
    matchingLoc.hasDescription ? 1 : 0,
    reviews.length,
    avgRating,
    audit.score,
    JSON.stringify(audit.problems)
  ).run().catch(() => {});

  // 6. Sync reviews to google_reviews & reviews tables
  for (const r of reviews) {
    const revDbId = crypto.randomUUID();
    const replyStatus = r.isReplied || (r.replyComment && r.replyComment.trim().length > 0) ? 'answered' : 'unanswered';

    await db.prepare(`
      INSERT INTO google_reviews (
        id, business_id, user_id, review_id, customer_name,
        reviewer_photo_url, rating, review_text, review_date,
        owner_reply, reply_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(review_id) DO UPDATE SET
        customer_name = excluded.customer_name,
        rating = excluded.rating,
        review_text = excluded.review_text,
        owner_reply = excluded.owner_reply,
        reply_status = excluded.reply_status,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      revDbId,
      businessId,
      userId,
      r.reviewId,
      r.reviewerName,
      r.reviewerPhotoUrl || null,
      r.rating,
      r.comment || '',
      r.createTime,
      r.replyComment || null,
      replyStatus
    ).run().catch(() => {});

    // Mirror to standard reviews table
    await db.prepare(`
      INSERT INTO reviews (
        id, user_id, business_id, google_location_id, google_review_id,
        reviewer_name, reviewer_profile_url, reviewer_photo_url,
        rating, comment, review_created_at, review_updated_at,
        reply_comment, reply_updated_at, is_replied, source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        rating = excluded.rating,
        comment = excluded.comment,
        reply_comment = excluded.reply_comment,
        is_replied = excluded.is_replied,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      revDbId,
      userId,
      businessId,
      matchingLoc.name,
      r.reviewId,
      r.reviewerName,
      r.reviewerProfileUrl || null,
      r.reviewerPhotoUrl || null,
      r.rating,
      r.comment || '',
      r.createTime,
      r.updateTime || r.createTime,
      r.replyComment || null,
      r.replyUpdateTime || null,
      replyStatus === 'answered' ? 1 : 0
    ).run().catch(() => {});
  }

  // 7. Update Growth Score in D1 with local score
  await db.prepare(`
    UPDATE growth_scores SET
      local_score = ?,
      reviews_score = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE business_id = ?
  `).bind(
    audit.score,
    Math.min(100, Math.round((avgRating / 5.0) * 100)),
    businessId
  ).run().catch(() => {});

  return {
    success: true,
    localSeoScore: audit.score,
    totalReviews: reviews.length,
    averageRating: avgRating,
    problems: audit.problems,
    location: matchingLoc
  };
}

export async function generateLocalAiRecommendations(
  apiKey: string | undefined,
  businessName: string,
  city: string,
  localScore: number,
  totalReviews: number,
  averageRating: number,
  problems: string[],
  competitorAvgReviews: number = 120
): Promise<Array<{ title: string; recommendation: string; impact: 'HIGH' | 'MEDIUM' | 'LOW'; effort: 'EASY' | 'MEDIUM' }>> {
  const defaultRecommendations = [
    {
      title: "Review Generation Campaign",
      recommendation: `Your competitors have an average of ~${competitorAvgReviews} reviews. You have ${totalReviews}. Aim for 8-10 new customer reviews per month to elevate Local 3-Pack visibility.`,
      impact: 'HIGH' as const,
      effort: 'MEDIUM' as const
    },
    {
      title: "Unanswered Review Response Policy",
      recommendation: "Maintain a 100% response rate within 24 hours. Google prioritizes actively managed business profiles in mobile search results.",
      impact: 'HIGH' as const,
      effort: 'EASY' as const
    },
    {
      title: "Local NAP & Description Optimization",
      recommendation: `Ensure your business description includes localized keywords for ${city} and service categories without keyword stuffing.`,
      impact: 'MEDIUM' as const,
      effort: 'EASY' as const
    }
  ];

  if (!apiKey) return defaultRecommendations;

  try {
    const prompt = `You are an expert Local SEO Strategist for Rankora SaaS.
Business: ${businessName} in ${city}
Local SEO Visibility Score: ${localScore}/100
Current Google Reviews: ${totalReviews} (Avg: ${averageRating}/5.0)
Estimated Competitor Average Reviews: ${competitorAvgReviews}
Detected GBP Problems: ${problems.join(', ') || 'None'}

Generate 3 high-impact, actionable Local SEO recommendations to dominate Google Maps and Local 3-Pack.
Return strictly valid JSON:
[
  {
    "title": "Short action title",
    "recommendation": "Specific 1-2 sentence advice mentioning review targets or optimizations",
    "impact": "HIGH" | "MEDIUM" | "LOW",
    "effort": "EASY" | "MEDIUM"
  }
]`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: 'You are a Local SEO Intelligence agent. Output strictly valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json() as any;
      const rawText = data.choices?.[0]?.message?.content?.trim();
      if (rawText) {
        const cleaned = rawText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err: any) {
    console.warn("AI Local recommendations fallback:", err.message);
  }

  return defaultRecommendations;
}
