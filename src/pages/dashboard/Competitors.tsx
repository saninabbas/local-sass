import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeCompetitor } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { 
  Target,
  Search,
  Swords,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  me: {
    url: string;
    https: boolean;
    title: string;
    h1: string;
    score: number;
  };
  competitor: {
    url: string;
    https: boolean;
    title: string;
    h1: string;
    score: number;
  };
  strategy: {
    summary: string;
    action_plan: Array<{ title: string; description: string }>;
  };
}

export function Competitors() {
  const { user } = useAuth();
  const currentPlan = (user as any)?.subscription_status || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'growth';

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setLoading(true);
      setError(null);
      const res = await analyzeCompetitor(url);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze competitor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
          <Target className="text-rose-500" size={32} />
          Competitor Analysis
        </h1>
        <p className="text-secondary max-w-2xl">
          Enter a competitor's website URL below. Our AI will analyze both your website and theirs to generate a strategic plan to outrank them.
        </p>
      </div>

      {!isPro && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-400"></div>
          <Lock className="text-rose-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-primary mb-3">Unlock Competitor Spy Tool</h2>
          <p className="text-secondary max-w-xl mx-auto mb-6">
            Analyzing dual websites and running advanced AI comparisons requires a premium subscription. Upgrade to Pro or Growth to spy on your competitors.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 border-none shadow-lg">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {isPro && (
        <form onSubmit={handleAnalyze} className="mb-12">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="url"
                required
                placeholder="https://competitor-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent text-lg shadow-sm"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl whitespace-nowrap"
            >
              {loading ? 'Scanning...' : 'Analyze'}
            </Button>
          </div>
          {error && (
            <p className="text-danger mt-3 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </p>
          )}
        </form>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Swords className="text-rose-500 animate-pulse mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-bold text-primary mb-2">Analyzing Battleground...</h2>
          <p className="text-secondary">Fetching data from both websites and running AI comparison. This may take a few seconds.</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* AI Summary */}
          <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-indigo-300" />
              AI Strategic Summary
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed relative z-10">
              {result.strategy.summary}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 p-4">
              <div className="font-bold text-gray-500 uppercase text-xs tracking-wider">Metric</div>
              <div className="font-black text-primary text-center">You</div>
              <div className="font-black text-rose-500 text-center">Competitor</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* Score */}
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-secondary">Health Score</div>
                <div className="text-center font-black text-2xl text-primary">{result.me.score}</div>
                <div className="text-center font-black text-2xl text-rose-500">{result.competitor.score}</div>
              </div>
              
              {/* HTTPS */}
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-secondary">SSL Security</div>
                <div className="flex justify-center">
                  {result.me.https ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-danger" />}
                </div>
                <div className="flex justify-center">
                  {result.competitor.https ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-danger" />}
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-secondary">Title Tag</div>
                <div className="text-center text-sm font-medium px-4">{result.me.title || 'Missing'}</div>
                <div className="text-center text-sm font-medium px-4">{result.competitor.title || 'Missing'}</div>
              </div>

              {/* H1 */}
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-secondary">Main Heading (H1)</div>
                <div className="text-center text-sm font-medium px-4">{result.me.h1 || 'Missing'}</div>
                <div className="text-center text-sm font-medium px-4">{result.competitor.h1 || 'Missing'}</div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <h2 className="text-2xl font-bold text-primary mt-12 mb-6">Your Battle Plan</h2>
          <div className="grid gap-4">
            {result.strategy.action_plan.map((action, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:border-primary-accent/30 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg mb-2">{action.title}</h3>
                  <p className="text-secondary leading-relaxed">{action.description}</p>
                </div>
              </div>
            ))}
            {result.strategy.action_plan.length === 0 && (
              <p className="text-secondary text-center py-8">AI could not generate specific action items. Please try again.</p>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
