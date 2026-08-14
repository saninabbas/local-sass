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
  Lock,
  Clock,
  Tag,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogResult {
  title: string;
  meta_description?: string;
  slug?: string;
  focus_keywords?: string[];
  read_time_minutes?: number;
  excerpt?: string;
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
  const [copyMode, setCopyMode] = useState<'html' | 'text'>('html');

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

  const handleCopy = (mode: 'html' | 'text' = 'html') => {
    if (!result) return;
    setCopyMode(mode);
    let contentToCopy = '';
    if (mode === 'html') {
      contentToCopy = `<h1>${result.title}</h1>\n${result.html_content}`;
    } else {
      // Plain text version stripping html tags
      const tempEl = document.createElement('div');
      tempEl.innerHTML = result.html_content;
      contentToCopy = `${result.title}\n\n${tempEl.innerText || tempEl.textContent || ''}`;
    }
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
          <FileText className="text-[#cc785c]" size={26} />
          AI Local Blog & Article Generator
        </h1>
        <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
          Instantly craft high-ranking, localized SEO blog articles with meta tags, keyword targets, and semantic headings tailored to your local audience.
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
                placeholder="e.g. 5 Common Signs You Need an Emergency Plumbing Repair"
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
              {loading ? 'Drafting Article...' : <><Sparkles size={14} /> Generate Article</>}
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
          <h2 className="text-xl font-serif font-normal text-[#141413] mb-1">Synthesizing local SEO article...</h2>
          <p className="text-xs text-[#6c6a64] font-sans">Drafting semantic headings, local keywords, FAQ sections, and conversion callouts (~8s).</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Bar with metadata and actions */}
          <div className="bg-[#e8e0d2] border-b border-[#e6dfd8] p-3.5 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4a017]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#5db872]"></div>
              <span className="ml-3 text-xs font-mono text-[#6c6a64]">seo-article.html</span>
              {result.read_time_minutes && (
                <span className="flex items-center gap-1 text-[11px] font-sans text-[#8e8b82] ml-2">
                  <Clock size={12} /> {result.read_time_minutes} min read
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleCopy('text')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium text-[#141413] hover:bg-[#efe9de] transition-colors shadow-xs"
              >
                {copied && copyMode === 'text' ? <CheckCircle2 className="text-[#5db872]" size={14} /> : <Copy size={14} />}
                {copied && copyMode === 'text' ? 'Copied Text!' : 'Copy Text'}
              </button>
              <button 
                onClick={() => handleCopy('html')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-sans font-medium transition-colors shadow-xs"
              >
                {copied && copyMode === 'html' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied && copyMode === 'html' ? 'Copied HTML!' : 'Copy HTML'}
              </button>
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="p-5 bg-[#faf8f5] border-b border-[#e6dfd8] space-y-3">
            {result.slug && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#6c6a64]">
                <Globe size={13} className="text-[#cc785c]" />
                <span className="text-[#8e8b82]">Suggested Slug:</span>
                <span className="text-[#141413] bg-[#efe9de] px-2 py-0.5 rounded">/{result.slug}</span>
              </div>
            )}
            
            {result.meta_description && (
              <div className="text-xs font-sans bg-white p-3 rounded-lg border border-[#e6dfd8]">
                <span className="font-semibold text-[#6c6a64] block mb-1">Recommended Meta Description:</span>
                <p className="text-[#141413]">{result.meta_description}</p>
              </div>
            )}

            {result.focus_keywords && result.focus_keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-medium text-[#6c6a64] flex items-center gap-1 mr-1">
                  <Tag size={12} /> Keywords:
                </span>
                {result.focus_keywords.map((kw, i) => (
                  <span key={i} className="text-[11px] bg-[#efe9de] text-[#141413] px-2.5 py-0.5 rounded-full font-mono border border-[#e6dfd8]">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Full Article Content */}
          <div className="p-8 bg-white text-[#141413]">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-6 leading-tight border-b border-[#e6dfd8] pb-4">
              {result.title}
            </h1>
            <div 
              className="text-sm font-sans leading-relaxed text-[#3d3d3a] space-y-4 prose prose-stone max-w-none [&_h2]:text-xl [&_h2]:font-serif [&_h2]:text-[#141413] [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#141413] [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-xs [&_p]:text-xs [&_p]:leading-relaxed [&_strong]:text-[#141413]"
              dangerouslySetInnerHTML={{ __html: result.html_content }} 
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
