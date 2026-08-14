import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi } from '../../lib/api';
import { ScoreMetric } from '../../components/dashboard/ScoreMetric';
import { GrowthScoreCard } from '../../components/dashboard/GrowthScoreCard';

interface LatestAuditData {
  audit: any;
  scores: any;
  recommendations: any[];
}

export function Score() {
  const [data, setData] = useState<LatestAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi('/api/audit/latest');
      setData(response as LatestAuditData);
    } catch (err) {
      console.error("Failed to load latest audit", err);
      setError(err instanceof Error ? err : new Error('Failed to load audit data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your Growth Score telemetry..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadData} />
      </DashboardLayout>
    );
  }

  if (!data || !data.audit) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-[#efe9de] rounded-2xl shadow-sm border border-[#e6dfd8] py-16 mt-6">
          <h2 className="text-2xl font-serif font-normal text-[#141413] mb-2">No Score Diagnostic Available</h2>
          <p className="text-xs font-sans text-[#6c6a64] mb-6 max-w-md">
            Execute your initial autonomous audit to generate your diagnostic benchmark. Head to Overview to start.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { scores, recommendations } = data;

  return (
    <DashboardLayout>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-serif font-normal text-[#141413]">Growth Score Diagnostic Breakdown</h2>
        <p className="text-xs font-sans text-[#6c6a64] mt-1">Algorithmic evaluation across 100+ local ranking & performance parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <GrowthScoreCard score={scores.overall_score || 0} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreMetric label="Search Engine Index" score={scores.seo_score} />
          <ScoreMetric label="Core Web Vitals" score={scores.website_score} />
          <ScoreMetric label="Local Map Pack Visibility" score={scores.visibility_score} />
          <ScoreMetric label="Customer Review Sentiment" score={scores.reviews_score} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-serif font-medium text-[#141413] mb-3">Sub-System Telemetry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <ScoreMetric label="Technical Crawl" score={scores.technical_score} />
          <ScoreMetric label="On-Page Structure" score={scores.onpage_score} />
          <ScoreMetric label="Local Map Signals" score={scores.local_score} />
          <ScoreMetric label="Content Depth" score={scores.content_score} />
          <ScoreMetric label="Asset Delivery" score={scores.performance_score} />
          <ScoreMetric label="Mobile UX" score={scores.mobile_score} />
          <ScoreMetric label="Security SSL" score={scores.security_score} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-serif font-medium text-[#141413] mb-3">Targeted Action Recommendations</h3>
        {recommendations && recommendations.length > 0 ? (
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs divide-y divide-[#e6dfd8] overflow-hidden">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="p-4 bg-[#faf9f5] flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-sans font-medium text-xs text-[#141413]">{rec.title}</h4>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      rec.priority === 'high' ? 'bg-[#c64545]/15 text-[#c64545] border-[#c64545]/30' : 
                      rec.priority === 'medium' ? 'bg-[#e8a55a]/15 text-[#e8a55a] border-[#e8a55a]/30' : 
                      'bg-[#efe9de] text-[#6c6a64] border-[#e6dfd8]'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6c6a64] font-sans">No critical issues detected for this audit pass.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
