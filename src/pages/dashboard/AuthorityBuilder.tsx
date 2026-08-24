import React, { useState, useEffect } from 'react';
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
  fetchAuthorityScore,
  fetchAuthorityTasks,
  generateAuthorityTasks,
  updateAuthorityTaskStatus,
  fetchBacklinkIntelligence,
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
  AlertTriangle,
  Award,
  ListTodo,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  Share2,
  Bookmark,
  Pin
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuthorityBuilder() {
  const [activeBusiness, setActiveBusiness] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'score' | 'tasks' | 'backlinks' | 'recommendations' | 'competitors'>('score');
  
  // Tasks Filtering & State
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskProgress, setTaskProgress] = useState<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
  }>({ total: 0, completed: 0, inProgress: 0, pending: 0, completionRate: 0 });
  const [taskPlatformFilter, setTaskPlatformFilter] = useState<string>('all');
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Authority Score State (Phase 5)
  const [scoreData, setScoreData] = useState<any>({
    overallScore: 48,
    tier: 'Growing Authority',
    factors: {
      referringDomains: { score: 12, max: 25, label: 'Referring Domains', details: 'Calculating...' },
      backlinkQuality: { score: 14, max: 25, label: 'Backlink Quality & Trust', details: 'Calculating...' },
      localCitations: { score: 10, max: 20, label: 'Local Citations (NAP)', details: 'Calculating...' },
      brandMentions: { score: 6, max: 15, label: 'Brand Mentions & Web Reach', details: 'Calculating...' },
      contentAuthority: { score: 6, max: 15, label: 'Content Authority & DOM Health', details: 'Calculating...' }
    }
  });

  // Overview & Backlinks State
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
    last_checked_at: ''
  });
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [backlinksSearch, setBacklinksSearch] = useState('');
  const [backlinksFilter, setBacklinksFilter] = useState<'all' | 'dofollow' | 'nofollow'>('all');
  const [referringDomains, setReferringDomains] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [linkGaps, setLinkGaps] = useState<any[]>([]);
  const [intelligenceData, setIntelligenceData] = useState<any>({
    totalBacklinks: 342,
    referringDomains: 86,
    highAuthorityLinks: 18,
    lostLinks: 3,
    newLinks: 7,
    authorityGrowthScore: 82,
    linkQualityScore: 78,
    domainDiversityScore: 91,
    gapsIdentified: 4,
    opportunities: [],
    competitorGaps: []
  });

  // Modals & Outreach
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

      const [overviewRes, backlinksRes, domainsRes, compsRes, oppsRes, scoreRes, tasksRes, intelligenceRes] = await Promise.all([
        fetchAuthorityOverview(targetBizId).catch(() => ({ overview: null, trends: {} })),
        fetchAuthorityBacklinks({ businessId: targetBizId, limit: 50 }).catch(() => ({ backlinks: [], total: 0 })),
        fetchAuthorityDomains(targetBizId).catch(() => ({ domains: [], total: 0 })),
        fetchAuthorityCompetitors(targetBizId).catch(() => ({ competitors: [], total: 0 })),
        fetchAuthorityOpportunities({ businessId: targetBizId }).catch(() => ({ opportunities: [], total: 0 })),
        fetchAuthorityScore(targetBizId).catch(() => ({ success: false })),
        fetchAuthorityTasks(targetBizId).catch(() => ({ tasks: [], progress: { total: 0, completed: 0, inProgress: 0, pending: 0, completionRate: 0 } })),
        fetchBacklinkIntelligence(targetBizId).catch(() => ({ success: false }))
      ]);

      if (overviewRes?.overview) {
        setOverview(overviewRes.overview);
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

      if (scoreRes?.data?.overallScore !== undefined) {
        setScoreData(scoreRes.data);
      }

      if (tasksRes?.tasks) {
        setTasks(tasksRes.tasks);
        if (tasksRes.progress) setTaskProgress(tasksRes.progress);
      }

      if (intelligenceRes?.data) {
        setIntelligenceData(intelligenceRes.data);
        if (intelligenceRes.data.competitorGaps && intelligenceRes.data.competitorGaps.length > 0) {
          setLinkGaps(intelligenceRes.data.competitorGaps);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load authority intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await syncAuthorityData(activeBusiness?.id);
      if (res?.success) {
        setSuccessNotice(`Synced ${res.data?.syncedBacklinksCount || 0} backlinks (${res.data?.newCount || 0} new, ${res.data?.lostCount || 0} lost).`);
      }
      await loadData(activeBusiness?.id);
    } catch (err: any) {
      setError(err.message || 'Failed to sync backlink data.');
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateTasks = async () => {
    setGeneratingTasks(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await generateAuthorityTasks(activeBusiness?.id);
      if (res?.tasks) {
        setTasks(res.tasks);
        if (res.progress) setTaskProgress(res.progress);
        setSuccessNotice('Generated 6 fresh AI Authority Growth Tasks!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate authority tasks.');
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setUpdatingTaskId(taskId);
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await updateAuthorityTaskStatus(taskId, newStatus, activeBusiness?.id);
      if (res?.progress) {
        setTaskProgress(res.progress);
      }
      // Re-calculate authority score dynamically
      const scoreRes = await fetchAuthorityScore(activeBusiness?.id).catch(() => null);
      if (scoreRes?.data) setScoreData(scoreRes.data);
    } catch (err: any) {
      console.warn("Failed to update task status:", err);
    } finally {
      setUpdatingTaskId(null);
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
      await loadData(activeBusiness?.id);
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
      await loadData(activeBusiness?.id);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitor backlink gap.');
    } finally {
      setAnalyzingGap(false);
    }
  };

  const handleGenerateEmail = async (opp: any) => {
    setSelectedOpportunity(opp);
    setGeneratingEmail(true);
    try {
      const res = await generateOutreachEmail({
        opportunityId: opp.id,
        opportunityName: opp.source_domain || opp.domain || 'Local Directory',
        whyRelevant: opp.evidence?.why_relevant || opp.why_relevant || 'Authoritative local citation source'
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

  // Filtered Backlinks
  const filteredBacklinks = backlinks.filter(b => {
    const term = backlinksSearch.toLowerCase();
    const matchesSearch = !term || 
      (b.source_domain || b.domain || '').toLowerCase().includes(term) ||
      (b.source_url || b.url || '').toLowerCase().includes(term) ||
      (b.anchor_text || '').toLowerCase().includes(term);
    
    const isDofollow = b.dofollow === 1 || b.follow_type === 'dofollow';
    if (backlinksFilter === 'dofollow') return matchesSearch && isDofollow;
    if (backlinksFilter === 'nofollow') return matchesSearch && !isDofollow;
    return matchesSearch;
  });

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    if (taskPlatformFilter === 'all') return true;
    return t.platform.toLowerCase().includes(taskPlatformFilter.toLowerCase());
  });

  // Score Tier Styling
  const getTierBadge = (tier: string) => {
    if (tier === 'Strong Authority') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        desc: 'Top 10% local authority. Search engines view your domain as a primary trusted entity.'
      };
    }
    if (tier === 'Growing Authority') {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
        desc: 'Steady foundation. Complete active growth tasks to push into local 3-Pack domination.'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-500',
      desc: 'Low trust footprint. Prioritize local directory citations and foundational guest articles.'
    };
  };

  const tierBadge = getTierBadge(scoreData?.tier || 'Growing Authority');

  const getPlatformIcon = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('medium')) return <FileText size={14} className="text-[#141413]" />;
    if (p.includes('quora')) return <Share2 size={14} className="text-[#b92b27]" />;
    if (p.includes('reddit')) return <Compass size={14} className="text-[#ff4500]" />;
    if (p.includes('pinterest')) return <Pin size={14} className="text-[#e60023]" />;
    if (p.includes('directory') || p.includes('directories')) return <Building size={14} className="text-[#0073aa]" />;
    return <Globe size={14} className="text-[#cc785c]" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e6dfd8] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">
                Local Presence & Authority
              </span>
              <span className="text-[10px] font-mono text-[#8e8b82]">&bull; {activeBusiness?.name || 'Your Business'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Authority Builder
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-0.5 max-w-2xl">
              Elevate domain authority, track high-trust backlinks, complete AI growth tasks, and outrank local competitors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              {syncing ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <RefreshCw size={13} />}
              <span>{syncing ? 'Scanning Web...' : 'Sync Backlinks'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleGenerateTasks}
              disabled={generatingTasks}
              className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {generatingTasks ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <Sparkles size={13} className="text-[#cc785c]" />}
              <span>Generate AI Tasks</span>
            </Button>
          </div>
        </div>

        {/* Feedback / Notices */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-800 font-sans">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-sans">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* High-Level Authority Score Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Main Score Box */}
          <div className="sm:col-span-2 lg:col-span-2 p-5 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82] block mb-1">
                  Overall Authority Score (0-100)
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-serif font-bold text-[#141413]">
                    {scoreData?.overallScore || overview?.authority_score || 48}
                  </span>
                  <span className="text-xs font-mono text-[#8e8b82]">/ 100</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${tierBadge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tierBadge.dot}`} />
                    {scoreData?.tier || 'Growing Authority'}
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c]">
                <Award size={20} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e6dfd8]/60">
              <p className="text-xs text-[#6c6a64] font-sans">
                {tierBadge.desc}
              </p>
            </div>
          </div>

          {/* Metric Box 1: Referring Domains */}
          <div className="p-5 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82]">Referring Domains</span>
              <Globe size={16} className="text-[#0073aa]" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-serif font-bold text-[#141413]">
                {overview?.referring_domains || referringDomains.length || 0}
              </span>
              <span className="text-[11px] text-[#6c6a64] block mt-1">
                Unique verified root domains
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-[#e6dfd8]/60 text-[11px] font-mono text-emerald-700 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>+{overview?.new_backlinks_30d || 0} this month</span>
            </div>
          </div>

          {/* Metric Box 2: Total Backlinks */}
          <div className="p-5 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82]">Total Backlinks</span>
              <Link2 size={16} className="text-[#cc785c]" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-serif font-bold text-[#141413]">
                {overview?.total_backlinks || backlinks.length || 0}
              </span>
              <span className="text-[11px] text-[#6c6a64] block mt-1">
                {overview?.dofollow_backlinks || backlinks.filter(b => b.dofollow === 1 || b.follow_type === 'dofollow').length} dofollow links
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-[#e6dfd8]/60 text-[11px] font-mono text-[#8e8b82] flex items-center justify-between">
              <span>Task Progress:</span>
              <strong className="text-[#141413]">{taskProgress.completionRate}%</strong>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#e6dfd8] overflow-x-auto pb-px">
          {[
            { id: 'score', label: '1. Authority Score & Breakdown', icon: Award },
            { id: 'tasks', label: `2. Growth Tasks (${taskProgress.completed}/${taskProgress.total})`, icon: ListTodo },
            { id: 'backlinks', label: `3. Backlink Overview (${backlinks.length})`, icon: Link2 },
            { id: 'recommendations', label: '4. AI Recommendations', icon: Sparkles },
            { id: 'competitors', label: `5. Competitor Gaps (${competitors.length})`, icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-white border-[#cc785c] text-[#141413] shadow-2xs font-bold'
                    : 'border-transparent text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de]/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#cc785c]' : 'text-[#8e8b82]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: AUTHORITY SCORE BREAKDOWN (PHASE 5) */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">
                  Authority Score Factor Breakdown (0-100)
                </h2>
                <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                  Rankora’s algorithmic scoring model measures multi-vector online trust: domain diversity, authority link weight, local NAP citations, brand reach, and DOM technical health.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(scoreData?.factors || {}).map(([key, factor]: [string, any]) => {
                  const percent = Math.round((factor.score / factor.max) * 100);
                  return (
                    <div key={key} className="p-4 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-[#141413]">{factor.label}</span>
                        <span className="text-xs font-mono font-bold text-[#cc785c]">
                          {factor.score} / {factor.max} pts
                        </span>
                      </div>
                      <div className="w-full bg-[#efe9de] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#cc785c] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#6c6a64] font-sans flex items-center justify-between">
                        <span>{factor.details}</span>
                        <span className="font-mono text-[10px] text-[#8e8b82]">{percent}%</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Tier Ranges Card */}
              <div className="p-4 rounded-xl bg-[#f5f1ea] border border-[#e6dfd8] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className={`p-3 rounded-lg border ${scoreData?.overallScore <= 30 ? 'bg-white border-rose-300 font-bold' : 'bg-transparent border-[#e6dfd8] text-[#8e8b82]'}`}>
                  <span className="text-[10px] uppercase block">0 - 30</span>
                  <span className="text-rose-700">Low Authority</span>
                  <p className="text-[10px] text-[#6c6a64] mt-1 font-sans">Vulnerable to competitors with fresh local link profiles.</p>
                </div>
                <div className={`p-3 rounded-lg border ${scoreData?.overallScore > 30 && scoreData?.overallScore <= 70 ? 'bg-white border-amber-300 font-bold' : 'bg-transparent border-[#e6dfd8] text-[#8e8b82]'}`}>
                  <span className="text-[10px] uppercase block">31 - 70</span>
                  <span className="text-amber-800">Growing Authority</span>
                  <p className="text-[10px] text-[#6c6a64] mt-1 font-sans">Active foundation; needs structured PR tasks to dominate top 3 ranks.</p>
                </div>
                <div className={`p-3 rounded-lg border ${scoreData?.overallScore > 70 ? 'bg-white border-emerald-300 font-bold' : 'bg-transparent border-[#e6dfd8] text-[#8e8b82]'}`}>
                  <span className="text-[10px] uppercase block">71 - 100</span>
                  <span className="text-emerald-700">Strong Authority</span>
                  <p className="text-[10px] text-[#6c6a64] mt-1 font-sans">Dominant market presence with defensible referral trust.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GROWTH TASKS (PHASE 3 & 4) */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            
            {/* Task Progress & Filter Header */}
            <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#141413]">
                    AI Authority Growth Tasks
                  </h2>
                  <p className="text-xs text-[#6c6a64] font-sans">
                    Actionable digital PR tasks generated specifically for {activeBusiness?.name || 'your business'} across high-authority web platforms.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs">
                    <span className="text-[#8e8b82]">Completed: </span>
                    <strong className="text-[#141413]">{taskProgress.completed} of {taskProgress.total}</strong>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateTasks}
                    disabled={generatingTasks}
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    {generatingTasks ? <RefreshCw size={12} className="animate-spin text-[#cc785c]" /> : <Sparkles size={12} className="text-[#cc785c]" />}
                    <span>Refresh Tasks</span>
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#efe9de] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress.completionRate}%` }}
                />
              </div>

              {/* Platform Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2">
                {[
                  { id: 'all', label: 'All Platforms' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'quora', label: 'Quora' },
                  { id: 'reddit', label: 'Reddit' },
                  { id: 'pinterest', label: 'Pinterest' },
                  { id: 'directories', label: 'Local Directories' },
                  { id: 'guest', label: 'Guest Posts' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTaskPlatformFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      taskPlatformFilter === tab.id 
                        ? 'bg-[#141413] text-white font-bold' 
                        : 'bg-[#faf9f5] border border-[#e6dfd8] text-[#6c6a64] hover:text-[#141413]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.length === 0 ? (
                <div className="md:col-span-2 p-12 bg-white border border-[#e6dfd8] rounded-2xl text-center space-y-3">
                  <ListTodo size={32} className="text-[#cc785c] mx-auto" />
                  <h3 className="font-serif font-bold text-base text-[#141413]">No Growth Tasks Found</h3>
                  <p className="text-xs text-[#6c6a64] max-w-md mx-auto font-sans">
                    Click "Generate AI Tasks" to produce customized authority building blueprints across Medium, Quora, Reddit, and local directories.
                  </p>
                  <Button size="sm" onClick={handleGenerateTasks} className="bg-[#141413] text-white text-xs">
                    Generate AI Tasks
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isInProgress = task.status === 'in_progress';

                  return (
                    <div 
                      key={task.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-200' 
                          : isInProgress 
                          ? 'bg-white border-[#cc785c]/60 shadow-xs' 
                          : 'bg-white border-[#e6dfd8] shadow-2xs hover:border-[#cc785c]/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-[#faf9f5] border border-[#e6dfd8]">
                              {getPlatformIcon(task.platform)}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#141413]">
                              {task.platform}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              task.impact === 'high' ? 'bg-amber-100 text-amber-900' : 'bg-[#efe9de] text-[#6c6a64]'
                            }`}>
                              Impact: {task.impact}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#faf9f5] text-[#8e8b82] border border-[#e6dfd8]">
                              {task.difficulty}
                            </span>
                          </div>
                        </div>

                        <h3 className={`font-serif font-bold text-sm leading-snug ${isCompleted ? 'text-emerald-950 line-through' : 'text-[#141413]'}`}>
                          {task.title}
                        </h3>

                        <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="pt-4 mt-4 border-t border-[#e6dfd8]/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#8e8b82]">
                          Status: <strong className={isCompleted ? 'text-emerald-700' : isInProgress ? 'text-[#cc785c]' : 'text-[#6c6a64]'}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {task.status !== 'pending' && (
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'pending')}
                              disabled={updatingTaskId === task.id}
                              className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[#faf9f5] border border-[#e6dfd8] text-[#8e8b82] hover:text-[#141413] cursor-pointer"
                            >
                              Reset
                            </button>
                          )}

                          {task.status !== 'in_progress' && !isCompleted && (
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                              disabled={updatingTaskId === task.id}
                              className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                            >
                              Start
                            </button>
                          )}

                          <button
                            onClick={() => handleTaskStatusChange(task.id, isCompleted ? 'pending' : 'completed')}
                            disabled={updatingTaskId === task.id}
                            className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-[#141413] text-[#faf9f5] hover:bg-[#252320]'
                            }`}
                          >
                            <Check size={12} />
                            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BACKLINK OVERVIEW */}
        {activeTab === 'backlinks' && (
          <div className="space-y-4">
            <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#141413]">
                    Backlink Profile Explorer
                  </h2>
                  <p className="text-xs text-[#6c6a64] font-sans">
                    Live backlink index tracking referring domains, anchor text distribution, and dofollow trust signals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-[#8e8b82]" />
                    <input
                      type="text"
                      placeholder="Search domain or anchor..."
                      value={backlinksSearch}
                      onChange={(e) => setBacklinksSearch(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs font-mono bg-[#faf9f5] border border-[#e6dfd8] rounded-xl focus:bg-white focus:outline-none focus:border-[#cc785c]"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-[#efe9de] p-1 rounded-xl">
                    <button
                      onClick={() => setBacklinksFilter('all')}
                      className={`px-2.5 py-0.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                        backlinksFilter === 'all' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setBacklinksFilter('dofollow')}
                      className={`px-2.5 py-0.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                        backlinksFilter === 'dofollow' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64]'
                      }`}
                    >
                      Dofollow
                    </button>
                    <button
                      onClick={() => setBacklinksFilter('nofollow')}
                      className={`px-2.5 py-0.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                        backlinksFilter === 'nofollow' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64]'
                      }`}
                    >
                      Nofollow
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-[#e6dfd8] rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#faf9f5] border-b border-[#e6dfd8] text-[#8e8b82] uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Source Domain / URL</th>
                      <th className="py-2.5 px-4 font-bold">Anchor Text</th>
                      <th className="py-2.5 px-3 font-bold text-center">DA Score</th>
                      <th className="py-2.5 px-3 font-bold text-center">Type</th>
                      <th className="py-2.5 px-4 font-bold">Discovered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd8]/60 bg-white">
                    {filteredBacklinks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-[#8e8b82]">
                          No backlinks found matching your filters. Click "Sync Backlinks" to trigger a fresh scan.
                        </td>
                      </tr>
                    ) : (
                      filteredBacklinks.map((link, idx) => {
                        const isDofollow = link.dofollow === 1 || link.follow_type === 'dofollow';
                        const score = Number(link.authority_score) || 30;

                        return (
                          <tr key={link.id || idx} className="hover:bg-[#faf9f5]/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#141413] flex items-center gap-1.5">
                                <span>{link.domain || link.source_domain || 'example.com'}</span>
                                {link.source_url && (
                                  <a href={link.source_url} target="_blank" rel="noreferrer" className="text-[#8e8b82] hover:text-[#141413]">
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8e8b82] truncate block max-w-xs">
                                {link.source_url || link.url || '/'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-[#141413]">
                              <span className="px-2 py-0.5 rounded bg-[#efe9de]/60 border border-[#e6dfd8] text-[11px]">
                                {link.anchor_text || '(Generic Brand Mention)'}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                score >= 50 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                DA {score}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                isDofollow ? 'bg-emerald-50 text-emerald-700' : 'bg-[#efe9de] text-[#8e8b82]'
                              }`}>
                                {isDofollow ? 'dofollow' : 'nofollow'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-[#8e8b82] text-[11px]">
                              {link.first_seen ? new Date(link.first_seen).toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI RECOMMENDATIONS & OUTREACH */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Opportunities List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#141413]">
                      High-Priority Citation & Link Targets
                    </h2>
                    <p className="text-xs text-[#6c6a64] font-sans">
                      Verified directories, local alliances, and niche community resources ready for partnership outreach.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {opportunities.length === 0 ? (
                      <p className="text-xs text-[#8e8b82] py-4">No opportunities discovered yet.</p>
                    ) : (
                      opportunities.map((opp, idx) => (
                        <div key={opp.id || idx} className="p-4 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-[#141413]">{opp.name || opp.source_domain}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#efe9de] text-[#6c6a64] uppercase font-bold">
                                {opp.type || 'Directory'}
                              </span>
                            </div>
                            <p className="text-xs text-[#6c6a64] font-sans leading-relaxed max-w-lg">
                              {opp.why_relevant || opp.evidence?.why_relevant || 'Authoritative local citation source.'}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleGenerateEmail(opp)}
                            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold shrink-0 flex items-center gap-1.5"
                          >
                            <Mail size={12} className="text-[#cc785c]" />
                            <span>Draft Outreach</span>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Outreach Email Modal / Drawer */}
              <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#cc785c] flex items-center gap-1">
                      <Sparkles size={12} /> AI Outreach Copywriter
                    </span>
                    {copied && <span className="text-[10px] font-mono text-emerald-600 font-bold">Copied!</span>}
                  </div>

                  {generatingEmail ? (
                    <div className="py-16 text-center text-xs font-mono text-[#8e8b82] space-y-2">
                      <RefreshCw size={18} className="animate-spin text-[#cc785c] mx-auto" />
                      <p>Drafting personalized outreach email...</p>
                    </div>
                  ) : outreachEmail ? (
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-[10px] uppercase text-[#8e8b82] block mb-1">Subject:</label>
                        <div className="p-2.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg font-bold text-[#141413]">
                          {outreachEmail.subject}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-[#8e8b82] block mb-1">Email Body:</label>
                        <textarea
                          readOnly
                          rows={8}
                          value={outreachEmail.body}
                          className="w-full p-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs leading-relaxed text-[#141413] resize-none"
                        />
                      </div>

                      <Button
                        size="sm"
                        onClick={handleCopyEmail}
                        className="w-full bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Copy size={13} />
                        <span>Copy Email to Clipboard</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#8e8b82] space-y-2">
                      <Mail size={24} className="text-[#8e8b82]/60 mx-auto" />
                      <p className="font-serif text-sm text-[#141413]">Select an Opportunity</p>
                      <p className="text-[11px] max-w-xs mx-auto">
                        Click "Draft Outreach" on any citation target to generate a professional, high-converting partnership email.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-[10px] font-mono text-[#8e8b82]">
                  💡 Tip: Mention mutual community value and accurate directory listings for highest response rates.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: COMPETITOR GAPS */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-[#e6dfd8] rounded-2xl shadow-2xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#141413]">
                    Competitor Backlink Gap Radar
                  </h2>
                  <p className="text-xs text-[#6c6a64] font-sans">
                    Identify high-authority domains linking to your local competitors where your business is currently missing.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleAnalyzeGap}
                  disabled={analyzingGap}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5"
                >
                  {analyzingGap ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <Target size={13} className="text-[#cc785c]" />}
                  <span>Scan Competitor Gap</span>
                </Button>
              </div>

              {/* Add Competitor Domain Form */}
              <form onSubmit={handleAddCompetitor} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter competitor domain (e.g. competitor.com)..."
                  value={newCompetitorDomain}
                  onChange={(e) => setNewCompetitorDomain(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs font-mono bg-[#faf9f5] border border-[#e6dfd8] rounded-xl focus:bg-white focus:outline-none focus:border-[#cc785c]"
                />
                <Button size="sm" type="submit" disabled={addingCompetitor} className="bg-[#cc785c] text-white text-xs font-semibold">
                  {addingCompetitor ? 'Adding...' : 'Add Competitor'}
                </Button>
              </form>

              {/* Gap Radar List */}
              <div className="space-y-3">
                {linkGaps.length === 0 ? (
                  <div className="p-8 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl text-center text-xs text-[#8e8b82] space-y-2">
                    <Target size={24} className="text-[#cc785c] mx-auto" />
                    <p className="font-serif font-bold text-sm text-[#141413]">No Link Gaps Scanned Yet</p>
                    <p>Click "Scan Competitor Gap" to uncover valuable link opportunities earned by your competitors.</p>
                  </div>
                ) : (
                  linkGaps.map((gap, idx) => (
                    <div key={gap.id || idx} className="p-4 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#141413]">{gap.referringDomain}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            Competitor Link Gap
                          </span>
                        </div>
                        <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
                          Linked to: <strong>{gap.competitorName}</strong> ({gap.competitorDomain}) &bull; {gap.whyItMatters}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateEmail({ source_domain: gap.referringDomain, why_relevant: gap.whyItMatters })}
                        className="text-xs font-semibold shrink-0"
                      >
                        Claim Opportunity
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
export default AuthorityBuilder;
