import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { 
  BookOpen, 
  Video, 
  FileText, 
  GitBranch, 
  ShoppingBag, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  Zap, 
  Clock, 
  X, 
  HelpCircle,
  TrendingUp,
  MapPin,
  Lock,
  MessageSquare,
  Key
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface IntegrationSlide {
  title: string;
  subtitle: string;
  steps: Array<{
    stepNumber: number;
    stepTitle: string;
    description: string;
    codeSnippet?: string;
    tip?: string;
  }>;
  benefits: string[];
  docsUrl: string;
  ctaText: string;
  ctaLink: string;
}

const INTEGRATION_SLIDES: Record<'github' | 'wordpress' | 'shopify' | 'google_business', IntegrationSlide> = {
  github: {
    title: 'GitHub Automated Pull Requests',
    subtitle: 'Connect your code repository for zero-touch, 1-click SEO fixes merged safely via Git pull requests.',
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Generate a GitHub Personal Access Token (PAT)',
        description: 'Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic). Click "Generate new token" with "repo" permissions.',
        codeSnippet: 'Scope required: repo (Full control of private repositories)',
        tip: 'Fine-grained tokens are also supported with "Repository contents: Read & Write" and "Pull requests: Read & Write".'
      },
      {
        stepNumber: 2,
        stepTitle: 'Paste Token & Select Target Repository',
        description: 'In Scorankio Dashboard > Integrations, paste your PAT. Scorankio will automatically discover your active repositories and production branches (e.g. main / master).',
        codeSnippet: 'Repository: your-org/your-website\nBranch: main\nStatus: Synced & Verified',
        tip: 'Scorankio never modifies code directly on main; all changes are submitted as isolated pull requests with full diffs.'
      },
      {
        stepNumber: 3,
        stepTitle: 'Approve & Merge AI-Generated SEO Pull Requests',
        description: 'When Scorankio detects missing meta tags, broken JSON-LD schema, open graph tags, or canonical URLs, click "Execute Fix" to create an automated Pull Request.',
        codeSnippet: 'git checkout -b scorankio-seo-fix-schema\ngit commit -m "SEO: Add local business JSON-LD schema markup"\ngit push origin scorankio-seo-fix-schema',
        tip: 'You review the diff in GitHub and merge when ready. Your CI/CD automatically deploys the optimized SEO changes!'
      }
    ],
    benefits: [
      '100% developer-friendly Git workflow',
      'Automated pull request diffs for complete safety',
      'Instant repair for Next.js, Remix, Astro, HTML & React sites',
      'Rollback anytime with standard Git reverts'
    ],
    docsUrl: '#github-guide',
    ctaText: 'Connect GitHub Repository',
    ctaLink: '/dashboard/connections'
  },
  wordpress: {
    title: 'WordPress 1-Click REST API Sync',
    subtitle: 'Connect WordPress via secure Application Passwords to automatically patch SEO tags, headers, and schema.',
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Open WordPress Profile & Application Passwords',
        description: 'Log in to your WordPress WP-Admin dashboard. Go to Users > Profile (or Edit User) and scroll down to the "Application Passwords" section.',
        codeSnippet: 'WP-Admin URL: https://yourdomain.com/wp-admin/profile.php',
        tip: 'Ensure your WordPress version is 5.6+ with standard REST API enabled.'
      },
      {
        stepNumber: 2,
        stepTitle: 'Generate a New Application Password',
        description: 'Enter "Scorankio SEO Engine" in the New Application Password Name field and click "Add New Application Password". Copy the generated 24-character key.',
        codeSnippet: 'Application Name: Scorankio\nGenerated Password: xxxx xxxx xxxx xxxx xxxx xxxx',
        tip: 'Store this password safely. You do not need to enter your main WordPress login password.'
      },
      {
        stepNumber: 3,
        stepTitle: 'Enter Credentials in Scorankio & Enable Auto-Sync',
        description: 'Go to Scorankio Dashboard > Integrations > WordPress. Enter your website URL, WP Username, and the Application Password. Test connection to verify.',
        codeSnippet: 'Site URL: https://example.com\nUsername: admin\nApp Password: ••••••••••••••••••••••••\nConnection Health: PASS (200 OK)',
        tip: 'Scorankio can now automatically update title tags, meta descriptions, image alt tags, and OpenGraph data without touching theme files.'
      }
    ],
    benefits: [
      'Zero plugins required (uses native WordPress Core REST API)',
      'Automated meta titles, descriptions & canonical link fixes',
      'Real-time post & page inventory synchronization',
      'Safe rollback log saved for every modification'
    ],
    docsUrl: '#wordpress-guide',
    ctaText: 'Connect WordPress Site',
    ctaLink: '/dashboard/connections'
  },
  shopify: {
    title: 'Shopify Store Admin API Integration',
    subtitle: 'Optimize product schema, collection meta tags, and blog articles directly across your Shopify storefront.',
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Create a Custom App in Shopify Admin',
        description: 'Go to Shopify Admin > Settings > Apps and sales channels > Develop apps. Click "Create an app" and name it "Scorankio Local SEO".',
        codeSnippet: 'Shopify Admin > Settings > Apps > Develop apps > Create an app',
        tip: 'You must have Store Owner or Admin permissions with App Development enabled.'
      },
      {
        stepNumber: 2,
        stepTitle: 'Configure Admin API Access Scopes',
        description: 'Under "Configuration", click "Admin API integration" and check the following permissions: write_products, read_products, write_themes, write_content, read_content.',
        codeSnippet: 'Scopes: write_products, read_products, write_content, read_content, write_themes',
        tip: 'These permissions allow Scorankio to optimize product descriptions, title tags, and rich schema markup.'
      },
      {
        stepNumber: 3,
        stepTitle: 'Install App & Copy Admin API Access Token',
        description: 'Click "Install app". Reveal and copy the Admin API Access Token (starts with shpat_). In Scorankio, enter your myshopify.com domain and token.',
        codeSnippet: 'Shop Domain: your-store.myshopify.com\nAccess Token: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        tip: 'Scorankio immediately scans all products, collections, and articles to boost your Google Shopping and Local search visibility.'
      }
    ],
    benefits: [
      'Automatic Product & Collection JSON-LD structured data',
      'Bulk SEO title & description optimization for e-commerce',
      'High-intent commercial keyword rankings on Google',
      'Full catalog sync with inventory and variant support'
    ],
    docsUrl: '#shopify-guide',
    ctaText: 'Connect Shopify Store',
    ctaLink: '/dashboard/connections'
  },
  google_business: {
    title: 'Google Business Profile (GBP) 1-Click OAuth',
    subtitle: 'Direct Google integration to track local map pack rankings, sync real customer reviews, and post updates.',
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Click "Connect Google Business" in Scorankio',
        description: 'Navigate to Dashboard > Integrations or GBP Manager and click the official Google sign-in button.',
        codeSnippet: 'OAuth Provider: Google Business Profile API v1',
        tip: 'Sign in with the Google Account that manages or owns your Google Business Location.'
      },
      {
        stepNumber: 2,
        stepTitle: 'Authorize Business Locations & Permissions',
        description: 'Grant Scorankio read and management permissions for your business locations, customer reviews, and local search insights.',
        codeSnippet: 'Permissions: Manage business profile, read reviews, post updates',
        tip: 'If you have multiple locations, Scorankio lets you select specific branches or manage all of them together.'
      },
      {
        stepNumber: 3,
        stepTitle: 'Automate Review Replies & GeoGrid Heatmaps',
        description: 'Scorankio will instantly sync your verified reviews, generate AI responses tailored to your tone, and render a 7x7 local GeoGrid ranking heatmap.',
        codeSnippet: 'Live Sync: Active\nGeoGrid Radius: 5km\nAI Auto-Reply: Ready',
        tip: 'High review response rates and frequent GBP posting increase Google Maps ranking by up to 34%.'
      }
    ],
    benefits: [
      '1-Click Official Google OAuth authentication',
      '7x7 Hyper-Local GeoGrid ranking map',
      'AI-powered contextual review response engine',
      'Automatic citation and NAP consistency verification'
    ],
    docsUrl: '#gbp-guide',
    ctaText: 'Connect Google Profile',
    ctaLink: '/dashboard/connections'
  }
};

