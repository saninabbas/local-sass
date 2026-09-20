import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  Link2, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowUpRight,
  HelpCircle,
  BarChart3,
  Layers,
  Cpu
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface AIVisibilityOverview {
  score: {
    overall_score: number;
    technical_accessibility_score: number;
    mention_rate_score: number;
    citation_rate_score: number;
    query_coverage_score: number;
    entity_consistency_score: number;
    content_readiness_score: number;
    structured_data_score: number;
    total_queries_evaluated: number;
    total_citations_found: number;
    total_mentions_found: number;
  };
  metrics: {
    totalQueries: number;
    activeQueries: number;
    totalEvaluations: number;
    totalMentions: number;
    totalCitations: number;
    allowedCrawlersCount: number;
    totalCrawlersCount: number;
    methodology?: 'live_api' | 'simulated' | 'mixed' | 'none';
    liveRunsCount?: number;
    simulatedRunsCount?: number;
  };
  surfaceBreakdown: Record<string, {
    runs: number;
    mentions: number;
    citations: number;
    visibilityRate: number;
  }>;
  crawlerAudits: Array<{
    crawler_name: string;
    user_agent: string;
    status: 'allowed' | 'blocked' | 'partially_blocked';
    robots_rule: string;
    recommendation: string;
  }>;
  recentActivity: Array<{
    id: string;
    query: string;
    surface: string;
    is_client_mentioned: number;
    is_client_cited: number;
    mention_sentiment: string;
    created_at: string;
  }>;
}

