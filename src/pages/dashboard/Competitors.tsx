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
  const isPro = currentPlan === 'pro' || currentPlan === 'growth' || currentPlan === 'enterprise';

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
      <div className="mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
          <Target className="text-[#cc785c]" size={26} />
          Competitor Analysis
        </h1>
        <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
          Enter a local competitor's website URL. Our AI compares technical SEO, search indexing, and content depth to generate a targeted strategy.
        </p>
      </div>

      {!isPro && (
        <div className="bg-[#efe9de] border border-[#cc785c]/30 rounded-xl p-8 mb-8 text-center relative overflow-hidden shadow-xs">
          <Lock className="text-[#cc785c] mx-auto mb-3" size={36} />
          <h2 className="text-xl font-serif font-medium text-[#141413] mb-2">Unlock Competitor Intelligence</h2>
          <p className="text-xs text-[#6c6a64] max-w-lg mx-auto mb-6 font-sans">
            Analyzing multi-domain signals and calculating competitive gaps requires a Growth or Pro plan.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-sans font-medium px-6 py-2 rounded-lg shadow-sm">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {isPro && (
        <form onSubmit={handleAnalyze} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="text-[#8e8b82]" size={16} />
              </div>
              <input
                type="url"
                required
                placeholder="https://competitor-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] text-xs text-[#141413] font-sans"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6 bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-medium rounded-lg whitespace-nowrap"
            >
              {loading ? 'Scanning...' : 'Analyze Competitor'}
            </Button>
          </div>
          {error && (
            <p className="text-[#c64545] text-xs font-mono mt-2 flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </form>
      )}

      {loading && (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs p-10 text-center">
          <Swords className="text-[#cc785c] animate-pulse mx-auto mb-4" size={40} />
          <h2 className="text-xl font-serif font-normal text-[#141413] mb-1">Comparing Search Signals...</h2>
          <p className="text-xs text-[#6c6a64] font-sans">Crawling competitor domain and computing strategic differential.</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* AI Summary in Dark Surface */}
          <div className="bg-[#181715] text-[#faf9f5] rounded-xl p-6 border border-[#252320] shadow-sm">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#cc785c] mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              Strategic Intelligence Summary
            </h2>
            <p className="text-xs text-[#d8d5ce] leading-relaxed font-sans">
              {result.strategy.summary}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs overflow-hidden">
            <div className="grid grid-cols-3 bg-[#e8e0d2] border-b border-[#e6dfd8] p-3 text-[10px] font-mono uppercase tracking-wider text-[#6c6a64]">
              <div>Metric</div>
              <div className="text-center font-bold text-[#141413]">Your Business</div>
              <div className="text-center font-bold text-[#cc785c]">Competitor</div>
            </div>
            
            <div className="divide-y divide-[#e6dfd8] text-xs font-sans">
              {/* Score */}
              <div className="grid grid-cols-3 p-3.5 items-center bg-[#faf9f5]">
                <div className="font-medium text-[#141413]">Health Score</div>
                <div className="text-center font-serif text-xl font-semibold text-[#141413]">{result.me.score}</div>
                <div className="text-center font-serif text-xl font-semibold text-[#cc785c]">{result.competitor.score}</div>
              </div>
              
              {/* HTTPS */}
              <div className="grid grid-cols-3 p-3.5 items-center bg-[#faf9f5]">
                <div className="font-medium text-[#141413]">SSL Security</div>
                <div className="flex justify-center">
                  {result.me.https ? <CheckCircle2 size={16} className="text-[#5db872]" /> : <XCircle size={16} className="text-[#c64545]" />}
                </div>
                <div className="flex justify-center">
                  {result.competitor.https ? <CheckCircle2 size={16} className="text-[#5db872]" /> : <XCircle size={16} className="text-[#c64545]" />}
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-3 p-3.5 items-center bg-[#faf9f5]">
                <div className="font-medium text-[#141413]">Title Tag</div>
                <div className="text-center text-xs font-mono px-2 truncate">{result.me.title || 'Missing'}</div>
                <div className="text-center text-xs font-mono px-2 truncate text-[#cc785c]">{result.competitor.title || 'Missing'}</div>
              </div>

              {/* H1 */}
              <div className="grid grid-cols-3 p-3.5 items-center bg-[#faf9f5]">
                <div className="font-medium text-[#141413]">Main Heading (H1)</div>
                <div className="text-center text-xs font-mono px-2 truncate">{result.me.h1 || 'Missing'}</div>
                <div className="text-center text-xs font-mono px-2 truncate text-[#cc785c]">{result.competitor.h1 || 'Missing'}</div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <h2 className="text-lg font-serif font-medium text-[#141413] mb-3">Competitive Action Queue</h2>
            <div className="grid gap-3">
              {result.strategy.action_plan.map((action, idx) => (
                <div key={idx} className="bg-[#efe9de] p-4 rounded-xl border border-[#e6dfd8] shadow-xs flex gap-3.5">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c] flex items-center justify-center font-mono text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-xs text-[#141413] mb-1">{action.title}</h3>
                    <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">{action.description}</p>
                  </div>
                </div>
              ))}
              {result.strategy.action_plan.length === 0 && (
                <p className="text-xs text-[#6c6a64] font-sans text-center py-6">No specific action items generated for this comparison.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