const DETAILED_GUIDES = [
  {
    id: 'local-seo-blueprint',
    category: 'Master Guide',
    title: 'The 2026 Local SEO Blueprint: Dominating Google Maps & Local Pack',
    readTime: '12 min read',
    icon: BookOpen,
    summary: 'A step-by-step masterclass on how local businesses jump from page 3 to the #1 Google 3-Pack spot.',
    highlights: [
      'NAP (Name, Address, Phone) consistency across 50+ tier-1 directories',
      'Google Business Profile category hierarchy and secondary subcategories',
      'GeoGrid signal optimization: building neighborhood-level search prominence',
      'Review velocity strategy: generating 5-star verified feedback on autopilot'
    ],
    content: `
### Overview
Local SEO is the fastest way for service-area and storefront businesses to generate high-intent customer phone calls, direction requests, and bookings. When customers search for "dentist near me", "emergency plumber", or "coffee shop Austin", Google displays the coveted **Local 3-Pack**.

### Step 1: Claim & Perfect Your Google Business Profile
1. **Exact Legal Name**: Avoid keyword stuffing in your business name unless legally registered, as Google algorithms now issue suspensions for unnatural spam names.
2. **Primary Category Selection**: Your primary category holds 65% of ranking weight. If you are a cosmetic dentist, choose "Cosmetic Dentist" as primary and "Dentist", "Dental Clinic", "Teeth Whitening Service" as secondaries.
3. **High-Resolution Geo-Tagged Images**: Upload at least 20 photos of your storefront, team, and work. Businesses with 100+ photos receive 520% more calls.

### Step 2: Establish NAP Consistency Across Local Citations
Google checks hundreds of third-party directories (Yelp, Apple Maps, Bing Places, YellowPages, BBB) to verify your existence. If your address is listed as "Suite 100" in one place and "Ste 100" in another, search trust degrades. Scorankio scans all citations and flags discrepancies instantly.

### Step 3: Implement Local Schema Markup on Your Website
Your website header must include valid \`LocalBusiness\` JSON-LD schema containing:
- Exact \`@type\` (e.g. \`MedicalBusiness\`, \`Plumber\`, \`Restaurant\`)
- \`geo\` coordinates (\`latitude\` and \`longitude\`)
- \`openingHoursSpecification\`
- \`hasMap\` URL and verified \`sameAs\` social URLs

### Step 4: GeoGrid Hyper-Local Radius Expansion
Rankings naturally drop off 2-3 miles away from your physical address. To expand your ranking bubble:
1. Build dedicated neighborhood landing pages (e.g. \`/locations/downtown-austin\`, \`/locations/south-congress\`).
2. Embed custom Google Maps and local testimonials from each neighborhood.
3. Track your rank across a 7x7 GeoGrid in Scorankio to monitor weekly expansion.
    `
  },
  {
    id: 'cms-integration-mastery',
    category: 'Integrations & Execution',
    title: 'Connecting GitHub, WordPress & Shopify for Zero-Touch Automated Fixes',
    readTime: '8 min read',
    icon: Zap,
    summary: 'How Scorankio bridges the gap between SEO audits and live code execution without breaking your website.',
    highlights: [
      'Git pull request workflow for developers and tech agencies',
      'WordPress REST API authentication without heavy third-party plugins',
      'Shopify Admin API for automated e-commerce product schema and meta fixes',
      'Automated regression tests and rollback safety mechanisms'
    ],
    content: `
### Why Automated Execution Matters
Traditional SEO tools give you a 40-page PDF audit that sits in an inbox for months because nobody has the time or technical expertise to update meta tags, canonical links, and JSON-LD structured data.

Scorankio solves this by directly interfacing with your CMS or code repository:

### 1. GitHub Integration (For Custom Web Apps & Headless Sites)
- **Supported Frameworks**: Next.js, React, Astro, Hugo, Vue, HTML5, Laravel.
- **Workflow**: Scorankio identifies issues (e.g., missing OpenGraph image or duplicate title tag), creates a isolated Git branch (\`scorankio-seo-fix-xyz\`), applies the exact code change, and opens a Pull Request on your repository.
- **Safety**: You or your developers review the PR diff before merging.

### 2. WordPress Integration (For Content Sites & Agencies)
- **Technology**: Native WordPress REST API with Application Passwords.
- **Benefits**: No heavyweight plugins slowing down your TTFB (Time to First Byte).
- **Capabilities**: Scorankio can automatically update post meta, SEO titles, image ALT texts, and schema headers in real time.

### 3. Shopify Integration (For E-Commerce Stores)
- **Technology**: Shopify Admin GraphQL and REST API.
- **Capabilities**: Automatically optimize product schema, collection descriptions, variant SEO tags, and blog post metadata to rank higher on Google Search and Google Shopping.
    `
  },
  {
    id: 'ai-copilot-local-ranking',
    category: 'AI & Automation',
    title: 'Using Scorankio AI Copilot to Outrank Local Competitors',
    readTime: '10 min read',
    icon: Sparkles,
    summary: 'Leverage AI to analyze competitor keywords, generate localized content, and draft high-converting outreach emails.',
    highlights: [
      'Reverse-engineering competitor backlink profiles and high-ranking keywords',
      'Generating geo-targeted blog articles that rank for long-tail search intent',
      'AI automated response generation for positive and negative Google reviews',
      'Local PR outreach email generation with 40%+ open rates'
    ],
    content: `
### Step-by-Step Competitor Outranking Strategy

1. **Competitor Radar**: Add up to 5 local competitors. Scorankio scans their SERP rankings daily to find keywords where they outrank you.
2. **Keyword Gap Analysis**: Identify low-difficulty, high-intent terms your competitors are capturing (e.g., "emergency 24/7 water leak repair").
3. **Local Authority Builder**: Discover local directories, chambers of commerce, and local blogs. Use the AI Copilot to generate personalized partnership and guest post outreach emails with 1 click.
4. **Automated Review Replies**: Responding to customer reviews within 24 hours boosts local ranking. The Copilot crafts genuine, keyword-rich responses that satisfy both customers and Google's ranking algorithms.
    `
  }
];

