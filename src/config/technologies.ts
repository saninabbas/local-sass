export type TechnologyCategory = 
  | 'CMS & Execution' 
  | 'Search & Link Intelligence' 
  | 'Local & Maps' 
  | 'Infrastructure & Edge' 
  | 'Billing & Monetization' 
  | 'AI & LLM Inference' 
  | 'Communications';

export type TechnologyStatus = 'ACTIVE' | 'CONNECTED' | 'AVAILABLE' | 'NOT_CONNECTED';

export interface TechnologyItem {
  id: string;
  name: string;
  category: TechnologyCategory;
  description: string;
  status: TechnologyStatus;
  providerKey?: string;
  verificationDetails: string;
  websiteUrl: string;
  docsUrl?: string;
}

export const TECHNOLOGIES: Record<string, TechnologyItem> = {
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'CMS & Execution',
    description: 'Universal SEO code execution, branch management, and automated Pull Request deployment.',
    status: 'AVAILABLE',
    providerKey: 'github',
    verificationDetails: 'Integrated via GitHub REST API (Octokit compatibility layer) in functions/api/providers/githubProvider.ts',
    websiteUrl: 'https://github.com',
    docsUrl: 'https://docs.github.com/en/rest'
  },
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    category: 'CMS & Execution',
    description: 'Automated SEO metadata updates, content publishing, and live DOM re-crawl verification.',
    status: 'AVAILABLE',
    providerKey: 'wordpress',
    verificationDetails: 'Integrated via WordPress REST API v2 and Application Passwords in functions/api/providers/wordpressProvider.ts',
    websiteUrl: 'https://wordpress.org',
    docsUrl: 'https://developer.wordpress.org/rest-api/'
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    category: 'CMS & Execution',
    description: 'E-commerce SEO schema, product title, and page metafield updates via GraphQL Admin API.',
    status: 'AVAILABLE',
    providerKey: 'shopify',
    verificationDetails: 'Integrated via Shopify GraphQL Admin API in functions/api/providers/shopifyProvider.ts',
    websiteUrl: 'https://www.shopify.com',
    docsUrl: 'https://shopify.dev/docs/api/admin-graphql'
  },
  google_business: {
    id: 'google_business',
    name: 'Google Business Profile',
    category: 'Local & Maps',
    description: 'Local 3-Pack discovery, Google reviews sync, AI review responses, and rating analytics.',
    status: 'AVAILABLE',
    providerKey: 'gbp',
    verificationDetails: 'Integrated via Google My Business API v4.9 & OAuth 2.0 in functions/api/gbp/reviewAiEngine.ts',
    websiteUrl: 'https://www.google.com/business/',
    docsUrl: 'https://developers.google.com/my-business'
  },
  google_oauth: {
    id: 'google_oauth',
    name: 'Google OAuth 2.0',
    category: 'Local & Maps',
    description: 'Secure user identity and Google API account linking authorization.',
    status: 'AVAILABLE',
    providerKey: 'google_oauth',
    verificationDetails: 'Configured in functions/api/[[route]].ts for Google account linking',
    websiteUrl: 'https://developers.google.com/identity/protocols/oauth2'
  },
  cloudflare_pages: {
    id: 'cloudflare_pages',
    name: 'Cloudflare Pages & Workers',
    category: 'Infrastructure & Edge',
    description: 'Global edge runtime executing serverless API functions and serving static frontend assets.',
    status: 'ACTIVE',
    verificationDetails: 'Live deployment platform at https://local-sass.pages.dev via functions/api/[[route]].ts',
    websiteUrl: 'https://pages.cloudflare.com'
  },
  cloudflare_d1: {
    id: 'cloudflare_d1',
    name: 'Cloudflare D1 Database',
    category: 'Infrastructure & Edge',
    description: 'Serverless relational SQLite database storing multi-tenant business records, audits, and rankings.',
    status: 'ACTIVE',
    verificationDetails: '17 migration schema files bound to env.DB across all Cloudflare Functions',
    websiteUrl: 'https://developers.cloudflare.com/d1/'
  },
  polar: {
    id: 'polar',
    name: 'Polar.sh',
    category: 'Billing & Monetization',
    description: 'Production subscription billing engine enforcing Starter ($15/mo), Growth ($30/mo), and Agency Pro ($80/mo) tiers.',
    status: 'ACTIVE',
    providerKey: 'polar',
    verificationDetails: 'Integrated via Polar SDK & Standard Webhooks in functions/api/billingEngine.ts',
    websiteUrl: 'https://polar.sh',
    docsUrl: 'https://docs.polar.sh'
  },
  nvidia_nim: {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM',
    category: 'AI & LLM Inference',
    description: 'Accelerated enterprise Llama 3.1 & 3.3 LLM inference for Copilot, SEO diagnosis, and content generation.',
    status: 'ACTIVE',
    providerKey: 'nvidia',
    verificationDetails: 'Integrated via https://integrate.api.nvidia.com/v1/chat/completions with deterministic fallbacks in auditEngine.ts',
    websiteUrl: 'https://www.nvidia.com/en-us/ai-data-science/products/nim/'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI API',
    category: 'AI & LLM Inference',
    description: 'Secondary LLM provider for technical code refactoring and content synthesis.',
    status: 'AVAILABLE',
    providerKey: 'openai',
    verificationDetails: 'Supported via standard OpenAI-compatible completions in functions/api/copilotEngine.ts',
    websiteUrl: 'https://openai.com'
  },
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid / SMTP',
    category: 'Communications',
    description: 'Transactional email delivery for account verification and security notifications.',
    status: 'AVAILABLE',
    providerKey: 'sendgrid',
    verificationDetails: 'Integrated via SMTP/REST email dispatcher in functions/api/[[route]].ts',
    websiteUrl: 'https://sendgrid.com'
  },
  serper: {
    id: 'serper',
    name: 'Serper.dev (Google Index)',
    category: 'Search & Link Intelligence',
    description: 'Real-time Google search ranking data, local Geo-grid positions, and citation opportunity discovery.',
    status: 'AVAILABLE',
    providerKey: 'serper',
    verificationDetails: 'Integrated in functions/api/serpEngine.ts & authority/serperAuthorityProvider.ts',
    websiteUrl: 'https://serper.dev'
  },
  dataforseo: {
    id: 'dataforseo',
    name: 'DataForSEO',
    category: 'Search & Link Intelligence',
    description: 'Enterprise backlink index, referring domain crawler, and keyword search volume metrics.',
    status: 'AVAILABLE',
    providerKey: 'dataforseo',
    verificationDetails: 'Integrated in functions/api/authority/dataForSeoBacklinkProvider.ts',
    websiteUrl: 'https://dataforseo.com'
  }
};