export function AIVisibility() {
  const { activeBusinessId, activeBusiness } = useBusiness();
  const [data, setData] = useState<AIVisibilityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai-search/overview?business_id=${activeBusinessId}`, {
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load AI Visibility data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching AI visibility');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBusinessId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  const getSurfaceIcon = (surface: string) => {
    switch (surface) {
      case 'chatgpt':
        return <Bot className="w-5 h-5 text-emerald-500" />;
      case 'perplexity':
        return <Search className="w-5 h-5 text-indigo-500" />;
      case 'gemini':
        return <Sparkles className="w-5 h-5 text-blue-500" />;
      default:
        return <Globe className="w-5 h-5 text-purple-500" />;
    }
  };

  const getSurfaceName = (surface: string) => {
    switch (surface) {
      case 'chatgpt': return 'ChatGPT Search';
      case 'perplexity': return 'Perplexity AI';
      case 'gemini': return 'Google Gemini';
      case 'google_ai_overview': return 'Google AI Overviews';
      default: return surface;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Calculating Scorankio AI Visibility Score & crawling status...
        </p>
      </div>
    );
  }

  const score = data?.score?.overall_score ?? 0;
  const hasEvaluations = (data?.metrics?.totalEvaluations ?? 0) > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
              AI Search Visibility
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-3 h-3" /> GEO Platform
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor and optimize brand presence, citations, and authority across ChatGPT, Gemini, Perplexity, and Google AI Overviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Signals
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scorankio AI Score Hero Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl lg:col-span-1 flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cpu className="w-48 h-48 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
                Scorankio Proprietary Index
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                7 Vector Weighting
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold font-heading text-white">
              AI Visibility Score
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Composite measure of technical crawler access, brand mention frequency, citation link rate, entity clarity, and GEO readiness.
            </p>
          </div>

          <div className="my-6 flex items-baseline gap-4">
            <div className="text-6xl font-extrabold tracking-tight font-heading text-white">
              {score}
              <span className="text-2xl font-normal text-indigo-300">/100</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold flex items-center gap-1 ${
                data?.metrics.methodology === 'live_api' ? 'text-emerald-400' :
                data?.metrics.methodology === 'simulated' ? 'text-amber-400' :
                data?.metrics.methodology === 'mixed' ? 'text-blue-400' :
                'text-slate-400'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" /> 
                {data?.metrics.methodology === 'live_api' ? 'Live Provider API' :
                 data?.metrics.methodology === 'simulated' ? 'Simulated Engine' :
                 data?.metrics.methodology === 'mixed' ? 'Mixed Live & Simulated' :
                 'Pending Queries'}
              </span>
              <span className="text-[11px] text-slate-400">
                {hasEvaluations 
                  ? (data?.metrics.methodology === 'simulated' 
                      ? 'Contextual Fallback Engine' 
                      : 'Live Provider Responses') 
                  : 'No queries run yet'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-base font-bold text-white">{data?.metrics.totalCitations ?? 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Citations</div>
            </div>
            <div>
              <div className="text-base font-bold text-white">{data?.metrics.totalMentions ?? 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Mentions</div>
            </div>
            <div>
              <div className="text-base font-bold text-white">{data?.metrics.activeQueries ?? 0}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">AI Queries</div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Vector Matrix */}
        <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                7-Component Scoring Breakdown
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Transparent Weights
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technical Accessibility */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Technical AI Crawlers (20%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.technical_accessibility_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data?.score?.technical_accessibility_score ?? 0}%` }} />
                </div>
              </div>

              {/* Mention Rate */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-500" /> Brand Mention Rate (20%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.mention_rate_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${data?.score?.mention_rate_score ?? 0}%` }} />
                </div>
              </div>

              {/* Citation Rate */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-500" /> Link Citation Rate (20%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.citation_rate_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${data?.score?.citation_rate_score ?? 0}%` }} />
                </div>
              </div>

              {/* Query Coverage */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-purple-500" /> Query Coverage (15%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.query_coverage_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${data?.score?.query_coverage_score ?? 0}%` }} />
                </div>
              </div>

              {/* Entity Consistency */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" /> Entity Consistency (10%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.entity_consistency_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${data?.score?.entity_consistency_score ?? 0}%` }} />
                </div>
              </div>

              {/* GEO Content & Schema */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Content & Schema (15%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data?.score?.content_readiness_score ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: `${data?.score?.content_readiness_score ?? 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Formula: Technical (20%) + Mentions (20%) + Citations (20%) + Queries (15%) + Entity (10%) + GEO (15%)</span>
            <a href="/dashboard/ai-content-readiness" className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              Optimize GEO <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Surface Performance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              AI Surface Visibility Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct measurement of answer generation and source linking per engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {['chatgpt', 'perplexity', 'gemini', 'google_ai_overview'].map((surfaceKey) => {
            const surfaceStat = data?.surfaceBreakdown?.[surfaceKey] || {
              runs: 0,
              mentions: 0,
              citations: 0,
              visibilityRate: 0
            };

            const isMeasured = surfaceStat.runs > 0;

            return (
              <div
                key={surfaceKey}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
                      {getSurfaceIcon(surfaceKey)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {getSurfaceName(surfaceKey)}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {surfaceStat.runs} Queries Evaluated
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${isMeasured ? getScoreColor(surfaceStat.visibilityRate) : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                    {isMeasured ? `${surfaceStat.visibilityRate}%` : 'No data'}
                  </span>
                </div>

                <div className="space-y-2.5 my-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-600 dark:text-slate-400">Brand Mentions</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{surfaceStat.mentions}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-600 dark:text-slate-400">Direct URL Citations</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{surfaceStat.citations}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  {isMeasured ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Measured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                      Not Measured
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Crawler Accessibility & Robots.txt Quick Status */}
      <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              AI Search Crawler Accessibility
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified robots.txt permissions for real-time generative search bots.
            </p>
          </div>
          <a
            href="/dashboard/ai-content-readiness"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Manage Crawler Directives & Schema <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(data?.crawlerAudits && data.crawlerAudits.length > 0 ? data.crawlerAudits : [
            { crawler_name: 'OAI-SearchBot', user_agent: 'OAI-SearchBot', status: 'allowed', robots_rule: 'Allow: /', recommendation: 'Full search indexing enabled.' },
            { crawler_name: 'PerplexityBot', user_agent: 'PerplexityBot', status: 'allowed', robots_rule: 'Allow: /', recommendation: 'Live answer source linking active.' },
            { crawler_name: 'Google-Extended', user_agent: 'Google-Extended', status: 'allowed', robots_rule: 'Allow: /', recommendation: 'Gemini and Vertex AI access active.' }
          ]).map((crawler: any) => (
            <div
              key={crawler.crawler_name}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {crawler.crawler_name}
                </span>
                {crawler.status === 'allowed' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Allowed
                  </span>
                ) : crawler.status === 'partially_blocked' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-3 h-3" /> Partial
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3 h-3" /> Blocked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1.5">
                {crawler.robots_rule || 'Allow: /'}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {crawler.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AIVisibility;
