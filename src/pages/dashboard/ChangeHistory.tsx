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
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ChangeHistory: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <History size={12} />
                Audit Log & Change Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Executed SEO Change History
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Before vs After diff logs for every approved fix with live HTML re-crawl verification status.
            </p>
          </div>

          <Button
            size="sm"
            onClick={loadChanges}
            disabled={loading}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            <span>Refresh Change Logs</span>
          </Button>
        </div>

        {/* Change Logs List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Fetching change history logs...</span>
          </div>
        ) : changes.length === 0 ? (
          <div className="text-center py-16 bg-[#efe9de]/30 rounded-2xl border border-[#e6dfd8] p-8">
            <FileCode size={32} className="text-[#8e8b82] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#141413]">No Executed Changes Yet</h3>
            <p className="text-xs text-[#6c6a64] mt-1 max-w-sm mx-auto">
              Approve and apply campaign fixes in the SEO Campaign module to start tracking verified HTML changes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {changes.map((chg: any) => {
              const isVerified = chg.verification_status === 'VERIFIED';
              const isFailed = chg.verification_status === 'FAILED';

              return (
                <div key={chg.id} className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isFailed ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        STATUS: {chg.verification_status || 'PENDING'}
                      </span>
                      <span className="text-xs font-serif font-bold text-[#141413]">
                        {chg.change_type} UPDATE
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#8e8b82]">
                      Date: {chg.created_at ? new Date(chg.created_at).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase block mb-1">Target Page URL:</span>
                    <a href={chg.target_url} target="_blank" rel="noreferrer" className="text-xs font-mono text-[#cc785c] hover:underline flex items-center gap-1">
                      {chg.target_url} <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    {chg.before_data && (
                      <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-1">
                        <span className="text-[10px] font-bold text-red-800 uppercase block">Before Code / Telemetry:</span>
                        <div className="text-red-950 font-mono text-[11px] break-all">{chg.before_data}</div>
                      </div>
                    )}

                    {chg.generated_data && (
                      <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Applied & Verified Fix:</span>
                        <div className="text-emerald-950 font-mono text-[11px] break-all">{chg.generated_data}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
