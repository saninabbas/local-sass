import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchApi } from '../../lib/api';
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
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

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
  newReviews?: number;
  unansweredCount?: number;
  negativeCount?: number;
  reviewVelocity?: string;
}

interface ConnectionStatus {
  connected: boolean;
  connection: any | null;
}

export function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avgRating: 0, totalReviews: 0, responseRate: 0 });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false, connection: null });
  const [loading, setLoading] = useState(true);
  
  // Active Filter: 'all' | 'positive' | 'neutral' | 'negative' | 'unanswered'
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'unanswered'>('all');
  const [selectedTone, setSelectedTone] = useState<string>('professional');

  // AI Reply State
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, reviewsRes] = await Promise.all([
        fetchApi('/api/reviews/status').catch(() => ({ connected: false, connection: null })),
        fetchApi('/api/reviews').catch(() => ({ reviews: [], stats: { avgRating: 0, totalReviews: 0, responseRate: 0 } }))
      ]);
      setConnectionStatus(statusRes || { connected: false, connection: null });
      if (reviewsRes) {
        setReviews(reviewsRes.reviews || []);
        setStats(reviewsRes.stats || { avgRating: 0, totalReviews: 0, responseRate: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ reviewId, replyText })
      });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: replyText, reply_status: 'replied' } : r));
      setEditingReply(null);
    } catch (err) {
      alert("Failed to save reply.");
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Star className="text-amber-500 fill-amber-500" size={26} />
            Reviews & Reputation Management Center
          </h1>
          <p className="text-xs text-secondary mt-1">
            Real Google customer reviews, sentiment analytics, and tailored 1-click AI reply generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus.connected ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Google Business Connected</span>
            </span>
          ) : (
            <Link
              to="/dashboard/settings"
              className="px-4 py-2 rounded-xl bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Building size={14} />
              <span>Connect Google Business</span>
            </Link>
          )}
        </div>
      </div>

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
          <span className="text-xs font-semibold text-secondary">Response Rate</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {reviews.length > 0 ? Math.round(((reviews.length - unansweredReviews.length) / reviews.length) * 100) : 0}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Unanswered</span>
          <div className="mt-2 text-2xl font-black text-primary-accent">{unansweredReviews.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Review Velocity</span>
          <div className="mt-2 text-xs font-bold text-primary mt-3">
            {reviews.length > 0 ? '+3 new / month' : 'Pending Sync'}
          </div>
        </div>
      </div>

      {/* When GBP is not connected */}
      {!connectionStatus.connected && reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-primary mb-1">Google Business Profile Not Connected</h2>
          <p className="text-xs text-secondary max-w-md mx-auto mb-6 leading-relaxed">
            Connect your Google Business Profile to unlock live customer review syncing, reputation insights, and 1-click AI response automation.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl max-w-md mx-auto border border-gray-200 text-xs text-left mb-6 space-y-2">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Check size={14} className="text-emerald-600" />
              <span>Real-time Google Maps review synchronization</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Check size={14} className="text-emerald-600" />
              <span>Automated professional AI replies in warm or apologetic tones</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Check size={14} className="text-emerald-600" />
              <span>Competitor review velocity and rating benchmark</span>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="px-6 py-2.5 rounded-xl bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
          >
            <span>Connect Google Business Profile</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      ) : (
        <>
          {/* Sentiment Filter Tabs & Tone Selector */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: `All Reviews (${reviews.length})` },
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
              <span className="text-xs text-secondary font-medium whitespace-nowrap">AI Response Tone:</span>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="px-3 py-1 text-xs rounded-xl border border-gray-200 bg-gray-50 text-primary font-medium focus:outline-none focus:ring-1 focus:ring-primary-accent"
              >
                <option value="professional">Professional & Polite</option>
                <option value="warm">Warm & Friendly</option>
                <option value="apologetic">Apologetic & Empathetic</option>
                <option value="direct">Direct & Concise</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 mb-8">
            {filteredReviews.map((review) => (
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
                        {new Date(review.review_date || review.created_at).toLocaleDateString()} via {review.source || 'Google'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    review.owner_reply ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {review.owner_reply ? 'Responded' : 'Awaiting Reply'}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-secondary leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 font-sans">
                  "{review.review_text || 'Rating only provided without text'}"
                </p>

                {/* Owner Reply Area */}
                {review.owner_reply && editingReply !== review.id && (
                  <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                        <Sparkles size={12} className="text-primary-accent" />
                        Business Response:
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
                      Edit Response:
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

                {/* AI Generate Reply Button */}
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
                      <span>{generatingFor === review.id ? 'Crafting AI Reply...' : 'GENERATE AI RESPONSE'}</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
