import type { WordPressSiteInfo, WordPressItem } from './types';

export class WordPressProvider {
  readonly providerName = 'wordpress';

  /**
   * Sanitizes and enforces HTTPS for WordPress site URL
   */
  public normalizeUrl(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new Error('INVALID_URL: WordPress URL cannot be empty');
    }

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    if (url.startsWith('http://')) {
      // In production, enforce HTTPS for credential safety
      url = url.replace('http://', 'https://');
    }

    // Strip trailing slashes and /wp-json
    url = url.replace(/\/+$/, '').replace(/\/wp-json\/?$/, '');

    try {
      const parsed = new URL(url);
      if (!parsed.hostname || parsed.hostname.length < 3) {
        throw new Error('INVALID_URL: Invalid domain host');
      }
      return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '')}`;
    } catch (e: any) {
      throw new Error(`INVALID_URL: ${e.message}`);
    }
  }

  /**
   * Generates Basic Auth header for WordPress Application Passwords
   */
  private getAuthHeaders(username: string, appPassword: string): Record<string, string> {
    const cleanUser = (username || '').trim();
    // Application passwords in WordPress are often formatted as "abcd efgh ijkl mnop", remove extra whitespace
    const cleanPass = (appPassword || '').trim();
    
    // Convert to base64
    const credentials = `${cleanUser}:${cleanPass}`;
    const utf8Bytes = new TextEncoder().encode(credentials);
    let binaryStr = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryStr += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Auth = btoa(binaryStr);

    return {
      'Authorization': `Basic ${base64Auth}`,
      'Accept': 'application/json',
      'User-Agent': 'Scorankio-WordPress-Operator/2.0'
    };
  }

  private async fetchWP(endpoint: string, siteUrl: string, username: string, appPassword: string, options: RequestInit = {}) {
    const baseUrl = this.normalizeUrl(siteUrl);
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const authHeaders = this.getAuthHeaders(username, appPassword);

    const headers: Record<string, string> = {
      ...authHeaders,
      ...(options.headers as Record<string, string> || {})
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers
      });
    } catch (err: any) {
      throw new Error(`CONNECTION_FAILED: Unable to reach WordPress server at ${baseUrl} (${err.message})`);
    }

    if (response.status === 401) {
      throw new Error('INVALID_CREDENTIALS: WordPress Application Password or Username is incorrect');
    }
    if (response.status === 403) {
      throw new Error('INSUFFICIENT_PERMISSIONS: User account lacks administrative or edit permissions in WordPress');
    }
    if (response.status === 404) {
      throw new Error('WORDPRESS_API_UNAVAILABLE: WordPress REST API route not found. Verify REST API is enabled.');
    }
    if (response.status === 429) {
      throw new Error('RATE_LIMITED: WordPress server is rate limiting REST API requests');
    }
    if (!response.ok) {
      const errJson: any = await response.json().catch(() => ({}));
      throw new Error(errJson?.message || `WordPress API returned status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Validates WordPress REST API connectivity and authentication credentials
   */
  async testConnection(siteUrl: string, username: string, appPassword: string): Promise<{
    success: boolean;
    siteName: string;
    siteUrl: string;
    user: { id: number; name: string; slug: string };
  }> {
    const baseUrl = this.normalizeUrl(siteUrl);

    // 1. Fetch authenticated user profile
    const user = await this.fetchWP('/wp-json/wp/v2/users/me', baseUrl, username, appPassword);

    // 2. Fetch site information
    let siteName = baseUrl;
    try {
      const rootInfo = await this.fetchWP('/wp-json/', baseUrl, username, appPassword);
      siteName = rootInfo.name || baseUrl;
    } catch (e) {
      // Non-critical, fallback to user name
    }

    return {
      success: true,
      siteName,
      siteUrl: baseUrl,
      user: {
        id: user.id,
        name: user.name || username,
        slug: user.slug || username
      }
    };
  }

  async getSiteInfo(siteUrl: string, username: string, appPassword: string): Promise<WordPressSiteInfo> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const info = await this.fetchWP('/wp-json/', baseUrl, username, appPassword);
    return {
      name: info.name || 'WordPress Site',
      description: info.description || '',
      url: info.url || baseUrl,
      home: info.home || baseUrl,
      gmt_offset: info.gmt_offset,
      timezone_string: info.timezone_string,
      namespaces: info.namespaces || []
    };
  }

  async getPages(siteUrl: string, username: string, appPassword: string, perPage: number = 50): Promise<WordPressItem[]> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const pages = await this.fetchWP(`/wp-json/wp/v2/pages?per_page=${perPage}&context=edit`, baseUrl, username, appPassword);
    if (!Array.isArray(pages)) return [];
    return pages.map((p: any) => ({
      id: p.id,
      date: p.date,
      modified: p.modified,
      slug: p.slug,
      status: p.status,
      type: 'page',
      link: p.link,
      title: { rendered: p.title?.rendered || '', raw: p.title?.raw },
      content: { rendered: p.content?.rendered || '', raw: p.content?.raw },
      excerpt: { rendered: p.excerpt?.rendered || '', raw: p.excerpt?.raw },
      yoast_head_json: p.yoast_head_json,
      rank_math_seo: p.rank_math_seo,
      meta: p.meta || {}
    }));
  }

  async getPosts(siteUrl: string, username: string, appPassword: string, perPage: number = 50): Promise<WordPressItem[]> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const posts = await this.fetchWP(`/wp-json/wp/v2/posts?per_page=${perPage}&context=edit`, baseUrl, username, appPassword);
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: p.id,
      date: p.date,
      modified: p.modified,
      slug: p.slug,
      status: p.status,
      type: 'post',
      link: p.link,
      title: { rendered: p.title?.rendered || '', raw: p.title?.raw },
      content: { rendered: p.content?.rendered || '', raw: p.content?.raw },
      excerpt: { rendered: p.excerpt?.rendered || '', raw: p.excerpt?.raw },
      yoast_head_json: p.yoast_head_json,
      rank_math_seo: p.rank_math_seo,
      meta: p.meta || {}
    }));
  }

  async getPage(siteUrl: string, username: string, appPassword: string, pageId: number | string): Promise<WordPressItem> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const p = await this.fetchWP(`/wp-json/wp/v2/pages/${pageId}?context=edit`, baseUrl, username, appPassword);
    return {
      id: p.id,
      date: p.date,
      modified: p.modified,
      slug: p.slug,
      status: p.status,
      type: 'page',
      link: p.link,
      title: { rendered: p.title?.rendered || '', raw: p.title?.raw },
      content: { rendered: p.content?.rendered || '', raw: p.content?.raw },
      excerpt: { rendered: p.excerpt?.rendered || '', raw: p.excerpt?.raw },
      yoast_head_json: p.yoast_head_json,
      rank_math_seo: p.rank_math_seo,
      meta: p.meta || {}
    };
  }

  async getPost(siteUrl: string, username: string, appPassword: string, postId: number | string): Promise<WordPressItem> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const p = await this.fetchWP(`/wp-json/wp/v2/posts/${postId}?context=edit`, baseUrl, username, appPassword);
    return {
      id: p.id,
      date: p.date,
      modified: p.modified,
      slug: p.slug,
      status: p.status,
      type: 'post',
      link: p.link,
      title: { rendered: p.title?.rendered || '', raw: p.title?.raw },
      content: { rendered: p.content?.rendered || '', raw: p.content?.raw },
      excerpt: { rendered: p.excerpt?.rendered || '', raw: p.excerpt?.raw },
      yoast_head_json: p.yoast_head_json,
      rank_math_seo: p.rank_math_seo,
      meta: p.meta || {}
    };
  }

  async updatePage(
    siteUrl: string,
    username: string,
    appPassword: string,
    pageId: number | string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      meta?: Record<string, any>;
    }
  ): Promise<WordPressItem> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const updated = await this.fetchWP(
      `/wp-json/wp/v2/pages/${pageId}`,
      baseUrl,
      username,
      appPassword,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    return {
      id: updated.id,
      date: updated.date,
      modified: updated.modified,
      slug: updated.slug,
      status: updated.status,
      type: 'page',
      link: updated.link,
      title: { rendered: updated.title?.rendered || '', raw: updated.title?.raw },
      content: { rendered: updated.content?.rendered || '', raw: updated.content?.raw },
      excerpt: { rendered: updated.excerpt?.rendered || '', raw: updated.excerpt?.raw },
      yoast_head_json: updated.yoast_head_json,
      rank_math_seo: updated.rank_math_seo,
      meta: updated.meta || {}
    };
  }

  async updatePost(
    siteUrl: string,
    username: string,
    appPassword: string,
    postId: number | string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      meta?: Record<string, any>;
    }
  ): Promise<WordPressItem> {
    const baseUrl = this.normalizeUrl(siteUrl);
    const updated = await this.fetchWP(
      `/wp-json/wp/v2/posts/${postId}`,
      baseUrl,
      username,
      appPassword,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    return {
      id: updated.id,
      date: updated.date,
      modified: updated.modified,
      slug: updated.slug,
      status: updated.status,
      type: 'post',
      link: updated.link,
      title: { rendered: updated.title?.rendered || '', raw: updated.title?.raw },
      content: { rendered: updated.content?.rendered || '', raw: updated.content?.raw },
      excerpt: { rendered: updated.excerpt?.rendered || '', raw: updated.excerpt?.raw },
      yoast_head_json: updated.yoast_head_json,
      rank_math_seo: updated.rank_math_seo,
      meta: updated.meta || {}
    };
  }
}

export const wordpressProvider = new WordPressProvider();
