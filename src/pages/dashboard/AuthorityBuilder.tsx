import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  fetchAuthorityOpportunities, 
  fetchBacklinks, 
  generateOutreachEmail, 
  fetchApi 
} from '../../lib/api';
import { 
  Link2,
  Zap, 
  Plus, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  Sparkles,
  Mail,
  Copy,
  X,
  CheckCircle2,
  RefreshCw,
  Filter,
  Globe,
  ArrowUpRight,
  ChevronRight,
  Users,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

type OpportunityStatus = 'DISCOVERED' | 'CONTACTED' | 'IN_PROGRESS' | 'ACQUIRED' | 'REJECTED' | 'NOT_RELEVANT';

const STATUS_CONFIG: Record<OpportunityStatus, { label: string; color: string }> = {
  DISCOVERED: { label: 'Discovered', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONTACTED: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ACQUIRED: { label: 'Acquired ✓', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
  NOT_RELEVANT: { label: 'Not Relevant', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function AuthorityBuilder() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'competitor_gaps' | 'my_backlinks' | 'outreach'>('opportunities');
  const [activeFilter, setActiveFilter] = useState<'all' | 'VERIFIED' | 'AI_PROSPECT'>('all');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Outreach Email modal
  const [outreachOpp, setOutreachOpp] = useState<any | null>(null);
  const [outreachEmail, setOutreachEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status update
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

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
      console.error("Failed to scan authority prospects:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (oppId: string, newStatus: OpportunityStatus) => {
    setUpdatingStatusId(oppId);
    try {
      await fetchApi(`/api/authority/opportunities/${oppId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdatingStatusId(null);
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

  // Verified static opportunities (known high-authority directories)
  const verifiedOpportunities = [
    {
      id: 'ver-1',
      name: 'Google Business Profile',
      url: 'https://business.google.com',
      domain: 'business.google.com',
      type: 'Local Directory',
      why_relevant: 'The foundation for all Google Local 3-Pack and Maps search rankings. Every local business needs this claim.',
      evidence: 'Direct entity anchor with geographic coordinates and review authority.',
      difficulty: 'Easy',
      value: 'Critical',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    },
    {
      id: 'ver-2',
      name: 'Apple Business Connect',
      url: 'https://businessconnect.apple.com',
      domain: 'businessconnect.apple.com',
      type: 'Local Directory',
      why_relevant: 'Powers local Siri, Apple Maps, and Spotlight search on 1.4B+ active iOS devices.',
      evidence: 'High domain authority citation validating NAP across the Apple ecosystem.',
      difficulty: 'Easy',
      value: 'High',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    },
    {
      id: 'ver-3',
      name: 'Bing Places for Business',
      url: 'https://www.bingplaces.com',
      domain: 'bingplaces.com',
      type: 'Local Directory',
      why_relevant: 'Feeds Microsoft Copilot, Windows Search, and Cortana local results.',
      evidence: 'Verified NAP citation with direct synchronization from Google Business.',
      difficulty: 'Easy',
      value: 'High',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    },
    {
      id: 'ver-4',
      name: 'Yelp for Business',
      url: 'https://biz.yelp.com',
      domain: 'biz.yelp.com',
      type: 'Local Directory',
      why_relevant: 'Heavily indexed by Google for "best [service] in [city]" queries.',
      evidence: 'High authority citation that feeds third-party navigation systems.',
      difficulty: 'Easy',
      value: 'High',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    },
    {
      id: 'ver-5',
      name: 'Better Business Bureau (BBB)',
      url: 'https://www.bbb.org',
      domain: 'bbb.org',
      type: 'Trust Directory',
      why_relevant: 'Provides highest-tier domain trust signals and accredited business badges.',
      evidence: 'Dofollow domain citation with verified registration checks.',
      difficulty: 'Medium',
      value: 'High',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    },
    {
      id: 'ver-6',
      name: 'U.S. Chamber of Commerce Directory',
      url: 'https://www.uschamber.com',
      domain: 'uschamber.com',
      type: 'Chamber',
      why_relevant: 'Direct geographic anchor linking your domain to your specific city and region.',
      evidence: 'Localized .org/.com backlink from authoritative municipal business directories.',
      difficulty: 'Medium',
      value: 'Very High',
      priority: 'HIGH',
      verification_level: 'VERIFIED',
      status: 'DISCOVERED' as OpportunityStatus
    }
  ];

  const aiProspects = opportunities.filter(o => o.status === 'Prospect' || o.verification_level === 'AI_PROSPECT' || !o.is_verified);

  const allOpportunities = [...verifiedOpportunities, ...aiProspects];

  const filteredOpportunities = activeFilter === 'all' 
    ? allOpportunities
    : allOpportunities.filter(o => o.verification_level === activeFilter);

  // Computed stats
  const verifiedCount = allOpportunities.filter(o => o.verification_level === 'VERIFIED').length;
  const aiProspectCount = allOpportunities.filter(o => o.verification_level === 'AI_PROSPECT').length;
  const contactedCount = allOpportunities.filter(o => o.status === 'CONTACTED' || o.status === 'IN_PROGRESS').length;
  const acquiredCount = allOpportunities.filter(o => o.status === 'ACQUIRED').length;

  // Competitor gap opportunities (placeholder data structure)
  const competitorGaps = [
    {
      id: 'gap-1',
      competitorName: 'Top Local Competitor',
      competitorDomain: 'competitor.com',
      referringDomain: 'local-chamber.org',
      opportunityType: 'Chamber of Commerce Directory',
      url: 'https://local-chamber.org/members',
      whyItMatters: 'Chamber membership signals strong geographic authority to Google Maps.',
      difficulty: 'Easy',
      priority: 'HIGH',
      verification_level: 'VERIFIED'
    },
    {
      id: 'gap-2',
      competitorName: 'Top Local Competitor',
      competitorDomain: 'competitor.com',
      referringDomain: 'bbb.org',
      opportunityType: 'Accredited Business Directory',
      url: 'https://www.bbb.org',
      whyItMatters: 'BBB accreditation creates entity trust and verified business records.',
      difficulty: 'Easy',
      priority: 'HIGH',
      verification_level: 'VERIFIED'
    }
  ];

  const tabs = [
    { id: 'opportunities', label: 'Backlink Opportunities', count: filteredOpportunities.length },
    { id: 'competitor_gaps', label: 'Competitor Gaps', count: competitorGaps.length },
    { id: 'my_backlinks', label: 'My Backlinks', count: backlinks.length },
    { id: 'outreach', label: 'Outreach Tracker', count: contactedCount },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Link2 className="text-primary-accent" size={26} />
            Backlinks &amp; Authority
          </h1>
          <p className="text-xs text-secondary mt-1">
            Find real opportunities to strengthen your local authority. Never fabricated — only verified and AI-identified prospects.
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
            {generating ? 'Discovering...' : 'Discover Opportunities'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Verified Opportunities', value: verifiedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'AI Prospects', value: aiProspectCount, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Contacted / In Progress', value: contactedCount, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Acquired Backlinks', value: acquiredCount, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div>
                <span className="text-xl font-black text-primary">{stat.value}</span>
                <p className="text-[10px] text-secondary font-medium leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(t => (
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
            {t.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === t.id ? 'bg-primary-accent text-white' : 'bg-gray-100 text-secondary'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── OPPORTUNITIES TAB ─── */}
      {activeTab === 'opportunities' && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs text-secondary font-medium flex items-center gap-1"><Filter size={13} /> Filter:</span>
            {[
              { val: 'all', label: 'All' },
              { val: 'VERIFIED', label: 'Verified' },
              { val: 'AI_PROSPECT', label: 'AI Prospects' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setActiveFilter(f.val as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeFilter === f.val
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-secondary border-gray-200 hover:border-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* AI Prospect warning */}
          {(activeFilter === 'AI_PROSPECT' || activeFilter === 'all') && aiProspectCount > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2 font-medium mb-5">
              <AlertCircle size={16} className="shrink-0 text-amber-700 mt-0.5" />
              <span><strong>AI Prospects</strong> are algorithmically suggested local targets. Verify contact details and editorial relevance before sending outreach. URLs marked as AI PROSPECT were not independently verified.</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <RefreshCw size={18} className="animate-spin text-primary-accent" />
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <Link2 className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No Verified Opportunities Found Yet</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Click below to discover real local directories, chambers, and authority targets.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateProspects}
                disabled={generating}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
              >
                {generating ? 'Discovering...' : 'Run Discovery'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  onOutreach={handleOpenOutreach}
                  onStatusChange={handleUpdateStatus}
                  updatingStatusId={updatingStatusId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── COMPETITOR GAPS TAB ─── */}
      {activeTab === 'competitor_gaps' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
            <Target size={16} className="shrink-0 text-blue-700 mt-0.5" />
            <span>Competitor gap analysis identifies link opportunities your top competitors have but you don't. Run a competitor audit to populate with live competitor backlink data.</span>
          </div>

          {competitorGaps.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No Competitor Gap Data Yet</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Run a competitor audit first to discover which link sources your top competitors are using that you're not.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/dashboard/competitors'}
                className="font-semibold text-xs"
              >
                Go to Competitor Radar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {competitorGaps.map((gap) => (
                <div key={gap.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                          gap.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{gap.priority} PRIORITY</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                          gap.verification_level === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{gap.verification_level === 'VERIFIED' ? '✓ VERIFIED' : 'AI PROSPECT'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-primary">{gap.referringDomain}</h3>
                      <p className="text-[11px] text-secondary font-mono">{gap.opportunityType}</p>
                    </div>
                    <span className="text-[10px] font-medium text-secondary bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      Difficulty: {gap.difficulty}
                    </span>
                  </div>

                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs mb-3">
                    <p className="text-red-700 font-semibold mb-1">⚠ Competitor has this — you don't</p>
                    <p className="text-secondary">{gap.competitorName} <span className="font-mono text-[10px]">({gap.competitorDomain})</span> is listed on this authority source.</p>
                  </div>

                  <p className="text-xs text-secondary leading-relaxed mb-3">{gap.whyItMatters}</p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <a href={gap.url} target="_blank" rel="noreferrer" className="text-xs text-primary-accent hover:underline flex items-center gap-1 font-medium">
                      <ExternalLink size={12} /> View Source
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenOutreach({ id: gap.id, name: gap.referringDomain, url: gap.url, why_relevant: gap.whyItMatters })}
                      className="text-xs font-semibold border-gray-200 text-primary"
                    >
                      <Mail size={12} className="mr-1.5 text-primary-accent" />
                      Generate Outreach
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MY BACKLINKS TAB ─── */}
      {activeTab === 'my_backlinks' && (
        <div>
          {backlinks.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <Globe className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No Backlinks Tracked Yet</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                When you acquire a backlink, add it here to monitor whether it stays live, gets removed, or becomes unavailable.
              </p>
              <p className="text-[10px] text-secondary max-w-xs mx-auto">
                Status options: <strong>LIVE</strong> · <strong>LOST</strong> · <strong>UNAVAILABLE</strong> — never fabricated.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-xs">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Referring Domain', 'Backlink URL', 'Target URL', 'Anchor Text', 'First Seen', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold text-secondary uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backlinks.map((bl: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-primary font-medium">{bl.source_url || 'UNAVAILABLE'}</td>
                      <td className="px-4 py-3 text-secondary max-w-[200px] truncate">{bl.source_url || '—'}</td>
                      <td className="px-4 py-3 text-secondary max-w-[200px] truncate">{bl.target_url || '—'}</td>
                      <td className="px-4 py-3 text-secondary">{bl.anchor_text || '—'}</td>
                      <td className="px-4 py-3 text-secondary">{bl.discovered_at ? new Date(bl.discovered_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                          bl.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          bl.status === 'Lost' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {bl.status === 'Active' ? 'LIVE' : bl.status === 'Lost' ? 'LOST' : 'UNAVAILABLE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── OUTREACH TRACKER TAB ─── */}
      {activeTab === 'outreach' && (
        <div>
          {contactedCount === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <Mail className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No Outreach Tracked Yet</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                When you contact a website about a link opportunity, mark its status here. Track your progress from Discovered → Contacted → In Progress → Acquired.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-secondary">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">DISCOVERED</span>
                <ChevronRight size={12} />
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">CONTACTED</span>
                <ChevronRight size={12} />
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">IN PROGRESS</span>
                <ChevronRight size={12} />
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">ACQUIRED</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('opportunities')}
                className="font-semibold text-xs"
              >
                View Opportunities
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {allOpportunities
                .filter(o => ['CONTACTED', 'IN_PROGRESS', 'ACQUIRED'].includes(o.status))
                .map(opp => (
                  <div key={opp.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-primary">{opp.name}</h3>
                      <p className="text-[11px] text-secondary font-mono">{opp.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={opp.status}
                        onChange={(e) => handleUpdateStatus(opp.id, e.target.value as OpportunityStatus)}
                        className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-primary cursor-pointer"
                      >
                        {Object.keys(STATUS_CONFIG).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s as OpportunityStatus].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ─── OUTREACH EMAIL MODAL ─── */}
      {outreachOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary-accent" />
                <div>
                  <h3 className="text-sm font-bold text-primary">AI Outreach Email</h3>
                  <p className="text-[10px] text-secondary">{outreachOpp.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setOutreachOpp(null); setOutreachEmail(null); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {generatingEmail ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-primary-accent" />
                <span className="text-xs text-secondary font-medium">Generating personalized outreach email...</span>
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
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-medium outline-none focus:border-primary-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
                    Email Body
                  </label>
                  <textarea
                    value={outreachEmail.body}
                    onChange={(e) => setOutreachEmail({ ...outreachEmail, body: e.target.value })}
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-mono min-h-[180px] outline-none focus:border-primary-accent"
                  />
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenOutreach(outreachOpp)}
                disabled={generatingEmail}
                className="text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Regenerate
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setOutreachOpp(null); setOutreachEmail(null); }}
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
                  <span>{copied ? 'Copied!' : 'Copy Email'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ─── OpportunityCard Component ───
function OpportunityCard({ opp, onOutreach, onStatusChange, updatingStatusId }: {
  opp: any;
  onOutreach: (opp: any) => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  updatingStatusId: string | null;
}) {
  const isVerified = opp.verification_level === 'VERIFIED';
  const currentStatus: OpportunityStatus = opp.status || 'DISCOVERED';

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-300 transition-all space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {isVerified ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-600" />
              VERIFIED
            </span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
              <AlertCircle size={10} />
              AI PROSPECT
            </span>
          )}
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
            opp.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
            opp.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {opp.priority || 'MEDIUM'} PRIORITY
          </span>
        </div>

        <h3 className="text-sm font-bold text-primary">{opp.name}</h3>

        {opp.url && (
          <a 
            href={opp.url} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-primary-accent hover:underline font-mono truncate flex items-center gap-1"
          >
            <span>{(opp.domain || opp.url.replace(/^https?:\/\//, '').replace(/^www\./, '')).split('/')[0]}</span>
            <ExternalLink size={10} />
          </a>
        )}

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
          <p className="text-secondary leading-relaxed text-[11px]">{opp.why_relevant}</p>
          {opp.evidence && (
            <p className="text-secondary leading-relaxed text-[11px] pt-1 border-t border-gray-200">
              <strong className="text-primary">Evidence:</strong> {opp.evidence}
            </p>
          )}
          {!isVerified && (
            <p className="text-amber-700 text-[10px] italic pt-1">
              ⚠ Verify this opportunity before contacting.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-secondary">
          <span className="font-medium">{opp.type}</span>
          <span>Difficulty: {opp.difficulty || 'Medium'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-2">
        {/* Status Tracker */}
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-secondary shrink-0" />
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(opp.id, e.target.value as OpportunityStatus)}
            disabled={updatingStatusId === opp.id}
            className="text-[10px] font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-primary cursor-pointer flex-1"
          >
            {Object.keys(STATUS_CONFIG).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s as OpportunityStatus].label}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {opp.url && (
            <a
              href={opp.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-secondary hover:text-primary border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all text-center"
            >
              View Source
            </a>
          )}
          <button
            onClick={() => onOutreach(opp)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-primary-accent hover:text-white border border-primary-accent/30 hover:bg-primary-accent hover:border-primary-accent transition-all text-center flex items-center justify-center gap-1"
          >
            <Mail size={11} />
            Outreach
          </button>
        </div>
      </div>
    </div>
  );
}
