import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { fetchApi } from '../../lib/api';
import { 
  Link2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const InternalLinks: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInternalLinks = async () => {
    try {
      setLoading(true);
      const bizId = activeBusiness?.id;
      const res = await fetchApi(`/api/internal-links/discover${bizId ? `?business_id=${bizId}` : ''}`);
      if (res.success && res.data) {
        setOpportunities(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load internal link opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternalLinks();
  }, [activeBusiness?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Link2 size={12} />
                Contextual Link Optimization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Internal Link Opportunities
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Unlinked target keyword mentions detected across your crawled internal pages.
            </p>
          </div>

          <Button
            size="sm"
            onClick={loadInternalLinks}
            disabled={loading}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            <span>Scan Internal Links</span>
          </Button>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Analyzing internal page link graph...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16 bg-[#efe9de]/30 rounded-2xl border border-[#e6dfd8] p-8">
            <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#141413]">No Internal Link Gaps Found!</h3>
            <p className="text-xs text-[#6c6a64] mt-1 max-w-sm mx-auto">
              Your internal page architecture has strong contextual linking across core service targets.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp: any) => (
              <div key={opp.id} className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {opp.confidence || 'HIGH'} CONFIDENCE
                    </span>
                    <span className="text-xs font-serif font-bold text-[#141413]">
                      Suggested Anchor: &ldquo;<strong className="text-[#cc785c]">{opp.anchor}</strong>&rdquo;
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8b82] uppercase">Status: {opp.status}</span>
                </div>

                <p className="text-xs text-[#6c6a64] font-sans">{opp.reason}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#efe9de]/40 rounded-xl border border-[#e6dfd8] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#8e8b82] uppercase block mb-0.5">Source Page</span>
                    <span className="text-[#141413] break-all">{opp.source_url}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8e8b82] uppercase block mb-0.5">Target Destination</span>
                    <span className="text-[#cc785c] break-all flex items-center gap-1">
                      {opp.target_url} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