const VIDEO_TUTORIALS = [
  {
    title: '5-Minute Complete SEO Audit & 1-Click Fix Walkthrough',
    duration: '05:12',
    category: 'Getting Started',
    views: '4.8k views',
    summary: 'Watch how to run a full website crawl, identify critical growth blockers, and execute fixes in under 5 minutes.',
    videoPlaceholder: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    steps: ['1. Enter website URL and business location', '2. Analyze Core Web Vitals & Local SEO score', '3. Execute 1-click automated fix via connected CMS']
  },
  {
    title: 'Connecting GitHub, WordPress & Shopify Step-by-Step',
    duration: '04:35',
    category: 'Integrations',
    views: '3.2k views',
    summary: 'A visual walkthrough showing how to generate tokens and connect your website CMS to Scorankio.',
    videoPlaceholder: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    steps: ['1. GitHub Personal Access Token setup', '2. WordPress Application Passwords', '3. Shopify Custom App creation']
  },
  {
    title: 'Dominating Local Search with 7x7 GeoGrid Rank Tracking',
    duration: '06:40',
    category: 'Local SEO Mastery',
    views: '6.1k views',
    summary: 'Learn how to read GeoGrid coordinates and expand your Google Maps ranking radius across your entire city.',
    videoPlaceholder: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    steps: ['1. Set target keyword and scan radius', '2. Identify ranking blind spots on the map', '3. Target weak zones with localized content']
  }
];

