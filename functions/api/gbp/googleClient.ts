import type { GbpAccount, GbpLocation, GbpReview } from './types';

export class GoogleBusinessClient {
  constructor(
    private readonly clientId?: string,
    private readonly clientSecret?: string
  ) {}

  getOAuthUrl(redirectUri: string, state: string): string {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials not configured on server');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AUTH_FAILED: Google OAuth token exchange failed: ${errorText}`);
    }

    return response.json();
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ access_token: string; expires_in: number }> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials not configured on server');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AUTH_FAILED: Token refresh failed: ${errorText}`);
    }

    return response.json();
  }

  async fetchAccounts(accessToken: string): Promise<GbpAccount[]> {
    const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PROVIDER_ERROR: Failed to fetch GBP accounts: ${errorText}`);
    }

    const data = await response.json() as any;
    const accounts = Array.isArray(data.accounts) ? data.accounts : [];

    return accounts.map((acc: any) => ({
      name: acc.name, // e.g. "accounts/123456"
      accountName: acc.accountName || acc.name,
      type: acc.type || 'PERSONAL',
      role: acc.role || 'OWNER'
    }));
  }

  async fetchLocations(accessToken: string, accountName?: string): Promise<GbpLocation[]> {
    let accountsToScan: string[] = [];

    if (accountName) {
      accountsToScan = [accountName];
    } else {
      const accounts = await this.fetchAccounts(accessToken).catch(() => []);
      accountsToScan = accounts.map(a => a.name);
    }

    if (accountsToScan.length === 0) {
      return [];
    }

    const allLocations: GbpLocation[] = [];
    const readMask = 'name,title,storeCode,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile';

    for (const acc of accountsToScan) {
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${acc}/locations?readMask=${encodeURIComponent(readMask)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json() as any;
        const locations = Array.isArray(locationsData.locations) ? locationsData.locations : [];

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
            name: loc.name, // "locations/123"
            title: loc.title || 'Untitled Business',
            storeCode: loc.storeCode || undefined,
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
  }

  async fetchReviews(accessToken: string, locationResourceName: string, pageSize = 50): Promise<GbpReview[]> {
    // Normalizes location format to "accounts/.../locations/..." or "locations/..."
    const cleanLocation = locationResourceName.startsWith('locations/') || locationResourceName.startsWith('accounts/')
      ? locationResourceName
      : `locations/${locationResourceName}`;

    const response = await fetch(`https://mybusiness.googleapis.com/v4/${cleanLocation}/reviews?pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PROVIDER_ERROR: Failed to fetch GBP reviews: ${errorText}`);
    }

    const data = await response.json() as any;
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];

    const starMap: Record<string, number> = {
      'FIVE': 5,
      'FOUR': 4,
      'THREE': 3,
      'TWO': 2,
      'ONE': 1
    };

    return reviews.map((r: any) => {
      const numRating = typeof r.starRating === 'number' ? r.starRating : (starMap[r.starRating] || 5);
      const reply = r.reviewReply?.comment || null;

      return {
        reviewId: r.reviewId || crypto.randomUUID(),
        reviewerName: r.reviewer?.displayName || 'Google Reviewer',
        reviewerProfileUrl: r.reviewer?.profilePhotoUrl || undefined,
        reviewerPhotoUrl: r.reviewer?.profilePhotoUrl || undefined,
        rating: numRating,
        comment: r.comment || '',
        createTime: r.createTime || new Date().toISOString(),
        updateTime: r.updateTime || r.createTime || new Date().toISOString(),
        replyComment: reply,
        replyUpdateTime: r.reviewReply?.updateTime || null,
        isReplied: !!reply
      };
    });
  }

  async publishReply(
    accessToken: string,
    locationResourceName: string,
    reviewId: string,
    replyComment: string
  ): Promise<{ success: boolean; comment: string; updateTime: string }> {
    const cleanLocation = locationResourceName.startsWith('locations/') || locationResourceName.startsWith('accounts/')
      ? locationResourceName
      : `locations/${locationResourceName}`;

    const url = `https://mybusiness.googleapis.com/v4/${cleanLocation}/reviews/${reviewId}/reply`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: replyComment.trim()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PROVIDER_ERROR: Failed to publish review reply: ${errorText}`);
    }

    const data = await response.json() as any;
    return {
      success: true,
      comment: data.comment || replyComment,
      updateTime: data.updateTime || new Date().toISOString()
    };
  }
}
