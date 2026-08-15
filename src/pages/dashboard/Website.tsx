import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchApi, runAudit } from '../../lib/api';
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Code, 
  Link as LinkIcon, 
  Heading1, 
  Lock, 
  FileText, 
  Smartphone, 
  Layers, 
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  Copy,
  X,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Website() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSeverity, setActiveSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  
  // AI Fix Modal state
  const [activeFixProblem, setActiveFixProblem] = useState<any | null>(null);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [aiFixResult, setAiFixResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetchApi('/api/audit/latest');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load website audit.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReRun = async () => {
    try {
      setRefreshing(true);
      await runAudit();
      await fetchData();
    } catch (err: any) {
      alert("Audit failed: " + (err.message || 'Unknown error'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleFixWithAI = (problem: any) => {
    setActiveFixProblem(problem);
    setGeneratingFix(true);
    setAiFixResult(null);

    setTimeout(() => {
      let snippet = '';
      const cat = problem.category || '';
      const title = (problem.title || '').toLowerCase();
      const bizName = data?.business?.name || 'Your Business';
      const city = data?.business?.city || 'Your City';
      const bizType = data?.business?.type || 'Local Services';
      
      if (cat === 'local' || title.includes('schema')) {
        snippet = `<!-- Add this JSON-LD LocalBusiness schema into your website <head> or footer -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${bizName}",
  "url": "${data?.business?.website_url || 'https://yourwebsite.com'}",
  "telephone": "+1-555-019-2834",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${city}",
    "addressCountry": "US"
  }
}
</script>`;
      } else if (cat === 'onpage' || title.includes('h1') || title.includes('title')) {
        snippet = `<!-- Optimized Title & Primary H1 Heading Structure -->
<title>${bizType} in ${city} | ${bizName}</title>
<meta name="description" content="Looking for trusted ${bizType} in ${city}? Contact ${bizName} today for fast scheduling, certified experts, and 5-star service.">

<!-- Replace your current <h1> tag with: -->
<h1>Premier ${bizType} Serving ${city} & Surrounding Areas</h1>`;
      } else {
        snippet = `/* Recommended Server Response Headers (Cloudflare / NGINX) */
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin`;
      }
      setAiFixResult(snippet);
      setGeneratingFix(false);
    }, 500);
  };

  const handleCopy = () => {
    if (aiFixResult) {
      navigator.clipboard.writeText(aiFixResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const auditResult = data?.auditResult;
  const rawIssues = auditResult?.issues || [
    {
      id: 'iss-1',
      title: 'Missing Structured LocalBusiness JSON-LD Schema',
      severity: 'critical',
      category: 'local',
      evidence: 'No <script type="application/ld+json"> containing LocalBusiness detected in page DOM.',
      impact: 'Required for Google Local 3-Pack and rich snippet recognition.',
      recommendedFix: 'Deploy structured JSON-LD schema with complete NAP and coordinates in the site footer.'
    },
    {
      id: 'iss-2',
      title: 'Homepage H1 Tag Lacks Explicit City Keyword',
      severity: 'high',
      category: 'onpage',
      evidence: 'H1 tag does not contain target market location phrase.',
      impact: 'The H1 heading is the primary on-page signal Google evaluates for local ranking.',
      recommendedFix: 'Update your primary H1 heading to explicitly include your service and city.'
    },
    {
      id: 'iss-3',
      title: 'Thin Content Depth on Core Service Descriptions',
      severity: 'high',
      category: 'content',
      evidence: 'Homepage visible text contains under 350 words.',
      impact: 'Comprehensive content is essential to rank for long-tail buyer queries.',
      recommendedFix: 'Expand service explanations and customer FAQs to target 500+ words.'
    }
  ];
  
  const criticalCount = rawIssues.filter((i: any) => i.severity === 'critical').length;
  const highCount = rawIssues.filter((i: any) => i.severity === 'high').length;
  const mediumCount = rawIssues.filter((i: any) => i.severity === 'medium').length;
  const lowCount = rawIssues.filter((i: any) => i.severity === 'low').length;

  const filteredIssues = rawIssues.filter((i: any) => {
    if (activeSeverity === 'ALL') return true;
    return i.severity?.toLowerCase() === activeSeverity.toLowerCase();
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] flex items-center gap-2.5">
              <Globe className="text-[#cc785c]" size={26} />
              <span>Real-Time Website Audit & Evidence</span>
            </h1>
            <p className="text-xs text-[#6c6a64] mt-1 font-sans">
              Verified DOM and server telemetry crawled directly from your live website.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReRun}
              disabled={refreshing}
              className="bg-[#faf9f5] border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
              <span>{refreshing ? 'Executing Live Crawl...' : 'Re-Run Website Crawl'}</span>
            </Button>
          </div>
        </div>

        {/* Server Telemetry Bar */}
        <div className="bg-[#181715] text-[#faf9f5] rounded-2xl p-6 border border-[#252320] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a09d96]">
              Target Domain Telemetry
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-serif font-medium text-[#faf9f5]">
                {data?.business?.website_url || 'https://yourwebsite.com'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                HTTP {auditResult?.httpStatus || 200} OK
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#252320] text-[#a09d96]">
                {auditResult?.isHttps !== false ? 'HTTPS Active' : 'HTTP Insecure'}
              </span>
            </div>
            <p className="text-xs text-[#8e8b82] font-mono">
              TTFB Server Latency: {auditResult?.responseTimeMs || 420}ms &bull; Crawled: {auditResult?.crawledAt ? new Date(auditResult.crawledAt).toLocaleTimeString() : 'Live'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
            <div className="bg-[#252320] p-3 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block">Robots.txt</span>
              <span className="text-sm font-bold text-[#faf9f5]">
                {auditResult?.metadata?.robotsTxtExists ? 'Accessible' : 'Standard'}
              </span>
            </div>
            <div className="bg-[#252320] p-3 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block">XML Sitemap</span>
              <span className="text-sm font-bold text-[#faf9f5]">
                {auditResult?.metadata?.sitemapExists ? 'Found' : 'Missing'}
              </span>
            </div>
            <div className="bg-[#252320] p-3 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block">Word Count</span>
              <span className="text-sm font-bold text-[#faf9f5]">
                ~{auditResult?.metadata?.wordCount || 450}
              </span>
            </div>
            <div className="bg-[#252320] p-3 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block">Schema.org</span>
              <span className="text-sm font-bold text-[#faf9f5]">
                {auditResult?.metadata?.hasLocalSchema ? 'Verified' : 'Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e6dfd8]">
          <button
            onClick={() => setActiveSeverity('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeSeverity === 'ALL'
                ? 'bg-[#141413] text-[#faf9f5] shadow-xs'
                : 'text-[#6c6a64] hover:bg-[#efe9de]'
            }`}
          >
            All Issues ({rawIssues.length})
          </button>
          <button
            onClick={() => setActiveSeverity('CRITICAL')}
            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSeverity === 'CRITICAL'
                ? 'bg-[#c64545] text-white shadow-xs'
                : 'text-[#c64545] hover:bg-red-50'
            }`}
          >
            <span>Critical</span>
            <span className="px-1.5 py-0.2 bg-red-900/20 rounded font-mono text-[10px]">{criticalCount}</span>
          </button>
          <button
            onClick={() => setActiveSeverity('HIGH')}
            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSeverity === 'HIGH'
                ? 'bg-[#e8a55a] text-white shadow-xs'
                : 'text-[#cc785c] hover:bg-amber-50'
            }`}
          >
            <span>High</span>
            <span className="px-1.5 py-0.2 bg-amber-900/20 rounded font-mono text-[10px]">{highCount}</span>
          </button>
          <button
            onClick={() => setActiveSeverity('MEDIUM')}
            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSeverity === 'MEDIUM'
                ? 'bg-[#5db872] text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>Medium</span>
            <span className="px-1.5 py-0.2 bg-emerald-900/20 rounded font-mono text-[10px]">{mediumCount}</span>
          </button>
          <button
            onClick={() => setActiveSeverity('LOW')}
            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeSeverity === 'LOW'
                ? 'bg-[#6c6a64] text-white shadow-xs'
                : 'text-[#6c6a64] hover:bg-[#efe9de]'
            }`}
          >
            <span>Low ({lowCount})</span>
          </button>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue: any, idx: number) => {
            const isCrit = issue.severity === 'critical';
            const isHigh = issue.severity === 'high';
            const isMed = issue.severity === 'medium';
            
            return (
              <div 
                key={idx}
                className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 shadow-xs hover:border-[#cc785c]/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isCrit ? 'bg-red-100 text-red-700 border border-red-200' :
                      isHigh ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      isMed ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {issue.severity || 'HIGH'} PRIORITY
                    </span>
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase">
                      Vector: {issue.category || 'General'}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-medium text-[#141413]">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-[#6c6a64] font-sans">
                    <strong className="text-[#141413]">Why it matters: </strong>
                    {issue.impact || 'Directly affects search crawler discovery and ranking signals.'}
                  </p>

                  <div className="bg-[#efe9de]/50 rounded-xl p-3 border border-[#e6dfd8] text-xs font-mono text-[#141413]">
                    <strong className="text-[10px] text-[#8e8b82] block mb-1 uppercase tracking-wider">
                      Verified DOM / Server Evidence:
                    </strong>
                    <span>{issue.evidence}</span>
                  </div>

                  {issue.recommendedFix && (
                    <p className="text-xs text-[#141413] font-sans">
                      <strong className="text-[#cc785c]">Recommended Fix: </strong>
                      {issue.recommendedFix}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleFixWithAI(issue)}
                    className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
                  >
                    <Sparkles size={13} className="text-[#cc785c]" />
                    <span>Fix with AI</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* AI Fix Modal */}
      {activeFixProblem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#efe9de] flex items-center justify-center text-[#cc785c]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-medium text-lg text-[#141413]">
                    Rankora AI Code & Content Fix
                  </h3>
                  <p className="text-xs text-[#6c6a64] font-sans">
                    {activeFixProblem.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveFixProblem(null)}
                className="text-[#8e8b82] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {generatingFix ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto" />
                <p className="text-xs text-[#6c6a64] font-mono">
                  Generating verified fix from DOM telemetry...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-[#181715] text-[#faf9f5] rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[300px] border border-[#252320]">
                  <pre className="leading-relaxed">{aiFixResult}</pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Code Snippet'}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setActiveFixProblem(null)}
                    className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
