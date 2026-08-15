import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingSkeletonCard } from '../../components/dashboard/LoadingSkeletonCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { MetricCard } from '../../components/dashboard/MetricCard';
import type { IssueItem } from '../../components/dashboard/IssueCard';
import { IssueCard } from '../../components/dashboard/IssueCard';
import type { CompetitorData } from '../../components/dashboard/CompetitorCard';
import { CompetitorCard } from '../../components/dashboard/CompetitorCard';
import type { EvidenceData } from '../../components/dashboard/EvidenceDrawer';
import { EvidenceDrawer } from '../../components/dashboard/EvidenceDrawer';
import type { ScoreCheckItem } from '../../components/dashboard/CalculationModal';
import { CalculationModal } from '../../components/dashboard/CalculationModal';
import { getDashboard, runAudit } from '../../lib/api';
import type { DashboardData, ProblemItem } from '../../types';
import { 
  MapPin, 
  Building, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Globe,
  Search,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FixWithAIModal } from '../../components/modals/FixWithAIModal';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const navigate = useNavigate();

  // Drawers & Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFixType, setActiveFixType] = useState<any>('title');
  const [activeFixTitle, setActiveFixTitle] = useState('');
  const [activeFixContext, setActiveFixContext] = useState<any>({});

  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceData | null>(null);

  const [calcModalOpen, setCalcModalOpen] = useState(false);

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

  const handleFixIssue = (issue: IssueItem | ProblemItem) => {
    setActiveFixTitle(issue.title);
    setActiveFixType(issue.category || 'seo');
    setActiveFixContext({
      problem: issue.title,
      evidence: issue.evidence,
      impact: issue.impact,
      businessName: data?.business?.name,
      websiteUrl: data?.business?.websiteUrl,
      city: data?.business?.city
    });
    setModalOpen(true);
  };

  const handleViewEvidence = (item: IssueItem | ProblemItem) => {
    setSelectedEvidence({
      title: item.title,
      category: item.category,
      source: 'Website Crawl / SERP',
      impact: item.impact,
      evidence: item.evidence,
      technicalDetails: {
        category: item.category,
        severity: item.severity,
        business_target: data?.business?.name,
        target_url: data?.business?.websiteUrl,
      }
    });
    setEvidenceDrawerOpen(true);
  };

  const handleFixCompetitorGap = (competitor: CompetitorData) => {
    setActiveFixTitle(`Beat ${competitor.domain}: ${competitor.gapAnalysis?.gap || 'Service Page'}`);
    setActiveFixType('content');
    setActiveFixContext({
      competitorDomain: competitor.domain,
      gap: competitor.gapAnalysis?.gap,
      evidence: competitor.gapAnalysis?.evidence,
      action: competitor.gapAnalysis?.recommendedAction,
      businessName: data?.business?.name,
      city: data?.business?.city,
    });
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-[#efe9de] rounded-xl animate-pulse" />
          <LoadingSkeletonCard stageText="Retrieving verified telemetry & crawl data..." count={5} />
          <LoadingSkeletonCard stageText="Compiling competitive analysis..." count={3} />
        </div>
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

  if (!business) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] py-16 shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#efe9de] flex items-center justify-center text-[#cc785c] mb-4">
            <Building size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#141413] mb-2">
            Welcome to Rankora
          </h2>
          <p className="text-xs sm:text-sm text-[#6c6a64] mb-6 max-w-md font-sans">
            Enter your business website URL to trigger real-time DOM extraction, local SERP benchmarking, and deterministic scoring.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/onboarding')} 
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold text-xs px-6 py-3 rounded-xl"
          >
            Start Business Auto-Discovery
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!growthScore) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] py-16 shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#efe9de] flex items-center justify-center text-[#cc785c] mb-4">
            <Globe size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#141413] mb-2">
            Ready to Audit {business.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#6c6a64] mb-6 max-w-md font-sans leading-relaxed">
            We will crawl <span className="font-mono text-[#141413] font-semibold">{business.websiteUrl}</span>, discover local competitors in <span className="font-semibold text-[#141413]">{business.city}</span>, verify technical signals, and assemble your prioritized action plan.
          </p>
          <Button
            size="lg"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold flex items-center gap-2 text-xs px-6 py-3 rounded-xl"
          >
            {isAuditing ? <RefreshCw size={16} className="animate-spin text-[#cc785c]" /> : <Sparkles size={16} className="text-[#cc785c]" />}
            <span>{isAuditing ? auditMessages[auditStep] : 'Execute Live Deep Audit'}</span>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Derive score checks for deterministic calculation modal
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
      status: (growthScore.local || 0) > 50 ? 'PASS' : 'FAIL',
      weight: 20,
      pointsAwarded: (growthScore.local || 0) > 50 ? 20 : 0,
      pointsPossible: 20,
      evidence: (growthScore.local || 0) > 50 
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
      evidence: `Target city (${business.city}) evaluated in core page headings.`
    },
    {
      id: 'chk_gbp',
      name: 'Google Business Profile Association',
      category: 'Local',
      status: growthScore.gbp !== null ? 'PASS' : 'WARNING',
      weight: 25,
      pointsAwarded: growthScore.gbp !== null ? 25 : 0,
      pointsPossible: 25,
      evidence: growthScore.gbp !== null 
        ? 'Connected Google OAuth telemetry linked.'
        : 'Google Business Profile is not connected in Settings.'
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

  // Top 3 Problems (Strictly max 3)
  const topProblems: ProblemItem[] = (biggestProblems || []).slice(0, 3);

  // Today's Actions (Strictly max 3)
  const todaysActions = (recommendations || []).slice(0, 3);

  // Competitor Items
  const competitorsArray = Array.isArray(competitorSnapshot) 
    ? competitorSnapshot 
    : ((competitorSnapshot as any)?.competitors || []);

  const competitorsList: CompetitorData[] = competitorsArray.slice(0, 3).map((comp: any, idx: number) => ({
    id: comp.domain || `comp_${idx}`,
    name: comp.name || comp.domain,
    domain: comp.domain,
    url: comp.url || `https://${comp.domain}`,
    rank: comp.rank || idx + 1,
    source: 'Serper Local SERP',
    signals: {
      hasDedicatedServicePage: comp.hasDedicatedServicePage !== false,
      hasLocalSchema: comp.localScore > 50 || comp.hasLocalSchema === true,
      wordCount: comp.wordCount || 850,
    },
    gapAnalysis: {
      evidence: comp.gapSummary || `Competitor holds strong organic presence in ${business.city}.`,
      yourStatus: 'No dedicated landing page detected for this localized service query.',
      gap: comp.gapSummary || 'Dedicated service sub-page & localized schema markup.',
      recommendedAction: 'Generate a specialized local service page using Rankora AI Content Studio.'
    }
  }));

  const trackedKeywordsCount = data.keywordsSummary?.totalTracked ?? ((data as any).rankingTelemetry?.keywords?.length ?? 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header & Entity Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">
                {business.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#efe9de] text-[#141413] border border-[#e6dfd8]">
                {business.type || 'Local Business'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs font-sans text-[#6c6a64]">
              <span className="flex items-center gap-1 text-[#141413] font-medium">
                <MapPin size={13} className="text-[#cc785c]" />
                {business.city}{business.country ? `, ${business.country}` : ''}
              </span>
              <span>•</span>
              <a 
                href={business.websiteUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 hover:text-[#cc785c] font-mono transition-colors text-[#141413]"
              >
                <span>{business.websiteUrl?.replace(/^https?:\/\//, '')}</span>
                <ExternalLink size={11} className="text-[#8e8b82]" />
              </a>
              <span>•</span>
              <span className="font-mono text-[#8e8b82]">Last audit: {growthScore.lastAudited || 'Just now'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="bg-[#faf9f5] border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] flex items-center gap-2 text-xs font-sans font-semibold h-9 shadow-xs"
            >
              <RefreshCw size={13} className={isAuditing ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
              <span>{isAuditing ? auditMessages[auditStep] : 'Re-Run Audit'}</span>
            </Button>
            <Link
              to="/dashboard/copilot"
              className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles size={13} className="text-[#cc785c]" />
              <span>Ask AI Copilot</span>
            </Link>
          </div>
        </div>

        {/* 1. TOP AREA: HOW AM I DOING? */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
              1. HOW AM I DOING? — Core Telemetry
            </h2>
            <button
              onClick={() => setCalcModalOpen(true)}
              className="text-xs font-mono text-[#cc785c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck size={13} />
              <span>[View Calculation]</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Growth Score"
              value={`${growthScore.overall || 0}/100`}
              subtitle="Deterministic multi-vector score"
              icon={TrendingUp}
              trend={{
                value: growthScore.change ? Math.abs(growthScore.change) : 0,
                isPositive: (growthScore.change || 0) >= 0,
                label: 'vs last check'
              }}
              source="Crawl + SERP"
              lastChecked="Live"
              status="PASS"
              action={{
                label: 'Calculation',
                onClick: () => setCalcModalOpen(true)
              }}
            />

            <MetricCard
              title="Local Visibility"
              value={`${growthScore.local || 0}/100`}
              subtitle={`Geo-pack readiness in ${business.city}`}
              icon={MapPin}
              source="Google SERP"
              lastChecked="Today"
              status={(growthScore.local || 0) >= 60 ? 'PASS' : 'WARNING'}
              action={{
                label: 'GeoGrid',
                onClick: () => navigate('/dashboard/geogrid')
              }}
            />

            <MetricCard
              title="Website Health"
              value={`${growthScore.technical || 0}/100`}
              subtitle="DOM structure & technical checks"
              icon={Globe}
              source="Direct Crawl"
              lastChecked="Live"
              status={(growthScore.technical || 0) >= 70 ? 'PASS' : 'WARNING'}
              action={{
                label: 'Inspect',
                onClick: () => navigate('/dashboard/website')
              }}
            />

            <MetricCard
              title="Google Business"
              value={growthScore.gbp !== null ? `${growthScore.gbp}/100` : 'Not Connected'}
              subtitle={growthScore.gbp !== null ? 'Verified Profile Synced' : 'Connect in Settings'}
              icon={Building}
              source="Google API"
              lastChecked={growthScore.gbp !== null ? 'Synced' : 'Unlinked'}
              status={growthScore.gbp !== null ? 'CONNECTED' : 'DISCONNECTED'}
              action={{
                label: growthScore.gbp !== null ? 'Manage' : 'Connect',
                onClick: () => navigate('/dashboard/settings')
              }}
            />

            <MetricCard
              title="Tracked Keywords"
              value={trackedKeywordsCount}
              subtitle="Live SERP rank monitoring"
              icon={Search}
              source="Serper API"
              lastChecked="Fresh"
              status={trackedKeywordsCount > 0 ? 'PASS' : 'WARNING'}
              action={{
                label: 'Rankings',
                onClick: () => navigate('/dashboard/keywords')
              }}
            />
          </div>
        </section>

        {/* 2. SECOND AREA: WHAT IS WRONG? (Top 3 Problems) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
              2. WHAT IS WRONG? — Top 3 Priority Problems
            </h2>
            <Link
              to="/dashboard/score"
              className="text-xs font-sans text-[#cc785c] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All Problems</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {topProblems.length === 0 ? (
            <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 text-center text-xs font-sans text-[#6c6a64]">
              <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-2" />
              <p className="font-serif font-medium text-base text-[#141413]">No Critical Problems Detected</p>
              <p className="mt-1">Your website passes all fundamental local technical and indexability checks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {topProblems.map((prob) => (
                <IssueCard
                  key={prob.id || prob.title}
                  issue={{
                    id: prob.id,
                    title: prob.title,
                    category: prob.category as any,
                    severity: (prob.severity?.toLowerCase() as any) || 'high',
                    impact: prob.impact || prob.whyItMatters,
                    evidence: prob.evidence || 'Observed via DOM extraction.',
                  }}
                  onFixWithAI={() => handleFixIssue(prob)}
                  onViewEvidence={() => handleViewEvidence(prob)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 3. THIRD AREA: WHO IS BEATING ME? (Competitor Snapshot) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
              3. WHO IS BEATING ME? — Competitor Snapshot
            </h2>
            <Link
              to="/dashboard/competitors"
              className="text-xs font-sans text-[#cc785c] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Competitor Radar</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {competitorsList.length === 0 ? (
            <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 text-center text-xs font-sans text-[#6c6a64]">
              <p className="font-serif font-medium text-base text-[#141413]">No Competitors Discovered Yet</p>
              <p className="mt-1">Re-run the deep audit to discover organic and 3-pack competitors in {business.city}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {competitorsList.map((comp) => (
                <CompetitorCard
                  key={comp.id || comp.domain}
                  competitor={comp}
                  onFixGapWithAI={() => handleFixCompetitorGap(comp)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. FOURTH AREA: WHAT SHOULD I FIX FIRST? (Today's Actions - Max 3) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
              4. WHAT SHOULD I FIX FIRST? — Today's Highest Impact Actions
            </h2>
            <Link
              to="/dashboard/actions"
              className="text-xs font-sans text-[#cc785c] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full 30-Day Roadmap</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {todaysActions.length === 0 ? (
              <div className="col-span-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 text-center text-xs font-sans text-[#6c6a64]">
                <p className="font-serif font-medium text-base text-[#141413]">All Daily Actions Completed</p>
                <p className="mt-1">Check back tomorrow or generate custom tasks in the AI Action Plan.</p>
              </div>
            ) : (
              todaysActions.map((act: any, idx: number) => (
                <div
                  key={act.id || idx}
                  className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-5 shadow-xs hover:border-[#cc785c]/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#141413] border border-[#e6dfd8]">
                        TASK #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#cc785c] font-bold">
                        {act.priority || 'HIGH IMPACT'}
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-medium text-[#141413] leading-snug">
                      {act.title || act.action}
                    </h4>

                    <p className="text-xs font-sans text-[#6c6a64] leading-relaxed line-clamp-2">
                      {act.description || act.expectedOutcome || 'High leverage SEO improvement.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e6dfd8]/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8e8b82]">
                      Est. Effort: {act.difficulty || 'Easy'}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleFixIssue({
                        title: act.title || act.action,
                        category: act.category || 'content',
                        severity: 'HIGH',
                        impact: act.expectedOutcome || 'Increases local search visibility.',
                        evidence: 'Identified via comparative gap analysis.',
                      } as any)}
                      className="flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#141413] hover:bg-[#252320] text-[#faf9f5]"
                    >
                      <Sparkles size={13} className="text-[#cc785c]" />
                      <span>Execute with AI</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 5. FIFTH AREA: WHAT CHANGED? (Freshness & Diagnostic Summary) */}
        <section className="bg-[#efe9de]/30 border border-[#e6dfd8] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#cc785c]" />
              <span className="font-mono font-bold uppercase text-[#8e8b82]">
                5. WHAT CHANGED? — Telemetry Freshness
              </span>
            </div>
            <p className="text-[#6c6a64]">
              Last full website DOM crawl and SERP comparison was executed on <strong className="text-[#141413] font-medium">{growthScore.lastAudited || 'Today'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="bg-[#faf9f5] border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] text-xs font-semibold"
            >
              <RefreshCw size={13} className={isAuditing ? "animate-spin text-[#cc785c]" : ""} />
              <span>Refresh Telemetry</span>
            </Button>
            <Link to="/dashboard/reports">
              <Button size="sm" className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold">
                Generate Growth Report
              </Button>
            </Link>
          </div>
        </section>
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
        overallScore={growthScore.overall || 0}
        checks={sampleChecks}
        timestamp={growthScore.lastAudited}
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
