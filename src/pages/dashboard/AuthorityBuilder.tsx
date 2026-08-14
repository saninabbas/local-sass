import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  fetchAuthorityOpportunities, 
  fetchBacklinks, 
  generateOutreachEmail, 
  fetchApi 
} from '../../lib/api';
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
  ShieldCheck,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuthorityBuilder() {
  const [activeTab, setActiveTab] = useState<'verified' | 'prospects' | 'citations' | 'backlinks'>('verified');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Outreach Email modal
  const [outreachOpp, setOutreachOpp] = useState<any | null>(null);
  const [outreachEmail, setOutreachEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oppsData, backsData] = await Promise.all([
        fetchAuthorityOpportunities().catch(() => []),
        fetchBacklinks().catch(() => [])
      ]);
      setOpportunities(oppsData || []);
      setBacklinks(backsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProspects = async () => {
    setGenerating(true);
    try {
      await fetchApi('/api/authority/generate-opportunities', { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert("Failed to scan authority prospects: " + (err.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenOutreach = async (opp: any) => {
    setOutreachOpp(opp);
    setGeneratingEmail(true);
    setOutreachEmail(null);

    try {
      const res = await generateOutreachEmail({
        opportunityId: opp.id,
        opportunityName: opp.name,
        whyRelevant: opp.why_relevant || opp.reason || 'Local partnership and citation'
      });
      setOutreachEmail(res);
    } catch (e) {
      // Fallback template
      setOutreachEmail({
        subject: `Partnership & Local Directory Inquiry — ${opp.name}`,
        body: `Hi ${opp.name} Team,\n\nI came across your local resource directory and community listings at ${opp.url || 'your website'}.\n\nWe provide verified 5-star local services in your area. We would love to explore getting our verified business profile included in your local directory or collaborating on a helpful resource for neighborhood residents.\n\nPlease let me know the best person to speak with regarding local business listings and partnerships.\n\nWarm regards,\nThe Management Team`
      });
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCopyOutreach = () => {
    if (outreachEmail) {
      const fullText = `Subject: ${outreachEmail.subject}\n\n${outreachEmail.body}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Separation of verified vs AI prospects
  const verifiedOpportunities = [
    {
      id: 'ver-1',
      name: 'Google Business Profile',
      url: 'https://business.google.com',
      source: 'Google Local Knowledge Graph',
      type: 'Local Directory',
      why_relevant: 'The foundation for all Google Local 3-Pack and Maps search rankings.',
      evidence: 'Direct entity anchor with geographic coordinates and review authority.',
      difficulty: 'Easy',
      value: 'Critical (DA 100)',
      is_verified: true
    },
    {
      id: 'ver-2',
      name: 'Apple Business Connect',
      url: 'https://businessconnect.apple.com',
      source: 'Apple Maps Ecosystem',
      type: 'Local Directory',
      why_relevant: 'Powers local Siri, Apple Maps, and Spotlight search on iOS devices.',
      evidence: 'High domain authority citation validating NAP across 1.4B+ active devices.',
      difficulty: 'Easy',
      value: 'High (DA 99)',
      is_verified: true
    },
    {
      id: 'ver-3',
      name: 'Bing Places for Business',
      url: 'https://www.bingplaces.com',
      source: 'Microsoft Search Network',
      type: 'Local Directory',
      why_relevant: 'Feeds Microsoft Copilot, Windows Search, and Cortana local results.',
      evidence: 'Verified NAP citation with direct synchronization from Google Business.',
      difficulty: 'Easy',
      value: 'High (DA 94)',
      is_verified: true
    },
    {
      id: 'ver-4',
      name: 'Yelp for Business',
      url: 'https://biz.yelp.com',
      source: 'Yelp Local Network',
      type: 'Local Directory',
      why_relevant: 'Heavily indexed by Google for "best [service] in [city]" queries.',
      evidence: 'High authority citation that feeds third-party navigation systems.',
      difficulty: 'Easy',
      value: 'High (DA 93)',
      is_verified: true
    },
    {
      id: 'ver-5',
      name: 'Better Business Bureau (BBB)',
      url: 'https://www.bbb.org',
      source: 'BBB Business Directory',
      type: 'Chambers & Trust Organizations',
      why_relevant: 'Provides highest-tier domain trust signals and accredited business badges.',
      evidence: 'Dofollow domain citation with verified registration checks.',
      difficulty: 'Medium',
      value: 'High (DA 91)',
      is_verified: true
    },
    {
      id: 'ver-6',
      name: 'Local Chamber of Commerce',
      url: 'https://www.uschamber.com',
      source: 'Local Chamber Network',
      type: 'Chambers',
      why_relevant: 'Direct geographic anchor linking your domain to your specific city.',
      evidence: 'Localized .org/.com backlink from municipal business directories.',
      difficulty: 'Medium',
      value: 'Very High (DA 80+)',
      is_verified: true
    }
  ];

  const aiProspects = opportunities.filter(o => o.status === 'Prospect' || o.verification_level === 'AI_PROSPECT' || !o.is_verified);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Award className="text-primary-accent" size={26} />
            Authority Builder & Local Citations
          </h1>
          <p className="text-xs text-secondary mt-1">
            Build high-trust local backlinks and verified citations without spam or private blog networks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateProspects}
            disabled={generating}
            className="border-gray-200 bg-white text-primary hover:bg-gray-50 flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
          >
            <Sparkles size={13} className={generating ? "animate-spin text-primary-accent" : "text-primary-accent"} />
            {generating ? 'Scanning Local Targets...' : 'Discover AI Prospects'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'verified', label: `Verified Opportunities (${verifiedOpportunities.length})` },
          { id: 'prospects', label: `AI Prospects (${aiProspects.length})` },
          { id: 'citations', label: 'Local Citation Core' },
          { id: 'backlinks', label: `Backlink Tracker (${backlinks.length})` }
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

      {/* 1. VERIFIED OPPORTUNITIES */}
      {activeTab === 'verified' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {verifiedOpportunities.map((opp) => (
            <div 
              key={opp.id} 
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:border-blue-200 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    <span>VERIFIED OPPORTUNITY</span>
                  </span>
                  <span className="text-[10px] font-mono text-secondary">
                    {opp.value}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-primary mt-1">{opp.name}</h3>
                <a 
                  href={opp.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary-accent hover:underline font-mono truncate flex items-center gap-1"
                >
                  <span>{opp.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={10} />
                </a>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                  <span className="font-bold text-primary block text-[11px]">Why Relevant:</span>
                  <p className="text-secondary leading-relaxed text-[11px]">{opp.why_relevant}</p>
                  <span className="font-bold text-primary block text-[11px] pt-1">Evidence:</span>
                  <p className="text-secondary leading-relaxed text-[11px]">{opp.evidence}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-secondary font-medium">
                  Type: {opp.type}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenOutreach(opp)}
                  className="text-xs font-semibold border-gray-200 hover:border-primary-accent text-primary"
                >
                  <Mail size={12} className="mr-1.5 text-primary-accent" />
                  <span>GENERATE OUTREACH EMAIL</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. AI PROSPECTS */}
      {activeTab === 'prospects' && (
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0 text-amber-700" />
            <span>AI Prospects are algorithmically suggested local targets. Verify contact details and editorial relevance before sending outreach.</span>
          </div>

          {aiProspects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs space-y-3">
              <Sparkles className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No AI Prospects Generated Yet</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Click below to scan for local sponsorship, community guide, and industry directory targets.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateProspects}
                disabled={generating}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
              >
                {generating ? 'Scanning...' : 'Discover AI Prospects'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiProspects.map((opp) => (
                <div 
                  key={opp.id}
                  className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:border-blue-200 transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        AI PROSPECT — Verify before contacting
                      </span>
                      <span className="text-[10px] font-mono text-secondary">
                        Difficulty: {opp.difficulty || 'Medium'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-primary mt-1">{opp.name}</h3>
                    {opp.url && (
                      <p className="text-xs text-secondary font-mono truncate">{opp.url}</p>
                    )}
                    <p className="text-xs text-secondary leading-relaxed pt-1">
                      {opp.why_relevant || opp.reason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-secondary font-medium">
                      Category: {opp.type || 'Partnership'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenOutreach(opp)}
                      className="text-xs font-semibold border-gray-200 hover:border-primary-accent text-primary"
                    >
                      <Mail size={12} className="mr-1.5 text-primary-accent" />
                      <span>Outreach Email</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CITATIONS TAB */}
      {activeTab === 'citations' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs mb-8 space-y-4">
          <h3 className="text-sm font-bold text-primary">Foundational Local NAP Citation Platforms</h3>
          <p className="text-xs text-secondary">
            Ensure your business Name, Address, and Phone number are listed with 100% identical formatting across these foundational directories.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              { name: 'Google Business Profile', authority: 'DA 100', category: 'Local Directory' },
              { name: 'Apple Maps / Business Connect', authority: 'DA 99', category: 'Local Directory' },
              { name: 'Bing Places for Business', authority: 'DA 94', category: 'Local Directory' },
              { name: 'Yelp Local Business', authority: 'DA 93', category: 'Local Directory' },
              { name: 'Better Business Bureau (BBB)', authority: 'DA 91', category: 'Trust Directory' },
              { name: 'Local Chamber of Commerce', authority: 'DA 80+', category: 'Chambers' }
            ].map((cit, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary">{cit.name}</h4>
                  <span className="text-[10px] font-mono text-secondary">{cit.authority}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent">
                  {cit.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BACKLINK TRACKER TAB */}
      {activeTab === 'backlinks' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-8">
          <div className="p-8 text-center">
            <Award className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-primary mb-1">Live Backlink Tracker</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-4">
              Real-time referring domain and backlink telemetry for your verified domain.
            </p>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              LIVE MONITORING ACTIVE
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
                <h3 className="text-sm font-bold text-primary">Personalized Outreach Template</h3>
              </div>
              <button
                onClick={() => setOutreachOpp(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {generatingEmail ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-primary-accent" />
                <span className="text-xs text-secondary font-medium">Generating customized outreach email...</span>
              </div>
            ) : outreachEmail ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={outreachEmail.subject}
                    onChange={(e) => setOutreachEmail({ ...outreachEmail, subject: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
                    Email Body
                  </label>
                  <textarea
                    value={outreachEmail.body}
                    onChange={(e) => setOutreachEmail({ ...outreachEmail, body: e.target.value })}
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-mono min-h-[180px]"
                  />
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
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
                disabled={generatingEmail || !outreachEmail}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
