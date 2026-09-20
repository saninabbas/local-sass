import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Bot, 
  Code,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface CrawlerAudit {
  crawler_name: string;
  user_agent: string;
  status: 'allowed' | 'blocked' | 'partially_blocked';
  robots_rule: string;
  recommendation: string;
}

interface GEOAudit {
  id?: string;
  page_url: string;
  direct_answers_score: number;
  information_gain_score: number;
  structured_data_health: number;
  entity_clarity_score: number;
  overall_readiness_score: number;
  findings: Array<{ aspect: string; status: string; detail: string }>;
  recommendations: string[];
}

export function AIContentReadiness() {
  const { activeBusinessId, activeBusiness } = useBusiness();
  const [crawlers, setCrawlers] = useState<CrawlerAudit[]>([]);
  const [geoAudit, setGeoAudit] = useState<GEOAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditingCrawlers, setAuditingCrawlers] = useState(false);
  const [auditingGEO, setAuditingGEO] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditData = async () => {
    if (!activeBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      
      const [crawlerRes, geoRes] = await Promise.all([
        fetch(`/api/ai-search/crawler-audit?business_id=${activeBusinessId}`, { headers: { 'X-Business-Id': activeBusinessId } }),
        fetch(`/api/ai-search/content-readiness?business_id=${activeBusinessId}`, { headers: { 'X-Business-Id': activeBusinessId } })
      ]);

      const crawlerJson = await crawlerRes.json();
      const geoJson = await geoRes.json();

      if (crawlerJson.success) setCrawlers(crawlerJson.crawlers || []);
      if (geoJson.success) setGeoAudit(geoJson.audit || null);
    } catch (err: any) {
      setError(err.message || 'Error loading GEO content readiness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [activeBusinessId]);

  const handleRunCrawlerAudit = async () => {
    if (!activeBusinessId) return;
    try {
      setAuditingCrawlers(true);
      const res = await fetch(`/api/ai-search/crawler-audit?business_id=${activeBusinessId}`, {
        method: 'POST',
        headers: { 'X-Business-Id': activeBusinessId }
      });
      const json = await res.json();
      if (json.success) {
        setCrawlers(json.crawlers || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to audit AI crawlers');
    } finally {
      setAuditingCrawlers(false);
    }
  };

  const handleRunGEOAudit = async () => {
    if (!activeBusinessId) return;
    try {
      setAuditingGEO(true);
      const res = await fetch(`/api/ai-search/content-readiness?business_id=${activeBusinessId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Business-Id': activeBusinessId 
        },
        body: JSON.stringify({ page_url: activeBusiness?.website_url })
      });
      const json = await res.json();
      if (json.success) {
        setGeoAudit(json.audit);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run GEO audit');
    } finally {
      setAuditingGEO(false);
    }
  };

  const recommendedRobotsTxt = `# Scorankio Optimal AI Search Crawler Configuration
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

# Foundation Model Crawlers (Optional)
User-agent: GPTBot
Allow: /
`;

  const copyRobots = () => {
    navigator.clipboard.writeText(recommendedRobotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-slate-900 dark:text-white sm:text-3xl">
            Generative Engine Optimization (GEO) & AI Crawlers
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Audit content readiness, direct answer clarity, Schema.org structures, and AI crawler permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunGEOAudit}
            disabled={auditingGEO}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${auditingGEO ? 'animate-spin' : ''}`} />
            Run Full GEO Audit
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* GEO Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Direct Answers</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {geoAudit ? `${geoAudit.direct_answers_score}%` : '—'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${geoAudit?.direct_answers_score ?? 0}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">
            {geoAudit ? 'Clear, concise answers directly below question headings' : 'Click Run Full GEO Audit to test'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Information Gain</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {geoAudit ? `${geoAudit.information_gain_score}%` : '—'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${geoAudit?.information_gain_score ?? 0}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">
            {geoAudit ? 'Unique metrics, case proof, and original insights' : 'Click Run Full GEO Audit to test'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Schema.org Health</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {geoAudit ? `${geoAudit.structured_data_health}%` : '—'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${geoAudit?.structured_data_health ?? 0}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">
            {geoAudit ? 'Organization, LocalBusiness, FAQPage JSON-LD' : 'Click Run Full GEO Audit to test'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Entity Clarity</span>
            <Globe className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {geoAudit ? `${geoAudit.entity_clarity_score}%` : '—'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${geoAudit?.entity_clarity_score ?? 0}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">
            {geoAudit ? 'Consistent brand name, addresses, and social links' : 'Click Run Full GEO Audit to test'}
          </p>
        </div>
      </div>

      {/* GEO Detailed Findings & Recommendations if audit exists */}
      {geoAudit && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              GEO Audit Aspect Findings ({geoAudit.page_url})
            </h3>
            <div className="space-y-3">
              {(geoAudit.findings || []).map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{f.aspect}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      f.status === 'optimal' || f.status === 'good' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' :
                      f.status === 'needs_work' || f.status === 'partial' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Prioritized Optimization Action Plan
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {(geoAudit.recommendations || []).map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Crawlers & Robots.txt Directives Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white">
                AI Search Crawler Accessibility Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live verification of crawler access in your domain's robots.txt
              </p>
            </div>
          </div>
          <button
            onClick={handleRunCrawlerAudit}
            disabled={auditingCrawlers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${auditingCrawlers ? 'animate-spin' : ''}`} />
            Re-check robots.txt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">AI Crawler / Engine</th>
                <th className="py-3 px-4">User-Agent</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Robots Directive</th>
                <th className="py-3 px-4">Impact / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {crawlers.map((c) => (
                <tr key={c.crawler_name} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {c.crawler_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {c.user_agent}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.status === 'allowed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Allowed
                      </span>
                    ) : c.status === 'partially_blocked' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Partial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3 h-3" /> Blocked
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {c.robots_rule || 'Allow: /'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {c.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended robots.txt Generator Card */}
      <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-white">
              Recommended Robots.txt for AI Search Engines
            </h3>
          </div>
          <button
            onClick={copyRobots}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Robots.txt'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          {recommendedRobotsTxt}
        </pre>
      </div>
    </div>
  );
}
export default AIContentReadiness;
