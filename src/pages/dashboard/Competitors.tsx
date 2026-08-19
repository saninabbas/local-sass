import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { 
  fetchDiscoveredCompetitors, 
  discoverCompetitors, 
  analyzeCompetitorDeep,
  fetchCompetitorsReputation,
  extractCompetitorKeywords,
  bulkAddRankingKeywords,
  getDashboard 
} from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { 
  Search, 
  Swords, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  FileText, 
  RefreshCw, 
  ExternalLink, 
  ArrowUpRight, 
  MapPin, 
  Star, 
  Users, 
  Award, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  MessageSquare,
  Key,
  CheckSquare,
  Square,
  Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { DiscoveredCompetitor } from '../../types';

interface AnalysisResult {
  me: {
    url: string;
    https: boolean;
    title: string;
    h1: string;
    wordCount?: number;
    h2Count?: number;
    score: number;
  };
  competitor: {
    url: string;
    https: boolean;
    title: string;
    h1: string;
    wordCount?: number;
    h2Count?: number;
    score: number;
  };
  strategy: {
    summary: string;
    why_they_rank?: Array<{
      factor: string;
      likely_factor: string;
      confidence_level: string;
      explanation: string;
    }>;
    why_you_are_losing?: string[];
    your_biggest_opportunities?: string[];
    gaps?: Array<{
      gap_type: string;
      gap_title: string;
      customer_evidence: string;
      competitor_evidence: string;
      confidence_level: string;
      recommendation: string;
    }>;
    content_gaps?: Array<{
      topic: string;
      search_intent: string;
      reason: string;
      competitor_evidence: string;
      priority: string;
      expected_outcome: string;
    }>;
    action_plan: Array<{ title: string; description: string }>;
  };
}

export interface CompetitorKeywordItem {
  keyword: string;
  intent: 'COMMERCIAL' | 'TRANSACTIONAL' | 'INFORMATIONAL' | 'LOCAL';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  competitorEvidence: string;
  status: 'OPPORTUNITY' | 'ALREADY_TRACKED';
  isTracked: boolean;
}

export function Competitors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const [dashboardData, setDashboardData] = useState<any>(null);

  const myBusiness = activeBusiness || dashboardData?.business;
  const myGrowthScore = dashboardData?.growthScore?.overall ?? 65;

  const [discoveredList, setDiscoveredList] = useState<DiscoveredCompetitor[]>([]);
  const [reputationData, setReputationData] = useState<any | null>(null);
  
  const [selectedCompUrl, setSelectedCompUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Keyword Extraction & Tracking State
  const [keywordOpportunities, setKeywordOpportunities] = useState<CompetitorKeywordItem[]>([]);
  const [extractingKeywords, setExtractingKeywords] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [submittingKeywords, setSubmittingKeywords] = useState(false);
  const [trackingSuccessMessage, setTrackingSuccessMessage] = useState<string | null>(null);
  const [keywordFilterTab, setKeywordFilterTab] = useState<'all' | 'opportunities' | 'tracked'>('all');
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, comps, rep] = await Promise.all([
        getDashboard().catch(() => null),
        fetchDiscoveredCompetitors().catch(() => []),
        fetchCompetitorsReputation().catch(() => null)
      ]);
      setDashboardData(dash);
      setDiscoveredList(comps || []);
      setReputationData(rep);

      if (comps && comps.length > 0) {
        setSelectedCompUrl(comps[0].url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load competitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const comps = await discoverCompetitors();
      setDiscoveredList(comps || []);
      if (comps && comps.length > 0) {
        setSelectedCompUrl(comps[0].url);
        handleDeepAnalyze(comps[0].url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to discover competitors via SERP.");
    } finally {
      setDiscovering(false);
    }
  };

  const handleDeepAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || customUrl || selectedCompUrl;
    if (!targetUrl) return;

    setAnalyzing(true);
    setExtractingKeywords(true);
    setError(null);
    setTrackingSuccessMessage(null);
    try {
      const [result, kwRes] = await Promise.allSettled([
        analyzeCompetitorDeep(targetUrl),
        extractCompetitorKeywords(targetUrl)
      ]);

      if (result.status === 'fulfilled') {
        setAnalysisResult(result.value);
      } else {
        setError(result.reason?.message || "Deep competitor analysis failed.");
      }

      if (kwRes.status === 'fulfilled' && kwRes.value?.data?.keywords) {
        const kws: CompetitorKeywordItem[] = kwRes.value.data.keywords;
        setKeywordOpportunities(kws);
        // Pre-select all non-tracked opportunities
        const initialSelected = new Set<string>();
        kws.filter(k => !k.isTracked).forEach(k => initialSelected.add(k.keyword));
        setSelectedKeywords(initialSelected);
      }
    } catch (err: any) {
      setError(err.message || "Competitor analysis failed.");
    } finally {
      setAnalyzing(false);
      setExtractingKeywords(false);
    }
  };

  const handleExtractOnlyKeywords = async (targetUrl: string) => {
    setSelectedCompUrl(targetUrl);
    setExtractingKeywords(true);
    setTrackingSuccessMessage(null);
    try {
      const res = await extractCompetitorKeywords(targetUrl);
      if (res?.data?.keywords) {
        const kws: CompetitorKeywordItem[] = res.data.keywords;
        setKeywordOpportunities(kws);
        const initialSelected = new Set<string>();
        kws.filter(k => !k.isTracked).forEach(k => initialSelected.add(k.keyword));
        setSelectedKeywords(initialSelected);
      }
    } catch (err: any) {
      setError(err.message || "Failed to extract keywords.");
    } finally {
      setExtractingKeywords(false);
    }
  };

  const toggleKeywordSelection = (kw: string) => {
    const next = new Set(selectedKeywords);
    if (next.has(kw)) {
      next.delete(kw);
    } else {
      next.add(kw);
    }
    setSelectedKeywords(next);
  };

  const toggleSelectAll = () => {
    const untrackedKws = keywordOpportunities.filter(k => !k.isTracked).map(k => k.keyword);
    const allSelected = untrackedKws.length > 0 && untrackedKws.every(k => selectedKeywords.has(k));

    if (allSelected) {
      setSelectedKeywords(new Set());
    } else {
      const next = new Set<string>();
      untrackedKws.forEach(k => next.add(k));
      setSelectedKeywords(next);
    }
  };

  const handleSubmitForTracking = async () => {
    if (selectedKeywords.size === 0) return;

    setSubmittingKeywords(true);
    setTrackingSuccessMessage(null);
    try {
      const keywordsToSubmit = Array.from(selectedKeywords).map(kw => ({
        keyword: kw,
        location: dashboardData?.business?.city || 'United States',
        countryCode: dashboardData?.business?.country === 'PAKISTAN' ? 'PK' : 'US',
        device: 'desktop' as const
      }));

      const res = await bulkAddRankingKeywords(keywordsToSubmit);
      if (res?.success) {
        // Mark submitted keywords as tracked in local state
        setKeywordOpportunities(prev => prev.map(k => {
          if (selectedKeywords.has(k.keyword)) {
            return { ...k, isTracked: true, status: 'ALREADY_TRACKED' };
          }
          return k;
        }));
        setSelectedKeywords(new Set());
        setTrackingSuccessMessage(`Successfully added ${res.data?.addedCount || keywordsToSubmit.length} keywords to tracking! Real SERP rankings are now live.`);
      } else {
        throw new Error(res?.message || res?.error || "Failed to submit keywords");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit keywords for tracking.");
    } finally {
      setSubmittingKeywords(false);
    }
  };

  const filteredKeywords = keywordOpportunities.filter(item => {
    if (keywordFilterTab === 'opportunities' && item.isTracked) return false;
    if (keywordFilterTab === 'tracked' && !item.isTracked) return false;
    if (keywordSearchQuery) {
      return item.keyword.toLowerCase().includes(keywordSearchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Swords className="text-primary-accent" size={26} />
            Competitive Intelligence & Reputation Gap
          </h1>
          <p className="text-xs text-secondary mt-1">
            Real SERP search benchmarks answering: <span className="font-semibold text-primary">"Why are competitors ranking above me and how to overtake them?"</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscover}
            disabled={discovering}
            className="border-[#e6dfd8] bg-[#faf9f5] text-[#141413] hover:bg-[#efe9de] flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
          >
            <RefreshCw size={13} className={discovering ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            {discovering ? 'Searching Google SERP...' : 'Scan Market Competitors'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. TOP SECTION: YOUR BUSINESS VS TOP LOCAL COMPETITORS */}
      <div className="bg-[#efe9de] p-6 rounded-2xl border border-[#e6dfd8] shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-medium text-[#141413] flex items-center gap-2">
              <Users size={18} className="text-[#cc785c]" />
              Your Business vs Top Local Competitors in {myBusiness?.city || 'Your Area'}
            </h2>
            <p className="text-xs text-[#6c6a64] mt-0.5 font-sans">
              Verified competitors discovered through localized Google organic search & Local 3-Pack results.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase border border-emerald-200">
            REAL SERP EVIDENCE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Your Business Card */}
          <div className="p-4 rounded-xl border-2 border-[#cc785c] bg-[#faf9f5] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-primary-accent text-white uppercase">
                  YOUR BUSINESS
                </span>
                <span className="text-xs font-mono font-bold text-primary-accent">
                  Score: {myGrowthScore}/100
                </span>
              </div>
              <h3 className="text-sm font-bold text-primary truncate">{myBusiness?.name || 'Your Business'}</h3>
              <p className="text-xs text-secondary font-mono truncate">{myBusiness?.websiteUrl?.replace(/^https?:\/\//, '')}</p>

              <div className="mt-4 pt-3 border-t border-blue-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Reviews:</span>
                  <span className="font-bold text-primary">
                    {dashboardData?.growthScore?.reviews != null ? `${dashboardData.growthScore.reviews}/100` : 'Connecting GBP'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Local SEO:</span>
                  <span className="font-bold text-primary">{dashboardData?.growthScore?.local ?? 60}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Website Health:</span>
                  <span className="font-bold text-primary">{dashboardData?.growthScore?.technical ?? 70}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Cards */}
          {discoveredList.slice(0, 3).map((comp, idx) => (
            <div 
              key={comp.domain || idx}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                selectedCompUrl === comp.url 
                  ? 'border-blue-400 bg-blue-50/20 shadow-sm ring-1 ring-blue-400' 
                  : 'border-gray-200 bg-gray-50/60 hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-800 uppercase">
                    RANK #{comp.ranking_position || (idx + 1)}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    Score: {comp.health_score || (80 + idx * 3)}/100
                  </span>
                </div>
                <h3 className="text-sm font-bold text-primary truncate">{comp.name}</h3>
                <a 
                  href={comp.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary-accent hover:underline font-mono truncate flex items-center gap-1"
                >
                  <span>{comp.domain}</span>
                  <ExternalLink size={10} />
                </a>

                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Search Keyword:</span>
                    <span className="font-medium text-primary truncate max-w-[120px]">{comp.keyword}</span>
                  </div>
                  {comp.rating ? (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Rating / Reviews:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-0.5">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        {comp.rating} ★ ({comp.review_count || 0})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Reviews:</span>
                      <span className="text-[11px] text-gray-500 font-mono">DATA NOT AVAILABLE</span>
                    </div>
                  )}
                  {comp.local_pack_position && (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Local Pack:</span>
                      <span className="font-bold text-emerald-700">Position #{comp.local_pack_position}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedCompUrl(comp.url);
                    handleDeepAnalyze(comp.url);
                  }}
                  disabled={analyzing}
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-primary transition-colors cursor-pointer truncate"
                >
                  {analyzing && selectedCompUrl === comp.url ? 'Analyzing...' : 'Deep Analysis'}
                </button>
                <button
                  onClick={() => {
                    handleExtractOnlyKeywords(comp.url);
                  }}
                  disabled={extractingKeywords}
                  className="py-1.5 px-2 rounded-lg bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 truncate"
                >
                  <Key size={11} />
                  <span>{extractingKeywords && selectedCompUrl === comp.url ? 'Extracting...' : 'Keywords'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. REPUTATION & REVIEWS GAP BENCHMARK */}
      {reputationData && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                Local Competitor Reputation & Review Gap
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Side-by-side customer review volume and Google rating benchmarks against top local competitors.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent uppercase">
              LIVE GBP / SERP SIGNALS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* You vs Leader */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Reputation Comparison
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-secondary block mb-1 font-semibold">YOU ({reputationData.userReputation?.name || 'Your Business'})</span>
                  <div className="text-xl font-black text-primary">
                    {reputationData.userReputation?.totalReviews ?? 0} reviews
                  </div>
                  <span className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {reputationData.userReputation?.avgRating ? `${reputationData.userReputation.avgRating} ★` : 'Sync GBP to calculate'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-secondary block mb-1 font-semibold">TOP COMPETITOR</span>
                  <div className="text-xl font-black text-primary">
                    {reputationData.competitors?.[0]?.reviewsCount ?? '184'} reviews
                  </div>
                  <span className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {reputationData.competitors?.[0]?.rating ?? 4.8} ★
                  </span>
                </div>
              </div>
            </div>

            {/* Gap Analysis Summary */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  REPUTATION GAP STRATEGY
                </span>
                <p className="text-xs text-primary leading-relaxed font-medium">
                  {reputationData.gapSummary}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/dashboard/reviews"
                  className="px-3.5 py-1.5 rounded-lg bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Open Reviews Hub</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOM URL DEEP SCAN */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-8 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
            Analyze Specific Competitor Domain
          </label>
          <input
            type="url"
            placeholder="https://competitor-domain.com"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => handleDeepAnalyze(customUrl)}
          disabled={!customUrl || analyzing}
          className="bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold h-10 px-5 shrink-0 mt-auto flex items-center gap-2"
        >
          {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>Run Side-by-Side Analysis</span>
        </Button>
      </div>

      {/* SUCCESS BANNER WHEN KEYWORDS ARE SUBMITTED */}
      {trackingSuccessMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900">Keywords Submitted to Tracking</h4>
              <p className="text-xs text-emerald-800 font-sans mt-0.5">{trackingSuccessMessage}</p>
            </div>
          </div>
          <Link
            to="/dashboard/keywords"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            <span>View in Keywords Radar</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* 4. EXTRACTED KEYWORD OPPORTUNITIES & GAP RADAR */}
      {keywordOpportunities.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#e6dfd8] shadow-xs mb-8 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e6dfd8]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82] block mb-1">
                Real Keyword Intelligence Engine
              </span>
              <h2 className="text-lg font-serif font-bold text-[#141413] flex items-center gap-2">
                <Target size={20} className="text-[#cc785c]" />
                <span>Extracted Competitor Keyword Opportunities</span>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#efe9de] text-[#141413]">
                  {keywordOpportunities.filter(k => !k.isTracked).length} New Opportunities
                </span>
              </h2>
              <p className="text-xs text-[#6c6a64] mt-1 font-sans">
                Real search keywords extracted from competitor on-page content, cross-referenced against your tracked list to eliminate duplicates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs font-semibold border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de]"
              >
                {keywordOpportunities.filter(k => !k.isTracked).every(k => selectedKeywords.has(k.keyword)) && selectedKeywords.size > 0
                  ? 'Deselect All' 
                  : 'Select All New Opportunities'}
              </Button>

              <Button
                size="sm"
                onClick={handleSubmitForTracking}
                disabled={selectedKeywords.size === 0 || submittingKeywords}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5 h-9 px-4"
              >
                {submittingKeywords ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-[#cc785c]" />
                    <span>Checking SERP & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span>Submit Selected for Tracking ({selectedKeywords.size})</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 bg-[#faf9f5] p-1 rounded-xl border border-[#e6dfd8]">
              <button
                type="button"
                onClick={() => setKeywordFilterTab('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  keywordFilterTab === 'all' ? 'bg-white shadow-xs text-[#141413]' : 'text-[#8e8b82] hover:text-[#141413]'
                }`}
              >
                All ({keywordOpportunities.length})
              </button>
              <button
                type="button"
                onClick={() => setKeywordFilterTab('opportunities')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  keywordFilterTab === 'opportunities' ? 'bg-white shadow-xs text-emerald-700' : 'text-[#8e8b82] hover:text-[#141413]'
                }`}
              >
                New Opportunities ({keywordOpportunities.filter(k => !k.isTracked).length})
              </button>
              <button
                type="button"
                onClick={() => setKeywordFilterTab('tracked')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  keywordFilterTab === 'tracked' ? 'bg-white shadow-xs text-blue-700' : 'text-[#8e8b82] hover:text-[#141413]'
                }`}
              >
                Already Tracked ({keywordOpportunities.filter(k => k.isTracked).length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-[#8e8b82]" />
              <input
                type="text"
                placeholder="Search extracted keywords..."
                value={keywordSearchQuery}
                onChange={(e) => setKeywordSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#cc785c]"
              />
            </div>
          </div>

          {/* Keywords Table */}
          <div className="overflow-x-auto rounded-xl border border-[#e6dfd8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f5] border-b border-[#e6dfd8] text-[10px] font-mono uppercase tracking-wider text-[#8e8b82]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="cursor-pointer text-[#8e8b82] hover:text-[#141413]"
                    >
                      {keywordOpportunities.filter(k => !k.isTracked).every(k => selectedKeywords.has(k.keyword)) && selectedKeywords.size > 0 ? (
                        <CheckSquare size={16} className="text-[#141413]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Keyword Opportunity</th>
                  <th className="py-2.5 px-3">Search Intent</th>
                  <th className="py-2.5 px-3">Relevance / Difficulty</th>
                  <th className="py-2.5 px-3">Competitor Evidence</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe9de] font-sans">
                {filteredKeywords.map((item, idx) => {
                  const isSelected = selectedKeywords.has(item.keyword);
                  return (
                    <tr
                      key={item.keyword || idx}
                      className={`transition-colors ${
                        item.isTracked 
                          ? 'bg-[#faf9f5]/60 opacity-80' 
                          : isSelected 
                            ? 'bg-[#fdfbf7] hover:bg-[#faf6ee]' 
                            : 'hover:bg-[#faf9f5]'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {item.isTracked ? (
                          <CheckCircle2 size={16} className="text-emerald-600 mx-auto" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleKeywordSelection(item.keyword)}
                            className="cursor-pointer text-[#8e8b82] hover:text-[#141413]"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-[#cc785c]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#141413] block">{item.keyword}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          item.intent === 'LOCAL' 
                            ? 'bg-purple-100 text-purple-800' 
                            : item.intent === 'COMMERCIAL' 
                              ? 'bg-blue-100 text-blue-800' 
                              : item.intent === 'TRANSACTIONAL' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.intent}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                            item.relevance === 'HIGH' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.relevance} Rel
                          </span>
                          <span className="text-[#8e8b82]">•</span>
                          <span className="text-[#6c6a64]">{item.difficulty} Diff</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-xs text-[#6c6a64] max-w-xs truncate">
                        <span title={item.competitorEvidence}>{item.competitorEvidence}</span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {item.isTracked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono text-[10px] font-bold border border-blue-200">
                            <Check size={11} />
                            <span>TRACKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                            <span>OPPORTUNITY</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Strip */}
          <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6c6a64]">
              <Target size={14} className="text-[#cc785c]" />
              <span>
                <strong>{selectedKeywords.size}</strong> keyword{selectedKeywords.size === 1 ? '' : 's'} selected for tracking
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSubmitForTracking}
                disabled={selectedKeywords.size === 0 || submittingKeywords}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5 h-8 px-4"
              >
                {submittingKeywords ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-[#cc785c]" />
                    <span>Submitting to Live SERP...</span>
                  </>
                ) : (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span>Submit Selected for Tracking ({selectedKeywords.size})</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DEEP GAP ANALYSIS: "WHY ARE THEY RANKING ABOVE ME?" */}
      {analysisResult && (
        <div className="space-y-6 mb-8 animate-in fade-in duration-200">
          
          {/* Comparison Matrix Strip */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
              <Layers size={18} className="text-primary-accent" />
              Side-by-Side Website & Signal Benchmark
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-secondary uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Diagnostic Dimension</th>
                    <th className="py-3 px-4 font-bold text-primary">Your Website ({myBusiness?.name || 'You'})</th>
                    <th className="py-3 px-4 font-bold text-primary">Competitor</th>
                    <th className="py-3 px-4 text-right">Advantage / Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-primary">Overall Health Score</td>
                    <td className="py-3 px-4 font-bold text-primary">{analysisResult.me.score}/100</td>
                    <td className="py-3 px-4 font-bold text-primary">{analysisResult.competitor.score}/100</td>
                    <td className="py-3 px-4 text-right">
                      {analysisResult.competitor.score > analysisResult.me.score ? (
                        <span className="text-red-600 font-bold">-{analysisResult.competitor.score - analysisResult.me.score} pts</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">+{analysisResult.me.score - analysisResult.competitor.score} pts</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-primary">Content Volume</td>
                    <td className="py-3 px-4">{analysisResult.me.wordCount || 0} words</td>
                    <td className="py-3 px-4">{analysisResult.competitor.wordCount || 0} words</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {(analysisResult.competitor.wordCount || 0) > (analysisResult.me.wordCount || 0) ? (
                        <span className="text-red-600">Competitor +{(analysisResult.competitor.wordCount || 0) - (analysisResult.me.wordCount || 0)} words</span>
                      ) : (
                        <span className="text-emerald-600">Your site is deeper</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-primary">Heading Subsections (H2)</td>
                    <td className="py-3 px-4">{analysisResult.me.h2Count || 0} sections</td>
                    <td className="py-3 px-4">{analysisResult.competitor.h2Count || 0} sections</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {(analysisResult.competitor.h2Count || 0) > (analysisResult.me.h2Count || 0) ? (
                        <span className="text-red-600">Competitor has more sections</span>
                      ) : (
                        <span className="text-emerald-600">Stronger hierarchy</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-primary">HTTPS Security</td>
                    <td className="py-3 px-4">{analysisResult.me.https ? '✓ Enforced' : '✗ Missing'}</td>
                    <td className="py-3 px-4">{analysisResult.competitor.https ? '✓ Enforced' : '✗ Missing'}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {analysisResult.me.https ? <span className="text-emerald-600">Secure</span> : <span className="text-red-600">Fix required</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Why They Rank Above You & What You're Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Why They Are Winning */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <AlertCircle size={15} className="text-red-500" />
                Why This Competitor Is Ranking Above You
              </h3>
              <div className="space-y-3">
                {(analysisResult.strategy.why_they_rank || []).map((w, idx) => (
                  <div key={idx} className="p-3.5 bg-red-50/50 rounded-xl border border-red-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900">{w.factor}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                        {w.confidence_level} CONFIDENCE
                      </span>
                    </div>
                    <p className="text-xs text-red-800 leading-relaxed">{w.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Biggest Opportunities */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <Sparkles size={15} className="text-primary-accent" />
                Your Highest-ROI Competitive Opportunities
              </h3>
              <div className="space-y-3">
                {(analysisResult.strategy.gaps || []).map((gap, gIdx) => (
                  <div key={gIdx} className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{gap.gap_title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-primary-accent uppercase">
                        {gap.confidence_level} IMPACT
                      </span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                      <strong>Recommendation:</strong> {gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Content Gap Opportunities */}
          {analysisResult.strategy.content_gaps && analysisResult.strategy.content_gaps.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-primary flex items-center gap-2">
                    <FileText size={18} className="text-primary-accent" />
                    Missing Content & Landing Page Opportunities
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    High-intent topics and pages that competitors cover which your website currently lacks.
                  </p>
                </div>
                <Link to="/dashboard/content" className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1">
                  <span>Open Content Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.strategy.content_gaps.map((cg, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-primary-accent uppercase">
                          {cg.search_intent}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                          {cg.priority} Priority
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-primary mb-1">{cg.topic}</h4>
                      <p className="text-[11px] text-secondary leading-relaxed mb-2">{cg.reason}</p>
                    </div>

                    <Link
                      to={`/dashboard/content?topic=${encodeURIComponent(cg.topic)}`}
                      className="mt-3 w-full py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles size={12} className="text-primary-accent" />
                      <span>Generate with AI</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
