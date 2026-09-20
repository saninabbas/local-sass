import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Link2, 
  FileText, 
  Bot,
  Filter
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface AIOpportunity {
  id: string;
  query: string;
  opportunity_type: string;
  priority: 'high' | 'medium' | 'low';
  estimated_impact: 'high' | 'medium' | 'low';
  competitor_cited?: string;
  suggested_action: string;
  is_resolved: number;
}

export function AIOpportunities() {
  const { activeBusinessId } = useBusiness();
  const [opportunities, setOpportunities] = useState<AIOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');

  const fetchOpportunities = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai-search/opportunities?business_id=${activeBusinessId}`, {
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setOpportunities(json.opportunities || []);
      } else {
        setError(json.error || 'Failed to fetch AI opportunities');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [activeBusinessId]);

  const filtered = opportunities.filter(o => {
    if (filterType !== 'all' && o.opportunity_type !== filterType) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">Low Priority</span>;
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'missed_citation':
        return <Link2 className="w-5 h-5 text-indigo-500" />;
      case 'crawler_blocked':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'missing_schema':
        return <FileText className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
            AI Search Opportunities & Gap Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Actionable optimization items to capture citations from ChatGPT Search, Perplexity, Gemini, and Google AI Overviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOpportunities}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Scan Opportunities
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Gaps ({opportunities.length})
        </button>
        <button
          onClick={() => setFilterType('missed_citation')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'missed_citation'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Citation Gaps
        </button>
        <button
          onClick={() => setFilterType('crawler_blocked')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'crawler_blocked'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Crawler Directives
        </button>
        <button
          onClick={() => setFilterType('missing_schema')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'missing_schema'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Schema & Entity Markup
        </button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading && opportunities.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500">Scanning queries and crawler signals for AI opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No open AI opportunities</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your tracked queries and crawler directives are well optimized for generative engines.
            </p>
          </div>
        ) : (
          filtered.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 flex-shrink-0">
                  {getOpportunityIcon(opp.opportunity_type)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      "{opp.query}"
                    </span>
                    {getPriorityBadge(opp.priority)}
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Impact: High
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {opp.suggested_action}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="/dashboard/content"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Apply in Content Studio <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default AIOpportunities;
