export interface RepositoryItem {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  description?: string;
  updatedAt?: string;
}

export interface BranchItem {
  name: string;
  commitSha: string;
  isProtected?: boolean;
}

export interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
  sha: string;
  size: number;
}

export interface PullRequestResult {
  number: number;
  htmlUrl: string;
  id: number;
  state: string;
  merged?: boolean;
}

export interface WordPressSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset?: string;
  timezone_string?: string;
  namespaces?: string[];
  authentication?: Record<string, any>;
}

export interface WordPressItem {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: 'page' | 'post';
  link: string;
  title: {
    rendered: string;
    raw?: string;
  };
  content: {
    rendered: string;
    raw?: string;
    protected?: boolean;
  };
  excerpt: {
    rendered: string;
    raw?: string;
  };
  yoast_head_json?: Record<string, any>;
  rank_math_seo?: Record<string, any>;
  meta?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// SHOPIFY TYPES (PHASE 4)
// -----------------------------------------------------------------------------
export interface ShopifyStoreInfo {
  id: number;
  name: string;
  email: string;
  domain: string;
  myshopify_domain: string;
  currency: string;
  timezone: string;
  shop_owner?: string;
  plan_name?: string;
}

export interface ShopifyProductItem {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor?: string;
  product_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface ShopifyPageItem {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  author?: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface ShopifyArticleItem {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  author?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UniversalExecutionResult {
  provider: 'github' | 'wordpress' | 'shopify' | 'manual';
  status: 'PROPOSED' | 'APPROVED' | 'BRANCH_CREATED' | 'COMMITTED' | 'PR_CREATED' | 'APPLIED' | 'VERIFYING' | 'VERIFIED' | 'VERIFICATION_FAILED' | 'STALE_CHANGE' | 'FAILED';
  verification?: {
    status: string;
    url?: string;
    http_status?: number;
    expected?: string;
    observed_match?: boolean;
    evidence?: any;
  };
  details?: any;
  message: string;
}

export interface WebsiteProvider {
  readonly providerName: string;
  getRepositories(token: string): Promise<RepositoryItem[]>;
  getBranches(token: string, owner: string, repo: string): Promise<BranchItem[]>;
  getTree(token: string, owner: string, repo: string, branch: string, path?: string): Promise<TreeItem[]>;
  getFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<FileContent>;
  
  // Phase 2: Safe Approval-based Write Operations
  createBranch(token: string, owner: string, repo: string, baseBranch: string, newBranch: string): Promise<{ ref: string; sha: string }>;
  updateFile(token: string, owner: string, repo: string, branch: string, path: string, content: string, commitMessage: string, previousSha?: string): Promise<{ commitSha: string; contentSha: string }>;
  createPullRequest(token: string, owner: string, repo: string, baseBranch: string, headBranch: string, title: string, body: string): Promise<PullRequestResult>;
  getPullRequest(token: string, owner: string, repo: string, pullNumber: number): Promise<PullRequestResult>;
}
