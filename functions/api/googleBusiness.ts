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
    throw new Error(`Failed to exchange token: ${errorText}`);
  }

  return response.json();
}

export async function fetchGoogleLocations(accessToken: string): Promise<any> {
  const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!accountsResponse.ok) {
    throw new Error(`Failed to fetch accounts: ${await accountsResponse.text()}`);
  }

  const accountsData = await accountsResponse.json();
  const accounts = accountsData.accounts || [];

  if (accounts.length === 0) {
    return [];
  }

  const accountName = accounts[0].name;

  const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!locationsResponse.ok) {
    throw new Error(`Failed to fetch locations: ${await locationsResponse.text()}`);
  }

  const locationsData = await locationsResponse.json();
  return locationsData.locations || [];
}

export async function syncGoogleReviews(db: any, userId: string, locationName: string, accessToken: string): Promise<{ synced: number }> {
  // locationName is expected to be in the fully qualified format: "accounts/{accountId}/locations/{locationId}"
  const reviewsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!reviewsResponse.ok) {
    const errorText = await reviewsResponse.text();
    console.error("GBP Reviews API Error:", errorText);
    throw new Error(`Failed to fetch reviews: ${reviewsResponse.status}`);
  }

  const data = await reviewsResponse.json();
  const reviews = data.reviews || [];

  if (reviews.length === 0) return { synced: 0 };

  // Setup batch insert
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
    return insertStmt.bind(
      r.reviewId,
      userId,
      r.reviewId,
      r.reviewer?.displayName || 'Google User',
      r.starRating === 'FIVE' ? 5 : r.starRating === 'FOUR' ? 4 : r.starRating === 'THREE' ? 3 : r.starRating === 'TWO' ? 2 : 1,
      r.comment || '',
      r.updateTime || r.createTime || new Date().toISOString(),
      r.reviewReply?.comment || null,
      r.reviewReply?.comment ? 'replied' : 'none',
      'google'
    );
  });

  await db.batch(batch);

  return { synced: batch.length };
}
