import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLeads, getBusiness } from '../../lib/api';
import { Users, Copy, CheckCircle2, Link as LinkIcon, Download, Mail, Lock } from 'lucide-react';
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

  // Determine the widget base URL from current origin
  const widgetBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://local-sass.pages.dev';
  const embedCode = businessId 
    ? `<script src="${widgetBaseUrl}/widget.js?id=${businessId}" async></script>` 
    : '';

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
    link.setAttribute("download", "seo_leads.csv");
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
            Lead Generation Widget
          </h1>
          <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
            Embed the interactive audit widget on your website to capture high-intent inbound inquiries automatically.
          </p>
        </div>
        {isPro && leads.length > 0 && (
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-1.5 bg-[#efe9de] border-[#e6dfd8] text-xs text-[#141413]">
            <Download size={14} /> Export CSV
          </Button>
        )}
      </div>

      {!isPro ? (
        <div className="bg-[#efe9de] border border-[#cc785c]/30 rounded-xl p-8 mb-8 text-center relative overflow-hidden shadow-xs">
          <Lock className="text-[#cc785c] mx-auto mb-3" size={36} />
          <h2 className="text-xl font-serif font-medium text-[#141413] mb-2">Unlock Lead Capture Widget</h2>
          <p className="text-xs text-[#6c6a64] max-w-lg mx-auto mb-6 font-sans">
            Embed the SEO diagnostic widget on your website to capture inbound visitor leads directly into your dashboard.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-sans font-medium px-6 py-2 rounded-lg shadow-sm">
              Upgrade Now
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-5 mb-6 shadow-xs">
            <h2 className="text-sm font-serif font-medium text-[#141413] mb-2 flex items-center gap-2">
              <LinkIcon className="text-[#cc785c]" size={16} />
              Widget Embed Script
            </h2>
            <p className="text-xs text-[#6c6a64] font-sans mb-3">
              Paste this snippet right before the closing <code>&lt;/body&gt;</code> tag on your website to activate the floating audit button.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <code className="flex-1 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg p-2.5 w-full overflow-x-auto text-xs text-[#141413] font-mono whitespace-nowrap">
                {embedCode || 'Loading your widget code...'}
              </code>
              <Button onClick={handleCopy} disabled={!embedCode} size="sm" className="w-full sm:w-auto flex items-center gap-1.5 whitespace-nowrap bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-medium h-9">
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
          </div>

          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5] flex justify-between items-center">
              <h2 className="text-sm font-serif font-medium text-[#141413]">Captured Inbound Leads ({leads.length})</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-[#8e8b82]">
                <div className="w-6 h-6 border-2 border-[#cc785c] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Mail size={24} />
                </div>
                <h3 className="text-base font-serif font-medium text-[#141413] mb-1">No leads captured yet</h3>
                <p className="text-xs text-[#6c6a64] max-w-md mx-auto font-sans">
                  Embed the snippet on your website to start capturing prospective client inquiries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-[#e8e0d2] border-b border-[#e6dfd8] text-[10px] uppercase font-mono tracking-wider text-[#6c6a64]">
                      <th className="py-3 px-4 sm:px-6">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4 sm:px-6">Date Captured</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#efe9de]/50 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-medium text-[#141413]">{lead.name}</td>
                        <td className="py-3 px-4 text-[#6c6a64] font-mono">
                          <a href={`mailto:${lead.email}`} className="text-[#cc785c] hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-[#6c6a64] font-mono">
                          {lead.website_url ? (
                            <a href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`} target="_blank" rel="noopener noreferrer" className="text-[#cc785c] hover:underline">
                              {lead.website_url.replace(/^https?:\/\//i, '')}
                            </a>
                          ) : (
                            <span className="text-[#8e8b82]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-[10px] font-mono text-[#8e8b82]">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
