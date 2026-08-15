import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchApi } from '../../lib/api';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Check, 
  RefreshCw,
  ExternalLink,
  Crown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Billing: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/billing/status');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load billing status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const handleCheckout = async (plan: 'growth' | 'pro') => {
    setLoadingCheckout(plan);
    try {
      const res = await fetchApi('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan,
          productId: plan === 'growth' ? '7594755d-5580-4b77-86ae-90baae0e20d8' : 'pro_package_id'
        })
      });

      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.error || 'Failed to initiate checkout session.');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setLoadingCheckout(null);
    }
  };

  const plan = data?.plan;
  const trial = data?.trial;
  const usage = data?.usage;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 font-mono">
                <CreditCard size={12} />
                Subscription & Entitlements
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Plan & Billing Management
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Manage your commercial tier, project limits, keyword allowances, and Polar billing portal.
            </p>
          </div>

          <Button
            size="sm"
            onClick={loadBilling}
            disabled={loading}
            className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
            <span>Refresh Status</span>
          </Button>
        </div>

        {/* Current Plan & Usage Summary Bar */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Loading billing state from server...</span>
          </div>
        ) : (
          <>
            <div className="bg-[#181715] text-[#faf9f5] rounded-3xl p-6 sm:p-8 border border-[#252320] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#a09d96]">
                  Active Membership
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-serif font-bold text-[#faf9f5]">
                    {plan?.name || 'Free Trial'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c]/20 text-[#cc785c] border border-[#cc785c]/40 uppercase">
                    {data?.user?.subscription_status === 'active' ? 'Active Paid' : '14-Day Free Trial'}
                  </span>
                </div>
                {trial?.isTrial && (
                  <p className="text-xs text-[#a09d96] font-sans flex items-center gap-1.5">
                    <Clock size={13} className="text-[#cc785c]" />
                    <span><strong>{trial.daysLeft} days remaining</strong> in your trial period.</span>
                  </p>
                )}
              </div>

              {/* Usage Meters */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#252320] p-3 rounded-2xl border border-[#3a3732]">
                  <span className="text-[10px] text-[#a09d96] uppercase block">Websites</span>
                  <span className="text-sm font-bold text-[#faf9f5]">
                    {usage?.projectsUsed || 1} / {plan?.project_limit || 1}
                  </span>
                </div>
                <div className="bg-[#252320] p-3 rounded-2xl border border-[#3a3732]">
                  <span className="text-[10px] text-[#a09d96] uppercase block">Keywords</span>
                  <span className="text-sm font-bold text-[#faf9f5]">
                    {usage?.keywordsUsed || 0} / {plan?.keyword_limit || 5}
                  </span>
                </div>
                <div className="bg-[#252320] p-3 rounded-2xl border border-[#3a3732]">
                  <span className="text-[10px] text-[#a09d96] uppercase block">AI Fixes</span>
                  <span className="text-sm font-bold text-[#faf9f5]">
                    {plan?.ai_limit || 15}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#141413]">
                Available Production Plans
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Free / Trial */}
                <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    <div>
                      <span className="font-serif font-bold text-base text-[#141413] block">Starter / Trial</span>
                      <span className="text-xs text-[#6c6a64]">Test drive Rankora core features.</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#141413]">$0</div>
                    <ul className="space-y-2 text-xs font-sans text-[#6c6a64]">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 1 Website Project</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 5 Tracked Keywords</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 1 Local GeoGrid Scan</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 15 AI Fixes</li>
                    </ul>
                  </div>
                  <Button variant="outline" size="sm" disabled className="mt-6 w-full text-xs font-semibold">
                    Current Base Tier
                  </Button>
                </div>

                {/* Growth */}
                <div className="bg-[#faf9f5] border-2 border-[#cc785c] rounded-3xl p-6 flex flex-col justify-between shadow-md relative">
                  <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c] text-white uppercase">
                    Most Popular
                  </span>
                  <div className="space-y-4">
                    <div>
                      <span className="font-serif font-bold text-base text-[#141413] block">Growth Plan</span>
                      <span className="text-xs text-[#6c6a64]">Ideal for local business owners.</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#141413]">
                      $49<span className="text-xs font-sans font-normal text-[#8e8b82]">/mo</span>
                    </div>
                    <ul className="space-y-2 text-xs font-sans text-[#6c6a64]">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 5 Website Projects</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 50 Tracked Keywords</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 10 GeoGrid Scans</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 250 AI Fix Generations</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Weekly Re-Audits</li>
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCheckout('growth')}
                    disabled={loadingCheckout === 'growth'}
                    className="mt-6 w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold"
                  >
                    {loadingCheckout === 'growth' ? 'Opening Checkout...' : 'Upgrade to Growth'}
                  </Button>
                </div>

                {/* Pro / Agency */}
                <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    <div>
                      <span className="font-serif font-bold text-base text-[#141413] block">Agency / Pro</span>
                      <span className="text-xs text-[#6c6a64]">For agencies managing multi-client SEO.</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#141413]">
                      $149<span className="text-xs font-sans font-normal text-[#8e8b82]">/mo</span>
                    </div>
                    <ul className="space-y-2 text-xs font-sans text-[#6c6a64]">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 25 Website Projects</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 500 Tracked Keywords</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 50 GeoGrid Scans</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 2,500 AI Fix Generations</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Lead Gen Funnel Access</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Agency White-Label Reports</li>
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCheckout('pro')}
                    disabled={loadingCheckout === 'pro'}
                    className="mt-6 w-full bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-semibold"
                  >
                    {loadingCheckout === 'pro' ? 'Opening Checkout...' : 'Upgrade to Agency'}
                  </Button>
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};
