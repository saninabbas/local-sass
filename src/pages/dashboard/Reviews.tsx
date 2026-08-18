import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  connectGoogleBusiness, 
  fetchGbpAccounts,
  fetchGbpLocations, 
  selectGbpLocation, 
  syncGbpReviews,
  fetchGbpMetrics,
  fetchGbpReviews,
  analyzeReviewSentiment,
  generateGbpReviewReply,
  saveOrPublishGbpReply,
  fetchGbpHealth,
  getBusinesses
} from '../../lib/api';
import { 
  Star, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Edit3, 
  AlertCircle,
  Copy,
  CheckCircle2,
  Filter,
  Building,
  AlertTriangle,
  Layers,
  X,
  TrendingUp,
  MessageCircle,
  Send,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  Phone,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSearchParams } from 'react-router-dom';

interface Review {
  id: string;
  business_id?: string;
  google_location_id?: string;
  google_review_id?: string;
  reviewer_name: string;
  reviewer_profile_url?: string;
  reviewer_photo_url?: string;
  rating: number;
  comment?: string;
  review_text?: string;
  review_created_at?: string;
  review_date?: string;
  reply_comment?: string | null;
  owner_reply?: string | null;
  reply_status?: string;
  is_replied?: number | boolean;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentiment_confidence?: number;
  topics?: string | string[];
  source?: string;
  created_at: string;
}

interface ReviewMetrics {
  totalReviews: number;
  averageRating: number;
  starsBreakdown: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
  unansweredReviews: number;
  responseRate: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export function Reviews() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const integrationQuery = searchParams.get('integration');
  const queryErrorMsg = searchParams.get('msg');

