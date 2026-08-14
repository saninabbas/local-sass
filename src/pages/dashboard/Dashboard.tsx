import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getDashboard, runAudit } from '../../lib/api';
import type { DashboardData, ProblemItem } from '../../types';
import { 
  MapPin, 
  Building, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  ExternalLink,
  Sparkles,
  ChevronRight,
  Users,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';

import { FixWithAIModal } from '../../components/modals/FixWithAIModal';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const navigate = useNavigate();

  // Fix With AI Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFixType, setActiveFixType] = useState<any>('title');
  const [activeFixTitle, setActiveFixTitle] = useState('');
  const [activeFixContext, setActiveFixContext] = useState<any>({});

  const auditMessages = [
    "Crawling website pages and extracting DOM telemetry...",
    "Evaluating semantic headings, titles, and local schema...",
    "Scanning localized SERP competitors in your market...",
    "Benchmarking local 3-pack & organic ranking gaps...",
    "Generating 30-day prioritized AI execution roadmap..."
  ];

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditStep(0);
    
    const interval = setInterval(() => {
      setAuditStep(prev => Math.min(prev + 1, auditMessages.length - 1));
    }, 2200);

    try {
      await runAudit();
      await loadDashboard(); 
    } catch (err: any) {
      alert("Failed to run audit: " + (err.message || 'Unknown error'));
    } finally {
      clearInterval(interval);
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your executive growth command center..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadDashboard} />
      </DashboardLayout>
    );
  }

  const { business, growthScore, recommendations, biggestProblems, competitorSnapshot } = data;

  // If no business profile configured
  if (!business) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white rounded-2xl border border-gray-200 py-16 shadow-xs">
          <Building size={48} className="text-primary-accent mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Welcome to Rankora</h2>
          <p className="text-sm text-secondary mb-6 max-w-md">
            Enter your website URL to automatically discover your business profile, competitors, and growth roadmap.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')} className="bg-primary-accent hover:bg-blue-700 text-white font-semibold">
            Start Business Auto-Discovery
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // If business exists but first audit not run yet
  if (!growthScore) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white rounded-2xl border border-gray-200 py-16 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-accent mb-4">
            <Zap size={24} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Ready to Analyze {business.name}</h2>
          <p className="text-sm text-secondary mb-6 max-w-md">
            We will crawl your website <span className="font-mono text-primary font-semibold">"{business.websiteUrl}"</span>, discover local competitors in <span className="font-semibold text-primary">{business.city}</span>, calculate your 11 Growth Scores, and build your 30-day action roadmap.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="bg-primary-accent hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
          >
            {isAuditing ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isAuditing ? auditMessages[auditStep] : 'Execute Deep Diagnostic Audit'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const scoreChange = growthScore.change || 0;
  const isScorePositive = scoreChange >= 0;

  return (
    <DashboardLayout>
      {/* Top Header & Entity Status */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {business.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-primary-accent border border-blue-100">
              {business.type || 'Local Business'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary">
            <span className="flex items-center gap-1 font-medium text-primary">
              <MapPin size={13} className="text-primary-accent" />
              {business.city}{business.country ? `, ${business.country}` : ''}
            </span>
            <span>•</span>
            <a 
              href={business.websiteUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 hover:text-primary-accent font-mono transition-colors"
            >
              <span>{business.websiteUrl?.replace(/^https?:\/\//, '')}</span>
              <ExternalLink size={11} />
            </a>
            <span>•</span>
            <span>Last audited: {growthScore.lastAudited}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="border-gray-200 bg-white text-primary hover:bg-gray-50 flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
          >
            <RefreshCw size={13} className={isAuditing ? "animate-spin text-primary-accent" : "text-secondary"} />
            {isAuditing ? auditMessages[auditStep] : 'Re-Run Audit'}
          </Button>
          <Link
            to="/dashboard/copilot"
            className="px-3.5 py-2 rounded-lg bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-blue-500/20"
          >
            <Sparkles size={13} />
            <span>Ask Rankora AI</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP METRICS STRIP: HOW AM I DOING? */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Overall Growth Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Overall Growth Score</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-primary-accent uppercase">
              CALCULATED
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">{growthScore.overall}</span>
            <span className="text-xs font-semibold text-secondary">/ 100</span>
            {scoreChange !== 0 && (
              <span className={`ml-auto text-xs font-bold flex items-center gap-0.5 ${isScorePositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isScorePositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isScorePositive ? `+${scoreChange}` : scoreChange}
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">11 Vectors Scanned</span>
            <Link to="/dashboard/score" className="text-primary-accent font-semibold hover:underline flex items-center gap-0.5">
              <span>View Breakdown</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Local Visibility */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Local Visibility</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
              LIVE
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">{growthScore.local}</span>
            <span className="text-xs font-semibold text-secondary">/ 100</span>
            <span className="ml-auto text-[11px] text-secondary font-medium">
              {business.city} Target
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">Map Pack Readiness</span>
            <Link to="/dashboard/score?tab=local" className="text-primary-accent font-semibold hover:underline flex items-center gap-0.5">
              <span>Inspect Local</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Google Business Profile */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Google Business</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
              growthScore.gbp !== null ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {growthScore.gbp !== null ? 'CONNECTED' : 'ACTION REQUIRED'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {growthScore.gbp !== null ? (
              <>
                <span className="text-3xl font-black text-primary">{growthScore.gbp}</span>
                <span className="text-xs font-semibold text-secondary">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                <AlertTriangle size={15} /> Disconnected
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">Reputation Sync</span>
            <Link to="/dashboard/settings" className="text-primary-accent font-semibold hover:underline flex items-center gap-0.5">
              <span>{growthScore.gbp !== null ? 'Manage GBP' : 'Connect Google'}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Reviews & Reputation */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Reviews & Rating</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-primary-accent uppercase">
              {growthScore.reviews !== null ? 'LIVE' : 'SYNC READY'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {growthScore.reviews !== null ? (
              <>
                <span className="text-3xl font-black text-primary">{growthScore.reviews}</span>
                <span className="text-xs font-semibold text-secondary">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-secondary">
                Connect GBP to track
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">AI Auto-Reply</span>
            <Link to="/dashboard/reviews" className="text-primary-accent font-semibold hover:underline flex items-center gap-0.5">
              <span>Reviews Hub</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Website & Technical Health */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Website Health</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
              CRAWLED
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">{growthScore.technical}</span>
            <span className="text-xs font-semibold text-secondary">/ 100</span>
            <span className="ml-auto text-xs font-bold text-emerald-600">
              {growthScore.security >= 80 ? 'SSL Secure' : 'Notice'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">Technical SEO</span>
            <Link to="/dashboard/website" className="text-primary-accent font-semibold hover:underline flex items-center gap-0.5">
              <span>Deep Crawl</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: WHY? & WHAT TO DO NEXT? */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (2 cols): Top Problems & AI Action Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top 3 Ranking Problems (WHY AM I LOSING?) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  Top Growth Bottlenecks Identified
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  The primary weaknesses suppressing your rankings in {business.city} search results.
                </p>
              </div>
              <Link to="/dashboard/score" className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1">
                <span>All 11 Vectors</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {(biggestProblems || []).slice(0, 3).map((prob: ProblemItem) => (
                <div key={prob.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        prob.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                        prob.severity === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {prob.severity}
                      </span>
                      <h3 className="text-xs font-bold text-primary">{prob.title}</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {prob.impact}
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    <strong className="text-primary">Evidence:</strong> {prob.evidence}
                  </p>
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-secondary text-[11px]">
                      <strong>Fix:</strong> {prob.recommendedFix}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const fixType = prob.title.toLowerCase().includes('meta') ? 'meta_description' :
                                          prob.title.toLowerCase().includes('schema') ? 'faq_schema' :
                                          prob.title.toLowerCase().includes('page') || prob.title.toLowerCase().includes('service') ? 'service_page_structure' : 'title';
                          setActiveFixType(fixType);
                          setActiveFixTitle(prob.title);
                          setActiveFixContext({
                            evidence: prob.evidence,
                            recommendedFix: prob.recommendedFix,
                            city: business.city,
                            businessName: business.name
                          });
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[#cc785c] font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
                      >
                        <Sparkles size={12} />
                        <span>FIX WITH AI</span>
                      </button>
                      <Link
                        to={prob.actionLink || '/dashboard/actions'}
                        className="inline-flex items-center gap-1 text-primary-accent font-bold hover:underline shrink-0 ml-1"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Action Plan: TODAY'S EXECUTION PRIORITIES */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <CheckCircle size={18} className="text-primary-accent" />
                  Today's Execution Priorities
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  High-leverage tasks to move your Growth Score towards 90+.
                </p>
              </div>
              <Link to="/dashboard/actions" className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1">
                <span>View Full Roadmap</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {(recommendations || []).slice(0, 3).map((rec, i) => (
                <div key={rec.id || i} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-all flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent uppercase">
                        {rec.priority || 'High Priority'}
                      </span>
                      <span className="text-xs font-bold text-primary">{rec.title}</span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                      {rec.description}
                    </p>
                    {rec.businessOutcome && (
                      <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                        🎯 Expected Outcome: {rec.businessOutcome}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/dashboard/actions"
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 text-primary hover:text-primary-accent text-xs font-semibold border border-gray-200 shrink-0 transition-colors"
                  >
                    Execute
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Local Competitor Benchmark & Real SERP Radar */}
        <div className="space-y-6">
          
          {/* Competitor Snapshot */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <Users size={18} className="text-primary-accent" />
                  Local Competitor Radar
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Real ranking competitors in {business.city}.
                </p>
              </div>
              <Link to="/dashboard/competitors" className="text-xs font-semibold text-primary-accent hover:underline">
                Compare
              </Link>
            </div>

            <div className="space-y-3">
              {(competitorSnapshot || []).map((comp, idx) => (
                <div 
                  key={comp.domain || idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === 0 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-primary">{comp.name}</span>
                        {idx === 0 && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary-accent text-white uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-secondary">{comp.domain}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-primary">{comp.growthScore}</span>
                      <span className="text-[10px] text-secondary font-medium block">Growth Score</span>
                    </div>
                  </div>
                  {comp.gapSummary && idx > 0 && (
                    <p className="text-[11px] text-secondary mt-2 pt-2 border-t border-gray-200 leading-tight">
                      {comp.gapSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link 
                to="/dashboard/competitors" 
                className="w-full py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
              >
                <span>Full Gap Analysis ("Why They Win")</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Quick Growth Prompts for AI Copilot */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-300" />
                <h3 className="text-sm font-bold">Ask Rankora Growth Agent</h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Your AI Copilot has full real-time access to {business.name}'s live audit, competitors, and keywords.
              </p>
              <div className="space-y-2 pt-1">
                {[
                  "Why is my competitor outranking me in Google Maps?",
                  "Give me a 30-day plan to reach top 3 in " + business.city,
                  "Which local service pages am I missing?"
                ].map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => navigate('/dashboard/copilot')}
                    className="w-full text-left p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-blue-50 border border-white/10 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate pr-2">"{promptText}"</span>
                    <ArrowUpRight size={13} className="shrink-0 text-blue-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

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
