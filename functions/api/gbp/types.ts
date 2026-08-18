export interface GbpAccount {
  name: string; // "accounts/123456"
  accountName: string; // Human-readable name
  type?: string;
  role?: string;
  locationCount?: number;
}

export interface GbpLocation {
  name: string; // "locations/123" or "accounts/123/locations/456"
  title: string; // Business name on GBP
  storeCode?: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  hours?: string;
  hasDescription?: boolean;
  totalReviews?: number;
  averageRating?: number;
}

export interface GbpReview {
  reviewId: string;
  reviewerName: string;
  reviewerProfileUrl?: string;
  reviewerPhotoUrl?: string;
  rating: number;
  comment: string;
  createTime: string;
  updateTime?: string;
  replyComment?: string | null;
  replyUpdateTime?: string | null;
  isReplied: boolean;
}

export interface ReviewMetrics {
  totalReviews: number;
  averageRating: number;
  starsBreakdown: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
  unansweredReviews: number;
  responseRate: number; // percentage e.g. 93.1
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export interface ReviewTrend {
  periodDays: number; // 7, 30, 90
  newReviewsCount: number;
  averageRating: number;
  responseRate: number;
  negativeReviewsCount: number;
}

export interface ReviewSentimentAnalysis {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  topics: string[]; // e.g. ["Staff", "Service", "Waiting Time", "Cleanliness", "Price", "Quality"]
  summary: string;
}

export interface AiReplyOptions {
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  tone?: 'professional' | 'friendly' | 'empathetic' | 'concise';
}
