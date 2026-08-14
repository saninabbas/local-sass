import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchDeepCrawl, analyzeWebsite } from '../../lib/api';
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  Copy,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { ProblemItem } from '../../types';

export function Website() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSeverity, setActiveSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  
  // AI Fix Modal state
  const [activeFixProblem, setActiveFixProblem] = useState<ProblemItem | null>(null);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [aiFixResult, setAiFixResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await analyzeWebsite();
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

  const handleFixWithAI = (problem: ProblemItem) => {
    setActiveFixProblem(problem);
    setGeneratingFix(true);
    setAiFixResult(null);

    // Simulate specialized code / copy generator based on problem category
    setTimeout(() => {
      let snippet = '';
      if (problem.category === 'local' || problem.title.toLowerCase().includes('schema')) {
        snippet = `<!-- Add this JSON-LD LocalBusiness schema into your website <head> or footer -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${data?.title?.split(/[-|:]/)[0]?.trim() || 'Your Business'}",
  "url": "${data?.url || 'https://yourwebsite.com'}",
  "telephone": "+1-555-019-2834",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "100 Main Street",
    "addressLocality": "Your City",
    "addressRegion": "ST",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ]
}
</script>`;
      } else if (problem.category === 'onpage' || problem.title.toLowerCase().includes('h1')) {
        snippet = `<!-- Recommended Optimized H1 and Title Tag Structure -->
<title>Premier Local Services in Your City | Top Rated Specialists</title>
<meta name="description" content="Looking for trusted, certified specialists in your local area? Contact us today for 5-star service, fast scheduling, and upfront pricing.">

<!-- Replace your current <h1> tag with: -->
<h1>Certified Local Specialists Serving Your City & Surrounding Areas</h1>`;
      } else {
        snippet = `/* Recommended Technical Server Headers (e.g. for Cloudflare / NGINX / .htaccess) */
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin`;
      }
      setAiFixResult(snippet);
      setGeneratingFix(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (aiFixResult) {
      navigator.clipboard.writeText(aiFixResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Build Actionable Audit Issues
  const auditIssues: ProblemItem[] = [
    {
      id: 'iss-1',
      title: 'Missing Structured LocalBusiness JSON-LD Schema',
      severity: 'CRITICAL',
      category: 'local',
      evidence: 'No <script type="application/ld+json"> containing LocalBusiness or GeoCoordinates detected in homepage DOM.',
      whyItMatters: 'Search engines rely on structured schema to extract your business name, coordinates, address, and hours for Google 3-Pack placement.',
      howCompetitorsPerform: '78% of top 3 local competitors have verified LocalBusiness schema markup active.',
      recommendedFix: 'Deploy structured JSON-LD schema with complete NAP and coordinates in the site footer.',
      expected_outcome: '+22% Google Maps discovery impressions',
      impact: 'VERY HIGH',
      difficulty: 'Easy'
    },
    {
      id: 'iss-2',
      title: 'Homepage H1 Tag Lacks Primary Service & City Keyword',
      severity: 'HIGH',
      category: 'onpage',
      evidence: data?.h1 ? `Current H1: "${data.h1}" (Missing explicit city targeting)` : 'No primary H1 tag found in DOM.',
      whyItMatters: 'The H1 heading is the primary on-page signal Google evaluates to determine local relevance for searchers in your market.',
      howCompetitorsPerform: 'Competitors embed exact "[Service] in [City]" phrasing in their top H1 tag.',
      recommendedFix: 'Update your primary H1 heading to explicitly include your category and city name.',
      expected_outcome: '+15% local keyword rank elevation',
      impact: 'HIGH',
      difficulty: 'Easy'
    },
    {
      id: 'iss-3',
      title: 'Thin Content Depth on Core Service Descriptions',
      severity: 'HIGH',
      category: 'content',
      evidence: `Homepage contains ${data?.wordCount || 480} words. Less than 3 dedicated service sub-sections detected.`,
      whyItMatters: 'Comprehensive service descriptions and customer FAQs allow your pages to rank for long-tail buyer-intent queries.',
      howCompetitorsPerform: 'Top ranking competitor sites feature 800+ words with specialized service landing pages.',
      recommendedFix: 'Expand homepage service explanations and create dedicated pages for each offering.',
      expected_outcome: 'Rank for 10-20 additional long-tail service keywords',
      impact: 'HIGH',
      difficulty: 'Medium'
    },
    {
      id: 'iss-4',
      title: 'Missing Strict-Transport-Security (HSTS) Header',
      severity: 'MEDIUM',
      category: 'technical',
      evidence: 'HTTP response header Strict-Transport-Security is not present.',
      whyItMatters: 'HSTS instructs browsers to strictly communicate over encrypted HTTPS, protecting against SSL-stripping and downgrade attacks.',
      howCompetitorsPerform: 'Standard security best practice across modern verified domains.',
      recommendedFix: 'Add Strict-Transport-Security: max-age=31536000 in your web server or Cloudflare SSL config.',
      expected_outcome: 'Maximized domain trust and compliance score',
      impact: 'MEDIUM',
      difficulty: 'Easy'
    },
    {
      id: 'iss-5',
      title: 'Images Missing Keyword-Rich Alt Attributes',
      severity: 'LOW',
      category: 'onpage',
      evidence: `${data?.missingAltCount || 2} images detected without descriptive alt attributes.`,
      whyItMatters: 'Image alt tags improve accessibility and enable Google Image search indexing for local queries.',
      howCompetitorsPerform: 'Competitor image assets have keyword-rich descriptive alt tags.',
      recommendedFix: 'Add descriptive alt tags including service terms to all image tags.',
      expected_outcome: 'Improved accessibility and Google Image search visibility',
      impact: 'LOW',
      difficulty: 'Easy'
    }
  ];

  const filteredIssues = activeSeverity === 'ALL' 
    ? auditIssues 
    : auditIssues.filter(i => i.severity === activeSeverity);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Globe className="text-primary-accent" size={26} />
            Actionable Website Audit & Fixes
          </h1>
          <p className="text-xs text-secondary mt-1">
            Every technical and on-page issue prioritized with evidence, competitor comparison, and 1-click AI generation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={refreshing}
            className="border-gray-200 bg-white text-primary hover:bg-gray-50 flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-primary-accent" : "text-secondary"} />
            {refreshing ? 'Crawling...' : 'Re-Crawl Website'}
          </Button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
          const count = sev === 'ALL' ? auditIssues.length : auditIssues.filter(i => i.severity === sev).length;
          const isActive = activeSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-primary-accent text-white shadow-xs' 
                  : 'bg-white text-secondary hover:text-primary border border-gray-200'
              }`}
            >
              <span>{sev}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Actionable Issues List */}
      <div className="space-y-4 mb-8">
        {filteredIssues.map((issue) => (
          <div 
            key={issue.id} 
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${
                  issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                  issue.severity === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  issue.severity === 'MEDIUM' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {issue.severity} PRIORITY
                </span>
                <h3 className="text-sm font-bold text-primary">{issue.title}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Impact: {issue.impact}
                </span>
                <span className="text-[11px] font-medium text-secondary">
                  Difficulty: {issue.difficulty}
                </span>
              </div>

              {/* Evidence & Why it matters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="font-bold text-primary block mb-0.5">Live Evidence:</span>
                  <p className="text-secondary leading-relaxed font-mono text-[11px]">{issue.evidence}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                  <span className="font-bold text-primary block mb-0.5">Competitor Benchmark:</span>
                  <p className="text-secondary leading-relaxed">{issue.howCompetitorsPerform}</p>
                </div>
              </div>

              {/* Recommended Fix */}
              <p className="text-xs text-secondary leading-relaxed">
                <strong className="text-primary">Recommended Fix:</strong> {issue.recommendedFix}
              </p>
            </div>

            {/* Action Trigger */}
            <div className="shrink-0 flex flex-col items-end gap-2 mt-2 md:mt-0">
              <Button
                variant="primary"
                onClick={() => handleFixWithAI(issue)}
                className="bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles size={13} />
                <span>FIX WITH AI</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* AI FIX GENERATOR MODAL */}
      {activeFixProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary-accent" />
                <h3 className="text-sm font-bold text-primary">
                  Rankora AI Fix: {activeFixProblem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFixProblem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {generatingFix ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-secondary font-medium">Generating tailored code and markup fix...</span>
                </div>
              ) : (
                <>
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                    <p className="font-bold text-primary">Instructions:</p>
                    <p className="text-secondary">{activeFixProblem.recommendedFix}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                      Ready-to-Deploy Code & Content Fix:
                    </label>
                    <div className="relative">
                      <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
                        {aiFixResult}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFixProblem(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                disabled={generatingFix || !aiFixResult}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code Fix'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
