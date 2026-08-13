import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi } from '../../lib/api';

interface AuditHistory {
  id: string;
  created_at: string;
  status: string;
  overall_score: number | null;
  seo_score: number | null;
  website_score: number | null;
  visibility_score: number | null;
}

export function Reports() {
  const [history, setHistory] = useState<AuditHistory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/api/audits');
      setHistory(data as AuditHistory[]);
    } catch (err) {
      console.error("Failed to load audit history", err);
      setError(err instanceof Error ? err : new Error('Failed to load history'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading audit history..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadHistory} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Audit History</h2>
        
        {(!history || history.length === 0) ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-2">No reports yet.</h3>
            <p className="text-secondary mb-0">Run your first audit from the dashboard to start tracking your progress.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold text-secondary">
                    <th className="py-4 px-6">Audit Date</th>
                    <th className="py-4 px-6 text-center">Growth Score</th>
                    <th className="py-4 px-6 text-center">SEO</th>
                    <th className="py-4 px-6 text-center">Website</th>
                    <th className="py-4 px-6 text-center">Visibility</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((audit) => {
                    const date = new Date(audit.created_at);
                    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    return (
                      <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-medium text-primary">{formattedDate}</span>
                          <span className="block text-xs text-secondary mt-0.5">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {audit.overall_score !== null ? (
                            <span className="inline-flex items-center justify-center bg-blue-50 text-primary-accent font-bold h-8 w-12 rounded-lg text-sm">
                              {audit.overall_score}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-medium text-secondary">{audit.seo_score ?? '-'}</td>
                        <td className="py-4 px-6 text-center text-sm font-medium text-secondary">{audit.website_score ?? '-'}</td>
                        <td className="py-4 px-6 text-center text-sm font-medium text-secondary">{audit.visibility_score ?? '-'}</td>
                        <td className="py-4 px-6 text-center">
                          {audit.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success-dark">
                              Completed
                            </span>
                          ) : audit.status === 'running' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning-dark">
                              Running
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {audit.status === 'completed' && (
                            <a
                              href={`/report/${audit.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Report
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
