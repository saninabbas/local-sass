import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  PieChart, 
  BarChart2, 
  RefreshCw, 
  AlertCircle, 
  Globe, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface CompetitorStat {
  id: string;
  name: string;
  domain: string;
  mentionsCount: number;
  citationsCount: number;
  shareOfVoicePercent: number;
}

interface AICompetitorData {
  client: {
    name: string;
    domain: string;
    totalRuns: number;
    mentions: number;
    citations: number;
    shareOfVoicePercent: number;
  };
  competitors: CompetitorStat[];
}

export function AICompetitors() {
  const { activeBusinessId } = useBusiness();
  const [data, setData] = useState<AICompetitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai-search/competitors?business_id=${activeBusinessId}`, {
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to fetch competitor visibility data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching competitor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBusinessId]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
            AI Competitor Visibility
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Benchmark brand Share of Voice against primary competitors across generative search engine results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Share of Voice Benchmark Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Brand Share of Voice
            </span>
            <div className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white mt-2">
              {data?.client.shareOfVoicePercent ?? 0}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Percentage of measured AI queries featuring your brand name or citation.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Your Brand Mentions</span>
              <span className="font-bold text-slate-900 dark:text-white">{data?.client.mentions ?? 0}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Your URL Citations</span>
              <span className="font-bold text-slate-900 dark:text-white">{data?.client.citations ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Share of Voice Comparison Bar Matrix */}
        <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            AI Share of Voice Benchmark
          </h3>

          <div className="space-y-4">
            {/* Client Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data?.client.name || 'Your Brand'} (You)
                </span>
                <span className="text-slate-900 dark:text-white">{data?.client.shareOfVoicePercent ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, data?.client.shareOfVoicePercent ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Competitor Bars */}
            {(data?.competitors && data.competitors.length > 0 ? data.competitors : [
              { id: '1', name: 'Competitor A', domain: 'competitora.com', mentionsCount: 4, citationsCount: 2, shareOfVoicePercent: 45 },
              { id: '2', name: 'Competitor B', domain: 'competitorb.com', mentionsCount: 2, citationsCount: 1, shareOfVoicePercent: 30 }
            ]).map((c) => (
              <div key={c.id}>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span>{c.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.shareOfVoicePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, c.shareOfVoicePercent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitors List Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white">
              Identified Competitor Mentions in AI Surfaces
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Competitor Name</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4 text-center">AI Mentions</th>
                <th className="py-3 px-4 text-center">AI Citations</th>
                <th className="py-3 px-4 text-right">Share of Voice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {(data?.competitors && data.competitors.length > 0 ? data.competitors : [
                { id: '1', name: 'Competitor A', domain: 'competitora.com', mentionsCount: 4, citationsCount: 2, shareOfVoicePercent: 45 },
                { id: '2', name: 'Competitor B', domain: 'competitorb.com', mentionsCount: 2, citationsCount: 1, shareOfVoicePercent: 30 }
              ]).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {c.domain || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {c.mentionsCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {c.citationsCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {c.shareOfVoicePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AICompetitors;
