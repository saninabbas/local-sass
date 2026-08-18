import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  fetchAuthorityOverview,
  syncAuthorityData,
  fetchAuthorityBacklinks,
  fetchAuthorityDomains,
  fetchAuthorityCompetitors,
  addAuthorityCompetitor,
  analyzeAuthorityGap,
  fetchAuthorityOpportunities,
  updateOpportunityStatus,
  generateOutreachEmail,
  getBusinesses
} from '../../lib/api';
import { 
  Link2,
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
  TrendingUp,
  ShieldCheck,
  Building,
  Target,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuthorityBuilder() {
  const [activeBusiness, setActiveBusiness] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'gaps' | 'backlinks' | 'domains' | 'lost'>('overview');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // all | high | directory | chamber
  const [activeTrendPeriod, setActiveTrendPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const [overview, setOverview] = useState<any>({
    domain: '',
    authority_score: 0,
    total_backlinks: 0,
    referring_domains: 0,
    dofollow_backlinks: 0,
    nofollow_backlinks: 0,
    new_backlinks_30d: 0,
    lost_backlinks_30d: 0,
    top_referring_domains: [],
    top_linked_pages: [],
    last_checked_at: ''
  });
  const [trends, setTrends] = useState<any>({ '7d': null, '30d': null, '90d': null });
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [referringDomains, setReferringDomains] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [linkGaps, setLinkGaps] = useState<any[]>([]);

  // Modals & Drawers
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [outreachEmail, setOutreachEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  // Actions
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState('');
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async (bizId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let currentBiz = activeBusiness;
      if (!currentBiz) {
        const bizRes = await getBusinesses().catch(() => ({ businesses: [] }));
        const list = bizRes.businesses || (Array.isArray(bizRes) ? bizRes : []);
        currentBiz = list.find((b: any) => b.is_default === 1) || list[0] || null;
        setActiveBusiness(currentBiz);
      }

      const targetBizId = bizId || currentBiz?.id;

      const [overviewRes, backlinksRes, domainsRes, compsRes, oppsRes] = await Promise.all([
        fetchAuthorityOverview(targetBizId).catch(() => ({ overview: null, trends: {} })),
        fetchAuthorityBacklinks({ businessId: targetBizId, limit: 50 }).catch(() => ({ backlinks: [], total: 0 })),
        fetchAuthorityDomains(targetBizId).catch(() => ({ domains: [], total: 0 })),
        fetchAuthorityCompetitors(targetBizId).catch(() => ({ competitors: [], total: 0 })),
        fetchAuthorityOpportunities({ filter: activeFilter, businessId: targetBizId }).catch(() => ({ opportunities: [], total: 0 }))
      ]);

      if (overviewRes?.overview) {
        setOverview(overviewRes.overview);
        setTrends(overviewRes.trends || {});
      }

      if (backlinksRes?.backlinks) {
        setBacklinks(backlinksRes.backlinks);
      }

      if (domainsRes?.domains) {
        setReferringDomains(domainsRes.domains);
      }

      if (compsRes?.competitors) {
        setCompetitors(compsRes.competitors);
      }

      if (oppsRes?.opportunities) {
        setOpportunities(oppsRes.opportunities);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load authority intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await syncAuthorityData(activeBusiness?.id);
      if (res?.success) {
        setSuccessNotice(`Synced ${res.data?.syncedBacklinksCount || 0} backlinks (${res.data?.newCount || 0} new, ${res.data?.lostCount || 0} lost).`);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to sync backlink data.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorDomain.trim()) return;
    setAddingCompetitor(true);
    setError(null);
    try {
      await addAuthorityCompetitor(newCompetitorDomain.trim(), activeBusiness?.id);
      setNewCompetitorDomain('');
      setSuccessNotice(`Added competitor domain "${newCompetitorDomain.trim()}".`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add competitor domain.');
    } finally {
      setAddingCompetitor(false);
    }
  };

  const handleAnalyzeGap = async () => {
    setAnalyzingGap(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await analyzeAuthorityGap({ business_id: activeBusiness?.id });
      if (res?.success) {
        setLinkGaps(res.data?.linkGaps || []);
        setSuccessNotice(`Discovered ${res.data?.opportunitiesCount || 0} new link opportunities across competitors.`);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitor backlink gap.');
    } finally {
      setAnalyzingGap(false);
    }
  };

  const handleUpdateStatus = async (oppId: string, status: string) => {
    try {
      await updateOpportunityStatus(oppId, status);
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, status } : o));
      if (selectedOpportunity?.id === oppId) {
        setSelectedOpportunity({ ...selectedOpportunity, status });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update opportunity status.');
    }
  };

  const handleGenerateEmail = async (opp: any) => {
    setSelectedOpportunity(opp);
    setGeneratingEmail(true);
    try {
      const res = await generateOutreachEmail({
        opportunityId: opp.id,
        opportunityName: opp.source_domain,
        whyRelevant: opp.evidence?.why_relevant || opp.evidence?.reason || 'Verified local authority source'
      });
      setOutreachEmail(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate outreach email.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    if (!outreachEmail) return;
    navigator.clipboard.writeText(`Subject: ${outreachEmail.subject}\n\n${outreachEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTrend = trends[activeTrendPeriod];
  const lostBacklinks = backlinks.filter(b => b.status === 'LOST');

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Authority & Backlink Intelligence</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 uppercase border border-blue-500/20">
              Phase 8 Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real domain authority tracking, competitor backlink gap analysis, and verified local citation opportunities for {activeBusiness?.name || 'your business'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeGap}
            disabled={analyzingGap}
            className="text-xs h-8 px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Target size={13} className={`mr-1.5 ${analyzingGap ? 'animate-spin' : 'text-blue-600'}`} />
            {analyzingGap ? 'Analyzing Gap...' : 'Analyze Competitor Gap'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="text-xs h-8 px-3.5 bg-gray-900 hover:bg-black text-white font-medium shadow-xs"
          >
            <RefreshCw size={13} className={`mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Backlinks'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
        </div>
      )}

      {successNotice && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-500 hover:text-emerald-700"><X size={14} /></button>
        </div>
      )}

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        {/* KPI 1: Domain Authority Score */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Authority Score</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{overview.authority_score}/100</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
              {overview.authority_score >= 60 ? 'HIGH' : overview.authority_score >= 30 ? 'GROWING' : 'FOUNDATIONAL'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Domain trust & link equity</p>
        </div>

        {/* KPI 2: Total Backlinks */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Backlinks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{overview.total_backlinks}</span>
            <span className="text-[11px] font-bold text-gray-400">Indexed</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{overview.dofollow_backlinks} Dofollow links</p>
        </div>

        {/* KPI 3: Referring Domains */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Referring Domains</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{overview.referring_domains}</span>
            <span className="text-[11px] font-bold text-emerald-600">Unique</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Distinct linking entities</p>
        </div>

        {/* KPI 4: New Backlinks (30D) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">New Links (30D)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">+{overview.new_backlinks_30d}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">Acquired</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Observed in last 30 days</p>
        </div>

        {/* KPI 5: Lost Backlinks (30D) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Lost Links (30D)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black ${overview.lost_backlinks_30d > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {overview.lost_backlinks_30d}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">Monitored</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Requires reclaim action</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Trajectory
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'opportunities' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Link Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'gaps' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Competitor Link Gap ({competitors.length} Rivals)
        </button>
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'backlinks' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Backlinks ({backlinks.length})
        </button>
        <button
          onClick={() => setActiveTab('domains')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'domains' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Referring Domains ({referringDomains.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'lost' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Lost Links ({lostBacklinks.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TRAJECTORY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Historical Trend Telemetry */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-900" />
                <h3 className="text-xs font-bold text-gray-900">Authority Velocity & Link Movement</h3>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                {(['7d', '30d', '90d'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActiveTrendPeriod(p)}
                    className={`px-2.5 py-0.5 rounded font-semibold transition-all cursor-pointer uppercase ${
                      activeTrendPeriod === p ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {currentTrend ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">New Backlinks</span>
                  <span className="text-xl font-black text-emerald-600">+{currentTrend.newBacklinks}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Lost Backlinks</span>
                  <span className={`text-xl font-black ${currentTrend.lostBacklinks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {currentTrend.lostBacklinks}
                  </span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Net Link Growth</span>
                  <span className="text-xl font-black text-gray-900">
                    {currentTrend.newBacklinks - currentTrend.lostBacklinks >= 0 ? '+' : ''}{currentTrend.newBacklinks - currentTrend.lostBacklinks}
                  </span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Active Referring</span>
                  <span className="text-xl font-black text-gray-900">{currentTrend.referringDomains}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                Insufficient historical link telemetry in this window.
              </div>
            )}
          </div>

          {/* Top Referring Domains & Linked Pages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Referring Domains */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span>Top Referring Domains</span>
                <span className="text-[10px] font-normal text-gray-400">{overview.top_referring_domains?.length || 0} listed</span>
              </h3>

              {overview.top_referring_domains?.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No referring domains recorded yet. Click "Sync Backlinks" to discover links.</p>
              ) : (
                <div className="space-y-2">
                  {overview.top_referring_domains?.map((rd: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{rd.domain}</span>
                        <span className="text-[10px] text-gray-500 block">{rd.domain_type || 'WEB'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">DA {rd.authority_score}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{rd.backlinks_count} links</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Linked Pages */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span>Top Linked Pages</span>
                <span className="text-[10px] font-normal text-gray-400">Target equity</span>
              </h3>

              {overview.top_linked_pages?.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No landing pages mapped yet.</p>
              ) : (
                <div className="space-y-2">
                  {overview.top_linked_pages?.map((lp: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[240px]">
                        <span className="font-bold text-gray-900 truncate block">{lp.url}</span>
                        <span className="text-[10px] text-gray-500">{lp.referring_domains} referring domains</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">{lp.backlinks_count} Backlinks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LINK OPPORTUNITIES & EVIDENCE DRAWER */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunities Column */}
          <div className={`${selectedOpportunity ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs mb-2">
              <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
                <Filter size={12} /> Filters:
              </span>
              {[
                { id: 'all', label: `All (${opportunities.length})` },
                { id: 'high', label: 'High Priority (75+)' },
                { id: 'directory', label: 'Local Directories' },
                { id: 'chamber', label: 'Chamber & Alliance' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-400" />
                Loading backlink opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-200 space-y-2">
                <Target size={28} className="mx-auto text-gray-300" />
                <h4 className="text-xs font-bold text-gray-900">No Link Opportunities Discovered Yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Run "Analyze Competitor Gap" to compare rival backlink profiles and uncover high-authority link prospects.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAnalyzeGap}
                  disabled={analyzingGap}
                  className="mt-2 text-xs bg-gray-900 hover:bg-black text-white"
                >
                  Analyze Competitor Gap
                </Button>
              </div>
            ) : (
              opportunities.map(opp => (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    selectedOpportunity?.id === opp.id
                      ? 'border-gray-900 shadow-sm ring-1 ring-gray-900'
                      : 'border-gray-200/80 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{opp.source_domain}</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                          {opp.opportunity_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{opp.source_url}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-black text-gray-900">{opp.ai_score}/100</span>
                        <span className="text-[9px] text-gray-400 block uppercase font-semibold">AI Score</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        opp.priority === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        opp.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {opp.priority}
                      </span>
                    </div>
                  </div>

                  {/* Evidence summary */}
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {opp.evidence?.reason || opp.evidence?.why_relevant || 'Verified regional citation opportunity.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <span className="text-gray-500 font-medium">
                      Status: <strong className="text-gray-900 capitalize">{opp.status?.toLowerCase()}</strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateEmail(opp);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Mail size={12} />
                      Generate Outreach Pitch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Opportunity Detail & Evidence Drawer */}
          {selectedOpportunity && (
            <div className="bg-white p-5 rounded-xl border border-gray-900 shadow-sm space-y-4 self-start sticky top-6">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{selectedOpportunity.source_domain}</h3>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase">{selectedOpportunity.opportunity_type}</span>
                </div>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* AI Score Breakdown */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Transparent AI Score</span>
                  <span className="text-sm font-black text-gray-900">{selectedOpportunity.ai_score}/100</span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span>Authority & Entity Trust:</span>
                    <span className="font-semibold text-gray-900">{selectedOpportunity.scoring_breakdown?.authority_weight ?? 25}/30 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category & Topical Relevance:</span>
                    <span className="font-semibold text-gray-900">{selectedOpportunity.scoring_breakdown?.relevance_weight ?? 22}/25 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Geographic Factor:</span>
                    <span className="font-semibold text-gray-900">{selectedOpportunity.scoring_breakdown?.local_relevance_weight ?? 20}/25 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Competitor Evidence:</span>
                    <span className="font-semibold text-gray-900">{selectedOpportunity.scoring_breakdown?.competitor_evidence_weight ?? 12}/15 pts</span>
                  </div>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Verified Evidence
                </h4>
                <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200 text-gray-700 leading-relaxed text-[11px] space-y-1">
                  <p><strong>Observed Date:</strong> {selectedOpportunity.evidence?.observed_date || 'Live'}</p>
                  {selectedOpportunity.evidence?.competitor_domain && (
                    <p><strong>Competitor Target:</strong> {selectedOpportunity.evidence.competitor_domain}</p>
                  )}
                  <p><strong>Rationale:</strong> {selectedOpportunity.evidence?.reason}</p>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-gray-900 block">Recommended Action</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {selectedOpportunity.recommended_action || 'Submit verified business NAP citation to match competitor link profile.'}
                </p>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-700 block">Update Status</span>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  {(['DISCOVERED', 'CONTACTED', 'ACQUIRED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOpportunity.id, st)}
                      className={`p-1.5 rounded-lg border font-medium capitalize text-center transition-all cursor-pointer ${
                        selectedOpportunity.status === st
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleGenerateEmail(selectedOpportunity)}
                disabled={generatingEmail}
                className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Mail size={13} className="mr-1.5" />
                {generatingEmail ? 'Generating...' : 'Open Outreach Studio'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPETITOR LINK GAP */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          {/* Add Competitor Domain Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900">Tracked Competitor Domains</h3>
              <p className="text-xs text-gray-500">Add rival domains to scan their backlink profile for common link gaps.</p>
            </div>

            <form onSubmit={handleAddCompetitor} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. competitorclinic.com"
                value={newCompetitorDomain}
                onChange={(e) => setNewCompetitorDomain(e.target.value)}
                className="p-2 text-xs rounded-lg border border-gray-300 w-56 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={addingCompetitor}
                className="text-xs h-8 px-3.5 bg-gray-900 text-white"
              >
                <Plus size={13} className="mr-1" />
                {addingCompetitor ? 'Adding...' : 'Add Rival'}
              </Button>
            </form>
          </div>

          {/* Competitors List */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3">Registered Rivals ({competitors.length})</h3>
            {competitors.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No competitors added. Enter a competitor domain above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{comp.domain}</span>
                      {comp.name && <span className="text-[10px] text-gray-500">{comp.name}</span>}
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">{comp.source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ALL BACKLINKS TABLE */}
      {activeTab === 'backlinks' && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900">Verified Target Backlinks ({backlinks.length})</h3>
            <span className="text-xs text-gray-400">Strictly tenant-scoped</span>
          </div>

          {backlinks.length === 0 ? (
            <p className="text-xs text-gray-400 py-12 text-center">No backlinks indexed. Click "Sync Backlinks" to fetch live links.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3">Source Domain</th>
                    <th className="p-3">Source URL / Title</th>
                    <th className="p-3">Anchor Text</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backlinks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{b.source_domain}</td>
                      <td className="p-3 max-w-[280px] truncate text-gray-600">
                        <a href={b.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 flex items-center gap-1">
                          <span className="truncate">{b.source_url}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      </td>
                      <td className="p-3 text-gray-700">{b.anchor_text || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          b.dofollow ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.dofollow ? 'Dofollow' : 'Nofollow'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          b.status === 'NEW' ? 'bg-emerald-50 text-emerald-700' :
                          b.status === 'LOST' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {b.status || 'STABLE'}
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

      {/* TAB 5: REFERRING DOMAINS */}
      {activeTab === 'domains' && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900">Referring Domains ({referringDomains.length})</h3>
          </div>

          {referringDomains.length === 0 ? (
            <p className="text-xs text-gray-400 py-12 text-center">No referring domains indexed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3">Domain</th>
                    <th className="p-3 text-center">Authority</th>
                    <th className="p-3 text-center">Total Links</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3">First Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referringDomains.map((d, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{d.domain}</td>
                      <td className="p-3 text-center font-bold text-blue-600">DA {d.authority_score || 35}</td>
                      <td className="p-3 text-center font-semibold text-gray-900">{d.backlinks_count}</td>
                      <td className="p-3 text-center">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Dofollow</span>
                      </td>
                      <td className="p-3 text-gray-400">{d.first_seen ? new Date(d.first_seen).toLocaleDateString() : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: LOST BACKLINKS */}
      {activeTab === 'lost' && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900">Lost Backlinks Monitor ({lostBacklinks.length})</h3>
          </div>

          {lostBacklinks.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
              <h4 className="text-xs font-bold text-gray-900">No Lost Backlinks Detected</h4>
              <p className="text-xs text-gray-500">Your existing link profile remains healthy and active across all monitored referring domains.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lostBacklinks.map((b, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{b.source_domain}</span>
                    <span className="text-[10px] text-gray-500">{b.source_url}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">
                    Lost
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OUTREACH EMAIL MODAL */}
      {outreachEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">White-Hat Outreach Pitch</h3>
              </div>
              <button
                onClick={() => setOutreachEmail(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={outreachEmail.subject}
                  readOnly
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Email Body</label>
                <textarea
                  value={outreachEmail.body}
                  readOnly
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 min-h-[140px] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOutreachEmail(null)}
              >
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyEmail}
                className="text-xs bg-gray-900 hover:bg-black text-white font-bold"
              >
                {copied ? (
                  <>
                    <Check size={13} className="mr-1.5 text-emerald-400" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={13} className="mr-1.5" />
                    Copy Pitch
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
