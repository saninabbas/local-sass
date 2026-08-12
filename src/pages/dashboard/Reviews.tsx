import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Star, 
  MessageSquare, 
  TrendingUp,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Check,
  LockIcon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Dummy data for presentation
const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Sarah Jenkins',
    rating: 5,
    date: '2 days ago',
    text: "Absolutely fantastic service! The team was highly professional and fixed my issue in record time. I will definitely be recommending them to my friends.",
    reply: null
  },
  {
    id: '2',
    author: 'Michael T.',
    rating: 4,
    date: '1 week ago',
    text: "Good experience overall. They were a little late to the appointment, but the quality of work made up for it.",
    reply: "Hi Michael, thank you for the feedback! We apologize for the slight delay and are glad you were happy with the final result."
  },
  {
    id: '3',
    author: 'Emily R.',
    rating: 5,
    date: '2 weeks ago',
    text: "I couldn't be happier. Very transparent pricing and excellent customer support.",
    reply: null
  },
  {
    id: '4',
    author: 'David Wright',
    rating: 2,
    date: '3 weeks ago',
    text: "Communication was lacking. I had to call three times to get an update on my project status.",
    reply: null
  }
];

export function Reviews() {
  const { user } = useAuth();
  const currentPlan = (user as any)?.subscription_status || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'growth';

  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const handleGenerateReply = (id: string, rating: number) => {
    setGeneratingFor(id);
    
    // Simulate AI generation delay
    setTimeout(() => {
      let aiReply = "";
      if (rating >= 4) {
        aiReply = "Thank you so much for your kind words! We're thrilled to hear you had a great experience with our team. We look forward to serving you again!";
      } else {
        aiReply = "We sincerely apologize for your negative experience. Customer satisfaction is our top priority. Please contact our support team directly so we can make this right.";
      }

      setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: aiReply } : r));
      setGeneratingFor(null);
    }, 1500);
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
        <Button variant="outline" className="flex items-center gap-2 bg-white">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4" />
          Connect Google Business
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg text-amber-500">
            <Star size={24} className="fill-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Rating</p>
            <div className="text-2xl font-black text-primary">4.6</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-500">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Reviews</p>
            <div className="text-2xl font-black text-primary">128</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Response Rate</p>
            <div className="text-2xl font-black text-primary">82%</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <MessageCircle size={20} className="text-secondary" />
            Recent Reviews
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 sm:p-8 hover:bg-gray-50/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-primary text-lg">{review.author}</h3>
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
                <span className="text-sm text-gray-400 font-medium">{review.date}</span>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">{review.text}</p>

              {review.reply ? (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 ml-4 sm:ml-8 relative">
                  <div className="absolute -left-3 top-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform -rotate-45"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-primary text-sm">Owner Response</span>
                    <Check size={14} className="text-green-500" />
                  </div>
                  <p className="text-sm text-secondary">{review.reply}</p>
                </div>
              ) : (
                <div className="ml-4 sm:ml-8">
                  {isPro ? (
                    <button 
                      onClick={() => handleGenerateReply(review.id, review.rating)}
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
      </div>
    </DashboardLayout>
  );
}
