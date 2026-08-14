import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, AlertCircle } from 'lucide-react';

interface AuditData {
  audit: {
    id: string;
    completed_at: string;
    score: number;
  };
  business: {
    name: string;
    website_url: string;
    city: string;
    country: string;
    type: string;
  };
  scores: {
    overall_score: number;
    seo_score: number;
    website_score: number;
    visibility_score: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    impact: string;
    estimated_minutes: string;
    priority_color: string;
  }>;
}

export function PublicReport() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/public/audit/${id}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load report');
        }

        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 border-3 border-[#cc785c] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#6c6a64] font-sans text-xs">Loading Executive Report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4">
        <div className="bg-[#efe9de] p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-[#e6dfd8]">
          <div className="h-12 w-12 bg-[#c64545]/15 text-[#c64545] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-serif font-normal text-[#141413] mb-1">Report Not Found</h2>
          <p className="text-xs text-[#6c6a64] font-sans">{error || "This audit report does not exist or has expired."}</p>
        </div>
      </div>
    );
  }

  const { audit, business, scores, recommendations } = data;
  const auditDate = new Date(audit.completed_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] print:bg-white font-sans selection:bg-[#cc785c] selection:text-white">
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 inset-x-0 mx-auto max-w-[220px] bg-[#181715] rounded-full shadow-xl border border-[#252320] p-1.5 flex justify-center print:hidden z-50">
        <button
          onClick={handlePrint}
          className="bg-[#cc785c] text-white px-5 py-2 rounded-full text-xs font-sans font-medium hover:bg-[#a9583e] transition-colors flex items-center gap-2"
        >
          <Printer size={14} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0">
        <div className="bg-[#efe9de] rounded-2xl shadow-xs border border-[#e6dfd8] p-8 sm:p-12 print:shadow-none print:border-none print:p-0 mb-8">
          
          {/* Header */}
          <header className="border-b border-[#e6dfd8] pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img src="/brand/logo.svg" alt="Rankora" className="w-[110px] h-auto object-contain" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141413] mb-1">{business.name}</h1>
                <div className="text-xs text-[#6c6a64] font-mono">
                  <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-[#cc785c] hover:underline">
                    {business.website_url.replace(/^https?:\/\//, '')}
                  </a>
                  {business.city && <span className="ml-2 text-[#8e8b82]">· {business.city}, {business.country}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-[#6c6a64] uppercase tracking-wider">Executive Audit Report</div>
                <div className="text-xs font-mono text-[#141413] font-medium mt-0.5">{auditDate}</div>
              </div>
            </div>
          </header>

          {/* Scores Overview */}
          <section className="mb-10 print:mb-6">
            <h2 className="text-lg font-serif font-medium text-[#141413] mb-4">Performance Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#faf9f5] rounded-xl p-5 text-center border border-[#e6dfd8]">
                <div className="text-[10px] font-mono text-[#cc785c] uppercase tracking-wider mb-1">Growth Score</div>
                <div className="text-4xl font-serif font-normal text-[#141413]">{scores.overall_score}</div>
                <div className="text-[10px] font-mono text-[#8e8b82] mt-0.5">/ 100</div>
              </div>
              
              <div className="bg-[#faf9f5] rounded-xl p-5 text-center border border-[#e6dfd8]">
                <div className="text-[10px] font-mono text-[#6c6a64] uppercase tracking-wider mb-1">SEO Health</div>
                <div className="text-3xl font-serif font-normal text-[#141413]">{scores.seo_score}</div>
              </div>
              
              <div className="bg-[#faf9f5] rounded-xl p-5 text-center border border-[#e6dfd8]">
                <div className="text-[10px] font-mono text-[#6c6a64] uppercase tracking-wider mb-1">Website</div>
                <div className="text-3xl font-serif font-normal text-[#141413]">{scores.website_score}</div>
              </div>
              
              <div className="bg-[#faf9f5] rounded-xl p-5 text-center border border-[#e6dfd8]">
                <div className="text-[10px] font-mono text-[#6c6a64] uppercase tracking-wider mb-1">Visibility</div>
                <div className="text-3xl font-serif font-normal text-[#141413]">{scores.visibility_score}</div>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-lg font-serif font-medium text-[#141413] mb-4">Actionable AI Recommendations</h2>
            <div className="space-y-3.5">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="bg-[#faf9f5] rounded-xl border border-[#e6dfd8] p-5 shadow-xs print:shadow-none print:border-b print:rounded-none">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                            rec.priority === 'high' ? 'bg-[#c64545]/15 text-[#c64545] border-[#c64545]/30' :
                            rec.priority === 'medium' ? 'bg-[#e8a55a]/15 text-[#e8a55a] border-[#e8a55a]/30' :
                            'bg-[#efe9de] text-[#6c6a64] border-[#e6dfd8]'
                          }`}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <h3 className="text-sm font-sans font-medium text-[#141413]">{rec.title}</h3>
                      </div>
                      
                      <div className="flex gap-3 text-xs font-mono">
                        <div className="flex flex-col items-end">
                          <span className="text-[#8e8b82] text-[9px] uppercase">Impact</span>
                          <span className="text-[#141413] text-[11px]">{rec.impact}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[#8e8b82] text-[9px] uppercase">Time</span>
                          <span className="text-[#141413] text-[11px]">{rec.estimated_minutes}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6c6a64] font-sans italic">No critical recommendations found.</p>
              )}
            </div>
          </section>

          {/* Footer for print */}
          <footer className="mt-12 pt-6 border-t border-[#e6dfd8] text-center text-xs font-sans text-[#8e8b82] hidden print:block">
            <p>Generated by Rankora AI Local Auditor</p>
            <p className="mt-0.5 font-mono text-[10px]">{window.location.origin}/report/{id}</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
