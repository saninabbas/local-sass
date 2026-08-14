import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { generateBlogArticle } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { 
  FileText,
  Sparkles,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Globe,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Check
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlogResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'preview'>('generate');

  const handleGenerate = async (topicToUse?: string) => {
    const t = topicToUse || topic;
    try {
      setLoading(true);
      setError(null);
      setCopied(false);
      const res = await generateBlogArticle(t || undefined);
      setResult(res);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || "Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (mode: 'html' | 'text' = 'html') => {
    if (!result) return;
    let contentToCopy = '';
    if (mode === 'html') {
      contentToCopy = `<h1>${result.title}</h1>\n${result.html_content}`;
    } else {
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
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Sparkles className="text-primary-accent" size={26} />
            AI Content Engine & Gap Publisher
          </h1>
          <p className="text-xs text-secondary mt-1">
            Generate high-converting, local SEO optimized service articles with FAQ schema and internal link suggestions.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Topic Generator */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <FileText size={18} className="text-primary-accent" />
            Article Configuration
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Target Topic or Focus Service
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How Much Does Emergency Plumbing Cost in Seattle? 2026 Price Guide"
                className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent min-h-[90px]"
              />
            </div>

            <Button
              variant="primary"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs h-10 flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{loading ? 'Crafting 800-Word SEO Guide...' : 'Generate Full SEO Article'}</span>
            </Button>
          </div>

          {/* Preset High-Intent Topics */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
              High-Converting Local Topics:
            </span>
            {[
              "Complete Cost & Pricing Guide for 2026",
              "5 Warning Signs You Need an Immediate Specialist Consultation",
              "How to Choose the Best Certified Provider in Your City"
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(preset);
                  handleGenerate(preset);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-xs font-medium text-primary hover:text-primary-accent border border-gray-100 transition-colors cursor-pointer"
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (2 cols): Generated Article Preview */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[500px]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 m-auto">
              <div className="w-10 h-10 border-3 border-primary-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-secondary font-medium">Researching local keyword intent and writing formatted HTML article...</span>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Meta & Slug Banner */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">SEO Meta Description:</span>
                  <span className="font-mono text-secondary text-[11px]">{result.read_time_minutes || 4} min read</span>
                </div>
                <p className="text-secondary leading-relaxed">{result.meta_description}</p>
                {result.slug && (
                  <div className="pt-1 font-mono text-[11px] text-primary-accent">
                    URL Slug: /{result.slug}/
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-primary">{result.title}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy('text')}
                    className="text-xs border-gray-200"
                  >
                    Copy Plain Text
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopy('html')}
                    className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied HTML!' : 'Copy HTML Code'}</span>
                  </Button>
                </div>
              </div>

              {/* Formatted HTML Article Content */}
              <div 
                className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-primary prose-p:text-secondary prose-p:leading-relaxed prose-li:text-secondary"
                dangerouslySetInnerHTML={{ __html: result.html_content }}
              />
            </div>
          ) : (
            <div className="py-24 text-center m-auto space-y-3">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="text-base font-bold text-primary">Your Article Workspace is Ready</h3>
              <p className="text-xs text-secondary max-w-md mx-auto">
                Enter a topic or select a suggested high-intent title on the left to generate an authoritative 800-word local SEO guide with FAQs and schema markup.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
