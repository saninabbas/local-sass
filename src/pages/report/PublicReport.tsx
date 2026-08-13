import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary font-medium text-lg">Loading Report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="h-16 w-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-secondary">{error || "This audit report doesn't exist or is not complete."}</p>
        </div>
      </div>
    );
  }

  const { audit, business, scores, recommendations } = data;
  const auditDate = new Date(audit.completed_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 print:bg-white font-sans">
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="fixed bottom-6 inset-x-0 mx-auto max-w-[250px] bg-white rounded-full shadow-lg border border-gray-200 p-2 flex justify-center print:hidden z-50">
        <button
          onClick={handlePrint}
          className="bg-primary text-white px-6 py-2 rounded-full font-medium shadow hover:bg-primary-dark transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 mb-8">
          
          {/* Header */}
          <header className="border-b border-gray-100 pb-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{business.name}</h1>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {business.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-secondary uppercase tracking-wider font-semibold">Audit Report</div>
                <div className="text-lg text-gray-900 font-medium">{auditDate}</div>
              </div>
            </div>
          </header>

          {/* Scores Overview */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Overall Score</div>
                <div className="text-5xl font-extrabold text-primary">{scores.overall_score}</div>
                <div className="text-xs text-primary/70 font-medium mt-1">/ 100</div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-sm font-medium text-secondary mb-2">SEO Health</div>
                <div className="text-4xl font-bold text-gray-900">{scores.seo_score}</div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-sm font-medium text-secondary mb-2">Website</div>
                <div className="text-4xl font-bold text-gray-900">{scores.website_score}</div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-sm font-medium text-secondary mb-2">Visibility</div>
                <div className="text-4xl font-bold text-gray-900">{scores.visibility_score}</div>
              </div>
            </div>
          </section>

          {/* Recommendations Page Break for Print */}
          <div className="print:break-before-auto"></div>

          {/* Recommendations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Actionable Recommendations</h2>
            <div className="space-y-6">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm print:shadow-none print:border-b print:rounded-none">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white bg-${rec.priority_color}`}>
                            {rec.priority} PRIORITY
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                      </div>
                      
                      <div className="flex gap-4 text-sm font-medium">
                        <div className="flex flex-col items-end">
                          <span className="text-secondary text-xs uppercase tracking-wider">Impact</span>
                          <span className="text-gray-900">{rec.impact}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-secondary text-xs uppercase tracking-wider">Time</span>
                          <span className="text-gray-900">{rec.estimated_minutes}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {rec.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-secondary italic">No recommendations found.</p>
              )}
            </div>
          </section>

          {/* Footer for print */}
          <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-secondary hidden print:block">
            <p>Generated by LocalSaaS SEO Auditor</p>
            <p className="mt-1">{window.location.origin}/report/{id}</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
