import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchAuthorityOpportunities, fetchBacklinks } from '../../lib/api';
import { 
  Award, 
  Zap, 
  Building, 
  Plus, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Sparkles,
  Mail,
  Copy,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuthorityBuilder() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'citations' | 'backlinks'>('opportunities');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Outreach Email modal
  const [outreachOpp, setOutreachOpp] = useState<any | null>(null);
  const [outreachEmail, setOutreachEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'opportunities') {
        const data = await fetchAuthorityOpportunities();
        setOpportunities(data || []);
      } else if (activeTab === 'backlinks') {
        const data = await fetchBacklinks();
        setBacklinks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutreach = (opp: any) => {
    setOutreachOpp(opp);
    const email = `Subject: Partnership & Local Feature Inquiry — ${opp.name || 'Local Business'}

Hi ${opp.name || 'Team'},

I came across your local resource directory and community listings at ${opp.url || 'your website'}. 

We provide certified local services in your area with verified 5-star customer ratings. We'd love to explore getting our business profile featured on your local partner directory, or collaborating on a helpful local guide for neighborhood residents.

Could you let me know the best person to speak with regarding local business directory listings and partnerships?

Warm regards,
The Management Team`;
    setOutreachEmail(email);
  };

  const handleCopyOutreach = () => {
    if (outreachEmail) {
      navigator.clipboard.writeText(outreachEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Award className="text-primary-accent" size={26} />
            Citations & Authority Builder
          </h1>
          <p className="text-xs text-secondary mt-1">
            Discover verified local partnerships, chamber of commerce listings, and directories to build domain authority safely.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'opportunities', label: 'Verified Directory & Link Opportunities' },
          { id: 'citations', label: 'Local NAP Citations' },
          { id: 'backlinks', label: 'Live Backlink Tracker' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 px-5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'border-primary-accent text-primary-accent'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-primary-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'opportunities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {opportunities.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
              <Zap className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-primary mb-1">Scanning Market Authority Signals</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Our crawler is evaluating local chamber and directory opportunities in your city.
              </p>
            </div>
          ) : (
            opportunities.map((opp) => {
              const isVerified = opp.status !== 'Prospect';
              return (
                <div key={opp.id} className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:border-blue-200 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isVerified ? 'VERIFIED OPPORTUNITY' : 'AI PROSPECT'}
                      </span>
                      <span className="text-[10px] font-mono text-secondary">
                        Impact: {opp.potential_impact || 'High'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-primary mt-1">{opp.name || opp.source_domain}</h3>
                    {opp.url && (
                      <a 
                        href={opp.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-primary-accent hover:underline font-mono truncate flex items-center gap-1"
                      >
                        <span>{opp.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    <p className="text-xs text-secondary leading-relaxed pt-1">
                      {opp.reason || opp.why_relevant || 'High-relevance local directory with high domain trust in your service market.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-secondary font-medium">
                      Difficulty: {opp.difficulty || 'Easy'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateOutreach(opp)}
                      className="text-xs font-semibold border-gray-200 hover:border-primary-accent text-primary"
                    >
                      <Mail size={12} className="mr-1.5 text-primary-accent" />
                      <span>Outreach Email</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'citations' ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs mb-8 space-y-4">
          <h3 className="text-sm font-bold text-primary">Top Verified Local Directory Citations</h3>
          <p className="text-xs text-secondary">
            Ensure your business name, phone number, and physical address are listed with 100% identical formatting across these foundational directories.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              { name: 'Google Business Profile', authority: 'DA 100', status: 'Essential' },
              { name: 'Apple Maps / Business Connect', authority: 'DA 99', status: 'Essential' },
              { name: 'Bing Places for Business', authority: 'DA 94', status: 'Recommended' },
              { name: 'Yelp Local Business', authority: 'DA 93', status: 'Recommended' },
              { name: 'Better Business Bureau (BBB)', authority: 'DA 91', status: 'High Trust' },
              { name: 'Local Chamber of Commerce', authority: 'DA 80+', status: 'Local Rank Booster' }
            ].map((cit, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary">{cit.name}</h4>
                  <span className="text-[10px] font-mono text-secondary">{cit.authority}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent">
                  {cit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-8">
          <div className="p-8 text-center">
            <Award className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-primary mb-1">Live Backlink Tracker</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-4">
              Track referring domains and partnership links pointing to your business.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent uppercase">
              REAL BACKLINK TELEMETRY READY
            </span>
          </div>
        </div>
      )}

      {/* OUTREACH EMAIL MODAL */}
      {outreachOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary-accent" />
                <h3 className="text-sm font-bold text-primary">Personalized Outreach Email</h3>
              </div>
              <button
                onClick={() => setOutreachOpp(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              value={outreachEmail || ''}
              onChange={(e) => setOutreachEmail(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary-accent min-h-[220px]"
            />

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOutreachOpp(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyOutreach}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Template'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
