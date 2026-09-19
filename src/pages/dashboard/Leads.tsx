import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLeads, getBusiness } from '../../lib/api';
import { Users, Copy, CheckCircle2, Download, Mail, Lock, Sliders } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

interface Lead {
  id: string;
  name: string;
  email: string;
  website_url: string;
  created_at: string;
}

export function Leads() {
  const { user } = useAuth();
  const currentPlan = (user as any)?.subscription_status || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'growth' || currentPlan === 'enterprise';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [widgetHeadline, setWidgetHeadline] = useState('Get Your Free Local SEO & Ranking Audit');
  const [widgetButtonText, setWidgetButtonText] = useState('Run Free Audit');

  const widgetBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://local-sass.pages.dev';
  const embedCode = businessId 
    ? `<script src="${widgetBaseUrl}/widget.js?id=${businessId}" async></script>` 
    : `<script src="${widgetBaseUrl}/widget.js" async></script>`;

  useEffect(() => {
    if (isPro) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isPro]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessData, leadsData] = await Promise.all([
        getBusiness().catch(() => null),
        fetchLeads().catch(() => [])
      ]);
      if (businessData?.id) {
        setBusinessId(businessData.id);
      }
      setLeads(leadsData || []);
    } catch (error) {
      console.error("Failed to load leads data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Website URL', 'Date'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
        `"${l.name}"`, 
        `"${l.email}"`, 
        `"${l.website_url}"`, 
        `"${new Date(l.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scorankio_inbound_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
            <Users className="text-[#cc785c]" size={26} />
            Lead Generation Widget Builder
          </h1>
          <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
            Embed an interactive SEO audit widget on your website to capture high-intent inbound customer inquiries automatically.
          </p>
        </div>
        {isPro && leads.length > 0 && (
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 text-xs font-medium border-[#e6dfd8] bg-[#efe9de] text-[#141413] hover:bg-[#e8e0d2]"
          >
            <Download size={14} />
            Export CSV ({leads.length})
          </Button>
        )}
      </div>

      {!isPro && (
        <div className="bg-[#efe9de] border border-[#cc785c]/30 rounded-xl p-8 mb-8 text-center relative overflow-hidden shadow-xs">
          <Lock className="text-[#cc785c] mx-auto mb-3" size={36} />
          <h2 className="text-xl font-serif font-medium text-[#141413] mb-2">Unlock Inbound Lead Gen Widget</h2>
          <p className="text-xs text-[#6c6a64] max-w-lg mx-auto mb-6 font-sans">
            Deploying embeddable lead capture widgets and exporting customer submissions requires an active Growth or Pro plan.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-sans font-medium px-6 py-2 rounded-lg shadow-sm">
              Upgrade to Access
            </Button>
          </Link>
        </div>
      )}

      {isPro && (
        <div className="space-y-6">
          
          {/* Customizer & Live Interactive Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Embed Snippet & Customizer */}
            <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders size={16} className="text-[#cc785c]" />
                  <h3 className="font-serif font-medium text-sm text-[#141413]">Widget Configuration</h3>
                </div>

                <div className="space-y-3 text-xs font-sans mb-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase mb-1">Widget Headline</label>
                    <input
                      type="text"
                      value={widgetHeadline}
                      onChange={(e) => setWidgetHeadline(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs text-[#141413] font-sans focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase mb-1">Call-To-Action Button Text</label>
                    <input
                      type="text"
                      value={widgetButtonText}
                      onChange={(e) => setWidgetButtonText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs text-[#141413] font-sans focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  </div>
                </div>

                <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase mb-1">
                  1-Line Embed Snippet (Paste into HTML)
                </label>
                <div className="p-3 bg-[#faf9f5] rounded-lg border border-[#e6dfd8] text-xs font-mono text-[#cc785c] break-all select-all">
                  {embedCode}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e6dfd8] flex justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-sans font-medium transition-colors shadow-xs"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Script Tag'}</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="bg-[#181715] rounded-xl border border-[#252320] p-6 shadow-xs flex flex-col justify-between text-[#faf9f5]">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#5db872] px-2 py-0.5 rounded bg-[#252320] border border-[#5db872]/30 mb-3 inline-block">
                  Live Interactive Embed Preview
                </span>

                <div className="bg-[#faf9f5] text-[#141413] p-5 rounded-xl border border-[#e6dfd8] shadow-sm">
                  <h4 className="font-serif font-medium text-base mb-1 text-center">{widgetHeadline}</h4>
                  <p className="text-[11px] text-[#6c6a64] font-sans text-center mb-4">
                    Enter your website URL to receive a complimentary local audit breakdown.
                  </p>

                  <div className="space-y-2 text-xs font-sans">
                    <input
                      type="text"
                      disabled
                      placeholder="Your Name (e.g. Dr. Sarah Jenkins)"
                      className="w-full px-3 py-1.5 bg-[#efe9de]/50 border border-[#e6dfd8] rounded text-xs"
                    />
                    <input
                      type="email"
                      disabled
                      placeholder="Your Email (sarah@clinic.com)"
                      className="w-full px-3 py-1.5 bg-[#efe9de]/50 border border-[#e6dfd8] rounded text-xs"
                    />
                    <button
                      disabled
                      className="w-full py-2 bg-[#cc785c] text-white rounded font-medium text-xs shadow-xs"
                    >
                      {widgetButtonText}
                    </button>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#8e8b82] mt-4 block text-center">
                Submissions automatically flow into your Leads table and trigger instant email notifications.
              </span>
            </div>

          </div>

          {/* Captured Inbound Leads Table */}
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#e8e0d2] border-b border-[#e6dfd8] flex justify-between items-center text-xs font-sans">
              <h3 className="font-serif font-medium text-sm text-[#141413]">Captured Submissions ({leads.length})</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-[#8e8b82]">
                Loading captured leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="p-10 text-center text-xs font-sans text-[#6c6a64]">
                <Mail size={24} className="mx-auto text-[#8e8b82] mb-2" />
                <p className="font-medium text-[#141413]">No leads captured yet</p>
                <p className="text-[11px] text-[#8e8b82] mt-0.5">Embed the script above on your site to start receiving inquiries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-[#faf9f5] border-b border-[#e6dfd8] text-[10px] uppercase font-mono text-[#6c6a64]">
                      <th className="py-3 px-4">Contact Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Submitted Website</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-[#efe9de]/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-[#141413]">{l.name}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#cc785c]">{l.email}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#6c6a64]">{l.website_url}</td>
                        <td className="py-3 px-4 text-[#8e8b82] text-[11px] font-mono">{new Date(l.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
