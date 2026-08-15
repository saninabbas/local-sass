import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { fetchApi } from '../../lib/api';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Tag,
  Compass,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const KeywordDiscovery: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadDiscovery = async () => {
    try {
      setLoading(true);
      const bizId = activeBusiness?.id;
      const res = await fetchApi(`/api/keywords/discover${bizId ? `?business_id=${bizId}` : ''}`, { method: 'POST' });
      if (res.success && res.data) {
        setCandidates(res.data);
      }
    } catch (err: any) {
      console.error("Failed to discover keywords:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscovery();
  }, [activeBusiness?.id]);

  const handleTrackKeyword = async (cand: any) => {
    try {
      const res = await fetchApi('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: cand.keyword, location: activeBusiness?.city })
      });

      if (res.success) {
        setFeedback({ type: 'success', message: `Added "${cand.keyword}" to active SERP tracking!` });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add keyword' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Compass size={12} />
                Candidate Term Extraction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Keyword Candidate Discovery
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Auto-extracted from your verified business category, location, and competitor search intent.
            </p>
          </div>

          <Button
            size="sm"
            onClick={loadDiscovery}
            disabled={discovering}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={13} className={discovering ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            <span>Re-Discover Candidates</span>
          </Button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Zero-Fabrication Disclaimer */}
        <div className="p-4 bg-[#efe9de]/50 rounded-2xl border border-[#e6dfd8] flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#6c6a64]">
            <Sparkles size={16} className="text-[#cc785c]" />
            <span>Candidate terms require SERP query verification. No synthetic rank numbers are assigned prior to search API check.</span>
          </div>
        </div>

        {/* Candidates Table */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Extracting candidate keywords...</span>
          </div>
        ) : (
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#e6dfd8] bg-[#efe9de]/40 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#141413]">
                Discovered Target Keywords ({candidates.length})
              </h3>
            </div>

            <div className="divide-y divide-[#e6dfd8]">
              {candidates.map((cand, idx) => (
                <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#efe9de]/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-base text-[#141413]">{cand.keyword}</span>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        cand.intent === 'LOCAL_TRANSACTIONAL' ? 'bg-emerald-100 text-emerald-800' :
                        cand.intent === 'COMMERCIAL' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {cand.intent}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#6c6a64] flex items-center gap-2">
                      <span>Target URL: {cand.target_url}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleTrackKeyword(cand)}
                    className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus size={14} className="text-[#cc785c]" />
                    <span>Track SERP Rank</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
