// Google Business Profile OAuth & Data Engine for Rankora

export function getGoogleOAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth token exchange failed: ${errorText}`);
  }

  return response.json();
}

export interface GoogleLocation {
  name: string; // Resource name: "locations/{locationId}" or "accounts/{accId}/locations/{locId}"
  title: string; // Business Title
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  hours?: string;
  hasDescription?: boolean;
}

export async function fetchGoogleLocations(accessToken: string): Promise<GoogleLocation[]> {
  try {
    const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!accountsResponse.ok) {
      console.warn("Could not fetch accounts directly:", await accountsResponse.text());
      return [];
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];

    if (accounts.length === 0) {
      return [];
    }

    const allLocations: GoogleLocation[] = [];

    for (const account of accounts) {
      const accountName = account.name; // e.g. "accounts/123456"
      const readMask = 'name,title,storeCode,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile';
      
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=${encodeURIComponent(readMask)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        const locations = locationsData.locations || [];
        
        for (const loc of locations) {
          const addr = loc.storefrontAddress;
          let formattedAddr = '';
          if (addr) {
            formattedAddr = [
              ...(addr.addressLines || []),
              addr.locality,
              addr.administrativeArea,
              addr.postalCode
            ].filter(Boolean).join(', ');
          }

          allLocations.push({
            name: loc.name,
            title: loc.title || 'Untitled Business',
            address: formattedAddr || undefined,
            phone: loc.phoneNumbers?.primaryPhone || undefined,
            website: loc.websiteUri || undefined,
            category: loc.categories?.primaryCategory?.displayName || undefined,
            hours: loc.regularHours ? 'Configured' : undefined,
            hasDescription: !!loc.profile?.description
          });
        }
      }
    }

    return allLocations;
  } catch (err) {
    console.error("fetchGoogleLocations error:", err);
    return [];
  }
}

export interface GbpHealthEvaluation {
  score: number;
  status: 'OPTIMAL' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  completedChecks: number;
  totalChecks: number;
  breakdown: Array<{
    factor: string;
    status: 'COMPLETE' | 'MISSING' | 'ACTION_REQUIRED';
    whyItMatters: string;
    recommendedAction: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

export function computeGbpHealth(
  loc: GoogleLocation | null, 
  reviewStats: { total: number; avgRating: number; unanswered: number }
): GbpHealthEvaluation {
  if (!loc) {
    return {
      score: 0,
      status: 'CRITICAL',
      completedChecks: 0,
      totalChecks: 7,
      breakdown: [
        {
          factor: 'Google Business Profile Connection',
          status: 'ACTION_REQUIRED',
          whyItMatters: 'An active GBP link is the #1 ranking factor for Google Local 3-Pack placement.',
          recommendedAction: 'Connect your Google Business Profile in Settings to sync live ratings and local presence.',
          impact: 'HIGH'
        }
      ]
    };
  }

  const items = [
    {
      factor: 'Business Name & Exact Entity Match',
      isComplete: !!loc.title && loc.title.length > 2,
      whyItMatters: 'Exact match between website branding and GBP listing prevents algorithmic suspension.',
      recommendedAction: 'Ensure business name exactly matches state registration.',
      impact: 'HIGH' as const
    },
    {
      factor: 'Physical Storefront / Service Area Address',
      isComplete: !!loc.address,
      whyItMatters: 'Precise geographic coordinates allow Google Maps to calculate proximity for searchers.',
      recommendedAction: 'Set exact physical address or clear neighborhood service boundaries.',
      impact: 'HIGH' as const
    },
    {
      factor: 'Direct Primary Phone Line',
      isComplete: !!loc.phone,
      whyItMatters: 'Enables mobile users to initiate click-to-call conversions directly from search results.',
      recommendedAction: 'Add a verified direct local telephone number.',
      impact: 'HIGH' as const
    },
    {
      factor: 'Canonical Website URL Link',
      isComplete: !!loc.website,
      whyItMatters: 'Passes website domain authority and on-page schema back into the Google Maps entity card.',
      recommendedAction: 'Verify that your secure HTTPS website URL is linked to your GBP profile.',
      impact: 'HIGH' as const
    },
    {
      factor: 'Primary Business Category',
      isComplete: !!loc.category,
      whyItMatters: 'The primary category determines which commercial queries trigger your map pack card.',
      recommendedAction: 'Select the most specific primary category matching your core customer offering.',
      impact: 'HIGH' as const
    },
    {
      factor: 'Regular Operating Hours',
      isComplete: !!loc.hours,
      whyItMatters: 'Google prioritizes "Open Now" businesses in local search queries.',
      recommendedAction: 'Maintain up-to-date weekly opening and closing hours.',
      impact: 'MEDIUM' as const
    },
    {
      factor: 'Customer Review Engagement & Rating',
      isComplete: reviewStats.total >= 5 && reviewStats.avgRating >= 4.0 && reviewStats.unanswered === 0,
      whyItMatters: 'Active response rates and 4.0+ ratings build trust and improve Local Pack ranking velocity.',
      recommendedAction: reviewStats.unanswered > 0 ? `Respond to ${reviewStats.unanswered} unanswered customer reviews.` : 'Acquire 5+ fresh reviews monthly.',
      impact: 'HIGH' as const
    }
  ];

  let completedCount = 0;
  const breakdown = items.map(item => {
    if (item.isComplete) completedCount++;
    return {
      factor: item.factor,
      status: item.isComplete ? ('COMPLETE' as const) : ('MISSING' as const),
      whyItMatters: item.whyItMatters,
      recommendedAction: item.recommendedAction,
      impact: item.impact
    };
  });

  const score = Math.round((completedCount / items.length) * 100);
  const status = score >= 85 ? 'OPTIMAL' : score >= 70 ? 'GOOD' : score >= 50 ? 'NEEDS_ATTENTION' : 'CRITICAL';

  return {
    score,
    status,
    completedChecks: completedCount,
    totalChecks: items.length,
    breakdown
  };
}

export async function syncGoogleReviews(
  db: any, 
  userId: string, 
  locationName: string, 
  accessToken: string
): Promise<{ synced: number; error?: string }> {
  try {
    const reviewsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text();
      console.warn("GBP Reviews fetch notice:", reviewsResponse.status, errorText);
      return { synced: 0, error: `Google API status ${reviewsResponse.status}` };
    }

    const data = await reviewsResponse.json();
    const reviews = data.reviews || [];

    if (reviews.length === 0) return { synced: 0 };

    const insertStmt = db.prepare(`
      INSERT INTO reviews (id, user_id, external_id, reviewer_name, rating, review_text, review_date, owner_reply, reply_status, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        rating = excluded.rating,
        review_text = excluded.review_text,
        review_date = excluded.review_date,
        owner_reply = excluded.owner_reply
    `);

    const batch = reviews.map((r: any) => {
      const ratingMap: Record<string, number> = {
        'FIVE': 5,
        'FOUR': 4,
        'THREE': 3,
        'TWO': 2,
        'ONE': 1
      };
      const numRating = typeof r.starRating === 'number' ? r.starRating : (ratingMap[r.starRating] || 5);

      return insertStmt.bind(
        r.reviewId || crypto.randomUUID(),
        userId,
        r.reviewId || null,
        r.reviewer?.displayName || 'Google Reviewer',
        numRating,
        r.comment || '',
        r.updateTime || r.createTime || new Date().toISOString(),
        r.reviewReply?.comment || null,
        r.reviewReply?.comment ? 'replied' : 'none',
        'google'
      );
    });

    await db.batch(batch);
    return { synced: batch.length };
  } catch (err: any) {
    console.error("syncGoogleReviews error:", err);
    return { synced: 0, error: err.message };
  }
}
