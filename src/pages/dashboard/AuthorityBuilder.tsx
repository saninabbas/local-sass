import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchAuthorityOpportunities, fetchBacklinks } from '../../lib/api';
import { Link2, Award, Zap, Building, Plus, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
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
      <div className="mb-8 mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Award className="text-indigo-500" size={32} />
            AI Authority Builder
          </h1>
          <p className="text-secondary max-w-2xl">
            Discover legitimate local partnership, directory, and content opportunities to build your business authority safely.
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'opportunities'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Link Opportunities
        </button>
        <button
          onClick={() => setActiveTab('citations')}
          className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'citations'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Local Citations
        </button>
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'backlinks'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Backlink Tracker
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'opportunities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No opportunities found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Our AI is analyzing your local market. Check back soon for legitimate authority-building ideas.</p>
            </div>
          ) : (
            opportunities.map(opp => (
              <div key={opp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                    {opp.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{opp.difficulty} Difficulty</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{opp.name}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">{opp.why_relevant}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-gray-500">Value:</span>
                    <span className={opp.value === 'High' ? 'text-green-600' : 'text-amber-600'}>{opp.value}</span>
                  </div>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center group">
                    Generate Outreach <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'backlinks' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Tracked Links</h2>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-2">
              <Plus size={16} /> Add Backlink
            </Button>
          </div>
          {backlinks.length === 0 ? (
            <div className="py-16 text-center">
              <Link2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No tracked links</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">Keep a manual record of the legitimate links and citations you secure.</p>
              <Button variant="outline">Add First Link</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Source URL</th>
                    <th className="px-6 py-4">Anchor Text</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Discovered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {backlinks.map(link => (
                    <tr key={link.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-indigo-600 max-w-[200px] truncate">
                        <a href={link.source_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {link.source_url} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{link.anchor_text || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">{link.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(link.discovered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
          <Building className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Local Citations</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-4">Discover directories where your business should be listed to build local trust signals.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
            <AlertCircle size={16} /> Scan running... Check back later.
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
