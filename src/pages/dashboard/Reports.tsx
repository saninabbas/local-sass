import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi } from '../../lib/api';
import { FileText, ExternalLink } from 'lucide-react';

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
      <div className="mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
          <FileText className="text-[#cc785c]" size={26} />
          Diagnostic Audit History
        </h1>
        <p className="text-xs text-[#6c6a64] font-sans">View previous audit scans, track score improvements, and access shareable public executive summaries.</p>
      </div>

      {(!history || history.length === 0) ? (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-12 text-center shadow-xs">
          <h3 className="text-base font-serif font-medium text-[#141413] mb-1">No diagnostic reports yet.</h3>
          <p className="text-xs text-[#6c6a64] font-sans">Execute your first audit from the Overview dashboard to start tracking progress.</p>
        </div>
      ) : (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#e8e0d2] border-b border-[#e6dfd8] text-[10px] uppercase font-mono tracking-wider text-[#6c6a64]">
                  <th className="py-3 px-4 sm:px-6">Audit Timestamp</th>
                  <th className="py-3 px-4 text-center">Growth Score</th>
                  <th className="py-3 px-4 text-center">SEO</th>
                  <th className="py-3 px-4 text-center">Website</th>
                  <th className="py-3 px-4 text-center">Visibility</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                {history.map((audit) => {
                  const date = new Date(audit.created_at);
                  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  return (
                    <tr key={audit.id} className="hover:bg-[#efe9de]/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-medium text-[#141413] text-xs">{formattedDate}</span>
                        <span className="block text-[10px] font-mono text-[#8e8b82] mt-0.5">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {audit.overall_score !== null ? (
                          <span className="inline-flex items-center justify-center bg-[#cc785c]/15 text-[#cc785c] font-mono font-bold h-7 w-11 rounded-lg text-xs">
                            {audit.overall_score}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-[#3d3d3a]">{audit.seo_score ?? '-'}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-[#3d3d3a]">{audit.website_score ?? '-'}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-[#3d3d3a]">{audit.visibility_score ?? '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        {audit.status === 'completed' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#5db872]/20 text-[#2b753e]">
                            Completed
                          </span>
                        ) : audit.status === 'running' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#e8a55a]/20 text-[#e8a55a]">
                            Running
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#c64545]/20 text-[#c64545]">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {audit.status === 'completed' && (
                          <a
                            href={`/report/${audit.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-[#cc785c] bg-[#efe9de] hover:bg-[#e8e0d2] rounded-lg border border-[#e6dfd8] transition-colors whitespace-nowrap"
                          >
                            <span>View Public Report</span>
                            <ExternalLink size={12} />
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
    </DashboardLayout>
  );
}
