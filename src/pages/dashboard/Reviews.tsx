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
  const isPro = currentPlan === 'pro' || currentPlan === 'growth' || currentPlan === 'enterprise';

  const [selectedTone, setSelectedTone] = useState<string>('professional');
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

  const handleGenerateReply = async (review: Review, tone: string = selectedTone) => {
    if (!isPro) return;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 mt-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
            <Star className="text-[#cc785c] fill-[#cc785c]" size={26} />
            Reviews Reputation Manager
          </h1>
          <p className="text-xs text-[#6c6a64] font-sans">Monitor customer feedback and draft authentic replies with AI.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 bg-[#efe9de] border-[#e6dfd8] text-xs text-[#141413] hover:bg-[#e8e0d2]"
          onClick={() => window.location.href = '/api/auth/googleBusiness'}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-3.5 h-3.5" />
          Connect Google Business
        </Button>
      </div>

      {error && (
        <div className="bg-[#efe9de] border border-[#c64545]/30 text-[#c64545] p-3.5 rounded-xl mb-6 flex items-center gap-2.5 text-xs font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-[#c64545] hover:opacity-70">×</button>
        </div>
      )}

      {/* Connection Status Banner */}
      {!connectionStatus.connected && !loading && (
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-[#cc785c]">
              <Link2 size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-medium text-sm text-[#141413] mb-0.5">Connect Google Business Profile</h3>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                Connect your Google Business Profile to automatically import reviews and synthesize AI-suggested responses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5 flex items-center gap-3.5">
          <div className="p-3 bg-[#faf9f5] rounded-lg text-[#cc785c] border border-[#e6dfd8]">
            <Star size={20} className="fill-[#cc785c]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Avg Rating</p>
            <div className="text-2xl font-serif font-normal text-[#141413]">
              {stats.totalReviews > 0 ? stats.avgRating.toFixed(1) : '—'}
            </div>
          </div>
        </div>

        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5 flex items-center gap-3.5">
          <div className="p-3 bg-[#faf9f5] rounded-lg text-[#5db8a6] border border-[#e6dfd8]">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Total Reviews</p>
            <div className="text-2xl font-serif font-normal text-[#141413]">{stats.totalReviews}</div>
          </div>
        </div>

        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5 flex items-center gap-3.5">
          <div className="p-3 bg-[#faf9f5] rounded-lg text-[#5db872] border border-[#e6dfd8]">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Response Rate</p>
            <div className="text-2xl font-serif font-normal text-[#141413]">
              {stats.totalReviews > 0 ? `${stats.responseRate}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden mb-8">
        <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5] flex justify-between items-center">
          <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2">
            <MessageCircle size={16} className="text-[#cc785c]" />
            {reviews.length > 0 ? 'Recent Customer Reviews' : 'Reviews'}
          </h2>
          {reviews.length > 0 && (
            <button onClick={loadReviews} className="text-xs text-[#cc785c] hover:text-[#a9583e] font-sans font-medium flex items-center gap-1">
              <RefreshCw size={12} />
              Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-[#cc785c] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-mono text-[#8e8b82]">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Star size={24} />
            </div>
            <h3 className="text-base font-serif font-medium text-[#141413] mb-1">No reviews synced yet</h3>
            <p className="text-xs text-[#6c6a64] max-w-md mx-auto font-sans leading-relaxed">
              {connectionStatus.connected 
                ? 'No reviews imported from your Google Business Profile yet. Check back once sync finishes.'
                : 'Connect your Google Business Profile to import and manage your customer reviews with AI suggestions.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e6dfd8]">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 sm:p-6 bg-[#faf9f5] hover:bg-[#efe9de]/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-sans font-medium text-xs text-[#141413]">{review.reviewer_name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={13} 
                          className={i < review.rating ? "text-[#e8a55a] fill-[#e8a55a]" : "text-[#e6dfd8]"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8b82]">
                    {formatDate(review.review_date || review.created_at)}
                  </span>
                </div>
                
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed mb-4">{review.review_text}</p>

                {review.owner_reply && editingReply !== review.id ? (
                  <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-lg p-3.5 ml-3 sm:ml-6 relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-medium text-xs text-[#141413]">Owner Response</span>
                        {review.reply_status === 'draft' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#e8a55a]/15 text-[#e8a55a] rounded font-mono">Draft</span>
                        )}
                        {review.reply_status === 'saved' && (
                          <Check size={12} className="text-[#5db872]" />
                        )}
                      </div>
                      {isPro && (
                        <button 
                          onClick={() => handleEditReply(review)}
                          className="text-[11px] text-[#6c6a64] hover:text-[#cc785c] flex items-center gap-1 font-sans"
                        >
                          <Edit3 size={11} />
                          Edit
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">{review.owner_reply}</p>
                  </div>
                ) : editingReply === review.id ? (
                  <div className="ml-3 sm:ml-6 space-y-2.5">
                    <textarea
                      value={editedReplyText}
                      onChange={(e) => setEditedReplyText(e.target.value)}
                      rows={3}
                      className="w-full border border-[#e6dfd8] bg-[#faf9f5] rounded-lg p-2.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] resize-none font-sans"
                      placeholder="Edit your reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveReply(review.id)}
                        disabled={savingReply || !editedReplyText.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-sans font-medium disabled:opacity-50 transition-colors"
                      >
                        {savingReply ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        {savingReply ? 'Saving...' : 'Save Reply'}
                      </button>
                      <button
                        onClick={() => { setEditingReply(null); setEditedReplyText(''); }}
                        className="px-3 py-1.5 text-[#6c6a64] hover:text-[#141413] text-xs font-sans"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ml-3 sm:ml-6 flex flex-wrap items-center gap-2">
                    {isPro ? (
                      <>
                        <div className="flex items-center gap-1 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg p-0.5 text-[11px] font-sans text-[#6c6a64]">
                          <span className="px-1.5 text-[#8e8b82]">Tone:</span>
                          <select
                            value={selectedTone}
                            onChange={(e) => setSelectedTone(e.target.value)}
                            className="bg-transparent text-xs font-medium text-[#141413] focus:outline-none pr-1"
                          >
                            <option value="professional">Professional</option>
                            <option value="warm">Warm & Friendly</option>
                            <option value="apologetic">Empathetic</option>
                            <option value="direct">Direct & Short</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => handleGenerateReply(review)}
                          disabled={generatingFor === review.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#efe9de] text-[#cc785c] hover:bg-[#e8e0d2] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium transition-colors"
                        >
                          {generatingFor === review.id ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} />
                              Generate AI Reply
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] text-[#8e8b82] border border-[#e6dfd8] rounded-lg text-xs font-sans cursor-not-allowed">
                        <LockIcon size={13} />
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
