import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Play, 
  Trash2, 
  Bot, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface AIQuery {
  id: string;
  query: string;
  intent_category: string;
  target_location: string;
  language: string;
  frequency: string;
  status: string;
  last_run_at: string | null;
  runs_count: number;
  mention_count: number;
  citation_count: number;
}

interface RunResultModal {
  query: string;
  results: Array<{
    surface: string;
    surfaceName: string;
    isClientMentioned: boolean;
    isClientCited: boolean;
    citedUrl?: string;
    mentionSentiment?: string;
    mentionSnippet?: string;
    competitorsFound: Array<{ name: string; domain?: string; citedUrl?: string }>;
    responseExcerpt: string;
    status: string;
    latencyMs: number;
  }>;
}

export function AIQueries() {
  const { activeBusinessId } = useBusiness();
  const [queries, setQueries] = useState<AIQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New query modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQueryText, setNewQueryText] = useState('');
  const [newIntent, setNewIntent] = useState('informational');
  const [newLocation, setNewLocation] = useState('Global');
  const [addingQuery, setAddingQuery] = useState(false);

  // Inspection modal
  const [activeRunDetails, setActiveRunDetails] = useState<RunResultModal | null>(null);

  const fetchQueries = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai-search/queries?business_id=${activeBusinessId}`, {
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setQueries(json.queries || []);
      } else {
        setError(json.error || 'Failed to fetch AI search queries');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [activeBusinessId]);

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryText.trim() || !activeBusinessId) return;

    try {
      setAddingQuery(true);
      setError(null);
      const res = await fetch(`/api/ai-search/queries?business_id=${activeBusinessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Business-Id': activeBusinessId
        },
        body: JSON.stringify({
          query: newQueryText.trim(),
          intent_category: newIntent,
          target_location: newLocation
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewQueryText('');
        setIsModalOpen(false);
        fetchQueries();
        if (json.runResults) {
          setActiveRunDetails({
            query: json.query.query,
            results: json.runResults
          });
        }
      } else {
        setError(json.error || 'Failed to add query');
      }
    } catch (err: any) {
      setError(err.message || 'Error adding query');
    } finally {
      setAddingQuery(false);
    }
  };

  const handleRunQuery = async (queryItem: AIQuery) => {
    if (!activeBusinessId) return;
    try {
      setRunningId(queryItem.id);
      setError(null);
      const res = await fetch(`/api/ai-search/run?business_id=${activeBusinessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Business-Id': activeBusinessId
        },
        body: JSON.stringify({
          query_id: queryItem.id
        })
      });
      const json = await res.json();
      if (json.success) {
        setActiveRunDetails({
          query: queryItem.query,
          results: json.results
        });
        fetchQueries();
      } else {
        setError(json.error || 'Failed to run AI search test');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing AI search run');
    } finally {
      setRunningId(null);
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!confirm('Are you sure you want to remove this query from AI monitoring?')) return;
    try {
      const res = await fetch(`/api/ai-search/queries/${id}?business_id=${activeBusinessId}`, {
        method: 'DELETE',
        headers: { 'X-Business-Id': activeBusinessId || '' }
      });
      const json = await res.json();
      if (json.success) {
        setQueries(queries.filter(q => q.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete query');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
            AI Search Queries
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track user prompts and test brand citations across ChatGPT, Perplexity, Gemini, and Google AI Overviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add AI Query
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Queries Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white">
              Monitored AI Prompts ({queries.length})
            </h3>
          </div>
          <button
            onClick={fetchQueries}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && queries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading AI search queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <Bot className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No AI queries tracked yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add user prompts and natural search questions to measure brand presence across ChatGPT, Perplexity, and Gemini.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add First AI Query
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Query / Prompt</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Mentions</th>
                  <th className="py-3 px-4 text-center">Citations</th>
                  <th className="py-3 px-4">Last Tested</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {queries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>{q.query}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {q.intent_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {q.target_location}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold ${q.mention_count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {q.mention_count || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold ${q.citation_count > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                        {q.citation_count || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {q.last_run_at ? new Date(q.last_run_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunQuery(q)}
                          disabled={runningId === q.id}
                          title="Run Multi-Engine AI Test"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Play className={`w-3.5 h-3.5 ${runningId === q.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuery(q.id)}
                          title="Delete Query"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Query Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Add AI Search Query
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddQuery} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Search Query / Prompt
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best dental clinic in Islamabad for implants"
                  value={newQueryText}
                  onChange={(e) => setNewQueryText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Intent Category
                  </label>
                  <select
                    value={newIntent}
                    onChange={(e) => setNewIntent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="informational">Informational</option>
                    <option value="commercial">Commercial</option>
                    <option value="local">Local Service</option>
                    <option value="transactional">Transactional</option>
                    <option value="navigational">Navigational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Global or City"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingQuery}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addingQuery ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  Save & Test Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surface Run Detail Modal */}
      {activeRunDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  AI Search Execution Snapshot
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mt-0.5">
                  "{activeRunDetails.query}"
                </h3>
              </div>
              <button
                onClick={() => setActiveRunDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {activeRunDetails.results.map((r) => (
                <div
                  key={r.surface}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.surfaceName}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.latencyMs}ms</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status === 'provider_unavailable' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> Provider Unavailable
                        </span>
                      ) : r.isClientMentioned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Mentioned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Not Mentioned
                        </span>
                      )}

                      {r.status !== 'provider_unavailable' && r.isClientCited ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3" /> Cited URL
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                    {r.responseExcerpt}
                  </p>

                  {r.citedUrl && (
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Cited Source: {r.citedUrl}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveRunDetails(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AIQueries;