const CASE_STUDIES = [
  {
    client: 'Apex Dental Care',
    location: 'Austin, TX',
    industry: 'Healthcare / Dental',
    stats: {
      rankImprovement: 'Rank #18 to #1',
      trafficIncrease: '+184%',
      callIncrease: '+3.2x Calls'
    },
    challenge: 'Apex Dental was invisible on Google Maps outside a 0.5-mile radius despite having 150+ reviews.',
    solution: 'Connected WordPress via Scorankio, implemented dental clinic JSON-LD schema, fixed 38 duplicate citations, and expanded GeoGrid radius to 8 miles.',
    quote: '"Scorankio doubled our new patient bookings in 45 days without hiring an expensive SEO agency."',
    author: 'Dr. Sarah Jenkins, Lead Dentist'
  },
  {
    client: 'Metro Rapid Plumbing',
    location: 'Denver, CO',
    industry: 'Home Services / Plumbing',
    stats: {
      rankImprovement: '420+ Keywords Top 3',
      trafficIncrease: '+240%',
      callIncrease: '+4.1x Inquiries'
    },
    challenge: 'High competition for high-ticket emergency plumbing searches. Website had missing canonical links and slow mobile TTFB.',
    solution: 'Connected GitHub repo, automated meta tags & local schema PRs, and enabled AI Copilot for automated GBP review responses.',
    quote: '"The automated GitHub PR workflow saved our dev team over 60 hours of manual coding."',
    author: 'Mark Sullivan, Operations Director'
  },
  {
    client: 'Artisan Roast & Co.',
    location: 'Seattle, WA',
    industry: 'Retail & E-Commerce / Coffee',
    stats: {
      rankImprovement: '#1 Coffee Near Me',
      trafficIncrease: '+310%',
      callIncrease: '+150% Foot Traffic'
    },
    challenge: 'Store had a physical cafe and a Shopify online store. Products were not showing in Google Rich Results.',
    solution: 'Integrated Shopify store and Google Business Profile. Automatically fixed product schema and optimized local collection pages.',
    quote: '"Our weekend foot traffic exploded and Shopify local pickup orders tripled in two months."',
    author: 'Elena Vance, Co-Founder'
  }
];

