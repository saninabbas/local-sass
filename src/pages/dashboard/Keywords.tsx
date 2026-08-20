import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  fetchRankingsOverview, 
  addRankingKeyword, 
  deleteRankingKeyword, 
  checkRanking, 
  bulkCheckRankings, 
  fetchRankingHistory, 
  getDashboard 
} from '../../lib/api';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  RefreshCw, 
  Trash2, 
  MapPin, 
  ExternalLink,
  AlertCircle,
  Sparkles,
  Zap,
  Layers,
  Monitor,
  Smartphone,
  History,
  X,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface TrackedRankingKeyword {
  id: string;
  keyword: string;
  location: string;
  countryCode?: string;
  languageCode?: string;
  device?: 'desktop' | 'mobile';
  currentPosition: number | null;
  previousPosition: number | null;
  positionChange: number | null;
  status: 'NEW' | 'IMPROVED' | 'DECLINED' | 'STABLE' | 'LOST' | 'NOT_RANKING' | 'UP' | 'DOWN' | 'NOT FOUND' | 'UNAVAILABLE';
  rankingUrl?: string | null;
  lastCheckedAt: string;
  bestCompetitor?: string;
}

export function Keywords() {
  const [keywords, setKeywords] = useState<TrackedRankingKeyword[]>([]);
  const [providerStatus, setProviderStatus] = useState<string>('NOT_CONFIGURED');
  const [providerName, setProviderName] = useState<string>('Unconfigured');
  const [kpis, setKpis] = useState<any>({
    totalKeywords: 0,
    top3: 0,
    top10: 0,
    top20: 0,
    notRanking: 0,
    averagePosition: null
  });
  const [visibilityScore, setVisibilityScore] = useState<number>(0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // History Drawer State
  const [selectedKwHistory, setSelectedKwHistory] = useState<any | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyDays, setHistoryDays] = useState<number>(30);
  
  // New keyword form
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('US');
  const [newDevice, setNewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [activeFilter, setActiveFilter] = useState<'all' | 'improved' | 'declined' | 'top3' | 'top10' | 'top20' | 'notranking'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, rankingOverview] = await Promise.all([
        getDashboard().catch(() => null),
        fetchRankingsOverview().catch(() => null)
      ]);
      
      setDashboardData(dash);
      if (rankingOverview && rankingOverview.data) {
        setProviderStatus(rankingOverview.data.providerStatus || 'NOT_CONFIGURED');
        setProviderName(rankingOverview.data.providerName || 'Unconfigured');
        setKpis(rankingOverview.data.kpis || {});
        setVisibilityScore(rankingOverview.data.visibilityScore || 0);
        
        const rawKws = rankingOverview.data.keywords || [];
        setKeywords(rawKws.map((k: any) => ({
          id: k.id,
          keyword: k.keyword,
          location: k.location || dash?.business?.city || 'United States',
          countryCode: k.country_code || k.countryCode || 'US',
          device: k.device || 'desktop',
          currentPosition: k.current_position !== undefined ? k.current_position : k.currentPosition,
          previousPosition: k.previous_position !== undefined ? k.previous_position : k.previousPosition,
          positionChange: k.position_change !== undefined ? k.position_change : k.positionChange,
          status: k.status || (k.current_position ? 'STABLE' : 'NOT_RANKING'),
          rankingUrl: k.ranking_url || k.rankingUrl,
          lastCheckedAt: k.last_checked_at || k.lastCheckedAt
        })));
      }
    } catch (err) {
      console.error("Failed to load rankings data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (dashboardData?.business?.city) {
      setNewLocation(dashboardData.business.city);
    }
  }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setAdding(true);
    try {
      const res = await addRankingKeyword({
        keyword: newKeyword.trim(),
        location: newLocation.trim() || dashboardData?.business?.city || 'United States',
        countryCode: newCountryCode.trim() || 'US',
        device: newDevice
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Keyword "${newKeyword.trim()}" tracked! Position: ${res.data?.currentPosition ? '#' + res.data.currentPosition : 'Not ranking yet'}`
        });
      }

      setNewKeyword('');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: "Failed to track keyword: " + (err.message || 'Unknown error') });
    } finally {
      setAdding(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Stop tracking this keyword?")) return;
    try {
      await deleteRankingKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
      setFeedback({ type: 'success', message: "Keyword removed from active tracking." });
    } catch (err: any) {
      setFeedback({ type: 'error', message: "Failed to delete keyword." });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCheckSingle = async (kw: TrackedRankingKeyword) => {
    setCheckingId(kw.id);
    try {
      const res = await checkRanking(kw.id);
      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: `Rank checked for "${kw.keyword}": ${res.data.position ? '#' + res.data.position : 'Not ranking'} (${res.data.status})`
        });
        await loadData();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to check ranking.'
      });
    } finally {
      setCheckingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleBulkRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await bulkCheckRankings();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Batch ranking check complete: ${res.updated || 0} keywords updated!`
        });
        await loadData();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: "Refresh error: " + (err.message || 'Failed to refresh SERP rankings.')
      });
    } finally {
      setRefreshing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleOpenHistory = async (kw: TrackedRankingKeyword, days: number = 30) => {
    setSelectedKwHistory(kw);
    setHistoryDays(days);
    setLoadingHistory(true);
    try {
      const res = await fetchRankingHistory(kw.id, days);
      if (res.success && res.data) {
        setHistorySnapshots(res.data.snapshots || []);
      }
    } catch (err: any) {
      console.warn("Failed to load ranking history:", err);
      setHistorySnapshots([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter logic
  const filteredKeywords = keywords.filter(k => {
    if (searchFilter && !k.keyword.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    const st = (k.status || '').toUpperCase();
    if (activeFilter === 'improved') return st === 'IMPROVED' || st === 'UP' || (typeof k.positionChange === 'number' && k.positionChange > 0);
    if (activeFilter === 'declined') return st === 'DECLINED' || st === 'DOWN' || (typeof k.positionChange === 'number' && k.positionChange < 0);
    if (activeFilter === 'top3') return k.currentPosition !== null && k.currentPosition <= 3;
    if (activeFilter === 'top10') return k.currentPosition !== null && k.currentPosition <= 10;
    if (activeFilter === 'top20') return k.currentPosition !== null && k.currentPosition <= 20;
    if (activeFilter === 'notranking') return k.currentPosition === null || st === 'NOT_RANKING' || st === 'LOST' || st === 'NOT FOUND';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Search size={12} />
                SERP & Local Ranking Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Keyword Rankings & SERP Telemetry
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Live Google search ranking telemetry, local pack visibility, and position trajectory for <strong className="text-[#141413]">{dashboardData?.business?.name || 'Current Project'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRefresh}
              disabled={refreshing || loading}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
              <span>Bulk Check Rankings</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus size={14} className="text-[#cc785c]" />
              <span>Track New Keyword</span>
            </Button>
          </div>
        </div>

        {/* SERP Provider Status Alert when Unconfigured */}
        {providerStatus === 'NOT_CONFIGURED' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>SERP Status: NOT_CONFIGURED</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/20 text-amber-800">Real Provider Needed</span>
                </div>
                <p className="text-[#6c6a64] mt-0.5">
                  Connect a SERP provider (e.g. Serper, DataForSEO, BrightLocal, Semrush) to enable real live Google search ranking telemetry. No fake rankings are displayed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* KPI Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-[#8e8b82] uppercase tracking-wider block mb-0.5">Tracked</span>
            <div className="text-2xl font-semibold text-[#141413] tracking-tight">{kpis.totalKeywords || keywords.length}</div>
            <span className="text-[10px] text-[#6c6a64]">Active Queries</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase tracking-wider block mb-0.5">Top 3</span>
            <div className="text-2xl font-semibold text-emerald-700 tracking-tight">{kpis.top3}</div>
            <span className="text-[10px] text-emerald-600">Prime Visibility</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-[#141413] font-semibold uppercase tracking-wider block mb-0.5">Top 10</span>
            <div className="text-2xl font-semibold text-[#141413] tracking-tight">{kpis.top10}</div>
            <span className="text-[10px] text-[#6c6a64]">Page 1 Rank</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-[#8e8b82] uppercase tracking-wider block mb-0.5">Top 20</span>
            <div className="text-2xl font-semibold text-[#141413] tracking-tight">{kpis.top20}</div>
            <span className="text-[10px] text-[#8e8b82]">Striking Range</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider block mb-0.5">Unranked</span>
            <div className="text-2xl font-semibold text-amber-700 tracking-tight">{kpis.notRanking}</div>
            <span className="text-[10px] text-amber-600">Pos &gt; 100</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
            <span className="text-[10px] font-mono text-[#cc785c] font-semibold uppercase tracking-wider block mb-0.5">Avg Pos</span>
            <div className="text-2xl font-semibold text-[#141413] tracking-tight">
              {kpis.averagePosition ? `#${kpis.averagePosition}` : '-'}
            </div>
            <span className="text-[10px] text-[#6c6a64]">Across Ranked</span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="p-2.5 bg-white rounded-2xl border border-[#e6dfd8] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All (${keywords.length})` },
              { id: 'improved', label: 'Improved' },
              { id: 'declined', label: 'Declined' },
              { id: 'top3', label: `Top 3 (${kpis.top3})` },
              { id: 'top10', label: `Top 10 (${kpis.top10})` },
              { id: 'top20', label: `Top 20 (${kpis.top20})` },
              { id: 'notranking', label: `Unranked (${kpis.notRanking})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#141413] text-[#faf9f5] font-bold'
                    : 'text-[#6c6a64] hover:bg-[#efe9de]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8b82]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search queries..."
              className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
            />
          </div>
        </div>

        {/* Keywords Table */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2.5" />
            <span>Loading ranking data...</span>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e6dfd8] p-6 space-y-2">
            <Search size={28} className="text-[#8e8b82] mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-[#141413]">No keywords found</h3>
            <p className="text-xs text-[#6c6a64] max-w-sm mx-auto mb-3">
              Add your first keyword to start tracking rankings.
            </p>
            <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-[#141413] text-[#faf9f5]">
              Add Keyword
            </Button>
          </div>
        ) : (
          <div className="bg-[#faf9f5] rounded-2xl border border-[#e6dfd8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#efe9de] border-b border-[#e6dfd8] text-[10px] font-mono uppercase text-[#6c6a64] tracking-wider">
                    <th className="p-3 font-semibold">Keyword</th>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">Position</th>
                    <th className="p-3 font-semibold">Change</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">URL</th>
                    <th className="p-3 font-semibold">Updated</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8]">
                  {filteredKeywords.map((kw) => {
                    const isImproved = kw.status === 'IMPROVED' || kw.status === 'UP' || (typeof kw.positionChange === 'number' && kw.positionChange > 0);
                    const isDeclined = kw.status === 'DECLINED' || kw.status === 'DOWN' || (typeof kw.positionChange === 'number' && kw.positionChange < 0);
                    const isChecking = checkingId === kw.id;

                    return (
                      <tr key={kw.id} className="hover:bg-[#efe9de]/50 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-[#141413] text-xs">{kw.keyword}</div>
                          {kw.bestCompetitor && (
                            <span className="text-[10px] text-[#8e8b82] font-mono block">
                              Leader: {kw.bestCompetitor}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-xs text-[#6c6a64]">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#cc785c] shrink-0" />
                            <span>{kw.location} ({kw.countryCode || 'US'})</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#8e8b82] mt-0.5">
                            {kw.device === 'mobile' ? <Smartphone size={10} /> : <Monitor size={10} />}
                            <span className="capitalize">{kw.device || 'desktop'}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono">
                          {kw.currentPosition ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-base font-bold ${
                                kw.currentPosition <= 3 ? 'text-emerald-700' : kw.currentPosition <= 10 ? 'text-[#141413]' : 'text-[#6c6a64]'
                              }`}>
                                #{kw.currentPosition}
                              </span>
                              {kw.currentPosition <= 3 && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                  Top 3
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#8e8b82] font-semibold">&gt; 100</span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-xs">
                          {typeof kw.positionChange === 'number' && kw.positionChange !== 0 ? (
                            <span className={`inline-flex items-center gap-0.5 font-bold ${
                              kw.positionChange > 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {kw.positionChange > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              <span>{kw.positionChange > 0 ? `+${kw.positionChange}` : kw.positionChange}</span>
                            </span>
                          ) : (
                            <span className="text-[#8e8b82] flex items-center gap-0.5">
                              <Minus size={12} />
                              <span>0</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            isImproved 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isDeclined
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : kw.status === 'NEW'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-[#efe9de] text-[#6c6a64] border-[#e6dfd8]'
                          }`}>
                            {kw.status || 'NOT_RANKING'}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-[#6c6a64] max-w-[160px] truncate">
                          {kw.rankingUrl ? (
                            <a
                              href={kw.rankingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#cc785c] hover:underline flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{kw.rankingUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink size={10} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[#8e8b82]">-</span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-[10px] text-[#8e8b82]">
                          {kw.lastCheckedAt ? new Date(kw.lastCheckedAt).toLocaleDateString() : 'Pending'}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckSingle(kw)}
                              disabled={isChecking}
                              className="text-[10px] font-semibold py-1 px-2 flex items-center gap-1"
                            >
                              <RefreshCw size={11} className={isChecking ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
                              <span>Check</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenHistory(kw, 30)}
                              className="text-[10px] font-semibold py-1 px-2 flex items-center gap-1"
                            >
                              <History size={11} className="text-[#8e8b82]" />
                              <span>History</span>
                            </Button>

                            <button
                              onClick={() => handleDelete(kw.id)}
                              className="p-1.5 rounded-lg text-[#8e8b82] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Stop tracking"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* TRACK NEW KEYWORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#e6dfd8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-[#cc785c]" />
                <h3 className="font-serif font-bold text-base text-[#141413]">Track New Keyword in SERP</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                  Target Keyword / Search Query *
                </label>
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. dentist near me, emergency plumbing, roof repair"
                  className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    Search Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Islamabad, New York, London"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())}
                    placeholder="US, PK, GB, CA"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                  Device Search Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDevice('desktop')}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer ${
                      newDevice === 'desktop' ? 'bg-[#141413] text-white font-bold border-[#141413]' : 'bg-[#faf9f5] border-[#e6dfd8] text-[#6c6a64]'
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDevice('mobile')}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer ${
                      newDevice === 'mobile' ? 'bg-[#141413] text-white font-bold border-[#141413]' : 'bg-[#faf9f5] border-[#e6dfd8] text-[#6c6a64]'
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6dfd8] flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} type="button">
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={adding || !newKeyword.trim()} className="bg-[#141413] text-[#faf9f5]">
                  {adding ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <Plus size={13} className="text-[#cc785c]" />}
                  <span>Track & Run Initial SERP Check</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RANKING HISTORY TRAJECTORY MODAL */}
      {selectedKwHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#141413] text-[#faf9f5] flex items-center justify-center">
                  <History size={18} className="text-[#cc785c]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#141413]">
                    "{selectedKwHistory.keyword}"
                  </h3>
                  <p className="text-xs text-[#8e8b82] font-mono">
                    Location: {selectedKwHistory.location} &bull; Device: {selectedKwHistory.device || 'desktop'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKwHistory(null)}
                className="p-1.5 rounded-xl text-[#8e8b82] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Range Toggle */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#e6dfd8]">
              <div className="flex items-center gap-1 text-xs font-mono text-[#8e8b82]">
                <BarChart3 size={14} className="text-[#cc785c]" />
                <span>Historical Snapshots (Lower Position = Better)</span>
              </div>

              <div className="flex items-center gap-1 bg-[#efe9de] p-1 rounded-xl text-xs font-mono">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleOpenHistory(selectedKwHistory, d)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      historyDays === d ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64] hover:text-[#141413]'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* History Table / Points */}
            {loadingHistory ? (
              <div className="py-12 text-center text-xs font-mono text-[#8e8b82]">
                <RefreshCw size={18} className="animate-spin text-[#cc785c] mx-auto mb-2" />
                <span>Loading ranking snapshots...</span>
              </div>
            ) : historySnapshots.length === 0 ? (
              <div className="py-12 text-center text-xs font-sans text-[#8e8b82] space-y-1">
                <p className="font-serif text-base text-[#141413]">No Snapshots Recorded Yet</p>
                <p className="text-[11px]">Subsequent automated and manual checks will accumulate historical trajectory points here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-white rounded-xl border border-[#e6dfd8] overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#efe9de] text-[10px] text-[#6c6a64] uppercase border-b border-[#e6dfd8]">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Rank Position</th>
                        <th className="p-3">Device</th>
                        <th className="p-3">Observed URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dfd8]">
                      {historySnapshots.map((snap, idx) => (
                        <tr key={idx} className="hover:bg-[#faf9f5]">
                          <td className="p-3 text-[#8e8b82] text-[11px]">
                            {new Date(snap.checked_at).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-[#141413]">
                            {snap.position ? (
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                snap.position <= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'
                              }`}>
                                #{snap.position}
                              </span>
                            ) : (
                              <span className="text-[#8e8b82]">&gt; 100</span>
                            )}
                          </td>
                          <td className="p-3 text-[#6c6a64] capitalize">{snap.device || 'desktop'}</td>
                          <td className="p-3 text-[#8e8b82] truncate max-w-[200px]">{snap.ranking_url || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#e6dfd8] flex justify-end">
              <Button size="sm" onClick={() => setSelectedKwHistory(null)} className="bg-[#141413] text-[#faf9f5]">
                Close Trajectory View
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
