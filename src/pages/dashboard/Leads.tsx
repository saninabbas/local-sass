import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLeads, getBusiness } from '../../lib/api';
import { Users, Copy, CheckCircle2, Link as LinkIcon, Download, Mail } from 'lucide-react';
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
  const isPro = currentPlan === 'pro' || currentPlan === 'growth';

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
      // Fetch real business ID and leads in parallel
      const [businessData, leadsData] = await Promise.all([
        getBusiness().catch(() => null),
        fetchLeads().catch(() => [])
      ]);
      if (businessData?.id) {
        setBusinessId(businessData.id);
      }
      setLeads(leadsData || []);
    } catch (error) {
      console.error("Failed to load data", error);
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
      <div className="mb-8 mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <Users className="text-blue-500" size={32} />
            Lead Generation
          </h1>
          <p className="text-secondary max-w-2xl">
            Embed the SEO Audit widget on your website to capture emails and generate warm leads automatically.
          </p>
        </div>
        {isPro && leads.length > 0 && (
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        )}
      </div>

      {!isPro ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <Users className="text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-primary mb-3">Unlock Lead Generation</h2>
          <p className="text-secondary max-w-xl mx-auto mb-6">
            Get a beautiful widget to embed on your WordPress or Shopify site. Capture visitor emails automatically and turn them into paying clients.
          </p>
          <Link to="/dashboard/settings">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none shadow-lg">
              Upgrade to Access
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <LinkIcon className="text-blue-500" size={20} />
              Widget Embed Code
            </h2>
            <p className="text-sm text-secondary mb-4">
              Copy and paste this script right before the closing <code>&lt;/body&gt;</code> tag on your website. 
              It will display a floating "Free SEO Audit" button to your visitors.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 w-full overflow-x-auto text-sm text-gray-700 whitespace-nowrap">
                {embedCode || 'Loading your widget code...'}
              </code>
              <Button onClick={handleCopy} disabled={!embedCode} className="w-full sm:w-auto flex items-center gap-2 whitespace-nowrap">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary">Captured Leads ({leads.length})</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">No leads yet</h3>
                <p className="text-secondary max-w-md mx-auto">
                  Embed the widget on your website to start capturing leads. When visitors request an SEO audit, their details will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4 pl-6">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Website</th>
                      <th className="p-4 pr-6">Date Captured</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 pl-6 font-medium text-primary">{lead.name}</td>
                        <td className="p-4 text-secondary">
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition-colors">
                            {lead.email}
                          </a>
                        </td>
                        <td className="p-4 text-secondary">
                          {lead.website_url ? (
                            <a href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {lead.website_url.replace(/^https?:\/\//i, '')}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-sm text-gray-500">
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
