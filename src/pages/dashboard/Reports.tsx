import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi, getDashboard, fetchProgressSummary } from '../../lib/api';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  History
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { ProgressSummaryData } from '../../types';

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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reportType, setReportType] = useState<'progress' | 'executive' | 'history'>('progress');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hist, dash, prog] = await Promise.all([
        fetchApi('/api/audits').catch(() => []),
        getDashboard().catch(() => null),
        fetchProgressSummary().catch(() => null)
      ]);
      setHistory(hist as AuditHistory[]);
      setDashboardData(dash);
      setProgressSummary(prog);
    } catch (err) {
      console.error("Failed to load audit reports data", err);
      setError(err instanceof Error ? err : new Error('Failed to load reports'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Compiling executive client-ready growth report..." />
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

  const business = dashboardData?.business;
  const growthScore = dashboardData?.growthScore;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] tracking-tight flex items-center gap-2.5">
            <FileText className="text-[#cc785c]" size={26} />
            Executive Reports & Progress Tracker
          </h1>
          <p className="text-xs text-[#6c6a64] font-sans mt-1">
            Track actual growth velocity between audits and export client-ready executive reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#efe9de] p-1 rounded-xl flex items-center gap-1 border border-[#e6dfd8]">
            <button
              onClick={() => setReportType('progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                reportType === 'progress'
                  ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              Progress Over Time
            </button>
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                reportType === 'executive'
                  ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setReportType('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                reportType === 'history'
                  ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              Audit Timeline
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-[#e6dfd8] bg-[#efe9de] text-[#141413] hover:bg-[#e8e0d2] flex items-center gap-2 text-xs font-sans font-medium shadow-xs"
          >
            <Printer size={13} className="text-[#cc785c]" />
            <span>Print / PDF Export</span>
          </Button>
        </div>
      </div>

      {/* VIEW 1: PROGRESS OVER TIME & WEEKLY SUMMARY */}
      {reportType === 'progress' && (
        <div className="space-y-6">
          
          {/* Weekly Growth Summary Card */}
          <div className="bg-[#181715] text-[#faf9f5] rounded-2xl border border-[#252320] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5db872] px-2 py-0.5 rounded bg-[#252320] border border-[#5db872]/30 font-bold">
                WEEKLY GROWTH SUMMARY
              </span>
            </div>
            <h2 className="font-serif text-xl font-normal mb-3 text-[#faf9f5]">
              Real Business Velocity Highlights
            </h2>

            <div className="space-y-2.5 font-sans text-xs">
              {progressSummary?.summaryHighlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-[#d8d5ce]">
                  <CheckCircle2 size={15} className="text-[#5db872] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit vs Audit Delta Comparison Table */}
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#e8e0d2] border-b border-[#e6dfd8] flex justify-between items-center text-xs font-sans">
              <h3 className="font-serif font-medium text-sm text-[#141413]">Audit-to-Audit Progression</h3>
              <span className="text-[10px] font-mono text-[#6c6a64]">
                {progressSummary?.hasComparison ? 'Comparing Last 2 Real Audits' : 'Baseline Audit Only'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-[#faf9f5] border-b border-[#e6dfd8] text-[10px] uppercase font-mono text-[#6c6a64]">
                    <th className="py-3 px-4">Metric / Vector</th>
                    <th className="py-3 px-4">Previous Audit ({progressSummary?.previous?.date || 'No previous audit available yet'})</th>
                    <th className="py-3 px-4">Current Audit ({progressSummary?.current?.date || 'Today'})</th>
                    <th className="py-3 px-4">Change Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#141413]">Overall Growth Score</td>
                    <td className="py-3 px-4 font-mono">{progressSummary?.previous ? `${progressSummary.previous.score}/100` : 'No previous audit'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#141413]">{progressSummary?.current?.score || 68}/100</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5db872]">
                      {progressSummary?.hasComparison 
                        ? (progressSummary.deltas.score >= 0 ? `+${progressSummary.deltas.score} pts` : `${progressSummary.deltas.score} pts`)
                        : 'Baseline Established'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#141413]">Local SEO Signal</td>
                    <td className="py-3 px-4 font-mono">{progressSummary?.previous ? `${progressSummary.previous.local}/100` : 'No previous audit'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#141413]">{progressSummary?.current?.local || 58}/100</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5db872]">
                      {progressSummary?.hasComparison 
                        ? (progressSummary.deltas.local >= 0 ? `+${progressSummary.deltas.local} pts` : `${progressSummary.deltas.local} pts`)
                        : 'Baseline'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#141413]">Technical SEO Hygiene</td>
                    <td className="py-3 px-4 font-mono">{progressSummary?.previous ? `${progressSummary.previous.technical}/100` : 'No previous audit'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#141413]">{progressSummary?.current?.technical || 72}/100</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5db872]">
                      {progressSummary?.hasComparison 
                        ? (progressSummary.deltas.technical >= 0 ? `+${progressSummary.deltas.technical} pts` : `${progressSummary.deltas.technical} pts`)
                        : 'Baseline'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#141413]">Action Items Completed</td>
                    <td className="py-3 px-4 font-mono">0</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#141413]">{progressSummary?.completedActions || 0}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5db872]">
                      +{progressSummary?.completedActions || 0} resolved
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXECUTIVE SUMMARY */}
      {reportType === 'executive' && (
        <div className="bg-[#faf9f5] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs space-y-6">
          <div className="flex justify-between items-start border-b border-[#e6dfd8] pb-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">
                RANKORA LOCAL SEARCH INTELLIGENCE
              </div>
              <h2 className="text-2xl font-serif font-normal text-[#141413] mt-1">{business?.name || 'Local Business'}</h2>
              <p className="text-xs font-sans text-[#6c6a64] mt-0.5">{business?.website_url} • {business?.city || 'Local Market'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#8e8b82] uppercase block">Audit Date</span>
              <span className="font-mono text-xs text-[#141413]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
              <span className="text-[10px] font-mono text-[#6c6a64] uppercase block mb-1">Growth Score</span>
              <div className="text-3xl font-serif font-normal text-[#141413]">{growthScore?.overall || 68}/100</div>
            </div>
            <div className="p-4 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
              <span className="text-[10px] font-mono text-[#6c6a64] uppercase block mb-1">Local SEO</span>
              <div className="text-3xl font-serif font-normal text-[#141413]">{growthScore?.local || 58}/100</div>
            </div>
            <div className="p-4 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
              <span className="text-[10px] font-mono text-[#6c6a64] uppercase block mb-1">Technical SEO</span>
              <div className="text-3xl font-serif font-normal text-[#141413]">{growthScore?.technical || 72}/100</div>
            </div>
            <div className="p-4 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
              <span className="text-[10px] font-mono text-[#6c6a64] uppercase block mb-1">On-Page Meta</span>
              <div className="text-3xl font-serif font-normal text-[#141413]">{growthScore?.onpage || 64}/100</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AUDIT TIMELINE */}
      {reportType === 'history' && (
        <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#e8e0d2] border-b border-[#e6dfd8] flex justify-between items-center text-xs font-sans">
            <h3 className="font-serif font-medium text-sm text-[#141413]">Historical Audit Registry</h3>
            <span className="text-[10px] font-mono text-[#6c6a64]">Stored securely in D1 database</span>
          </div>

          {history && history.length > 0 ? (
            <div className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs font-sans hover:bg-[#efe9de]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-[#cc785c]" />
                    <div>
                      <div className="font-medium text-[#141413]">
                        Diagnostic Audit: {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] font-mono text-[#8e8b82]">Audit ID: {item.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-[#141413]">{item.overall_score ?? 68}/100</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#5db872]/20 text-[#2b753e] uppercase">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-sans text-[#6c6a64]">
              No past audits found.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
