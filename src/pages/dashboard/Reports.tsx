import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchApi, getDashboard } from '../../lib/api';
import { 
  FileText, 
  ExternalLink, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  Star, 
  Globe, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reportType, setReportType] = useState<'executive' | 'history'>('executive');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hist, dash] = await Promise.all([
        fetchApi('/api/audits').catch(() => []),
        getDashboard().catch(() => null)
      ]);
      setHistory(hist as AuditHistory[]);
      setDashboardData(dash);
    } catch (err) {
      console.error("Failed to load audit history", err);
      setError(err instanceof Error ? err : new Error('Failed to load history'));
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <FileText className="text-primary-accent" size={26} />
            Executive Growth Reports
          </h1>
          <p className="text-xs text-secondary mt-1">
            Client-ready executive reports and diagnostic historical timeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reportType === 'executive' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-primary'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setReportType('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reportType === 'history' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-primary'
              }`}
            >
              Audit History ({history?.length || 0})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer size={14} />
            <span>Print / PDF Export</span>
          </Button>
        </div>
      </div>

      {reportType === 'executive' ? (
        <div className="space-y-6 mb-8">
          {/* Executive Client-Ready Report Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none space-y-6">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src="/brand/logo.png" alt="Rankora" className="h-10 w-auto" />
                <div>
                  <h2 className="text-xl font-bold text-primary">{business?.name || 'Local Business'}</h2>
                  <p className="text-xs text-secondary">{business?.city} • {business?.websiteUrl?.replace(/^https?:\/\//, '')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent uppercase border border-blue-200">
                  EXECUTIVE GROWTH AUDIT
                </span>
                <span className="block text-xs font-mono text-secondary mt-1">Generated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Score Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-secondary font-semibold">Overall Growth Score</span>
                <div className="text-3xl font-black text-primary mt-1">{growthScore?.overall || 68}/100</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-secondary font-semibold">Local SEO Power</span>
                <div className="text-3xl font-black text-emerald-600 mt-1">{growthScore?.local || 60}/100</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-secondary font-semibold">On-Page Signals</span>
                <div className="text-3xl font-black text-primary-accent mt-1">{growthScore?.onpage || 65}/100</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-secondary font-semibold">Technical Health</span>
                <div className="text-3xl font-black text-purple-600 mt-1">{growthScore?.technical || 70}/100</div>
              </div>
            </div>

            {/* Key Growth Findings */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Executive Diagnostics & Action Items
              </h3>
              <div className="space-y-2.5">
                {(dashboardData?.recommendations || []).slice(0, 4).map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary-accent mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-primary">{rec.title}</h4>
                      <p className="text-xs text-secondary mt-0.5 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Audit History Table */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-8">
          {(!history || history.length === 0) ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-primary mb-1">No Previous Audits Found</h3>
              <p className="text-xs text-secondary">Execute your first audit to start building historical progress logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold tracking-wider text-secondary">
                    <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                    <th className="py-3.5 px-4 text-center">Growth Score</th>
                    <th className="py-3.5 px-4 text-center">SEO</th>
                    <th className="py-3.5 px-4 text-center">Website</th>
                    <th className="py-3.5 px-4 text-center">Visibility</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-primary">
                        {new Date(audit.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-primary">
                        {audit.overall_score !== null ? `${audit.overall_score}/100` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-secondary">
                        {audit.seo_score ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-secondary">
                        {audit.website_score ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-secondary">
                        {audit.visibility_score ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                          {audit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
