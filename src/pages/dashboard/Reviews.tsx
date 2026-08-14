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
  LockIcon,
  Link2,
  Edit3,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

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
  const currentPlan = (user as any)?.subscription_status || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'growth';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avgRating: 0, totalReviews: 0, responseRate: 0 });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false, connection: null });
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      const data = await fetchApi('/api/reviews/status');
      setConnectionStatus(data || { connected: false, connection: null });
    } catch (err) {
      // Connection not available yet
      setConnectionStatus({ connected: false, connection: null });
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/reviews');
      if (data) {
        setReviews(data.reviews || []);
        setStats(data.stats || { avgRating: 0, totalReviews: 0, responseRate: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReply = async (review: Review) => {
    if (!isPro) return;
    setGeneratingFor(review.id);
    try {
      const data = await fetchApi('/api/reviews/reply', {
        method: 'POST',
        body: JSON.stringify({
          reviewId: review.id,
          reviewerName: review.reviewer_name,
          rating: review.rating,
          reviewText: review.review_text
        })
      });
      if (data?.reply) {
        setReviews(prev => prev.map(r => 
          r.id === review.id ? { ...r, owner_reply: data.reply, reply_status: 'draft' } : r
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI reply');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleEditReply = (review: Review) => {
    setEditingReply(review.id);
    setEditedReplyText(review.owner_reply || '');
  };

  const handleSaveReply = async (reviewId: string) => {
    setSavingReply(true);
    try {
      await fetchApi('/api/reviews/save-reply', {
        method: 'POST',
        body: JSON.stringify({
          reviewId,
          reply: editedReplyText
        })
      });
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, owner_reply: editedReplyText, reply_status: 'saved' } : r
      ));
      setEditingReply(null);
      setEditedReplyText('');
    } catch (err: any) {
      setError(err.message || 'Failed to save reply');
    } finally {
      setSavingReply(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 mt-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Star className="text-amber-500 fill-amber-500" size={32} />
            Reviews Manager
          </h1>
          <p className="text-secondary">Monitor your online reputation and reply to customers with AI.</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white"
          onClick={() => window.location.href = '/api/auth/googleBusiness'}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4" />
          Connect Google Business
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Connection Status Banner */}
      {!connectionStatus.connected && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Link2 className="text-amber-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-primary text-lg mb-1">Connect Google Business Profile</h3>
              <p className="text-secondary text-sm">
                Connect your Google Business Profile to automatically import and manage your customer reviews. 
                AI-powered reply suggestions will help you respond professionally.
              </p>
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Google Business API integration requires OAuth credentials to be configured on the server.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row - only show when there are reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg text-amber-500">
            <Star size={24} className="fill-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Rating</p>
            <div className="text-2xl font-black text-primary">
              {stats.totalReviews > 0 ? stats.avgRating.toFixed(1) : '—'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-500">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Reviews</p>
            <div className="text-2xl font-black text-primary">{stats.totalReviews}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Response Rate</p>
            <div className="text-2xl font-black text-primary">
              {stats.totalReviews > 0 ? `${stats.responseRate}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <MessageCircle size={20} className="text-secondary" />
            {reviews.length > 0 ? 'Recent Reviews' : 'Reviews'}
          </h2>
          {reviews.length > 0 && (
            <button onClick={loadReviews} className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No reviews yet</h3>
            <p className="text-secondary max-w-md mx-auto">
              {connectionStatus.connected 
                ? 'No reviews have been imported from your Google Business Profile yet. Reviews will appear here once synced.'
                : 'Connect your Google Business Profile to import and manage your customer reviews. You can also add reviews manually once connected.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 sm:p-8 hover:bg-gray-50/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-primary text-lg">{review.reviewer_name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    {formatDate(review.review_date || review.created_at)}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6">{review.review_text}</p>

                {review.owner_reply && editingReply !== review.id ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 ml-4 sm:ml-8 relative">
                    <div className="absolute -left-3 top-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform -rotate-45"></div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">Owner Response</span>
                        {review.reply_status === 'draft' && (
                          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">Draft</span>
                        )}
                        {review.reply_status === 'saved' && (
                          <Check size={14} className="text-green-500" />
                        )}
                      </div>
                      {isPro && (
                        <button 
                          onClick={() => handleEditReply(review)}
                          className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          Edit
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-secondary">{review.owner_reply}</p>
                  </div>
                ) : editingReply === review.id ? (
                  <div className="ml-4 sm:ml-8 space-y-3">
                    <textarea
                      value={editedReplyText}
                      onChange={(e) => setEditedReplyText(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                      placeholder="Edit your reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveReply(review.id)}
                        disabled={savingReply || !editedReplyText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        {savingReply ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {savingReply ? 'Saving...' : 'Save Reply'}
                      </button>
                      <button
                        onClick={() => { setEditingReply(null); setEditedReplyText(''); }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ml-4 sm:ml-8">
                    {isPro ? (
                      <button 
                        onClick={() => handleGenerateReply(review)}
                        disabled={generatingFor === review.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-sm font-bold transition-colors"
                      >
                        {generatingFor === review.id ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Generate AI Reply
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-sm font-bold cursor-not-allowed">
                        <LockIcon size={16} />
                        Upgrade to reply with AI
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
