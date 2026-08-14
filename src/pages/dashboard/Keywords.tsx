import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchKeywords, addKeyword, deleteKeyword, refreshKeywords, getDashboard } from '../../lib/api';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Award,
  Zap,
  MapPin,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { KeywordItem } from '../../types';

export function Keywords() {
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New keyword form
  const [newKeyword, setNewKeyword] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newZip, setNewZip] = useState('');

  const [activeFilter, setActiveFilter] = useState<'all' | 'improving' | 'declining' | 'top3' | 'top10' | 'unranked'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, data] = await Promise.all([
        getDashboard().catch(() => null),
        fetchKeywords().catch(() => [])
      ]);
      setDashboardData(dash);
      
      if (Array.isArray(data)) {
        const mapped: KeywordItem[] = data.map((k: any) => ({
          id: k.id || String(Math.random()),
          keyword: k.keyword,
          intent: k.intent || 'LOCAL',
          currentRank: k.current_position !== undefined && k.current_position !== null ? k.current_position : null,
          previousRank: k.previous_position !== undefined && k.previous_position !== null ? k.previous_position : null,
          localPackRank: k.local_pack_position || null,
          change: (k.previous_position && k.current_position) ? k.previous_position - k.current_position : 0,
          bestCompetitor: k.best_competitor || 'Local Competitor',
          competitorRank: k.competitor_position || null,
          opportunity: k.opportunity || 'Optimize primary H1 heading and local schema',
          searchVolume: k.search_volume || 'Available via SERP'
        }));
        setKeywords(mapped);
      } else {
        setKeywords([]);
      }
    } catch (err) {
      console.error(err);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setAdding(true);
    try {
      const fullKeyword = newCity ? `${newKeyword.trim()} in ${newCity.trim()}` : newKeyword.trim();
      await addKeyword(fullKeyword);
      setNewKeyword('');
      setNewCity('');
      setNewZip('');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert("Failed to track keyword: " + (err.message || 'Unknown error'));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Stop tracking this keyword?")) return;
    try {
      await deleteKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      alert("Failed to delete keyword.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshKeywords();
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const city = dashboardData?.business?.city || 'Your Area';

  // Filter logic
  const filteredKeywords = keywords.filter(k => {
    if (searchFilter && !k.keyword.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activeFilter === 'improving') return k.change > 0;
    if (activeFilter === 'declining') return k.change < 0;
    if (activeFilter === 'top3') return k.currentRank !== null && k.currentRank <= 3;
    if (activeFilter === 'top10') return k.currentRank !== null && k.currentRank <= 10;
    if (activeFilter === 'unranked') return k.currentRank === null;
    return true;
  });

  const top3Count = keywords.filter(k => k.currentRank !== null && k.currentRank <= 3).length;
  const top10Count = keywords.filter(k => k.currentRank !== null && k.currentRank <= 10).length;
  const unrankedCount = keywords.filter(k => k.currentRank === null).length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Search className="text-primary-accent" size={26} />
            Local Ranking & Visibility Radar
          </h1>
          <p className="text-xs text-secondary mt-1">
            Real Google localized search positions and Local 3-Pack rankings in <span className="font-semibold text-primary">{city}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || keywords.length === 0}
            className="border-gray-200 bg-white text-primary hover:bg-gray-50 flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-primary-accent" : "text-secondary"} />
            {refreshing ? 'Scanning SERP...' : 'Refresh Live SERP'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 h-9"
          >
            <Plus size={14} />
            <span>Track Keyword</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Tracked Keywords</span>
          <div className="mt-2 text-2xl font-black text-primary">{keywords.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Top 3 Positions</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">{top3Count}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Top 10 (Page 1)</span>
          <div className="mt-2 text-2xl font-black text-primary-accent">{top10Count}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Pending SERP Scan</span>
          <div className="mt-2 text-2xl font-black text-secondary">{unrankedCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${keywords.length})` },
            { id: 'top3', label: `Top 3 (${top3Count})` },
            { id: 'top10', label: `Top 10 (${top10Count})` },
            { id: 'unranked', label: `Unranked (${unrankedCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-primary-accent text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-secondary hover:text-primary border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>
      </div>

      {/* Real Keyword Ranking Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-8">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-secondary font-medium">Fetching real localized ranking telemetry...</span>
          </div>
        ) : keywords.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-primary mb-1">No Local Keywords Tracked Yet</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-5">
              Add your primary local search phrases to track real Google rankings and Google Maps 3-Pack positions.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
            >
              Add First Keyword
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold tracking-wider text-secondary">
                  <th className="py-3.5 px-4 sm:px-6">Keyword Phrase</th>
                  <th className="py-3.5 px-4 text-center">Organic Rank</th>
                  <th className="py-3.5 px-4 text-center">Local Pack</th>
                  <th className="py-3.5 px-4 text-center">Change</th>
                  <th className="py-3.5 px-4">Opportunity Action</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKeywords.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{k.keyword}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-primary-accent uppercase">
                          {k.intent}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {k.currentRank !== null ? (
                        <span className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg text-xs ${
                          k.currentRank <= 3 ? 'bg-emerald-100 text-emerald-800' :
                          k.currentRank <= 10 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          #{k.currentRank}
                        </span>
                      ) : (
                        <span className="text-secondary text-[11px] font-medium">Data unavailable</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {k.localPackRank ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Pack #{k.localPackRank}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {k.change > 0 ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center gap-0.5">
                          <TrendingUp size={12} /> +{k.change}
                        </span>
                      ) : k.change < 0 ? (
                        <span className="text-red-600 font-bold flex items-center justify-center gap-0.5">
                          <TrendingDown size={12} /> {k.change}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-secondary leading-tight">
                      {k.opportunity}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Delete keyword"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TRACK KEYWORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-primary mb-1">Track New Local Search Keyword</h3>
            <p className="text-xs text-secondary mb-4">
              Enter target keyword phrase and location. Rankora will fetch live Google SERP ranking positions.
            </p>
            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Keyword Phrase
                </label>
                <input
                  type="text"
                  placeholder="e.g. emergency plumber, cosmetic dentist"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    City / Market
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chicago"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    ZIP Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 60601"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={adding}
                  className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
                >
                  {adding ? 'Fetching SERP...' : 'Track Keyword'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
