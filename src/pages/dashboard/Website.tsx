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
          <RefreshCw className="animate-spin text-primary-accent mb-4" size={48} />
          <h2 className="text-xl font-bold text-primary">Analyzing your website...</h2>
          <p className="text-secondary mt-2">Fetching live SEO and technical signals.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center mt-8">
          <XCircle className="text-danger mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-danger mb-2">Analysis Failed</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-white text-danger font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate some basic signals based on the raw data
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
  
  const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-warning' : 'text-danger';

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 mt-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Globe className="text-primary-accent" size={32} />
            Website Analysis
          </h1>
          <p className="text-secondary">Live technical and content signals for <a href={data.url} target="_blank" rel="noreferrer" className="text-primary-accent hover:underline">{data.url}</a></p>
        </div>
        <button 
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center lg:col-span-1">
          <h2 className="text-lg font-bold text-secondary mb-6 uppercase tracking-wider">Health Score</h2>
          <div className={`text-7xl font-black mb-4 ${scoreColor}`}>
            {score}
          </div>
          <p className="text-secondary font-medium">
            {score >= 80 ? 'Excellent! Your website is well optimized.' : score >= 60 ? 'Good, but has room for improvement.' : 'Critical issues detected. Fix immediately.'}
          </p>
        </div>

        {/* Content Signals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Search className="text-secondary" size={20} />
            Content & SEO Signals
          </h2>
          <div className="space-y-6">
            
            {/* Title */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="mt-1 shrink-0">
                {isTitleGood ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-warning" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-primary">Title Tag</h3>
                  <span className="text-xs font-bold text-secondary">{data.title.length} chars</span>
                </div>
                <p className="text-sm text-secondary mb-2">Ideal length is 10-70 characters.</p>
                <div className="text-sm text-primary bg-white p-3 rounded border border-gray-200 break-all font-mono">
                  {data.title || <span className="text-gray-400 italic">No title tag found</span>}
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="mt-1 shrink-0">
                {isDescGood ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-warning" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-primary">Meta Description</h3>
                  <span className="text-xs font-bold text-secondary">{data.metaDescription.length} chars</span>
                </div>
                <p className="text-sm text-secondary mb-2">Ideal length is 50-160 characters.</p>
                <div className="text-sm text-primary bg-white p-3 rounded border border-gray-200 break-all font-mono">
                  {data.metaDescription || <span className="text-gray-400 italic">No meta description found</span>}
                </div>
              </div>
            </div>

            {/* H1 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="mt-1 shrink-0">
                {isH1Good ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-danger" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-primary mb-1">H1 Heading</h3>
                <p className="text-sm text-secondary mb-2">Every page should have exactly one H1 tag.</p>
                <div className="text-sm text-primary bg-white p-3 rounded border border-gray-200 break-all font-mono">
                  {data.h1 || <span className="text-danger font-bold">Missing H1 Heading!</span>}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Technical Grid */}
      <h2 className="text-xl font-bold text-primary mt-12 mb-6">Technical Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-3 ${data.https ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <Lock size={24} />
          </div>
          <h3 className="font-bold text-primary mb-1">Security (SSL)</h3>
          <p className="text-sm text-secondary">
            {data.https ? 'Secure (HTTPS active)' : 'Insecure (Missing HTTPS)'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mb-3">
            <Heading1 size={24} />
          </div>
          <h3 className="font-bold text-primary mb-1">Headings</h3>
          <p className="text-sm text-secondary">
            {data.headingsCount} heading tags found
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mb-3">
            <Code size={24} />
          </div>
          <h3 className="font-bold text-primary mb-1">Scripts</h3>
          <p className="text-sm text-secondary">
            {data.scriptCount} script tags detected
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-orange-50 text-orange-600 mb-3">
            <LinkIcon size={24} />
          </div>
          <h3 className="font-bold text-primary mb-1">Links</h3>
          <p className="text-sm text-secondary">
            {data.linkCount} total links found
          </p>
        </div>

      </div>

    </DashboardLayout>
  );
}