export function Resources() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'guides' | 'videos' | 'case_studies'>('integrations');
  const [selectedPlatform, setSelectedPlatform] = useState<'github' | 'wordpress' | 'shopify' | 'google_business'>('github');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Modal state for reading full guide
  const [activeGuideModal, setActiveGuideModal] = useState<typeof DETAILED_GUIDES[0] | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<typeof VIDEO_TUTORIALS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentIntegration = INTEGRATION_SLIDES[selectedPlatform];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleNextStep = () => {
    if (currentSlideIndex < currentIntegration.steps.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const filteredGuides = DETAILED_GUIDES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      {/* Header Banner */}
      <div className="bg-[#faf9f5] pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-medium text-[#cc785c] mb-4">
              <Sparkles size={14} />
              <span>Official Knowledge Base & Integration Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141413]">
              Growth Resources & Documentation
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#6c6a64] font-sans">
              Master local SEO, connect your website (GitHub, WordPress, Shopify) in minutes, and automate Google 3-Pack domination.
            </p>

            {/* Quick Search */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9b94]" size={18} />
              <input
                type="text"
                placeholder="Search integration guides, SEO blueprints, or tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder-[#9e9b94] focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] shadow-xs"
              />
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3 border-b border-[#e6dfd8] pb-4">
            <button
              onClick={() => { setActiveTab('integrations'); setCurrentSlideIndex(0); }}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'integrations'
                  ? 'bg-[#cc785c] text-white shadow-xs'
                  : 'bg-white text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
              }`}
            >
              <Zap size={16} />
              <span>Connect CMS (Slides & Guides)</span>
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'guides'
                  ? 'bg-[#cc785c] text-white shadow-xs'
                  : 'bg-white text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
              }`}
            >
              <BookOpen size={16} />
              <span>Master Local SEO Guides</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-[#cc785c] text-white shadow-xs'
                  : 'bg-white text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
              }`}
            >
              <Video size={16} />
              <span>Video Tutorials</span>
            </button>
            <button
              onClick={() => setActiveTab('case_studies')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'case_studies'
                  ? 'bg-[#cc785c] text-white shadow-xs'
                  : 'bg-white text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
              }`}
            >
              <FileText size={16} />
              <span>Real Case Studies</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#faf9f5] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* TAB 1: INTEGRATIONS SLIDE HUB */}
          {activeTab === 'integrations' && (
            <div className="space-y-10">
              {/* Platform Selector Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e6dfd8] shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6c6a64]">
                  Choose Platform to Connect:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => { setSelectedPlatform('github'); setCurrentSlideIndex(0); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPlatform === 'github'
                        ? 'bg-[#141413] text-white shadow-xs'
                        : 'bg-[#faf9f5] text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
                    }`}
                  >
                    <GitBranch size={14} />
                    <span>GitHub</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPlatform('wordpress'); setCurrentSlideIndex(0); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPlatform === 'wordpress'
                        ? 'bg-[#21759b] text-white shadow-xs'
                        : 'bg-[#faf9f5] text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
                    }`}
                  >
                    <Globe size={14} />
                    <span>WordPress</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPlatform('shopify'); setCurrentSlideIndex(0); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPlatform === 'shopify'
                        ? 'bg-[#95bf47] text-[#141413] font-semibold shadow-xs'
                        : 'bg-[#faf9f5] text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
                    }`}
                  >
                    <ShoppingBag size={14} />
                    <span>Shopify</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPlatform('google_business'); setCurrentSlideIndex(0); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPlatform === 'google_business'
                        ? 'bg-[#4285F4] text-white shadow-xs'
                        : 'bg-[#faf9f5] text-[#3d3d3a] hover:bg-[#efe9de] border border-[#e6dfd8]'
                    }`}
                  >
                    <MapPin size={14} />
                    <span>Google Business</span>
                  </button>
                </div>
              </div>

              {/* Interactive Slide Viewer */}
              <div className="bg-white rounded-3xl border border-[#e6dfd8] shadow-sm overflow-hidden">
                {/* Slide Header */}
                <div className="bg-[#efe9de]/50 px-6 sm:px-10 py-6 border-b border-[#e6dfd8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#cc785c] uppercase tracking-wider">
                      <Key size={14} />
                      <span>Step-by-Step Connection Slide Deck</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#141413] mt-1">
                      {currentIntegration.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6c6a64] mt-1 max-w-2xl">
                      {currentIntegration.subtitle}
                    </p>
                  </div>
                  
                  {/* Step indicators */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {currentIntegration.steps.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-8 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          currentSlideIndex === idx
                            ? 'bg-[#cc785c] text-white shadow-xs'
                            : 'bg-white text-[#6c6a64] border border-[#e6dfd8] hover:bg-[#efe9de]'
                        }`}
                      >
                        <span>Step {step.stepNumber}</span>
                        {currentSlideIndex === idx && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slide Body */}
                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Instruction & Code Snippet */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faf9f5] border border-[#e6dfd8] text-xs font-medium text-[#141413]">
                      <span className="w-5 h-5 rounded-full bg-[#cc785c] text-white flex items-center justify-center text-[10px] font-bold">
                        {currentIntegration.steps[currentSlideIndex].stepNumber}
                      </span>
                      <span>Phase {currentIntegration.steps[currentSlideIndex].stepNumber} of {currentIntegration.steps.length}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-serif font-medium text-[#141413]">
                      {currentIntegration.steps[currentSlideIndex].stepTitle}
                    </h3>

                    <p className="text-sm text-[#3d3d3a] leading-relaxed font-sans">
                      {currentIntegration.steps[currentSlideIndex].description}
                    </p>

                    {/* Code / Configuration Snippet */}
                    {currentIntegration.steps[currentSlideIndex].codeSnippet && (
                      <div className="rounded-xl bg-[#141413] text-[#efe9de] p-4 font-mono text-xs relative group shadow-inner">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-white/50 text-[11px]">
                          <span>Configuration / Example</span>
                          <button
                            onClick={() => handleCopy(currentIntegration.steps[currentSlideIndex].codeSnippet!)}
                            className="hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {copiedCode === currentIntegration.steps[currentSlideIndex].codeSnippet ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {currentIntegration.steps[currentSlideIndex].codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Pro Tip Box */}
                    {currentIntegration.steps[currentSlideIndex].tip && (
                      <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-start gap-3">
                        <ShieldCheck className="text-[#cc785c] shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-[#6c6a64] leading-relaxed">
                          <strong className="text-[#141413] font-medium">Pro-Tip: </strong>
                          {currentIntegration.steps[currentSlideIndex].tip}
                        </p>
                      </div>
                    )}

                    {/* Slide Navigation Controls */}
                    <div className="pt-4 flex items-center justify-between border-t border-[#e6dfd8]">
                      <button
                        onClick={handlePrevStep}
                        disabled={currentSlideIndex === 0}
                        className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                          currentSlideIndex === 0
                            ? 'opacity-40 cursor-not-allowed text-[#9e9b94]'
                            : 'bg-[#efe9de] text-[#141413] hover:bg-[#e6dfd8]'
                        }`}
                      >
                        <ChevronLeft size={14} />
                        <span>Previous Step</span>
                      </button>

                      <div className="text-xs text-[#6c6a64] font-medium">
                        Step {currentSlideIndex + 1} / {currentIntegration.steps.length}
                      </div>

                      {currentSlideIndex < currentIntegration.steps.length - 1 ? (
                        <button
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl text-xs font-medium bg-[#cc785c] text-white hover:bg-[#a9583e] flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Next Step</span>
                          <ChevronRight size={14} />
                        </button>
                      ) : (
                        <Link
                          to={currentIntegration.ctaLink}
                          className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>{currentIntegration.ctaText}</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Benefits & Live Action Card */}
                  <div className="lg:col-span-5 bg-[#faf9f5] p-6 sm:p-8 rounded-2xl border border-[#e6dfd8] space-y-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#cc785c]" />
                      <span>Integration Safeguards</span>
                    </h4>

                    <ul className="space-y-3">
                      {currentIntegration.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs text-[#3d3d3a]">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#6c6a64]">Live Integration Mode</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Ready
                        </span>
                      </div>
                      <p className="text-xs text-[#3d3d3a]">
                        Ready to connect? Jump straight into your account settings to authorize this provider.
                      </p>
                      <Link
                        to="/dashboard/connections"
                        className="w-full py-2.5 px-4 bg-[#cc785c] text-white text-xs font-medium rounded-lg hover:bg-[#a9583e] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Open Dashboard Integrations</span>
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER GUIDES */}
          {activeTab === 'guides' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <div
                      key={guide.id}
                      className="flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 border border-[#e6dfd8] shadow-xs hover:shadow-md transition-all hover:border-[#cc785c]/40 group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#faf9f5] text-[#cc785c] flex items-center justify-center border border-[#e6dfd8] group-hover:bg-[#cc785c] group-hover:text-white transition-colors">
                            <Icon size={20} />
                          </div>
                          <span className="text-[11px] font-medium text-[#9e9b94] flex items-center gap-1">
                            <Clock size={12} />
                            {guide.readTime}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#cc785c]">
                            {guide.category}
                          </span>
                          <h3 className="font-serif font-medium text-lg text-[#141413] mt-1 leading-snug">
                            {guide.title}
                          </h3>
                        </div>

                        <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                          {guide.summary}
                        </p>

                        <div className="pt-2 border-t border-[#f0eae1] space-y-1.5">
                          {guide.highlights.slice(0, 2).map((h, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#3d3d3a]">
                              <CheckCircle2 size={12} className="text-[#cc785c] shrink-0 mt-0.5" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveGuideModal(guide)}
                        className="mt-6 w-full py-2.5 px-4 bg-[#efe9de] text-[#141413] hover:bg-[#cc785c] hover:text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEO TUTORIALS */}
          {activeTab === 'videos' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {VIDEO_TUTORIALS.map((video, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl bg-white overflow-hidden border border-[#e6dfd8] shadow-xs hover:shadow-md transition-shadow group"
                  >
                    {/* Video Thumbnail with Play Button */}
                    <div className="relative h-48 bg-[#141413] overflow-hidden">
                      <img
                        src={video.videoPlaceholder}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => setActiveVideoModal(video)}
                          className="w-12 h-12 rounded-full bg-[#cc785c] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <Play size={20} className="ml-1 fill-white" />
                        </button>
                      </div>
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                        {video.duration}
                      </span>
                    </div>

                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#9e9b94]">
                          <span className="font-semibold text-[#cc785c] uppercase">{video.category}</span>
                          <span>{video.views}</span>
                        </div>
                        <h3 className="font-serif font-medium text-base text-[#141413] mt-1.5 leading-snug">
                          {video.title}
                        </h3>
                        <p className="text-xs text-[#6c6a64] mt-2 leading-relaxed">
                          {video.summary}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveVideoModal(video)}
                        className="mt-4 w-full py-2.5 px-4 bg-[#efe9de] text-[#141413] hover:bg-[#cc785c] hover:text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Play size={13} />
                        <span>Watch Video Lesson</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CASE STUDIES */}
          {activeTab === 'case_studies' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {CASE_STUDIES.map((study, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 border border-[#e6dfd8] shadow-xs space-y-6"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                        <div>
                          <h3 className="font-serif font-medium text-lg text-[#141413]">{study.client}</h3>
                          <p className="text-xs text-[#6c6a64]">{study.location} • {study.industry}</p>
                        </div>
                        <TrendingUp size={20} className="text-emerald-600" />
                      </div>

                      {/* Stat Callouts */}
                      <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-center">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-emerald-700">{study.stats.rankImprovement}</div>
                          <div className="text-[10px] text-[#6c6a64]">Google Maps</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[#cc785c]">{study.stats.trafficIncrease}</div>
                          <div className="text-[10px] text-[#6c6a64]">Organic Views</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-indigo-700">{study.stats.callIncrease}</div>
                          <div className="text-[10px] text-[#6c6a64]">Customer Calls</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-[#3d3d3a]">
                        <p><strong className="text-[#141413]">Challenge: </strong>{study.challenge}</p>
                        <p><strong className="text-[#141413]">Solution: </strong>{study.solution}</p>
                      </div>

                      <blockquote className="mt-4 p-3.5 bg-[#efe9de]/50 border-l-2 border-[#cc785c] rounded-r-lg text-xs italic text-[#6c6a64]">
                        {study.quote}
                        <footer className="mt-1 text-[11px] font-semibold text-[#141413] not-italic">— {study.author}</footer>
                      </blockquote>
                    </div>

                    <Link
                      to="/free-audit"
                      className="w-full py-2.5 px-4 bg-[#cc785c] text-white hover:bg-[#a9583e] text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Get Results for Your Business</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Help Banner */}
          <div className="mt-16 bg-[#efe9de] rounded-3xl p-8 sm:p-12 border border-[#e6dfd8] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-serif font-normal text-[#141413]">
                Need dedicated engineering help with your CMS?
              </h3>
              <p className="text-xs sm:text-sm text-[#6c6a64] max-w-xl">
                Our support engineers can guide your team through custom Git tokens, WordPress REST API configurations, and Shopify Admin credentials free of charge.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="px-5 py-3 bg-[#141413] text-white text-xs font-medium rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                Contact Technical Support
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-3 bg-[#cc785c] text-white text-xs font-medium rounded-xl hover:bg-[#a9583e] transition-colors shadow-sm"
              >
                Launch Dashboard
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: FULL GUIDE READER */}
      {activeGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#e6dfd8] shadow-2xl p-6 sm:p-10 relative">
            <button
              onClick={() => setActiveGuideModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#faf9f5] text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#cc785c]">
                {activeGuideModal.category} • {activeGuideModal.readTime}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">
                {activeGuideModal.title}
              </h2>
              <p className="text-sm text-[#6c6a64] font-sans pb-4 border-b border-[#e6dfd8]">
                {activeGuideModal.summary}
              </p>

              {/* Render Guide Markdown / Content */}
              <div className="prose prose-sm text-[#3d3d3a] max-w-none space-y-4 text-xs sm:text-sm leading-relaxed font-sans pt-2">
                {activeGuideModal.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={pIdx} className="text-base font-serif font-bold text-[#141413] mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                    return (
                      <div key={pIdx} className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] my-2 font-mono text-xs whitespace-pre-line text-[#141413]">
                        {paragraph}
                      </div>
                    );
                  }
                  return <p key={pIdx}>{paragraph}</p>;
                })}
              </div>

              <div className="pt-6 border-t border-[#e6dfd8] flex justify-end gap-3">
                <button
                  onClick={() => setActiveGuideModal(null)}
                  className="px-4 py-2 bg-[#efe9de] text-[#141413] text-xs font-medium rounded-xl hover:bg-[#e6dfd8]"
                >
                  Close Guide
                </button>
                <Link
                  to="/dashboard"
                  className="px-5 py-2 bg-[#cc785c] text-white text-xs font-medium rounded-xl hover:bg-[#a9583e]"
                >
                  Apply in Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIDEO TUTORIAL PLAYER */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e6dfd8] shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#faf9f5] text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] transition-colors"
            >
              <X size={18} />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-[#cc785c]">
              {activeVideoModal.category} • {activeVideoModal.duration}
            </span>
            <h3 className="text-xl font-serif font-medium text-[#141413]">
              {activeVideoModal.title}
            </h3>

            {/* Simulated Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center shadow-inner">
              <img
                src={activeVideoModal.videoPlaceholder}
                alt={activeVideoModal.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#cc785c] text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Play size={28} className="ml-1 fill-white" />
                </div>
                <p className="text-white text-xs max-w-md font-sans">
                  Interactive Video Demonstration Ready. Click below to launch the live guided interactive walkthrough inside your dashboard.
                </p>
              </div>
            </div>

            {/* Key Timestamps / Chapter Steps */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6c6a64]">Key Video Chapters:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeVideoModal.steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-[11px] text-[#3d3d3a]">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#e6dfd8] flex justify-end gap-3">
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 bg-[#efe9de] text-[#141413] text-xs font-medium rounded-xl hover:bg-[#e6dfd8]"
              >
                Close Player
              </button>
              <Link
                to="/dashboard/connections"
                className="px-5 py-2 bg-[#cc785c] text-white text-xs font-medium rounded-xl hover:bg-[#a9583e]"
              >
                Open Connections in Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

