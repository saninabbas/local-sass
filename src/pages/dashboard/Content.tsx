import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { generateBlogArticle } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { 
  FileText,
  Sparkles,
  PenTool,
  Copy,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogResult {
  title: string;
  html_content: string;
}

export function Content() {
  const { user } = useAuth();
  const currentPlan = (user as any)?.subscription_status || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'growth' || currentPlan === 'enterprise';

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlogResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setCopied(false);
      const res = await generateBlogArticle(topic || undefined);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const fullHtml = `<h1>${result.title}</h1>\n${result.html_content}`;
    navigator.clipboard.writeText(fullHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
          <FileText className="text-[#cc785c]" size={26} />
          AI Local Blog Generator
        </h1>
        <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
          Instantly draft SEO-optimized articles tailored to your business category and city to capture high-intent local search queries.
        </p>
      </div>

      {!isPro && (
        <div className="bg-[#efe9de] border border-[#cc785c]/30 rounded-xl p-8 mb-8 text-center relative overflow-hidden shadow-xs">
          <Lock className="text-[#cc785c] mx-auto mb-3" size={36} />
          <h2 className="text-xl font-serif font-medium text-[#141413] mb-2">Unlock AI Content Generator</h2>
          <p className="text-xs text-[#6c6a64] max-w-lg mx-auto mb-6 font-sans">
            Generating customized local SEO articles requires an active Growth or Pro plan.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-sans font-medium px-6 py-2 rounded-lg shadow-sm">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {isPro && (
        <form onSubmit={handleGenerate} className="mb-6 bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-2">Article Topic Focus (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <PenTool className="text-[#8e8b82]" size={16} />
              </div>
              <input
                type="text"
                placeholder="e.g. Why you need regular dental hygiene visits"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] text-xs text-[#141413] font-sans"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-medium rounded-lg whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              {loading ? 'Drafting...' : <><Sparkles size={14} /> Generate Article</>}
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
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs p-12 text-center">
          <Sparkles className="text-[#cc785c] animate-spin-slow mx-auto mb-4" size={36} />
          <h2 className="text-xl font-serif font-normal text-[#141413] mb-1">Synthesizing local SEO draft...</h2>
          <p className="text-xs text-[#6c6a64] font-sans">Researching local keyword intent and structuring semantic HTML headings (~10s).</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#e8e0d2] border-b border-[#e6dfd8] p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4a017]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#5db872]"></div>
              <span className="ml-3 text-xs font-mono text-[#6c6a64]">article.html</span>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium text-[#141413] hover:bg-[#efe9de] transition-colors shadow-xs"
            >
              {copied ? <CheckCircle2 className="text-[#5db872]" size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>
          
          <div className="p-8 bg-[#faf9f5] text-[#3d3d3a]">
            <h1 className="text-2xl font-serif font-normal text-[#141413] mb-4 leading-tight">{result.title}</h1>
            <div 
              className="text-xs font-sans leading-relaxed text-[#3d3d3a] space-y-3 prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: result.html_content }} 
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
