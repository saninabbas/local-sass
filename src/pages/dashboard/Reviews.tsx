import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchApi, 
  connectGoogleBusiness, 
  fetchGbpLocations, 
  selectGbpLocation, 
  fetchGbpHealth 
} from '../../lib/api';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  MessageCircle, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Link2, 
  Edit3, 
  Save, 
  AlertCircle,
  Copy,
  CheckCircle2,
  Filter,
  ExternalLink,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronRight,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSearchParams } from 'react-router-dom';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  owner_reply: string | null;
  reply_status: string;
  source: string;
  created_at: string;
}

interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  responseRate: number;
}

interface ConnectionStatus {
  connected: boolean;
  connection: any | null;
}

export function Reviews() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const integrationQuery = searchParams.get('integration');
  const queryErrorMsg = searchParams.get('msg');

  const [activeMainTab, setActiveMainTab] = useState<'reviews' | 'health' | 'profile'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avgRating: 0, totalReviews: 0, responseRate: 0 });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false, connection: null });
  const [gbpHealth, setGbpHealth] = useState<any | null>(null);
  
  // Locations picker modal
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectingLoc, setSelectingLoc] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(queryErrorMsg || null);

  // Filters & AI Reply State
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'unanswered'>('all');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, reviewsRes, healthRes] = await Promise.all([
        fetchApi('/api/reviews/status').catch(() => ({ connected: false, connection: null })),
        fetchApi('/api/reviews').catch(() => ({ reviews: [], stats: { avgRating: 0, totalReviews: 0, responseRate: 0 } })),
        fetchGbpHealth().catch(() => null)
      ]);

      setConnectionStatus(statusRes || { connected: false, connection: null });
      if (reviewsRes) {
        setReviews(reviewsRes.reviews || []);
        setStats(reviewsRes.stats || { avgRating: 0, totalReviews: 0, responseRate: 0 });
      }
      if (healthRes) {
        setGbpHealth(healthRes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncReviews = async () => {
    setSyncing(true);
    setError(null);
    try {
      await fetchApi('/api/reviews/sync', { method: 'POST' });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to sync Google reviews.');
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchLocations = async () => {
    try {
      const locs = await fetchGbpLocations();
      setAvailableLocations(locs || []);
      setShowLocationPicker(true);
    } catch (err: any) {
      alert("Failed to load Google locations: " + (err.message || 'Please reconnect Google account.'));
    }
  };

  const handleSelectLocation = async (loc: any) => {
    setSelectingLoc(true);
    try {
      await selectGbpLocation({
        locationName: loc.name,
        title: loc.title,
        address: loc.address,
        phone: loc.phone,
        website: loc.website,
        category: loc.category
      });
      setShowLocationPicker(false);
      await loadData();
    } catch (err: any) {
      alert("Failed to select location: " + err.message);
    } finally {
      setSelectingLoc(false);
    }
  };

  const handleGenerateReply = async (review: Review, tone: string = selectedTone) => {
    setGeneratingFor(review.id);
    try {
      const data = await fetchApi('/api/reviews/reply', {
        method: 'POST',
        body: JSON.stringify({
          reviewId: review.id,
          reviewerName: review.reviewer_name,
          rating: review.rating,
          reviewText: review.review_text,
          tone
        })
      });

      if (data && data.reply) {
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, owner_reply: data.reply, reply_status: 'draft' } : r));
        setEditingReply(review.id);
        setEditedReplyText(data.reply);
      }
    } catch (err: any) {
      alert("Failed to generate AI reply: " + (err.message || 'Unknown error'));
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSaveReply = async (reviewId: string, replyText: string) => {
    try {
      await fetchApi('/api/reviews/save-reply', {
        method: 'POST',
        body: JSON.stringify({ reviewId, reply: replyText })
      });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: replyText, reply_status: 'replied' } : r));
      setEditingReply(null);
    } catch (err: any) {
      alert("Failed to save reply: " + (err.message || 'Unknown error'));
    }
  };

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter calculations
  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const neutralReviews = reviews.filter(r => r.rating === 3);
  const negativeReviews = reviews.filter(r => r.rating <= 2);
  const unansweredReviews = reviews.filter(r => !r.owner_reply);

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'positive') return r.rating >= 4;
    if (activeFilter === 'neutral') return r.rating === 3;
    if (activeFilter === 'negative') return r.rating <= 2;
    if (activeFilter === 'unanswered') return !r.owner_reply;
    return true;
  });

  const isConnected = connectionStatus.connected;
  const conn = connectionStatus.connection;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
              <Star className="text-amber-500 fill-amber-500" size={26} />
              Google Business & Reviews Engine
            </h1>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Real Google Business Profile management, live customer review synchronization, and GBP Health scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncReviews}
                disabled={syncing}
                className="border-gray-200 bg-white text-primary hover:bg-gray-50 flex items-center gap-2 text-xs font-semibold h-9 shadow-xs"
              >
                <RefreshCw size={13} className={syncing ? "animate-spin text-primary-accent" : "text-secondary"} />
                {syncing ? 'Syncing Google API...' : 'Sync Reviews'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchLocations}
                className="border-gray-200 bg-white text-primary hover:bg-gray-50 text-xs font-semibold h-9 shadow-xs"
              >
                Switch Location
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={connectGoogleBusiness}
              className="bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 h-9 shadow-xs"
            >
              <Building size={14} />
              <span>CONNECT GOOGLE BUSINESS</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button 
            onClick={connectGoogleBusiness}
            className="underline font-bold hover:text-red-900"
          >
            Reconnect Google
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'reviews', label: `Reviews Manager (${reviews.length})` },
          { id: 'health', label: `GBP Health Score (${gbpHealth?.score || 0}/100)` },
          { id: 'profile', label: 'Connected Business Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeMainTab === tab.id
                ? 'border-primary-accent text-primary-accent'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. REVIEWS MANAGER TAB */}
      {activeMainTab === 'reviews' && (
        <>
          {/* KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-secondary">Total Reviews</span>
              <div className="mt-2 text-2xl font-black text-primary">{reviews.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-secondary">Average Rating</span>
              <div className="mt-2 text-2xl font-black text-amber-600 flex items-center gap-1">
                <span>{stats.avgRating ? stats.avgRating.toFixed(1) : (reviews.length > 0 ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1) : '—')}</span>
                <Star size={16} className="fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-secondary">Positive (4-5★)</span>
              <div className="mt-2 text-2xl font-black text-emerald-600">{positiveReviews.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-secondary">Negative (1-2★)</span>
              <div className="mt-2 text-2xl font-black text-red-600">{negativeReviews.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-secondary">Unanswered</span>
              <div className="mt-2 text-2xl font-black text-primary-accent">{unansweredReviews.length}</div>
            </div>
          </div>

          {!isConnected && reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-4">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-lg font-bold text-primary mb-1">Google Business Profile Not Connected</h2>
              <p className="text-xs text-secondary max-w-md mx-auto mb-6 leading-relaxed">
                Connect your Google Business Profile via OAuth to import live customer reviews, unlock response automation, and sync rating signals.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={connectGoogleBusiness}
                className="bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs h-10 px-6"
              >
                <Building size={15} />
                <span>CONNECT GOOGLE BUSINESS PROFILE</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Sentiment Filter Tabs & Tone Selector */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {[
                    { id: 'all', label: `All (${reviews.length})` },
                    { id: 'positive', label: `Positive (${positiveReviews.length})` },
                    { id: 'neutral', label: `Neutral (${neutralReviews.length})` },
                    { id: 'negative', label: `Negative (${negativeReviews.length})` },
                    { id: 'unanswered', label: `Unanswered (${unansweredReviews.length})` }
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

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-secondary font-medium whitespace-nowrap">AI Tone:</span>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="px-3 py-1 text-xs rounded-xl border border-gray-200 bg-gray-50 text-primary font-medium focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  >
                    <option value="professional">Professional & Courteous</option>
                    <option value="warm">Warm & Appreciative</option>
                    <option value="apologetic">Empathetic & Solution-Oriented</option>
                    <option value="direct">Direct & Concise</option>
                  </select>
                </div>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-4 mb-8">
                {filteredReviews.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-xs">
                    <Star className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <h3 className="text-sm font-bold text-primary">No Reviews Found for this Filter</h3>
                    <p className="text-xs text-secondary mt-1">Select another filter tab or sync live reviews from Google.</p>
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <div 
                      key={review.id}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-primary-accent text-sm">
                            {review.reviewer_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-primary">{review.reviewer_name}</h3>
                              <div className="flex items-center text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-secondary font-mono">
                              {new Date(review.review_date || review.created_at).toLocaleDateString()} via {review.source || 'Google Business'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          review.owner_reply ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {review.owner_reply ? 'Responded' : 'Awaiting Response'}
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs text-secondary leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                        "{review.review_text || 'Rating only provided without text comment.'}"
                      </p>

                      {/* Owner Reply Box */}
                      {review.owner_reply && editingReply !== review.id && (
                        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                              <Sparkles size={12} className="text-primary-accent" />
                              Your Business Reply:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyReply(review.id, review.owner_reply!)}
                                className="text-[11px] text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === review.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                <span>{copiedId === review.id ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReply(review.id);
                                  setEditedReplyText(review.owner_reply!);
                                }}
                                className="text-[11px] text-primary-accent hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-primary leading-relaxed">{review.owner_reply}</p>
                        </div>
                      )}

                      {/* Editing Reply Box */}
                      {editingReply === review.id && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                            Edit Business Response:
                          </label>
                          <textarea
                            value={editedReplyText}
                            onChange={(e) => setEditedReplyText(e.target.value)}
                            className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent min-h-[80px]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingReply(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveReply(review.id, editedReplyText)}
                              className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
                            >
                              Save & Mark Responded
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* AI Generate Reply Trigger */}
                      {!review.owner_reply && editingReply !== review.id && (
                        <div className="pt-2 flex justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleGenerateReply(review)}
                            disabled={generatingFor === review.id}
                            className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
                          >
                            <Sparkles size={13} className={generatingFor === review.id ? "animate-spin" : ""} />
                            <span>{generatingFor === review.id ? 'Generating tailored AI reply...' : 'GENERATE RESPONSE'}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* 2. GBP HEALTH SCORE TAB */}
      {activeMainTab === 'health' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">Google Business Profile Health Score</h2>
              <p className="text-xs text-secondary max-w-xl leading-relaxed">
                Deterministic audit of your Google Business Profile entity signals, NAP completeness, categories, and customer review velocity.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-4xl font-black text-primary">{gbpHealth?.score || 0}/100</span>
                <span className={`block text-xs font-bold uppercase ${
                  (gbpHealth?.score || 0) >= 80 ? 'text-emerald-600' :
                  (gbpHealth?.score || 0) >= 60 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {gbpHealth?.status || 'NOT CONNECTED'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Layers size={18} className="text-primary-accent" />
              What's Complete vs What's Missing
            </h3>

            <div className="space-y-3">
              {(gbpHealth?.breakdown || []).map((item: any, idx: number) => {
                const isDone = item.status === 'COMPLETE';
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-3 ${
                      isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-primary">{item.factor}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
                        <strong className="text-primary">Why it matters:</strong> {item.whyItMatters}
                      </p>
                      {!isDone && (
                        <p className="text-xs text-primary-accent font-medium pt-1">
                          👉 <strong>Recommended Action:</strong> {item.recommendedAction}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. CONNECTED PROFILE TAB */}
      {activeMainTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs mb-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-primary">Connected Google Business Information</h2>
              <p className="text-xs text-secondary">Verified entity data retrieved from your authorized Google account.</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700'
            }`}>
              {isConnected ? 'LIVE SYNC ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>

          {isConnected && conn ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Business Name:</span>
                <p className="text-sm font-bold text-primary">{conn.location_name || 'Your Business'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Primary Category:</span>
                <p className="text-sm font-bold text-primary">{conn.location_category || 'Local Service'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Storefront Address:</span>
                <p className="text-sm font-bold text-primary">{conn.location_address || 'Service Area Business'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Phone Number:</span>
                <p className="text-sm font-bold text-primary">{conn.location_phone || 'Not configured'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Website URI:</span>
                <p className="text-sm font-bold text-primary">{conn.location_website || 'Linked'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-secondary font-semibold">Connected At:</span>
                <p className="text-sm font-bold text-primary">{new Date(conn.connected_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Building className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-primary">No Google Business Profile Connected</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                Authorize your Google account to automatically import your verified address, hours, category, and review telemetry.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={connectGoogleBusiness}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
              >
                Connect Google Account
              </Button>
            </div>
          )}
        </div>
      )}

      {/* LOCATION PICKER MODAL */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-primary-accent" />
                <h3 className="text-sm font-bold text-primary">Select Google Business Location</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5">
              {availableLocations.length === 0 ? (
                <p className="text-xs text-secondary text-center py-6">No authorized locations returned from Google API.</p>
              ) : (
                availableLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(loc)}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50/50 hover:border-primary-accent transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-primary">{loc.title}</h4>
                      <p className="text-[11px] text-secondary">{loc.address || 'Service Area'}</p>
                      {loc.category && <span className="text-[10px] text-primary-accent font-medium">{loc.category}</span>}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={selectingLoc}
                      className="text-xs h-7 px-3 bg-primary-accent text-white"
                    >
                      {selectingLoc ? 'Saving...' : 'Select'}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationPicker(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
