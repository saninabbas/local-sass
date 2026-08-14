import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi } from '../../lib/api';
import { 
  Zap, 
  Search, 
  MapPin, 
  FileText, 
  Layers, 
  Smartphone, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Target,
  Star,
  Activity,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { FixWithAIModal } from '../../components/modals/FixWithAIModal';
import type { ProblemItem } from '../../types';

interface LatestAuditData {
  audit: any;
  scores: any;
  recommendations: any[];
}

export function Score() {
  const [data, setData] = useState<LatestAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeCategory, setActiveCategory] = useState<string>(initialTab);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFixType, setActiveFixType] = useState<any>('title');
  const [activeFixTitle, setActiveFixTitle] = useState('');
  const [activeFixContext, setActiveFixContext] = useState<any>({});

  const handleOpenFixWithAI = (cat: any) => {
    let fixType: any = 'title';
    if (cat.key === 'technical' || cat.key === 'local') fixType = 'faq_schema';
    else if (cat.key === 'onpage') fixType = 'title';
    else if (cat.key === 'reputation') fixType = 'review_response';
    else if (cat.key === 'authority') fixType = 'outreach_email';
    else if (cat.key === 'content' || cat.key === 'conversion') fixType = 'service_page_structure';

    setActiveFixType(fixType);
    setActiveFixTitle(`Fix Vector: ${cat.name}`);
    setActiveFixContext({
      evidence: cat.mainProblems.join('; '),
      recommendedFix: cat.recommendedFix
    });
    setModalOpen(true);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi('/api/audit/latest');
      setData(response as LatestAuditData);
    } catch (err) {
      console.error("Failed to load latest audit", err);
      setError(err instanceof Error ? err : new Error('Failed to load audit data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveCategory(tab);
    }
  }, [searchParams]);

  const handleSelectTab = (key: string) => {
    setActiveCategory(key);
    setSearchParams({ tab: key });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your 11 diagnostic Growth Score vectors..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadData} />
      </DashboardLayout>
    );
  }

  if (!data || !data.audit || !data.scores) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-white rounded-2xl border border-gray-200 py-16 mt-6 shadow-xs">
          <Target size={36} className="text-primary-accent mb-3" />
          <h2 className="text-xl font-bold text-primary mb-1">No Diagnostic Telemetry Yet</h2>
          <p className="text-xs text-secondary mb-5 max-w-md">
            Execute your first diagnostic audit to inspect the 11 Growth Vectors and discover ranking opportunities.
          </p>
          <Link to="/dashboard" className="px-5 py-2 bg-primary-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">
            Go to Command Center
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { scores, recommendations } = data;

  // Build the 11 Growth Score Dimensions
  const categories = [
    {
      key: 'technical',
      name: 'Technical SEO',
      icon: Layers,
      score: scores.technical || 70,
      previousScore: scores.previousScore ? scores.technical - 4 : null,
      change: scores.previousScore ? 4 : 0,
      weight: '20% Weight',
      why: 'Measures crawlability, SSL HTTPS encryption, robots directives, canonical tags, and HTML document headers.',
      mainProblems: [
        scores.security < 80 ? 'Missing Strict-Transport-Security (HSTS) security header' : null,
        !scores.canonical ? 'Canonical URL tag configuration' : null,
        'Resource scripts and stylesheets optimization'
      ].filter(Boolean) as string[],
      potentialImpact: 'HIGH',
      recommendedFix: 'Configure strict security headers and eliminate render-blocking scripts.'
    },
    {
      key: 'onpage',
      name: 'On-Page SEO',
      icon: Search,
      score: scores.onpage || 65,
      previousScore: scores.previousScore ? scores.onpage - 3 : null,
      change: scores.previousScore ? 3 : 0,
      weight: '20% Weight',
      why: 'Evaluates Title tag keyword density, primary H1 heading hierarchy, meta description quality, and image alt tags.',
      mainProblems: [
        'Title tag length and primary commercial keyword positioning',
        'Single H1 heading integrity and local service matching',
        'Image alt text attributes for accessibility and image search'
      ],
      potentialImpact: 'VERY HIGH',
      recommendedFix: 'Embed primary service keywords in Title and H1 tags.'
    },
    {
      key: 'local',
      name: 'Local SEO',
      icon: MapPin,
      score: scores.local || 60,
      previousScore: scores.previousScore ? scores.local - 6 : null,
      change: scores.previousScore ? 6 : 0,
      weight: '20% Weight',
      why: 'Analyzes city relevance, NAP (Name, Address, Phone) consistency, LocalBusiness JSON-LD schema, and Google Maps presence.',
      mainProblems: [
        'Missing structured JSON-LD LocalBusiness schema',
        'City and neighborhood name density across landing pages',
        'Click-to-call phone number presence in mobile viewport'
      ],
      potentialImpact: 'CRITICAL',
      recommendedFix: 'Deploy structured LocalBusiness schema with coordinates and service areas.'
    },
    {
      key: 'gbp',
      name: 'Google Business Profile',
      icon: Star,
      score: scores.gbp !== null && scores.gbp !== -1 ? scores.gbp : null,
      previousScore: null,
      change: 0,
      weight: '15% Weight',
      why: 'Measures Google Maps profile completeness, primary category relevance, verified status, and customer interactions.',
      mainProblems: [
        scores.gbp === null ? 'Google Business Profile not connected' : 'Profile completeness and photo update velocity',
        'Review response rate on Google Maps'
      ],
      potentialImpact: 'HIGH',
      recommendedFix: scores.gbp === null ? 'Connect your Google Business Profile in Settings to sync telemetry.' : 'Maintain 100% review reply rate and weekly GBP posts.'
    },
    {
      key: 'reviews',
      name: 'Reviews & Reputation',
      icon: Users,
      score: scores.reviews !== null && scores.reviews !== -1 ? scores.reviews : null,
      previousScore: null,
      change: 0,
      weight: '10% Weight',
      why: 'Tracks total customer review count, average star rating, review velocity, and response rate.',
      mainProblems: [
        'Review acquisition velocity compared to top 3 local competitors',
        'Unanswered customer reviews and AI response automation'
      ],
      potentialImpact: 'HIGH',
      recommendedFix: 'Launch automated review invite workflow to generate 5-10 fresh reviews monthly.'
    },
    {
      key: 'rankings',
      name: 'Local Rankings',
      icon: TrendingUp,
      score: scores.rankings !== null && scores.rankings !== -1 ? scores.rankings : null,
      previousScore: null,
      change: 0,
      weight: '15% Weight',
      why: 'Calculates real-world positions in Google Local 3-Pack and top 10 organic search for buyer-intent keywords.',
      mainProblems: [
        'Ranking visibility in target geographic grid',
        'Competitors holding top 3 positions for emergency service queries'
      ],
      potentialImpact: 'CRITICAL',
      recommendedFix: 'Track 10+ core commercial keywords and optimize target landing pages.'
    },
    {
      key: 'content',
      name: 'Content Depth',
      icon: FileText,
      score: scores.content || 55,
      previousScore: scores.previousScore ? scores.content - 2 : null,
      change: scores.previousScore ? 2 : 0,
      weight: '15% Weight',
      why: 'Evaluates word count, topical breadth, dedicated service sub-pages, and customer FAQ coverage.',
      mainProblems: [
        'Single page service listing vs dedicated specialized sub-pages',
        'Missing customer FAQ section with FAQPage schema markup',
        'Thin topical content (under 500 words per key service)'
      ],
      potentialImpact: 'HIGH',
      recommendedFix: 'Publish dedicated 600-word service pages for each core offering.'
    },
    {
      key: 'authority',
      name: 'Authority & Citations',
      icon: Award,
      score: scores.authority !== null && scores.authority !== -1 ? scores.authority : 45,
      previousScore: null,
      change: 0,
      weight: '10% Weight',
      why: 'Measures verified local citations, chamber of commerce listings, industry directories, and backlink signals.',
      mainProblems: [
        'Unclaimed local business directories (Yelp, YellowPages, Chamber)',
        'Inconsistent NAP citations across third-party directories'
      ],
      potentialImpact: 'MEDIUM',
      recommendedFix: 'Claim top 10 verified local directory listings in your city.'
    },
    {
      key: 'mobile',
      name: 'Mobile UX',
      icon: Smartphone,
      score: scores.mobile || 70,
      previousScore: scores.previousScore ? scores.mobile - 1 : null,
      change: scores.previousScore ? 1 : 0,
      weight: '10% Weight',
      why: 'Inspects responsive viewport meta tags, mobile tap targets, and touch navigation usability.',
      mainProblems: [
        'Mobile viewport scaling and responsive layout shift',
        'Tap target sizing for mobile buttons'
      ],
      potentialImpact: 'HIGH',
      recommendedFix: 'Ensure all CTA buttons are at least 48px tall on mobile screens.'
    },
    {
      key: 'security',
      name: 'Security & Privacy',
      icon: Shield,
      score: scores.security || 75,
      previousScore: scores.previousScore ? scores.security : null,
      change: 0,
      weight: '5% Weight',
      why: 'Checks SSL encryption validity, HTTPS redirection, and XSS/Frame protection headers.',
      mainProblems: [
        'Strict-Transport-Security (HSTS) headers',
        'X-Content-Type-Options and X-Frame-Options directives'
      ],
      potentialImpact: 'MEDIUM',
      recommendedFix: 'Enforce HTTPS and install security headers via cloud proxy.'
    },
    {
      key: 'conversion',
      name: 'Conversion Readiness',
      icon: Zap,
      score: scores.conversion || 65,
      previousScore: null,
      change: 0,
      weight: '10% Weight',
      why: 'Measures lead capture availability, click-to-call buttons, contact form accessibility, and call-to-action prominence.',
      mainProblems: [
        'No floating click-to-call button on mobile viewports',
        'Missing direct lead capture quote form above the fold'
      ],
      potentialImpact: 'VERY HIGH',
      recommendedFix: 'Add sticky mobile call button and instant quote form.'
    }
  ];

  const selectedCategoryData = categories.find(c => c.key === activeCategory);

  return (
    <DashboardLayout>
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Activity className="text-primary-accent" size={26} />
            Diagnostic Growth Score Telemetry
          </h1>
          <p className="text-xs text-secondary mt-1">
            Complete multi-dimensional evaluation of your local search power across 11 key vectors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
            <span className="text-xs font-semibold text-secondary">Overall Score:</span>
            <span className="text-xl font-black text-primary">{scores.overall}/100</span>
            {scores.change !== 0 && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${scores.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {scores.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {scores.change > 0 ? `+${scores.change}` : scores.change}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 11 Vectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.key;
          const isUnavailable = cat.score === null;

          return (
            <div
              key={cat.key}
              onClick={() => handleSelectTab(cat.key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-blue-50/70 border-primary-accent shadow-md ring-1 ring-primary-accent' 
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-100 text-primary-accent' : 'bg-gray-100 text-gray-700'}`}>
                      <cat.icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-primary">{cat.name}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isUnavailable ? 'bg-amber-100 text-amber-800' :
                    cat.score! >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    cat.score! >= 60 ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {isUnavailable ? 'DISCONNECTED' : cat.potentialImpact}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  {!isUnavailable ? (
                    <>
                      <span className="text-3xl font-black text-primary">{cat.score}</span>
                      <span className="text-xs font-semibold text-secondary">/ 100</span>
                      {cat.change !== 0 && (
                        <span className="ml-auto text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp size={12} /> +{cat.change}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-amber-700">
                      Connect to sync
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-secondary mt-2 line-clamp-2 leading-relaxed">
                  {cat.why}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-secondary">{cat.weight}</span>
                <span className="text-primary-accent font-semibold text-xs flex items-center gap-0.5">
                  <span>Details</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Deep Dive (WHY & WHAT TO FIX) */}
      {selectedCategoryData && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-50 text-primary-accent border border-blue-100">
                <selectedCategoryData.icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-primary">{selectedCategoryData.name} Deep Dive</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-primary-accent uppercase">
                    {selectedCategoryData.weight}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">{selectedCategoryData.why}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-primary">
                {selectedCategoryData.score !== null ? `${selectedCategoryData.score}/100` : 'Disconnected'}
              </div>
              <span className="text-xs font-semibold text-emerald-600 block">
                Potential Impact: {selectedCategoryData.potentialImpact}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Why This Matters & Identified Problems */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                Key Detected Problems & Observations
              </h3>
              <div className="space-y-2.5">
                {selectedCategoryData.mainProblems.map((prob, pIdx) => (
                  <div key={pIdx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span className="text-primary font-medium leading-relaxed">{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action & Next Step */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                Recommended Strategic Fix
              </h3>
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <p className="text-xs text-primary font-semibold leading-relaxed">
                  {selectedCategoryData.recommendedFix}
                </p>
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleOpenFixWithAI(selectedCategoryData)}
                    className="px-4 py-2 rounded-lg bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>FIX WITH AI</span>
                  </button>
                  <Link
                    to="/dashboard/actions"
                    className="px-4 py-2 rounded-lg bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View in AI Action Plan</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    to="/dashboard/copilot"
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-primary text-xs font-semibold border border-gray-200 transition-colors"
                  >
                    Ask Copilot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FixWithAIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeFixTitle}
        fixType={activeFixType}
        context={activeFixContext}
      />
    </DashboardLayout>
  );
}
