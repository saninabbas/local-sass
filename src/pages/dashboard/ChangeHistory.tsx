import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { fetchApi } from '../../lib/api';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  FileCode, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Layers,
  Activity,
  Filter,
  Globe,
  ShoppingBag,
  GitBranch,
  AlertTriangle
} from 'lucide-react';
import { ExecutionStatusBadge } from '../../components/dashboard/ExecutionStatusBadge';
import { Button } from '../../components/ui/Button';

export const ChangeHistory: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<any | null>(null);
  const [changeEvents, setChangeEvents] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('ALL');

  const loadChanges = async () => {
    try {
      setLoading(true);
      const bizId = activeBusiness?.id;
      const res = await fetchApi(`/api/seo/changes${bizId ? `?business_id=${bizId}` : ''}`);
      if (res.success && res.data) {
        setChanges(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load change history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChanges();
  }, [activeBusiness?.id]);

  const handleOpenDetails = async (change: any) => {
    setSelectedChange(change);
    setLoadingDetails(true);
    try {
      const res = await fetchApi(`/api/seo/changes/${change.id}`);
      if (res.success && res.data) {
        setSelectedChange(res.data.change);
        setChangeEvents(res.data.events || []);
      }
    } catch (err: any) {
      console.warn("Failed to load change details:", err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredChanges = changes.filter(c => {
    // 1. Status Filter
    if (statusFilter !== 'ALL') {
      const st = (c.execution_status || c.verification_status || 'PENDING').toUpperCase();
      if (!st.includes(statusFilter)) return false;
    }

    // 2. Provider Filter
    if (providerFilter !== 'ALL') {
      const prov = (c.provider || 'MANUAL').toUpperCase();
      if (!prov.includes(providerFilter)) return false;
    }

    // 3. Change Type Filter
    if (changeTypeFilter !== 'ALL') {
      const ct = (c.change_type || '').toUpperCase();
      if (!ct.includes(changeTypeFilter)) return false;
    }

    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 font-mono">
                <History size={12} />
                Audit Trail & Execution Logs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              SEO Change History & Verification
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Complete before/after diffs, live HTTP verification evidence, and ranking impact observations for <strong className="text-[#141413]">{activeBusiness?.name || 'Current Project'}</strong>.
            </p>
          </div>

          <Button
            size="sm"
            onClick={loadChanges}
            disabled={loading}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            <span>Refresh Audit Logs</span>
          </Button>
        </div>

        {/* Multi-Vector Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#141413] uppercase">
            <Filter size={13} className="text-[#cc785c]" />
            <span>Filter Execution History:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-mono text-[#8e8b82] uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-[#e6dfd8] bg-[#faf9f5]"
              >
                <option value="ALL">All Statuses ({changes.length})</option>
                <option value="VERIFIED">Verified (Live Confirmed)</option>
                <option value="COMPLETED">Completed / Applied</option>
                <option value="PENDING">Pending Approval</option>
                <option value="STALE_CHANGE">Stale Change</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div>
              <label className="block text-[10px] font-mono text-[#8e8b82] uppercase mb-1">Provider</label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-[#e6dfd8] bg-[#faf9f5]"
              >
                <option value="ALL">All Providers</option>
                <option value="GITHUB">GitHub (Pull Requests)</option>
                <option value="WORDPRESS">WordPress (REST API)</option>
                <option value="SHOPIFY">Shopify (Admin API)</option>
                <option value="MANUAL">Manual Deployments</option>
              </select>
            </div>

            {/* Change Type Filter */}
            <div>
              <label className="block text-[10px] font-mono text-[#8e8b82] uppercase mb-1">Change Type</label>
              <select
                value={changeTypeFilter}
                onChange={(e) => setChangeTypeFilter(e.target.value)}
                className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-[#e6dfd8] bg-[#faf9f5]"
              >
                <option value="ALL">All Types</option>
                <option value="SEO_TITLE">SEO Title</option>
                <option value="META_DESCRIPTION">Meta Description</option>
                <option value="H1">H1 Heading</option>
                <option value="SCHEMA">Schema JSON-LD</option>
                <option value="SECURITY">Security Headers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={28} className="animate-spin text-[#cc785c] mx-auto mb-3" />
            <span>Loading verified execution history...</span>
          </div>
        ) : filteredChanges.length === 0 ? (
          <div className="text-center py-16 bg-[#efe9de]/30 rounded-3xl border border-[#e6dfd8] p-8 space-y-3">
            <History size={36} className="text-[#8e8b82] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#141413]">No Execution Logs Found</h3>
            <p className="text-xs text-[#6c6a64] max-w-md mx-auto">
              Changes applied and verified via the Campaign or Action Plan will appear here with live crawl evidence.
            </p>
          </div>
        ) : (
          <div className="bg-[#faf9f5] rounded-2xl border border-[#e6dfd8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#efe9de] border-b border-[#e6dfd8] text-[10px] font-mono uppercase text-[#6c6a64] tracking-wider">
                    <th className="p-4 font-bold">Element & Type</th>
                    <th className="p-4 font-bold">Provider</th>
                    <th className="p-4 font-bold">Target URL</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Before</th>
                    <th className="p-4 font-bold">Applied Fix</th>
                    <th className="p-4 font-bold">Verified Date</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8]">
                  {filteredChanges.map((change) => {
                    const status = change.execution_status || change.verification_status || 'GENERATED';
                    const prov = (change.provider || 'MANUAL').toUpperCase();

                    return (
                      <tr 
                        key={change.id}
                        onClick={() => handleOpenDetails(change)}
                        className="hover:bg-[#efe9de]/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-mono font-bold text-[#141413]">
                          <div>{change.change_type}</div>
                          <span className="text-[10px] text-[#8e8b82] font-normal">{change.target_element || 'DOM Element'}</span>
                        </td>
                        <td className="p-4 font-mono text-xs">
                          <span className="inline-flex items-center gap-1 font-bold text-[#141413]">
                            {prov === 'SHOPIFY' && <ShoppingBag size={12} className="text-[#5e8e3e]" />}
                            {prov === 'WORDPRESS' && <Globe size={12} className="text-[#0073aa]" />}
                            {prov === 'GITHUB' && <GitBranch size={12} className="text-[#cc785c]" />}
                            {prov}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[#6c6a64] max-w-[180px] truncate">
                          {change.page_url || change.target_url || activeBusiness?.website_url}
                        </td>
                        <td className="p-4">
                          <ExecutionStatusBadge status={status} size="sm" />
                        </td>
                        <td className="p-4 font-mono text-red-900 max-w-[140px] truncate">
                          {change.before_value || change.before_data || '-'}
                        </td>
                        <td className="p-4 font-mono text-emerald-950 max-w-[160px] truncate">
                          {change.after_value || change.generated_data || change.generated_content || '-'}
                        </td>
                        <td className="p-4 font-mono text-[10px] text-[#8e8b82]">
                          {change.verified_at ? new Date(change.verified_at).toLocaleDateString() : 'Pending'}
                        </td>
                        <td className="p-4 text-right">
                          <Button size="sm" variant="outline" className="text-[10px] font-semibold py-1 px-2">
                            View Audit
                          </Button>
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

      {/* Change Details Drawer / Modal */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#141413] text-[#faf9f5] flex items-center justify-center">
                  <FileCode size={18} className="text-[#cc785c]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#141413]">
                    {selectedChange.change_type} Execution Audit
                  </h3>
                  <p className="text-xs text-[#8e8b82] font-mono">
                    ID: {selectedChange.id} &bull; Target: {selectedChange.page_url || selectedChange.target_url}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChange(null)}
                className="p-1.5 rounded-xl text-[#8e8b82] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status & Telemetry Banner */}
            <div className="p-4 rounded-2xl bg-[#efe9de]/50 border border-[#e6dfd8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[#6c6a64]">Status:</span>
                <ExecutionStatusBadge status={selectedChange.execution_status || selectedChange.verification_status} />
              </div>
              <span className="text-xs font-mono text-[#141413] font-bold">
                Provider: {selectedChange.provider || 'MANUAL'}
              </span>
            </div>

            {/* GitHub Pull Request Metadata (if GitHub provider) */}
            {selectedChange.pull_request_url && (
              <div className="p-4 rounded-2xl bg-[#faf9f5] border border-[#cc785c]/40 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8e8b82] uppercase text-[10px] font-bold">GitHub Code Execution:</span>
                  <a
                    href={selectedChange.pull_request_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cc785c] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>View PR #{selectedChange.pull_request_number}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#8e8b82] block">Feature Branch:</span>
                    <span className="text-[#141413] font-bold truncate block">{selectedChange.feature_branch || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#8e8b82] block">Target File:</span>
                    <span className="text-[#141413] font-bold truncate block">{selectedChange.file_path || 'index.html'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Before vs After Diff */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-[#141413] flex items-center gap-1.5">
                <Layers size={14} className="text-[#cc785c]" />
                Code / Element Comparison Diff
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200">
                  <span className="text-[10px] text-red-700 font-bold block mb-1 uppercase">Before Execution</span>
                  <div className="text-red-950 whitespace-pre-wrap break-all">
                    {selectedChange.before_value || selectedChange.before_data || 'Missing / Incomplete'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block mb-1 uppercase">Applied / Verified Value</span>
                  <div className="text-emerald-950 whitespace-pre-wrap break-all">
                    {selectedChange.after_value || selectedChange.generated_data || selectedChange.generated_content || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Verification Evidence */}
            {selectedChange.verification_evidence && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs font-bold uppercase text-[#141413] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Live Re-Crawl Evidence Payload
                </h4>
                <div className="p-4 rounded-xl bg-[#181715] text-[#faf9f5] font-mono text-xs overflow-x-auto">
                  <pre>{typeof selectedChange.verification_evidence === 'string' ? selectedChange.verification_evidence : JSON.stringify(selectedChange.verification_evidence, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Execution Events Timeline */}
            {changeEvents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs font-bold uppercase text-[#141413] flex items-center gap-1.5">
                  <Activity size={14} className="text-[#cc785c]" />
                  Telemetry Timeline
                </h4>
                <div className="space-y-1.5 font-mono text-xs">
                  {changeEvents.map((evt) => (
                    <div key={evt.id} className="p-2.5 rounded-lg bg-white border border-[#e6dfd8] flex items-center justify-between">
                      <span className="font-bold text-[#141413]">{evt.event_type}</span>
                      <span className="text-[#8e8b82] text-[10px]">{new Date(evt.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#e6dfd8] flex justify-end">
              <Button size="sm" onClick={() => setSelectedChange(null)} className="bg-[#141413] text-[#faf9f5]">
                Close Audit View
              </Button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