  const [activeBusiness, setActiveBusiness] = useState<any | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'reviews' | 'health' | 'profile'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [metrics, setMetrics] = useState<ReviewMetrics>({
    totalReviews: 0,
    averageRating: 0,
    starsBreakdown: { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 },
    unansweredReviews: 0,
    responseRate: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0
  });
  const [trends, setTrends] = useState<any>({
    '7d': null,
    '30d': null,
    '90d': null
  });
  const [activeTrendPeriod, setActiveTrendPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [gbpHealth, setGbpHealth] = useState<any | null>(null);
  const [connectionData, setConnectionData] = useState<any | null>(null);

  // Accounts & Locations discovery modal
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [selectingLoc, setSelectingLoc] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(queryErrorMsg || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(
    integrationQuery === 'success' ? 'Google Business Profile connected and reviews synced successfully.' : null
  );

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<string>('all'); // all | unanswered | positive | negative | 5 | 4 | 3 | 2 | 1
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // AI Reply & Sentiment
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'empathetic' | 'concise'>('professional');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [analyzingFor, setAnalyzingFor] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState<string>('');
  const [savingReply, setSavingReply] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async (bizId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Resolve business
      let currentBiz = activeBusiness;
      if (!currentBiz) {
        const bizRes = await getBusinesses().catch(() => ({ businesses: [] }));
        const list = bizRes.businesses || (Array.isArray(bizRes) ? bizRes : []);
        currentBiz = list.find((b: any) => b.is_default === 1) || list[0] || null;
        setActiveBusiness(currentBiz);
      }

      const targetBizId = bizId || currentBiz?.id;

      // 2. Fetch metrics, reviews, health in parallel
      const [metricsRes, reviewsRes, healthRes] = await Promise.all([
        fetchGbpMetrics(targetBizId).catch(() => ({
          metrics: {
            totalReviews: 0,
            averageRating: 0,
            starsBreakdown: { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 },
            unansweredReviews: 0,
            responseRate: 0,
            positiveCount: 0,
            neutralCount: 0,
            negativeCount: 0
          },
          trends: { '7d': null, '30d': null, '90d': null }
        })),
        fetchGbpReviews({ filter: activeFilter, businessId: targetBizId, limit: 50 }).catch(() => ({
          reviews: [],
          total: 0
        })),
        fetchGbpHealth().catch(() => null)
      ]);

      if (metricsRes?.metrics) {
        setMetrics(metricsRes.metrics);
        setTrends(metricsRes.trends || {});
      }

      if (reviewsRes?.reviews) {
        setReviews(reviewsRes.reviews);
        setTotalCount(reviewsRes.total || reviewsRes.reviews.length);
      }

      if (healthRes) {
        setGbpHealth(healthRes.data || healthRes);
        setConnectionData(healthRes.connection || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const handleSyncReviews = async () => {
    setSyncing(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await syncGbpReviews(activeBusiness?.id);
      if (res?.success) {
        setSuccessNotice(`Synced ${res.data?.syncedCount || 0} reviews (${res.data?.newCount || 0} new, ${res.data?.updatedCount || 0} updated).`);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to sync Google reviews.');
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenLocationPicker = async () => {
    setLoadingDiscovery(true);
    setShowLocationPicker(true);
    try {
      const accounts = await fetchGbpAccounts().catch(() => []);
      setAvailableAccounts(accounts || []);
      const locs = await fetchGbpLocations().catch(() => []);
      setAvailableLocations(locs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GBP locations.');
    } finally {
      setLoadingDiscovery(false);
    }
  };

  const handleSelectLocation = async (loc: any) => {
    setSelectingLoc(true);
    setError(null);
    try {
      await selectGbpLocation({
        locationName: loc.name,
        title: loc.title,
        address: loc.address,
        phone: loc.phone,
        website: loc.website,
        category: loc.category,
        business_id: activeBusiness?.id
      });
      setShowLocationPicker(false);
      setSuccessNotice(`Connected location "${loc.title}" and initiated review sync.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to connect location.');
    } finally {
      setSelectingLoc(false);
    }
  };

  const handleGenerateReply = async (review: Review) => {
    setGeneratingFor(review.id);
    setSelectedReview(review);
    try {
      const res = await generateGbpReviewReply({
        reviewId: review.id,
        reviewerName: review.reviewer_name,
        rating: review.rating,
        reviewText: review.comment || review.review_text || '',
        tone: selectedTone,
        businessId: activeBusiness?.id
      });

      if (res?.reply) {
        setDraftReply(res.reply);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI reply.');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleAnalyzeSentiment = async (review: Review) => {
    setAnalyzingFor(review.id);
    try {
      const res = await analyzeReviewSentiment(review.id, activeBusiness?.id);
      if (res?.success && res.data?.analysis) {
        setReviews(prev => prev.map(r => {
          if (r.id === review.id) {
            return {
              ...r,
              sentiment: res.data.analysis.sentiment,
              sentiment_confidence: res.data.analysis.confidence,
              topics: res.data.analysis.topics
            };
          }
          return r;
        }));
        if (selectedReview?.id === review.id) {
          setSelectedReview({
            ...selectedReview,
            sentiment: res.data.analysis.sentiment,
            sentiment_confidence: res.data.analysis.confidence,
            topics: res.data.analysis.topics
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sentiment.');
    } finally {
      setAnalyzingFor(null);
    }
  };

  const handleSaveReply = async (reviewId: string, action: 'save' | 'publish' = 'save') => {
    if (!draftReply.trim()) return;
    setSavingReply(true);
    try {
      await saveOrPublishGbpReply(reviewId, {
        reply: draftReply,
        action,
        businessId: activeBusiness?.id
      });

      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            reply_comment: draftReply,
            owner_reply: draftReply,
            is_replied: 1,
            reply_status: action === 'publish' ? 'published' : 'saved'
          };
        }
        return r;
      }));

      if (selectedReview?.id === reviewId) {
        setSelectedReview({
          ...selectedReview,
          reply_comment: draftReply,
          owner_reply: draftReply,
          is_replied: 1,
          reply_status: action === 'publish' ? 'published' : 'saved'
        });
      }

      setSuccessNotice(action === 'publish' ? 'Response published to Google Business Profile.' : 'Response saved as draft.');
    } catch (err: any) {
      setError(err.message || 'Failed to save reply.');
    } finally {
      setSavingReply(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isConnected = !!connectionData && connectionData.status === 'connected';
  const currentTrend = trends[activeTrendPeriod];

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Google Business Reviews</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase border border-amber-500/20">
              Phase 7 Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time reputation intelligence, unanswered review triage, and AI review responses for {activeBusiness?.name || 'your business'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenLocationPicker}
                className="text-xs h-8 px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Building size={13} className="mr-1.5 text-gray-500" />
                Change Location
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSyncReviews}
                disabled={syncing}
                className="text-xs h-8 px-3.5 bg-gray-900 hover:bg-black text-white font-medium shadow-xs"
              >
                <RefreshCw size={13} className={`mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Reviews'}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => connectGoogleBusiness(activeBusiness?.id)}
              className="text-xs h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
            >
              <Globe size={13} className="mr-1.5" />
              Connect Google Business Profile
            </Button>
          )}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveMainTab('reviews')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'reviews'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Review Intelligence ({metrics.totalReviews})
        </button>
        <button
          onClick={() => setActiveMainTab('health')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'health'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          GBP Entity Health ({gbpHealth?.score ?? 0}/100)
        </button>
        <button
          onClick={() => setActiveMainTab('profile')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'profile'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Connected Profile
        </button>
      </div>

      {/* TAB 1: REVIEWS & REPUTATION INTELLIGENCE */}
      {activeMainTab === 'reviews' && (
        <>
          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {/* KPI 1: Total Reviews */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Reviews</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900">{metrics.totalReviews}</span>
                <span className="text-[11px] font-bold text-gray-400">Google Verified</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">D1 persisted customer feedback</p>
            </div>

            {/* KPI 2: Average Rating */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Average Rating</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-gray-900">{metrics.averageRating || '0.0'}</span>
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  metrics.averageRating >= 4.5 ? 'bg-emerald-50 text-emerald-700' :
                  metrics.averageRating >= 4.0 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {metrics.averageRating >= 4.5 ? 'EXCELLENT' : metrics.averageRating >= 4.0 ? 'GOOD' : 'FAIR'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Calculated across verified ratings</p>
            </div>

            {/* KPI 3: Unanswered Reviews */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Unanswered Reviews</span>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${metrics.unansweredReviews > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {metrics.unansweredReviews}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  metrics.unansweredReviews > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {metrics.unansweredReviews > 0 ? 'Needs Action' : 'All Clear'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Direct owner response required</p>
            </div>

            {/* KPI 4: Response Rate */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Response Rate</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900">{metrics.responseRate}%</span>
                <span className="text-[11px] font-bold text-gray-400">Target 95%+</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full ${
                    metrics.responseRate >= 90 ? 'bg-emerald-500' :
                    metrics.responseRate >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.responseRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Star Breakdown & Trend Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Star Distribution */}
            <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span>Rating Breakdown</span>
                <span className="text-[10px] font-normal text-gray-400">{metrics.totalReviews} Total</span>
              </h3>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = metrics.starsBreakdown[`star${stars}` as keyof typeof metrics.starsBreakdown] || 0;
                  const pct = metrics.totalReviews > 0 ? Math.round((count / metrics.totalReviews) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-semibold text-gray-600 flex items-center gap-0.5">
                        {stars}<Star size={10} className="fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-[11px] font-medium text-gray-500">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historical Trend Telemetry */}
            <div className="lg:col-span-2 bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-gray-900" />
                  <h3 className="text-xs font-bold text-gray-900">Review Trajectory & Reputation Trend</h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                  {(['7d', '30d', '90d'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setActiveTrendPeriod(p)}
                      className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer uppercase ${
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
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">New Reviews</span>
                    <span className="text-lg font-black text-gray-900">{currentTrend.newReviewsCount}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Period Avg</span>
                    <span className="text-lg font-black text-gray-900">{currentTrend.averageRating || '0.0'} ★</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Response Rate</span>
                    <span className="text-lg font-black text-gray-900">{currentTrend.responseRate}%</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Critical / Neg</span>
                    <span className={`text-lg font-black ${currentTrend.negativeReviewsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {currentTrend.negativeReviewsCount}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  Insufficient historical trend observations in this window.
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-2">
                Honest historical data aggregated strictly from verified timestamps in D1.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
                <Filter size={12} /> Filters:
              </span>
              {[
                { id: 'all', label: `All (${metrics.totalReviews})` },
                { id: 'unanswered', label: `Unanswered (${metrics.unansweredReviews})` },
                { id: 'positive', label: `Positive 4-5★ (${metrics.positiveCount})` },
                { id: 'negative', label: `Negative 1-2★ (${metrics.negativeCount})` },
                { id: '5', label: '5★' },
                { id: '4', label: '4★' },
                { id: '3', label: '3★' },
                { id: '2', label: '2★' },
                { id: '1', label: '1★' }
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

            <div className="text-[11px] text-gray-500 font-medium">
              Showing {reviews.length} of {totalCount} reviews
            </div>
          </div>

          {/* Reviews List & Detail Drawer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews Column */}
            <div className={`${selectedReview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-400" />
                  Loading verified customer reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200 space-y-2">
                  <MessageCircle size={28} className="mx-auto text-gray-300" />
                  <h4 className="text-xs font-bold text-gray-900">No Reviews Found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {isConnected
                      ? 'No reviews match the selected filter, or no customer reviews exist on Google for this location.'
                      : 'Connect your Google Business Profile to sync live customer reviews.'}
                  </p>
                  {!isConnected && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => connectGoogleBusiness(activeBusiness?.id)}
                      className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Connect Google Profile
                    </Button>
                  )}
                </div>
              ) : (
                reviews.map(review => {
                  const isReplied = review.is_replied === 1 || !!review.reply_comment || !!review.owner_reply;
                  const replyText = review.reply_comment || review.owner_reply;
                  const text = review.comment || review.review_text || '';
                  const topicsList = typeof review.topics === 'string' ? JSON.parse(review.topics || '[]') : (review.topics || []);

                  return (
                    <div
                      key={review.id}
                      onClick={() => setSelectedReview(review)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                        selectedReview?.id === review.id
                          ? 'border-gray-900 shadow-sm ring-1 ring-gray-900'
                          : 'border-gray-200/80 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0">
                            {review.reviewer_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 leading-none">{review.reviewer_name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {new Date(review.review_created_at || review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Sentiment Badge */}
                          {review.sentiment && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              review.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              review.sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {review.sentiment}
                            </span>
                          )}

                          {/* Replied Status */}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            isReplied
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isReplied ? 'Replied' : 'Needs Reply'}
                          </span>
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs text-gray-700 leading-relaxed mb-2.5 line-clamp-3">
                        {text || <em className="text-gray-400">Customer left rating without review text.</em>}
                      </p>

                      {/* Topic Tags */}
                      {topicsList && topicsList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {topicsList.map((t: string, idx: number) => (
                            <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reply preview if exists */}
                      {replyText && (
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200/60 text-[11px] text-gray-600 mb-2">
                          <span className="font-bold text-gray-800 block text-[10px] mb-0.5">Owner Response:</span>
                          <p className="line-clamp-2">{replyText}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyzeSentiment(review);
                          }}
                          disabled={analyzingFor === review.id}
                          className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <SlidersHorizontal size={11} className={analyzingFor === review.id ? 'animate-spin' : ''} />
                          {analyzingFor === review.id ? 'Analyzing...' : 'Analyze AI Topics'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReply(review);
                          }}
                          disabled={generatingFor === review.id}
                          className="text-primary-accent hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={12} className={generatingFor === review.id ? 'animate-spin' : ''} />
                          {generatingFor === review.id ? 'Writing...' : isReplied ? 'Regenerate Reply' : 'Generate AI Reply'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detail & AI Response Drawer Column */}
            {selectedReview && (
              <div className="bg-white p-5 rounded-xl border border-gray-900 shadow-sm space-y-4 self-start sticky top-6">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Review & AI Response Studio</h3>
                    <p className="text-[11px] text-gray-500">{selectedReview.reviewer_name} • {selectedReview.rating}★</p>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Full Review Text */}
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed border border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-gray-900 text-[11px]">Customer Review</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p>{selectedReview.comment || selectedReview.review_text || 'No comment provided.'}</p>
                </div>

                {/* AI Response Settings */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-700 block">Response Tone</label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['professional', 'friendly', 'empathetic', 'concise'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={`p-2 rounded-lg border text-center font-medium capitalize transition-all cursor-pointer ${
                          selectedTone === t
                            ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700">Response Draft</label>
                    <button
                      onClick={() => handleGenerateReply(selectedReview)}
                      disabled={generatingFor === selectedReview.id}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} className={generatingFor === selectedReview.id ? 'animate-spin' : ''} />
                      Generate AI
                    </button>
                  </div>
                  <textarea
                    value={draftReply || selectedReview.reply_comment || selectedReview.owner_reply || ''}
                    onChange={(e) => setDraftReply(e.target.value)}
                    placeholder="Enter or generate response text..."
                    className="w-full p-3 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 min-h-[110px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(draftReply || selectedReview.reply_comment || selectedReview.owner_reply || '', selectedReview.id)}
                      className="flex-1 text-xs h-8"
                    >
                      {copiedId === selectedReview.id ? (
                        <>
                          <Check size={12} className="mr-1 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="mr-1" />
                          Copy Text
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveReply(selectedReview.id, 'save')}
                      disabled={savingReply}
                      className="flex-1 text-xs h-8"
                    >
                      Save Draft
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveReply(selectedReview.id, 'publish')}
                    disabled={savingReply || !(draftReply || selectedReview.reply_comment || selectedReview.owner_reply)}
                    className="w-full text-xs h-8 bg-gray-900 hover:bg-black text-white font-bold"
                  >
                    {savingReply ? 'Saving...' : 'Approve & Mark Responded'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: GBP HEALTH AUDIT */}
      {activeMainTab === 'health' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">Google Business Profile Entity Health</h2>
              <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                Deterministic audit of your Google Business Profile entity signals, NAP completeness, categories, and customer review velocity.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-black text-gray-900">{gbpHealth?.score || 0}/100</span>
              <span className={`block text-xs font-bold uppercase ${
                (gbpHealth?.score || 0) >= 80 ? 'text-emerald-600' :
                (gbpHealth?.score || 0) >= 60 ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {gbpHealth?.status || 'NOT CONNECTED'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Layers size={16} className="text-gray-900" />
              Verified Entity Checks
            </h3>

            <div className="space-y-3">
              {(gbpHealth?.breakdown || []).map((item: any, idx: number) => {
                const isDone = item.status === 'COMPLETE';
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-3 ${
                      isDone ? 'bg-emerald-50/30 border-emerald-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-gray-900">{item.factor}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <strong className="text-gray-900">Why it matters:</strong> {item.whyItMatters}
                      </p>
                      {!isDone && (
                        <p className="text-xs text-blue-700 font-medium pt-1">
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

      {/* TAB 3: CONNECTED PROFILE INFO */}
      {activeMainTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs mb-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Connected Google Business Information</h2>
              <p className="text-xs text-gray-500">Verified entity data retrieved from your authorized Google account.</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700'
            }`}>
              {isConnected ? 'LIVE SYNC ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>

          {isConnected && connectionData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Business Name:</span>
                <p className="text-sm font-bold text-gray-900">{connectionData.location_name || activeBusiness?.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Primary Category:</span>
                <p className="text-sm font-bold text-gray-900">{connectionData.location_category || 'Local Service'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Storefront Address:</span>
                <p className="text-sm font-bold text-gray-900">{connectionData.location_address || `${activeBusiness?.city}, ${activeBusiness?.country}`}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Phone Number:</span>
                <p className="text-sm font-bold text-gray-900">{connectionData.location_phone || 'Not configured'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Website URI:</span>
                <p className="text-sm font-bold text-gray-900">{connectionData.location_website || activeBusiness?.website_url}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-semibold">Connected At:</span>
                <p className="text-sm font-bold text-gray-900">{new Date(connectionData.connected_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Building className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="text-sm font-bold text-gray-900">No Google Business Profile Connected</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Authorize your Google account to automatically import your verified address, hours, category, and review telemetry.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => connectGoogleBusiness(activeBusiness?.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Connect Google Account
              </Button>
            </div>
          )}
        </div>
      )}

      {/* LOCATION PICKER MODAL */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-gray-900" />
                <h3 className="text-sm font-bold text-gray-900">Select Google Business Location</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {loadingDiscovery ? (
              <div className="py-8 text-center text-xs text-gray-500">
                <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-gray-400" />
                Discovering accessible Google accounts and locations...
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5">
                {availableLocations.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">
                    No authorized locations found. Please ensure your Google account has verified Business Profile management permissions.
                  </p>
                ) : (
                  availableLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50/50 hover:border-gray-900 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{loc.title}</h4>
                        <p className="text-[11px] text-gray-500">{loc.address || 'Service Area Business'}</p>
                        {loc.category && <span className="text-[10px] text-blue-600 font-medium">{loc.category}</span>}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={selectingLoc}
                        className="text-xs h-7 px-3 bg-gray-900 text-white"
                      >
                        {selectingLoc ? 'Connecting...' : 'Connect'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

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
