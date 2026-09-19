import type { ReviewMetrics, ReviewTrend } from './types';

export async function computeBusinessReviewMetrics(
  db: any,
  businessId: string
): Promise<ReviewMetrics> {
  const { results: rawReviews } = await db.prepare(`
    SELECT rating, is_replied, reply_comment, sentiment, comment, review_created_at
    FROM reviews
    WHERE business_id = ?
    ORDER BY review_created_at DESC
  `).bind(businessId).all();

  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      starsBreakdown: { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 },
      unansweredReviews: 0,
      responseRate: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0
    };
  }

  let ratingSum = 0;
  let answeredCount = 0;
  const starsBreakdown = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  for (const r of reviews) {
    const rating = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    ratingSum += rating;

    if (rating === 5) starsBreakdown.star5++;
    else if (rating === 4) starsBreakdown.star4++;
    else if (rating === 3) starsBreakdown.star3++;
    else if (rating === 2) starsBreakdown.star2++;
    else if (rating === 1) starsBreakdown.star1++;

    // Unanswered check
    const isReplied = r.is_replied === 1 || (r.reply_comment && r.reply_comment.trim().length > 0);
    if (isReplied) {
      answeredCount++;
    }

    // Sentiment count
    const sent = (r.sentiment || '').toUpperCase();
    if (sent === 'POSITIVE' || (!sent && rating >= 4)) positiveCount++;
    else if (sent === 'NEGATIVE' || (!sent && rating <= 2)) negativeCount++;
    else neutralCount++;
  }

  const averageRating = parseFloat((ratingSum / totalReviews).toFixed(1));
  const unansweredReviews = totalReviews - answeredCount;
  const responseRate = parseFloat(((answeredCount / totalReviews) * 100).toFixed(1));

  return {
    totalReviews,
    averageRating,
    starsBreakdown,
    unansweredReviews,
    responseRate,
    positiveCount,
    neutralCount,
    negativeCount
  };
}

export async function computeReviewTrends(
  db: any,
  businessId: string,
  days: number = 30
): Promise<ReviewTrend> {
  const { results: rawReviews } = await db.prepare(`
    SELECT rating, is_replied, reply_comment, sentiment, review_created_at
    FROM reviews
    WHERE business_id = ? AND review_created_at >= datetime('now', '-' || ? || ' days')
    ORDER BY review_created_at DESC
  `).bind(businessId, days).all();

  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const newReviewsCount = reviews.length;

  if (newReviewsCount === 0) {
    return {
      periodDays: days,
      newReviewsCount: 0,
      averageRating: 0,
      responseRate: 0,
      negativeReviewsCount: 0
    };
  }

  let ratingSum = 0;
  let answeredCount = 0;
  let negativeCount = 0;

  for (const r of reviews) {
    const rating = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    ratingSum += rating;

    const isReplied = r.is_replied === 1 || (r.reply_comment && r.reply_comment.trim().length > 0);
    if (isReplied) answeredCount++;

    if (rating <= 2 || (r.sentiment || '').toUpperCase() === 'NEGATIVE') {
      negativeCount++;
    }
  }

  return {
    periodDays: days,
    newReviewsCount,
    averageRating: parseFloat((ratingSum / newReviewsCount).toFixed(1)),
    responseRate: parseFloat(((answeredCount / newReviewsCount) * 100).toFixed(1)),
    negativeReviewsCount: negativeCount
  };
}
