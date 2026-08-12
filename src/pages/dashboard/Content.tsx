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
  const isPro = currentPlan === 'pro' || currentPlan === 'growth';

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
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
          <FileText className="text-blue-500" size={32} />
          AI Local Blog Generator
        </h1>
        <p className="text-secondary max-w-2xl">
          Instantly generate SEO-optimized blog articles tailored to your business and city. Paste these directly into your website to boost your local Google rankings.
        </p>
      </div>

      {!isPro && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <Lock className="text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-primary mb-3">Unlock Content Generator</h2>
          <p className="text-secondary max-w-xl mx-auto mb-6">
            Generating custom SEO articles requires our advanced AI engine. Upgrade to Pro or Growth to start creating unlimited blog posts for your business.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none shadow-lg">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {isPro && (
        <form onSubmit={handleGenerate} className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">What should the article be about? (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PenTool className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g. Why you need emergency plumbing in winter"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent text-lg shadow-sm"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 h-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl whitespace-nowrap flex items-center gap-2"
            >
              {loading ? 'Writing...' : <><Sparkles size={20} /> Generate Article</>}
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Sparkles className="text-blue-500 animate-spin-slow mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-bold text-primary mb-2">AI is writing your article...</h2>
          <p className="text-secondary">Generating local SEO keywords and structuring the HTML. This takes about 10-15 seconds.</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-4 text-sm font-medium text-gray-500">article.html</span>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-secondary hover:bg-gray-50 transition-colors shadow-sm"
            >
              {copied ? <CheckCircle2 className="text-green-500" size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>
          
          <div className="p-8 lg:p-12 prose prose-lg max-w-none">
            <h1 className="text-3xl font-black text-primary mb-6 leading-tight">{result.title}</h1>
            <div 
              className="text-secondary prose-headings:text-primary prose-a:text-primary-accent"
              dangerouslySetInnerHTML={{ __html: result.html_content }} 
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
