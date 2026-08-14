import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchAuthorityOpportunities, fetchBacklinks } from '../../lib/api';
import { Link2, Award, Zap, Building, Plus, AlertCircle, ArrowRight, ExternalLink, Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuthorityBuilder() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'backlinks' | 'citations'>('opportunities');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'opportunities') {
        const data = await fetchAuthorityOpportunities();
        setOpportunities(data || []);
      } else if (activeTab === 'backlinks') {
        const data = await fetchBacklinks();
        setBacklinks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
            <Award className="text-[#cc785c]" size={26} />
            AI Authority Builder
          </h1>
          <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
            Discover verified local partnership, directory, and citation opportunities to build your business authority safely.
          </p>
        </div>
      </div>

      <div className="flex border-b border-[#e6dfd8] mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`py-3 px-5 font-sans font-medium text-xs whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'opportunities'
              ? 'border-[#cc785c] text-[#cc785c] font-semibold'
              : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          Link Opportunities
        </button>
        <button
          onClick={() => setActiveTab('citations')}
          className={`py-3 px-5 font-sans font-medium text-xs whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'citations'
              ? 'border-[#cc785c] text-[#cc785c] font-semibold'
              : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          Local Citations
        </button>
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`py-3 px-5 font-sans font-medium text-xs whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'backlinks'
              ? 'border-[#cc785c] text-[#cc785c] font-semibold'
              : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          Backlink Tracker
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-[#cc785c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'opportunities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#efe9de] rounded-xl border border-[#e6dfd8]">
              <Zap className="mx-auto h-10 w-10 text-[#8e8b82] mb-3" />
              <h3 className="text-base font-serif font-medium text-[#141413] mb-1">No opportunities found</h3>
              <p className="text-xs text-[#6c6a64] max-w-sm mx-auto font-sans">Our AI is analyzing your local market. Check back soon for legitimate authority-building ideas.</p>
            </div>
          ) : (
            opportunities.map(opp => (
              <div key={opp.id} className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5 flex flex-col hover:shadow-md transition-shadow relative">
                {opp.status === 'Prospect' && (
                  <div className="absolute top-0 right-0 left-0 bg-[#e8a55a]/15 border-b border-[#e8a55a]/30 text-[#e8a55a] text-[9px] uppercase font-mono font-bold text-center py-0.5 rounded-t-xl tracking-wider">
                    Verify AI Prospect before contacting
                  </div>
                )}
                <div className={`flex justify-between items-start mb-2 ${opp.status === 'Prospect' ? 'mt-3' : ''}`}>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c] uppercase">
                      {opp.type.replace('_', ' ')}
                    </span>
                    {opp.status === 'Verified' ? (
                       <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#5db872]/20 text-[#2b753e] flex items-center gap-1">
                         <Check size={10} /> Verified
                       </span>
                    ) : (
                       <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#faf9f5] border border-[#e6dfd8] text-[#6c6a64] flex items-center gap-1">
                         <Sparkles size={10} /> AI Prospect
                       </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8b82]">{opp.difficulty}</span>
                </div>
                
                <h3 className="text-sm font-sans font-medium text-[#141413] mb-1">{opp.name}</h3>
                {opp.url && (
                  <a href={opp.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-[#cc785c] hover:underline flex items-center gap-1 mb-2">
                    {opp.url.replace(/^https?:\/\//, '').split('/')[0]} <ExternalLink size={10} />
                  </a>
                )}
                
                <p className="text-xs text-[#6c6a64] font-sans mb-4 flex-1 line-clamp-3 leading-relaxed">{opp.why_relevant}</p>
                
                <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-xs font-sans">
                    <span className="text-[#8e8b82]">Value:</span>
                    <span className={`font-medium ${opp.value === 'High' ? 'text-[#2b753e]' : 'text-[#e8a55a]'}`}>{opp.value}</span>
                  </div>
                  <button className="text-xs font-sans font-medium text-[#cc785c] hover:text-[#a9583e] flex items-center group">
                    Generate Outreach <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'backlinks' ? (
        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden">
          <div className="p-4 border-b border-[#e6dfd8] flex justify-between items-center bg-[#faf9f5]">
            <h2 className="text-sm font-serif font-medium text-[#141413]">Tracked Links</h2>
            <Button size="sm" className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-sans font-medium flex items-center gap-1.5 h-8">
              <Plus size={14} /> Add Backlink
            </Button>
          </div>
          {backlinks.length === 0 ? (
            <div className="py-12 text-center">
              <Link2 className="mx-auto h-10 w-10 text-[#8e8b82] mb-3" />
              <h3 className="text-base font-serif font-medium text-[#141413] mb-1">No tracked links</h3>
              <p className="text-xs text-[#6c6a64] max-w-sm mx-auto mb-4 font-sans">Keep a record of the verified citations and partnerships you secure.</p>
              <Button variant="outline" size="sm" className="text-xs border-[#e6dfd8] bg-[#faf9f5] text-[#141413]">Add First Link</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#e8e0d2] text-[10px] uppercase font-mono text-[#6c6a64] border-b border-[#e6dfd8]">
                  <tr>
                    <th className="px-5 py-3">Source URL</th>
                    <th className="px-5 py-3">Anchor Text</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Discovered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                  {backlinks.map(link => (
                    <tr key={link.id} className="hover:bg-[#efe9de]/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-[#cc785c] max-w-[200px] truncate">
                        <a href={link.source_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {link.source_url} <ExternalLink size={11} />
                        </a>
                      </td>
                      <td className="px-5 py-3 text-[#3d3d3a]">{link.anchor_text || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-[#5db872]/20 text-[#2b753e] rounded text-[10px] font-mono font-semibold">{link.status}</span>
                      </td>
                      <td className="px-5 py-3 text-[#8e8b82] font-mono text-[10px]">{new Date(link.discovered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center bg-[#efe9de] rounded-xl border border-[#e6dfd8]">
          <Building className="mx-auto h-10 w-10 text-[#8e8b82] mb-3" />
          <h3 className="text-base font-serif font-medium text-[#141413] mb-1">Local Citations</h3>
          <p className="text-xs text-[#6c6a64] max-w-sm mx-auto mb-4 font-sans">Discover regional directories and maps to strengthen local trust signals.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c] rounded-lg text-xs font-sans font-medium">
            <AlertCircle size={14} /> Scan running... Check back after next audit.
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
