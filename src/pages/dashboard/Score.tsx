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
        <LoadingState message="Loading your Growth Score..." />
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white rounded-2xl shadow-sm border border-gray-100 py-16 mt-6">
          <h2 className="text-3xl font-bold text-primary mb-4">No Score Available</h2>
          <p className="text-secondary mb-8 max-w-md">
            You need to run your first audit to generate a Growth Score. Head over to the Overview tab to get started.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { scores, recommendations } = data;

  return (
    <DashboardLayout>
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Growth Score Details</h2>
        <p className="text-secondary">A detailed breakdown of your overall online performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <GrowthScoreCard score={scores.overall_score || 0} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ScoreMetric label="SEO" score={scores.seo_score} />
          <ScoreMetric label="Website" score={scores.website_score} />
          <ScoreMetric label="Visibility" score={scores.visibility_score} />
          <ScoreMetric label="Reviews" score={scores.reviews_score} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-primary mb-4">Recommended Actions</h3>
        {recommendations && recommendations.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-primary">{rec.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-danger/10 text-danger' : 
                      rec.priority === 'medium' ? 'bg-warning/20 text-warning-dark' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-secondary">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No specific recommendations generated for this audit.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
