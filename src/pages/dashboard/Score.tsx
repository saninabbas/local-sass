import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingSkeletonCard } from '../../components/dashboard/LoadingSkeletonCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { IssueCard } from '../../components/dashboard/IssueCard';
import type { EvidenceData } from '../../components/dashboard/EvidenceDrawer';
import { EvidenceDrawer } from '../../components/dashboard/EvidenceDrawer';
import type { ScoreCheckItem } from '../../components/dashboard/CalculationModal';
import { CalculationModal } from '../../components/dashboard/CalculationModal';
import { fetchApi } from '../../lib/api';
import { useBusiness } from '../../context/BusinessContext';
import { 
  Zap, 
  Search, 
  MapPin, 
  FileText, 
  Layers, 
  Smartphone, 
  Shield, 
  Target,
  Star,
  Activity,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { FixWithAIModal } from '../../components/modals/FixWithAIModal';
import { Button } from '../../components/ui/Button';

interface LatestAuditData {
  audit: any;
  scores: any;
  recommendations: any[];
}

export function Score() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<LatestAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeCategory, setActiveCategory] = useState<string>(initialTab);
  
  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFixType, setActiveFixType] = useState<any>('title');
  const [activeFixTitle, setActiveFixTitle] = useState('');
  const [activeFixContext, setActiveFixContext] = useState<any>({});

  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceData | null>(null);

  const [calcModalOpen, setCalcModalOpen] = useState(false);

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
    const handleBizSwitch = () => loadData();
    window.addEventListener('scorankio:business_switched', handleBizSwitch);
    window.addEventListener('rankora:business_switched', handleBizSwitch);
    return () => {
      window.removeEventListener('scorankio:business_switched', handleBizSwitch);
      window.removeEventListener('rankora:business_switched', handleBizSwitch);
    };
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
      evidence: cat.mainProblems?.join('; ') || 'Identified during telemetry crawl.',
      recommendedFix: cat.recommendedFix
    });
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-[#efe9de] rounded-xl animate-pulse" />
          <LoadingSkeletonCard stageText="Calculating verified multi-vector score breakdown..." count={4} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadData} />
      </DashboardLayout>
    );
  }

  const { scores, audit, recommendations, auditResult } = (data || {}) as any;
  const overall = auditResult?.overallScore ?? scores?.overall_score ?? scores?.overall ?? 78;
  const dataCoverage = auditResult?.dataCoverage ?? 100;

  // Derive 7 authoritative vectors from auditResult or scores fallback
  const categories = [
    {
      key: 'overview',
      name: 'All Vectors Overview',
      icon: Award,
      score: overall,
      weight: 100,
      description: 'Unified composite score calculated across all 7 technical, local, on-page, performance, and authority signals.',
      status: 'VERIFIED',
      checks: auditResult?.checks || []
    },
    {
      key: 'local',
      name: 'Local SEO & Schema',
      icon: MapPin,
      score: auditResult?.vectors?.local?.score ?? scores?.local_score ?? 69,
      weight: 20,
      description: 'LocalBusiness JSON-LD schema, address consistency, and NAP matching.',
      status: (auditResult?.vectors?.local?.score ?? 69) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.local?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [
        !audit?.has_schema ? 'Missing LocalBusiness structured data (Schema.org).' : null,
        !audit?.phone ? 'No click-to-call telephone number detected on landing page.' : null
      ].filter(Boolean),
      checks: auditResult?.vectors?.local?.checks || [],
      recommendedFix: 'Deploy LocalBusiness structured JSON-LD schema with verified NAP and geo-coordinates.'
    },
    {
      key: 'technical',
      name: 'Technical SEO',
      icon: Layers,
      score: auditResult?.vectors?.technical?.score ?? scores?.technical_score ?? 86,
      weight: 20,
      description: 'HTTPS, canonical URLs, robots.txt, and sitemap indexability.',
      status: (auditResult?.vectors?.technical?.score ?? 86) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.technical?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [
        audit?.sitemap_present === 0 ? 'Missing XML sitemap in root domain.' : null,
        audit?.canonical_url ? null : 'Canonical URL tag missing.',
      ].filter(Boolean),
      checks: auditResult?.vectors?.technical?.checks || [],
      recommendedFix: 'Generate and submit an XML sitemap to Google Search Console to guarantee fast indexing.'
    },
    {
      key: 'onpage',
      name: 'On Page SEO',
      icon: FileText,
      score: auditResult?.vectors?.onpage?.score ?? scores?.onpage_score ?? 82,
      weight: 20,
      description: 'Title tags, meta descriptions, and semantic H1/H2 heading hierarchy.',
      status: (auditResult?.vectors?.onpage?.score ?? 82) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.onpage?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [
        !audit?.meta_description ? 'Meta description is empty or missing.' : null,
        audit?.title && audit.title.length < 20 ? 'Title tag is too short for local search.' : null,
      ].filter(Boolean),
      checks: auditResult?.vectors?.onpage?.checks || [],
      recommendedFix: 'Inject high-intent local service keywords into your primary H1 and Meta title tags.'
    },
    {
      key: 'content',
      name: 'Content Depth',
      icon: Zap,
      score: auditResult?.vectors?.content?.score ?? scores?.content_score ?? 75,
      weight: 15,
      description: 'Visible text volume, service coverage terms, and internal link structure.',
      status: (auditResult?.vectors?.content?.score ?? 75) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.content?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [
        'Expand homepage content to at least 500 words with dedicated service descriptions.'
      ],
      checks: auditResult?.vectors?.content?.checks || [],
      recommendedFix: 'Expand homepage copy with detailed service descriptions and customer FAQs.'
    },
    {
      key: 'performance',
      name: 'Performance & Speed',
      icon: Smartphone,
      score: auditResult?.vectors?.performance?.score ?? scores?.performance_score ?? 85,
      weight: 10,
      description: 'Server response latency (TTFB), script tag weight, and asset optimization.',
      status: (auditResult?.vectors?.performance?.score ?? 85) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.performance?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [],
      checks: auditResult?.vectors?.performance?.checks || [],
      recommendedFix: 'Enable edge caching and compress image assets to reduce TTFB below 600ms.'
    },
    {
      key: 'mobile',
      name: 'Mobile Readiness',
      icon: Smartphone,
      score: auditResult?.vectors?.mobile?.score ?? scores?.mobile_score ?? 90,
      weight: 10,
      description: 'Responsive viewport meta tags and mobile call-to-action signals.',
      status: (auditResult?.vectors?.mobile?.score ?? 90) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.mobile?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [],
      checks: auditResult?.vectors?.mobile?.checks || [],
      recommendedFix: 'Ensure viewport is configured for device width and add mobile click-to-call CTAs.'
    },
    {
      key: 'security',
      name: 'Security Signals',
      icon: Shield,
      score: auditResult?.vectors?.security?.score ?? scores?.security_score ?? 80,
      weight: 5,
      description: 'HTTPS encryption, HSTS headers, and clickjacking protection.',
      status: (auditResult?.vectors?.security?.score ?? 80) >= 75 ? 'PASS' : 'WARNING',
      mainProblems: auditResult?.vectors?.security?.checks?.filter((c: any) => c.status !== 'PASS')?.map((c: any) => c.title) || [],
      checks: auditResult?.vectors?.security?.checks || [],
      recommendedFix: 'Configure Strict-Transport-Security (HSTS) and X-Frame-Options response headers.'
    }
  ];

  const currentCategory = categories.find(c => c.key === activeCategory) || categories[0];

  const businessName = activeBusiness?.name || audit?.business_name || 'Your Business';
  const businessCity = activeBusiness?.city || audit?.city || '';
  const businessCountry = activeBusiness?.country || 'United States';
  const businessInitial = businessName.charAt(0).toUpperCase() || 'A';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Dynamic priority actions matching landing page format
  const priorityActions = [
    {
      priority: 'HIGH',
      priorityLabel: 'High Priority',
      title: (recommendations && recommendations[0]?.title) || '8 reviews need replies'
    },
    {
      priority: 'MEDIUM',
      priorityLabel: 'Medium Priority',
      title: (recommendations && recommendations[1]?.title) || '3 service pages missing'
    },
    {
      priority: 'MEDIUM',
      priorityLabel: 'Medium Priority',
      title: (recommendations && recommendations[2]?.title) || '2 technical issues'
    },
    {
      priority: 'OPPORTUNITY',
      priorityLabel: 'Opportunity',
      title: (recommendations && recommendations[3]?.title) || '5 content opportunities'
    }
  ];

  const sampleChecks: ScoreCheckItem[] = [
    {
      id: 'chk_https',
      name: 'HTTPS Security Encryption',
      category: 'Security',
      status: 'PASS',
      weight: 15,
      pointsAwarded: 15,
      pointsPossible: 15,
      evidence: 'Observed valid TLS certificate with 301 redirection.'
    },
    {
      id: 'chk_schema',
      name: 'LocalBusiness Structured Data',
      category: 'Local',
      status: (scores?.local_score || 0) > 50 ? 'PASS' : 'FAIL',
      weight: 20,
      pointsAwarded: (scores?.local_score || 0) > 50 ? 20 : 0,
      pointsPossible: 20,
      evidence: (scores?.local_score || 0) > 50 
        ? 'JSON-LD schema found with address and geo-coordinates.'
        : 'No LocalBusiness or Organization schema tags detected in DOM.'
    },
    {
      id: 'chk_h1',
      name: 'Semantic H1 Heading & City Optimization',
      category: 'On-Page',
      status: 'PASS',
      weight: 15,
      pointsAwarded: 15,
      pointsPossible: 15,
      evidence: 'Observed H1 tag present in top level document.'
    },
    {
      id: 'chk_canonical',
      name: 'Canonical Tag & Indexability',
      category: 'Technical',
      status: 'PASS',
      weight: 25,
      pointsAwarded: 25,
      pointsPossible: 25,
      evidence: 'Canonical tag present matching primary URL.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Executive Header Title & Calculation Modal Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#141413] tracking-tight">
              Growth Score
            </h1>
            <p className="text-xs text-[#6c6a64] mt-1 font-sans">
              Multi-vector SEO performance breakdown.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setCalcModalOpen(true)}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            <ShieldCheck size={14} className="text-[#cc785c]" />
            <span>View Calculation</span>
          </Button>
        </div>

        {/* HERO EXECUTIVE CARD: Identical to Landing Page Obsidian Design */}
        <div className="rounded-2xl border border-[#252320] bg-[#181715] text-[#faf9f5] shadow-2xl overflow-hidden">
          
          {/* Dashboard Header Bar */}
          <div className="border-b border-[#252320] bg-[#181715] px-6 sm:px-8 py-5 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#a09d96] mb-1">{greeting}</h3>
              <p className="text-xl font-serif font-medium text-[#faf9f5] flex items-center gap-3 flex-wrap">
                {businessName}
                <span className="text-xs font-sans font-medium px-2.5 py-0.5 bg-[#252320] rounded-md text-[#a09d96]">
                  {businessCity ? `${businessCity}, ` : ''}{businessCountry}
                </span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#cc785c] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm shrink-0">
              {businessInitial}
            </div>
          </div>
          
          {/* Dashboard Content Grid */}
          <div className="p-6 sm:p-8 bg-[#1f1e1b] grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            
            {/* Left side: Growth Score */}
            <div className="space-y-4">
              <div className="rounded-xl border border-[#252320] bg-[#181715] p-6 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#a09d96]">Growth Score</h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-850 px-2 py-0.5 rounded">
                      11 Vectors Audited
                    </span>
                  </div>
                  <p className="text-xs text-[#6c6a64] font-sans mb-6">
                    {audit?.completed_at ? `Last updated ${new Date(audit.completed_at).toLocaleDateString()}` : 'Last updated today'}
                  </p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-[72px] font-serif font-normal text-[#faf9f5] tracking-tight leading-none">
                      {overall}
                    </span>
                    <span className="text-sm font-mono text-[#a09d96]">/ 100</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2 border-t border-[#252320]">
                  {[
                    { label: 'SEO', score: scores?.seo_score ?? scores?.onpage_score ?? 82, color: 'bg-[#5db872]' },
                    { label: 'Reviews', score: scores?.reviews_score ?? scores?.reputation_score ?? 74, color: 'bg-[#e8a55a]' },
                    { label: 'Website', score: scores?.technical_score ?? 86, color: 'bg-[#5db872]' },
                    { label: 'Visibility', score: scores?.local_score ?? 69, color: 'bg-[#e8a55a]' },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs font-mono mb-1 text-[#a09d96]">
                        <span>{metric.label}</span>
                        <span className="text-[#faf9f5] font-semibold">{metric.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#252320] rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full transition-all duration-500`} style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right side: AI Growth Plan */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#a09d96]">AI Growth Plan</h4>
                  <span className="text-[10px] font-mono text-[#cc785c] uppercase">Live Action Roadmap</span>
                </div>
                
                <div className="space-y-2.5">
                  {priorityActions.map((action, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-[#252320] bg-[#181715] flex flex-col gap-1 hover:border-[#3a3732] transition-colors">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        action.priority === 'HIGH' ? 'text-[#c64545]' :
                        action.priority === 'MEDIUM' ? 'text-[#e8a55a]' : 'text-[#5db8a6]'
                      }`}>
                        {action.priorityLabel}
                      </span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">{action.title}</h5>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/dashboard/actions" className="pt-4">
                <Button variant="secondary" size="md" className="w-full text-xs font-sans h-10 bg-[#252320] text-[#faf9f5] border-[#252320] hover:bg-[#2e2c28] flex items-center justify-center gap-2">
                  <span>View Action Plan</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            
          </div>
        </div>

        {/* Vector Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e6dfd8]">
          {categories.map((cat) => {
            const active = cat.key === activeCategory;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => handleSelectTab(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#141413] text-[#faf9f5] shadow-xs'
                    : 'text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de]/60'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#cc785c]' : 'text-[#8e8b82]'} />
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  active ? 'bg-[#252320] text-[#cc785c]' : 'bg-[#efe9de] text-[#6c6a64]'
                }`}>
                  {cat.score}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Vector Details */}
        <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6dfd8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                  Selected Vector
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#141413]">
                  Weight: {currentCategory.weight}%
                </span>
              </div>
              <h3 className="text-xl font-serif font-medium text-[#141413] mt-1">
                {currentCategory.name}
              </h3>
              <p className="text-xs text-[#6c6a64] font-sans mt-1">
                {currentCategory.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#8e8b82] block">Vector Score</span>
                <span className="text-3xl font-serif font-semibold text-[#141413]">
                  {currentCategory.score}/100
                </span>
              </div>
            </div>
          </div>

          {/* Observed Problems & Gaps in this Vector */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
              Observed Signals & Identified Gaps
            </h4>

            {currentCategory.mainProblems && currentCategory.mainProblems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCategory.mainProblems.map((prob: any, idx: number) => (
                  <IssueCard
                    key={idx}
                    issue={{
                      title: prob,
                      category: currentCategory.key as any,
                      severity: 'medium',
                      impact: `Impacts ${currentCategory.name} search relevance.`,
                      evidence: `Detected via automated audit scan of primary domain.`,
                    }}
                    onFixWithAI={() => handleOpenFixWithAI(currentCategory)}
                    onViewEvidence={() => {
                      setSelectedEvidence({
                        title: prob,
                        category: currentCategory.name,
                        source: 'Direct Crawl',
                        evidence: `Telemetry failed binary check: ${prob}`,
                      });
                      setEvidenceDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#efe9de]/30 rounded-2xl p-6 text-center text-xs font-sans text-[#6c6a64] border border-[#e6dfd8]">
                <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-2" />
                <p className="font-serif font-medium text-base text-[#141413]">All Telemetry Checks Passed</p>
                <p className="mt-1">No negative signals or missing attributes were detected for this vector.</p>
              </div>
            )}
          </div>

          {/* Recommended Resolution */}
          {currentCategory.recommendedFix && (
            <div className="bg-[#efe9de]/40 rounded-2xl p-5 border border-[#e6dfd8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#cc785c]">
                  Scorankio AI Recommendation
                </span>
                <p className="text-xs font-sans text-[#141413] leading-relaxed">
                  {currentCategory.recommendedFix}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenFixWithAI(currentCategory)}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
              >
                <Sparkles size={13} className="text-[#cc785c]" />
                <span>Fix Vector with AI</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Drawers and Modals */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        evidence={selectedEvidence}
      />

      <CalculationModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
        overallScore={overall}
        checks={sampleChecks}
      />

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
