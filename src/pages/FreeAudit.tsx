import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Lock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { fetchApi } from '../lib/api';

export function FreeAudit() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunFreeAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/api/free-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl, email, name })
      });

      if (res.success && res.data) {
        setAuditResult(res.data);
      } else {
        setError(res.error || 'Failed to crawl website. Ensure URL is public and valid.');
      }
    } catch (err: any) {
      setError(err.message || 'Audit crawl error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="px-6 py-4 border-b border-[#e6dfd8] flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/logo.svg" alt="Rankora" className="w-28 h-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs font-semibold text-[#6c6a64] hover:text-[#141413]">
            Log In
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 w-full space-y-10">
        
        {!auditResult ? (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cc785c]/10 text-[#cc785c] font-mono text-xs font-bold uppercase">
              <Sparkles size={13} />
              <span>Real-Time Website Crawler & Audit</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] tracking-tight leading-tight">
              Get Your Instant Local SEO Health Score
            </h1>

            <p className="text-sm text-[#6c6a64] font-sans">
              Enter any public business website to crawl live DOM elements, evaluate 7 SEO vectors, and uncover high-impact ranking opportunities.
            </p>

            <form onSubmit={handleRunFreeAudit} className="space-y-4 pt-2 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-[#8e8b82]">Website URL *</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 text-[#8e8b82]" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="https://yourbusiness.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#e6dfd8] text-[#141413] text-sm focus:outline-none focus:ring-2 focus:ring-[#cc785c]/40 font-mono shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#8e8b82]">Your Name</label>
                  <input
                    type="text"
                    placeholder="Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#e6dfd8] text-[#141413] text-xs focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#8e8b82]">Work Email</label>
                  <input
                    type="email"
                    placeholder="sarah@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#e6dfd8] text-[#141413] text-xs focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-[#cc785c]" />
                    <span>Executing Live Crawl & Telemetry Extraction...</span>
                  </>
                ) : (
                  <>
                    <span>Run Real-Time Website Audit</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Score Banner */}
            <div className="bg-[#181715] text-[#faf9f5] rounded-3xl p-6 sm:p-8 border border-[#252320] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#a09d96]">
                  Crawled Target: {auditResult.url}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#faf9f5]">
                  Audit Summary & Score
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-[#8e8b82]">
                  <span>HTTP {auditResult.telemetry?.httpStatus || 200} OK</span> &bull;
                  <span>TTFB: {auditResult.telemetry?.responseTimeMs || 350}ms</span> &bull;
                  <span>{auditResult.telemetry?.isHttps ? 'HTTPS Verified' : 'Insecure'}</span>
                </div>
              </div>

              <div className="bg-[#252320] p-5 rounded-2xl border border-[#3a3732] text-center shrink-0">
                <span className="text-[10px] font-mono uppercase text-[#a09d96] block mb-1">Growth Score</span>
                <span className="text-4xl font-serif font-bold text-[#faf9f5]">{auditResult.growthScore}/100</span>
              </div>
            </div>

            {/* Top 3 Verified Opportunities */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#141413]">
                Top Verified SEO Issues Detected
              </h3>

              <div className="space-y-3">
                {auditResult.topOpportunities?.map((opp: any, idx: number) => (
                  <div key={idx} className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        {opp.severity || 'HIGH'} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono text-[#8e8b82]">Vector: {opp.category}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#141413]">{opp.title}</h4>
                    <p className="text-xs text-[#6c6a64] font-sans">{opp.impact}</p>
                    <div className="p-2.5 bg-[#efe9de]/50 rounded-xl font-mono text-[11px] text-[#141413]">
                      <strong>DOM Evidence: </strong>{opp.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlock Full SEO OS Call To Action */}
            <div className="p-8 rounded-3xl bg-[#efe9de] border border-[#e6dfd8] text-center space-y-4 shadow-sm">
              <Sparkles size={32} className="text-[#cc785c] mx-auto" />
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141413]">
                Ready to Auto-Fix and Verify These Issues?
              </h3>
              <p className="text-xs text-[#6c6a64] max-w-md mx-auto font-sans">
                Create your 14-day free trial account to unlock 1-click AI code generation, competitor radar, local keyword tracking, and live change verification.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to={`/signup?url=${encodeURIComponent(websiteUrl)}&email=${encodeURIComponent(email)}`}>
                  <Button size="lg" className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold text-xs py-3 px-6 rounded-xl flex items-center gap-2">
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
                <button
                  onClick={() => setAuditResult(null)}
                  className="text-xs font-semibold text-[#6c6a64] hover:text-[#141413] cursor-pointer"
                >
                  Audit Another Website
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#e6dfd8] text-center text-xs text-[#8e8b82] font-mono">
        &copy; {new Date().getFullYear()} Rankora &bull; Professional Local SEO Operating System
      </footer>

    </div>
  );
}
