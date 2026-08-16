import type { ShopifyStoreInfo, ShopifyProductItem, ShopifyPageItem, ShopifyArticleItem } from './types';

export class ShopifyProvider {
  readonly providerName = 'shopify';

  /**
   * Normalizes shop domain to clean hostname (e.g. store.myshopify.com)
   */
  public normalizeShopDomain(rawDomain: string): string {
    if (!rawDomain || typeof rawDomain !== 'string') {
      throw new Error('INVALID_URL: Shopify store domain cannot be empty');
    }

    let domain = rawDomain.trim().toLowerCase();
    // Remove protocol
    domain = domain.replace(/^https?:\/\//i, '');
    // Remove port, paths, slashes
    domain = domain.split('/')[0].split('?')[0];

    // If only handle entered, append .myshopify.com
    if (!domain.includes('.')) {
      domain = `${domain}.myshopify.com`;
    }

    if (domain.length < 4 || !domain.includes('.')) {
      throw new Error('INVALID_URL: Invalid Shopify domain format');
    }

    return domain;
  }

  private async fetchShopify(endpoint: string, shopDomain: string, accessToken: string, options: RequestInit = {}) {
    const domain = this.normalizeShopDomain(shopDomain);
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `https://${domain}/admin/api/2024-01${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'X-Shopify-Access-Token': accessToken.trim(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Rankora-Shopify-Operator/2.0',
      ...(options.headers as Record<string, string> || {})
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers
      });
    } catch (err: any) {
      throw new Error(`CONNECTION_FAILED: Unable to reach Shopify store at ${domain} (${err.message})`);
    }

    if (response.status === 401) {
      throw new Error('INVALID_CREDENTIALS: Shopify Admin Access Token is invalid, expired, or revoked');
    }
    if (response.status === 403) {
      throw new Error('INSUFFICIENT_PERMISSIONS: Shopify App token lacks required scopes (read_products, write_products, read_content, write_content)');
    }
    if (response.status === 404) {
      throw new Error('SHOPIFY_API_UNAVAILABLE: Shopify store or requested API resource not found');
    }
    if (response.status === 429) {
      throw new Error('RATE_LIMITED: Shopify API rate limit exceeded');
    }
    if (!response.ok) {
      const errJson: any = await response.json().catch(() => ({}));
      const msg = errJson?.errors ? (typeof errJson.errors === 'string' ? errJson.errors : JSON.stringify(errJson.errors)) : `Shopify error (${response.status})`;
      throw new Error(msg);
    }

    return response.json();
  }

  /**
   * Tests connection credentials against live Shopify Store API
   */
  async testConnection(shopDomain: string, accessToken: string): Promise<{
    success: boolean;
    store: ShopifyStoreInfo;
  }> {
    const domain = this.normalizeShopDomain(shopDomain);
    const data: any = await this.fetchShopify('/shop.json', domain, accessToken);

    if (!data || !data.shop) {
      throw new Error('CONNECTION_FAILED: Invalid Shopify response format');
    }

    const s = data.shop;
    return {
      success: true,
      store: {
        id: s.id,
        name: s.name || domain,
        email: s.email || '',
        domain: s.domain || domain,
        myshopify_domain: s.myshopify_domain || domain,
        currency: s.currency || 'USD',
        timezone: s.iana_timezone || s.timezone || 'UTC',
        shop_owner: s.shop_owner || '',
        plan_name: s.plan_name || ''
      }
    };
  }

  async getStoreInfo(shopDomain: string, accessToken: string): Promise<ShopifyStoreInfo> {
    const res = await this.testConnection(shopDomain, accessToken);
    return res.store;
  }

  async getProducts(shopDomain: string, accessToken: string, limit: number = 50): Promise<ShopifyProductItem[]> {
    const data: any = await this.fetchShopify(`/products.json?limit=${limit}`, shopDomain, accessToken);
    if (!data || !Array.isArray(data.products)) return [];

    return data.products.map((p: any) => ({
      id: p.id,
      title: p.title || '',
      handle: p.handle || '',
      body_html: p.body_html || '',
      vendor: p.vendor,
      product_type: p.product_type,
      status: p.status || 'active',
      created_at: p.created_at,
      updated_at: p.updated_at,
      seo_title: p.title,
      seo_description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : ''
    }));
  }

  async getProduct(shopDomain: string, accessToken: string, productId: number | string): Promise<ShopifyProductItem> {
    const data: any = await this.fetchShopify(`/products/${productId}.json`, shopDomain, accessToken);
    if (!data || !data.product) {
      throw new Error(`Product ${productId} not found on Shopify`);
    }

    const p = data.product;
    return {
      id: p.id,
      title: p.title || '',
      handle: p.handle || '',
      body_html: p.body_html || '',
      vendor: p.vendor,
      product_type: p.product_type,
      status: p.status || 'active',
      created_at: p.created_at,
      updated_at: p.updated_at,
      seo_title: p.title,
      seo_description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : ''
    };
  }

  async getPages(shopDomain: string, accessToken: string, limit: number = 50): Promise<ShopifyPageItem[]> {
    const data: any = await this.fetchShopify(`/pages.json?limit=${limit}`, shopDomain, accessToken);
    if (!data || !Array.isArray(data.pages)) return [];

    return data.pages.map((p: any) => ({
      id: p.id,
      title: p.title || '',
      handle: p.handle || '',
      body_html: p.body_html || '',
      author: p.author,
      created_at: p.created_at,
      updated_at: p.updated_at,
      seo_title: p.title,
      seo_description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : ''
    }));
  }

  async getPage(shopDomain: string, accessToken: string, pageId: number | string): Promise<ShopifyPageItem> {
    const data: any = await this.fetchShopify(`/pages/${pageId}.json`, shopDomain, accessToken);
    if (!data || !data.page) {
      throw new Error(`Page ${pageId} not found on Shopify`);
    }

    const p = data.page;
    return {
      id: p.id,
      title: p.title || '',
      handle: p.handle || '',
      body_html: p.body_html || '',
      author: p.author,
      created_at: p.created_at,
      updated_at: p.updated_at,
      seo_title: p.title,
      seo_description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : ''
    };
  }

  async getArticles(shopDomain: string, accessToken: string, limit: number = 50): Promise<ShopifyArticleItem[]> {
    // 1. Get blogs first
    const blogData: any = await this.fetchShopify('/blogs.json', shopDomain, accessToken);
    const blogs = blogData?.blogs || [];
    if (blogs.length === 0) return [];

    const allArticles: ShopifyArticleItem[] = [];
    for (const blog of blogs.slice(0, 3)) {
      const artData: any = await this.fetchShopify(`/blogs/${blog.id}/articles.json?limit=${limit}`, shopDomain, accessToken).catch(() => ({ articles: [] }));
      if (Array.isArray(artData.articles)) {
        for (const a of artData.articles) {
          allArticles.push({
            id: a.id,
            title: a.title || '',
            handle: a.handle || '',
            body_html: a.body_html || '',
            author: a.author,
            created_at: a.created_at,
            updated_at: a.updated_at,
            published_at: a.published_at,
            seo_title: a.title,
            seo_description: a.summary_html || (a.body_html ? a.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : '')
          });
        }
      }
    }

    return allArticles;
  }

  async getArticle(shopDomain: string, accessToken: string, articleId: number | string): Promise<ShopifyArticleItem> {
    const blogData: any = await this.fetchShopify('/blogs.json', shopDomain, accessToken);
    const blogs = blogData?.blogs || [];

    for (const blog of blogs) {
      try {
        const artData: any = await this.fetchShopify(`/blogs/${blog.id}/articles/${articleId}.json`, shopDomain, accessToken);
        if (artData?.article) {
          const a = artData.article;
          return {
            id: a.id,
            title: a.title || '',
            handle: a.handle || '',
            body_html: a.body_html || '',
            author: a.author,
            created_at: a.created_at,
            updated_at: a.updated_at,
            published_at: a.published_at,
            seo_title: a.title,
            seo_description: a.summary_html || (a.body_html ? a.body_html.replace(/<[^>]*>/g, '').substring(0, 160) : '')
          };
        }
      } catch (e) {
        // continue search
      }
    }

    throw new Error(`Article ${articleId} not found in any Shopify blog`);
  }

  async updateProduct(
    shopDomain: string,
    accessToken: string,
    productId: number | string,
    data: {
      title?: string;
      body_html?: string;
      seo_title?: string;
      seo_description?: string;
    }
  ): Promise<ShopifyProductItem> {
    const updatePayload: any = { id: productId };
    if (data.title) updatePayload.title = data.title;
    if (data.body_html) updatePayload.body_html = data.body_html;

    const res: any = await this.fetchShopify(
      `/products/${productId}.json`,
      shopDomain,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify({ product: updatePayload })
      }
    );

    const p = res.product;
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      body_html: p.body_html,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  }

  async updatePage(
    shopDomain: string,
    accessToken: string,
    pageId: number | string,
    data: {
      title?: string;
      body_html?: string;
      seo_title?: string;
      seo_description?: string;
    }
  ): Promise<ShopifyPageItem> {
    const updatePayload: any = { id: pageId };
    if (data.title) updatePayload.title = data.title;
    if (data.body_html) updatePayload.body_html = data.body_html;

    const res: any = await this.fetchShopify(
      `/pages/${pageId}.json`,
      shopDomain,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify({ page: updatePayload })
      }
    );

    const p = res.page;
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      body_html: p.body_html,
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  }

  async updateArticle(
    shopDomain: string,
    accessToken: string,
    articleId: number | string,
    data: {
      title?: string;
      body_html?: string;
    }
  ): Promise<ShopifyArticleItem> {
    const blogData: any = await this.fetchShopify('/blogs.json', shopDomain, accessToken);
    const blogs = blogData?.blogs || [];
    if (blogs.length === 0) throw new Error("No blog found on Shopify store");

    const blogId = blogs[0].id;
    const res: any = await this.fetchShopify(
      `/blogs/${blogId}/articles/${articleId}.json`,
      shopDomain,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify({
          article: {
            id: articleId,
            title: data.title,
            body_html: data.body_html
          }
        })
      }
    );

    const a = res.article;
    return {
      id: a.id,
      title: a.title,
      handle: a.handle,
      body_html: a.body_html,
      created_at: a.created_at,
      updated_at: a.updated_at
    };
  }
}

export const shopifyProvider = new ShopifyProvider();
