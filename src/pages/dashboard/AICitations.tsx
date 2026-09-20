import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Bot, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  Quote,
  Sparkles
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface AICitation {
  id: string;
  run_id: string;
  surface: string;
  query: string;
  intent_category: string;
  is_client_mentioned: number;
  is_client_cited: number;
  mention_sentiment: string;
  mention_snippet: string | null;
  cited_url: string | null;
  created_at: string;
}

export function AICitations() {
  const { activeBusinessId } = useBusiness();
  const [citations, setCitations] = useState<AICitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surfaceFilter, setSurfaceFilter] = useState('all');

  const fetchCitations = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai-search/citations?business_id=${activeBusinessId}`, {
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setCitations(json.citations || []);
      } else {
        setError(json.error || 'Failed to fetch citations');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching citations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitations();
  }, [activeBusinessId]);

  const filtered = citations.filter(c => {
    if (surfaceFilter !== 'all' && c.surface !== surfaceFilter) return false;
    return true;
  });

  const totalCitationsCount = citations.filter(c => c.is_client_cited === 1).length;
  const totalMentionsCount = citations.filter(c => c.is_client_mentioned === 1).length;

  const getSurfaceBadge = (surface: string) => {
    switch (surface) {
      case 'chatgpt':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ChatGPT</span>;
      case 'perplexity':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Perplexity</span>;
      case 'gemini':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Gemini</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Google AI</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
            AI Citations & Mentions
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Audit direct URL sources, citation links, and brand references extracted by LLMs during live query runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCitations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Citations
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Direct URL Citations</span>
            <Link2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalCitationsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Exact URL sources referenced in responses
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Brand Mentions</span>
            <Bot className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalMentionsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Entities identified in generated summaries
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Citation Rate</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {citations.length > 0 ? Math.round((totalCitationsCount / citations.length) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ratio of queried runs resulting in citations
          </p>
        </div>
      </div>

      {/* Citations List & Filter */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white">
              Citation Activity Log ({filtered.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={surfaceFilter}
              onChange={(e) => setSurfaceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All AI Surfaces</option>
              <option value="chatgpt">ChatGPT Search</option>
              <option value="perplexity">Perplexity AI</option>
              <option value="gemini">Google Gemini</option>
              <option value="google_ai_overview">Google AI Overview</option>
            </select>
          </div>
        </div>

        {loading && citations.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500">Loading AI citations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <Link2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No citations recorded yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Run AI query tests to extract brand citations and source links from real generative engines.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSurfaceBadge(item.surface)}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      "{item.query}"
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    {item.is_client_cited ? (
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        <CheckCircle2 className="w-3 h-3" /> Cited Link
                      </span>
                    ) : null}
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.mention_snippet && (
                  <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {item.mention_snippet}
                  </p>
                )}

                {item.cited_url && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a href={item.cited_url} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">
                      {item.cited_url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default AICitations;
