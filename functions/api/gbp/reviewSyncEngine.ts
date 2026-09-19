import type { GbpReview } from './types';
import { GoogleBusinessClient } from './googleClient';

export async function syncLocationReviews(
  db: any,
  userId: string,
  businessId: string,
  locationId: string,
  accessToken: string
): Promise<{
  syncedCount: number;
  newCount: number;
  updatedCount: number;
  locationTitle?: string;
}> {
  const client = new GoogleBusinessClient();
  const reviews = await client.fetchReviews(accessToken, locationId, 100);

  if (!reviews || reviews.length === 0) {
    await db.prepare(
      "UPDATE gbp_locations SET last_synced_at = CURRENT_TIMESTAMP WHERE google_location_id = ? AND business_id = ?"
    ).bind(locationId, businessId).run().catch(() => {});

    return { syncedCount: 0, newCount: 0, updatedCount: 0 };
  }

  let newCount = 0;
  let updatedCount = 0;

  for (const r of reviews) {
    const existing = await db.prepare(
      "SELECT id, is_replied, reply_comment FROM reviews WHERE google_review_id = ? AND business_id = ?"
    ).bind(r.reviewId, businessId).first();

    if (existing) {
      // Incremental update
      await db.prepare(`
        UPDATE reviews SET
          rating = ?,
          comment = ?,
          review_updated_at = ?,
          reply_comment = ?,
          reply_updated_at = ?,
          is_replied = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        r.rating,
        r.comment,
        r.updateTime || new Date().toISOString(),
        r.replyComment || null,
        r.replyUpdateTime || null,
        r.isReplied ? 1 : 0,
        existing.id
      ).run();

      updatedCount++;
    } else {
      // New review insert
      const newId = crypto.randomUUID();
      await db.prepare(`
        INSERT INTO reviews (
          id, user_id, business_id, google_location_id, google_review_id,
          reviewer_name, reviewer_profile_url, reviewer_photo_url,
          rating, comment, review_created_at, review_updated_at,
          reply_comment, reply_updated_at, is_replied, source,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        newId,
        userId,
        businessId,
        locationId,
        r.reviewId,
        r.reviewerName,
        r.reviewerProfileUrl || null,
        r.reviewerPhotoUrl || null,
        r.rating,
        r.comment,
        r.createTime,
        r.updateTime || r.createTime,
        r.replyComment || null,
        r.replyUpdateTime || null,
        r.isReplied ? 1 : 0
      ).run();

      newCount++;
    }
  }

  // Update location metadata
  const total = reviews.length;
  const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / total;
  const roundedAvg = parseFloat(avg.toFixed(1));

  await db.prepare(`
    UPDATE gbp_locations SET
      total_reviews = ?,
      average_rating = ?,
      last_synced_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE google_location_id = ? AND business_id = ?
  `).bind(total, roundedAvg, locationId, businessId).run().catch(() => {});

  return {
    syncedCount: reviews.length,
    newCount,
    updatedCount
  };
}
