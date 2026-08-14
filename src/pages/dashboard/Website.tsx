import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { analyzeWebsite } from '../../lib/api';
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Search,
  Code,
  Link as LinkIcon,
  Heading1,
  Lock
} from 'lucide-react';

interface WebsiteData {
  url: string;
  https: boolean;
  title: string;
  metaDescription: string;
  h1: string;
  headingsCount: number;
  scriptCount: number;
  linkCount: number;
}

export function Website() {
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await analyzeWebsite();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze website.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="animate-spin text-[#cc785c] mb-4" size={40} />
          <h2 className="text-xl font-serif font-normal text-[#141413]">Analyzing your website...</h2>
          <p className="text-xs text-[#6c6a64] font-sans mt-1">Extracting live SEO and technical signals.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="bg-[#efe9de] border border-[#c64545]/30 rounded-xl p-8 text-center mt-6">
          <XCircle className="text-[#c64545] mx-auto mb-3" size={40} />
          <h2 className="text-xl font-serif font-normal text-[#141413] mb-1">Analysis Failed</h2>
          <p className="text-xs text-[#c64545] font-mono mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="px-5 py-2 bg-[#faf9f5] text-[#141413] text-xs font-medium rounded-lg border border-[#e6dfd8] hover:bg-[#e8e0d2] transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate basic signals based on raw data
  const isTitleGood = data.title.length > 10 && data.title.length < 70;
  const isDescGood = data.metaDescription.length > 50 && data.metaDescription.length < 160;
  const isH1Good = data.h1.trim().length > 0;
  
  // Scoring
  let score = 100;
  if (!isTitleGood) score -= 15;
  if (!isDescGood) score -= 15;
  if (!isH1Good) score -= 20;
  if (!data.https) score -= 20;
  if (data.scriptCount > 30) score -= 10;
  
  const scoreColor = score >= 80 ? 'text-[#5db872]' : score >= 60 ? 'text-[#e8a55a]' : 'text-[#c64545]';

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 mt-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
            <Globe className="text-[#cc785c]" size={26} />
            Website Technical Analysis
          </h1>
          <p className="text-xs text-[#6c6a64] font-sans">Live technical and content signals for <a href={data.url} target="_blank" rel="noreferrer" className="text-[#cc785c] hover:underline font-mono">{data.url}</a></p>
        </div>
        <button 
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#efe9de] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium text-[#141413] hover:bg-[#e8e0d2] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#cc785c]' : 'text-[#cc785c]'} />
          {refreshing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Score Card */}
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-6 flex flex-col items-center justify-center text-center lg:col-span-1 shadow-xs">
          <h2 className="text-xs font-mono text-[#6c6a64] mb-4 uppercase tracking-widest">Health Score</h2>
          <div className={`text-6xl font-serif font-normal mb-2 ${scoreColor}`}>
            {score}
          </div>
          <p className="text-xs text-[#6c6a64] font-sans">
            {score >= 80 ? 'Excellent! Your website is well optimized.' : score >= 60 ? 'Good, but has room for improvement.' : 'Critical issues detected. Fix immediately.'}
          </p>
        </div>

        {/* Content Signals */}
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-6 lg:col-span-2 shadow-xs">
          <h2 className="text-base font-serif font-medium text-[#141413] mb-4 flex items-center gap-2">
            <Search className="text-[#cc785c]" size={18} />
            Content & SEO Signals
          </h2>
          <div className="space-y-4">
            
            {/* Title */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="mt-0.5 shrink-0">
                {isTitleGood ? <CheckCircle2 size={16} className="text-[#5db872]" /> : <XCircle size={16} className="text-[#e8a55a]" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-sans font-medium text-xs text-[#141413]">Title Tag</h3>
                  <span className="text-[10px] font-mono text-[#8e8b82]">{data.title.length} chars</span>
                </div>
                <p className="text-[11px] text-[#6c6a64] mb-1.5">Ideal length is 10-70 characters.</p>
                <div className="text-xs text-[#141413] bg-[#efe9de] p-2.5 rounded border border-[#e6dfd8] break-all font-mono">
                  {data.title || <span className="text-[#8e8b82] italic">No title tag found</span>}
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="mt-0.5 shrink-0">
                {isDescGood ? <CheckCircle2 size={16} className="text-[#5db872]" /> : <XCircle size={16} className="text-[#e8a55a]" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-sans font-medium text-xs text-[#141413]">Meta Description</h3>
                  <span className="text-[10px] font-mono text-[#8e8b82]">{data.metaDescription.length} chars</span>
                </div>
                <p className="text-[11px] text-[#6c6a64] mb-1.5">Ideal length is 50-160 characters.</p>
                <div className="text-xs text-[#141413] bg-[#efe9de] p-2.5 rounded border border-[#e6dfd8] break-all font-mono">
                  {data.metaDescription || <span className="text-[#8e8b82] italic">No meta description found</span>}
                </div>
              </div>
            </div>

            {/* H1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="mt-0.5 shrink-0">
                {isH1Good ? <CheckCircle2 size={16} className="text-[#5db872]" /> : <XCircle size={16} className="text-[#c64545]" />}
              </div>
              <div className="flex-1">
                <h3 className="font-sans font-medium text-xs text-[#141413] mb-1">H1 Heading</h3>
                <p className="text-[11px] text-[#6c6a64] mb-1.5">Every page should have exactly one H1 tag.</p>
                <div className="text-xs text-[#141413] bg-[#efe9de] p-2.5 rounded border border-[#e6dfd8] break-all font-mono">
                  {data.h1 || <span className="text-[#c64545] font-mono font-bold">Missing H1 Heading!</span>}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Technical Grid */}
      <h2 className="text-lg font-serif font-medium text-[#141413] mt-8 mb-4">Technical Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs flex flex-col items-center text-center">
          <div className={`p-2.5 rounded-full mb-2 ${data.https ? 'bg-[#5db872]/20 text-[#2b753e]' : 'bg-[#c64545]/20 text-[#c64545]'}`}>
            <Lock size={18} />
          </div>
          <h3 className="font-sans font-medium text-xs text-[#141413] mb-0.5">Security (SSL)</h3>
          <p className="text-[11px] font-mono text-[#6c6a64]">
            {data.https ? 'HTTPS Active' : 'Missing HTTPS'}
          </p>
        </div>

        <div className="bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs flex flex-col items-center text-center">
          <div className="p-2.5 rounded-full bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8] mb-2">
            <Heading1 size={18} />
          </div>
          <h3 className="font-sans font-medium text-xs text-[#141413] mb-0.5">Headings</h3>
          <p className="text-[11px] font-mono text-[#6c6a64]">
            {data.headingsCount} heading tags found
          </p>
        </div>

        <div className="bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs flex flex-col items-center text-center">
          <div className="p-2.5 rounded-full bg-[#faf9f5] text-[#e8a55a] border border-[#e6dfd8] mb-2">
            <Code size={18} />
          </div>
          <h3 className="font-sans font-medium text-xs text-[#141413] mb-0.5">Scripts</h3>
          <p className="text-[11px] font-mono text-[#6c6a64]">
            {data.scriptCount} scripts detected
          </p>
        </div>

        <div className="bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs flex flex-col items-center text-center">
          <div className="p-2.5 rounded-full bg-[#faf9f5] text-[#5db8a6] border border-[#e6dfd8] mb-2">
            <LinkIcon size={18} />
          </div>
          <h3 className="font-sans font-medium text-xs text-[#141413] mb-0.5">Links</h3>
          <p className="text-[11px] font-mono text-[#6c6a64]">
            {data.linkCount} total links found
          </p>
        </div>

      </div>

    </DashboardLayout>
  );
}
