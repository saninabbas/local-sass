import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { getBillingPlan, createCheckout, openBillingPortal } from '../../lib/api';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  RefreshCw,
  ExternalLink,
  Crown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PLANS } from '../../config/plans';

export const Billing: React.FC = () => {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const res = await getBillingPlan();
      if (res) {
        setBillingData(res);
      }
    } catch (err: any) {
      console.error("Failed to load billing plan state:", err);
    } finally {
      setLoading(false);
    }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    loadBilling();
  }, []);

  const handleCheckout = async (planKey: string) => {
    setLoadingCheckout(planKey);
    setCheckoutError(null);
    try {
      const res = await createCheckout(planKey);
      const checkoutUrl = typeof res === 'string' ? res : (res?.url || res?.checkout_url);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setCheckoutError((res as any)?.error || 'Failed to initiate Polar checkout session.');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed.');
    } finally {
      setLoadingCheckout(null);
    }
  };


  const handleOpenPortal = async () => {
    try {
      setLoadingPortal(true);
      const res = await openBillingPortal();
      const portalUrl = res?.url || (res as any)?.portal_url;
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        alert('Could not open Polar customer portal.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to open customer portal.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlan = billingData?.plan || 'starter';
  const websitesUsed = billingData?.websitesUsed || 1;
  const websiteLimit = billingData?.websiteLimit;
  const isLimitExceeded = billingData?.isLimitExceeded || false;
  const subscriptionStatus = (billingData?.subscriptionStatus || 'active').toUpperCase();

  const planCards = [
    {
      ...PLANS.starter,
      priceDisplay: '$15',
      websiteLimitDisplay: '1 Website'
    },
    {
      ...PLANS.growth,
      priceDisplay: '$30',
      websiteLimitDisplay: '5 Websites'
    },
    {
      ...PLANS.agency_pro,
      priceDisplay: '$80',
      websiteLimitDisplay: 'Unlimited Websites'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 font-mono">
                <CreditCard size={12} />
                Polar Billing & Entitlements
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Plan & Subscription Management
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Deterministic website capacity, verified Polar subscription state, and self-serve customer portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenPortal}
              disabled={loadingPortal}
              className="border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] flex items-center gap-2 text-xs font-semibold"
            >
              {loadingPortal ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
              <span>Manage in Polar Portal</span>
            </Button>

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
        </div>

        {/* Limit Exceeded Alert */}
        {isLimitExceeded && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <span className="font-bold font-serif block text-sm">Website Capacity Exceeded</span>
              <span>
                You currently have <strong>{websitesUsed} websites</strong>, while your active plan allows <strong>{websiteLimit}</strong>. Existing websites and telemetry remain preserved, but creating additional websites is blocked until you upgrade.
              </span>
            </div>
          </div>
        )}

        {/* Past Due Warning */}
        {subscriptionStatus === 'PAST_DUE' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
            <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <span className="font-bold font-serif block text-sm">Subscription Payment Past Due</span>
              <span>
                Your last subscription payment could not be processed by Polar. Please update your payment method in the customer portal to maintain active SEO services.
              </span>
            </div>
          </div>
        )}

        {/* Checkout Error Banner */}
        {checkoutError && (
          <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="text-amber-600" size={18} />
                <span>Polar Product Configuration</span>
              </div>
              <button 
                onClick={() => setCheckoutError(null)} 
                className="text-amber-700 hover:text-amber-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="text-xs whitespace-pre-line font-mono leading-relaxed text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-200">
              {checkoutError}
            </div>
          </div>
        )}

        {/* Current Plan Bar */}

        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Verifying subscription state with Polar...</span>
          </div>
        ) : (
          <>
            <div className="bg-[#181715] text-[#faf9f5] rounded-3xl p-6 sm:p-8 border border-[#252320] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#a09d96]">
                  Active Verified Plan
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-serif font-bold text-[#faf9f5]">
                    {billingData?.planName || currentPlan.toUpperCase()}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    subscriptionStatus === 'ACTIVE'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
                <p className="text-xs text-[#a09d96] font-mono">
                  ${billingData?.price || 15}/month • {websiteLimit === null ? 'Unlimited Websites' : `${websiteLimit} Website Limit`}
                </p>
                {billingData?.currentPeriodEnd && (
                  <p className="text-[11px] text-[#8e8b82] font-mono">
                    Period Renewal: {new Date(billingData.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Usage Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#252320] p-3.5 rounded-2xl border border-[#3a3732]">
                  <span className="text-[10px] text-[#a09d96] uppercase block">Websites</span>
                  <span className="text-sm font-bold text-[#faf9f5]">
                    {websitesUsed} / {websiteLimit === null ? '∞' : websiteLimit}
                  </span>
                </div>
                <div className="bg-[#252320] p-3.5 rounded-2xl border border-[#3a3732]">
                  <span className="text-[10px] text-[#a09d96] uppercase block">Provider</span>
                  <span className="text-sm font-bold text-[#cc785c]">
                    Polar.sh
                  </span>
                </div>
                <div className="bg-[#252320] p-3.5 rounded-2xl border border-[#3a3732] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#a09d96] uppercase block">Auto-Renew</span>
                  <span className="text-sm font-bold text-[#faf9f5]">
                    {billingData?.cancelAtPeriodEnd ? 'Canceling' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Available Plans Grid */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#141413]">
                  Subscription Tiers
                </h3>
                <span className="text-xs font-mono text-[#8e8b82]">
                  Direct Server Checkout via Polar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planCards.map((plan) => {
                  const isCurrent = currentPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`p-6 sm:p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                        plan.popular
                          ? 'bg-[#efe9de] border-[#cc785c] shadow-md relative'
                          : 'bg-[#faf9f5] border-[#e6dfd8] shadow-xs'
                      }`}
                    >
                      <div>
                        {plan.popular && (
                          <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c] text-white uppercase tracking-wider shadow-xs">
                            Most Popular
                          </span>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-serif text-xl font-bold text-[#141413]">{plan.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#e6dfd8] font-bold text-[#6c6a64] uppercase">
                            {plan.websiteLimitDisplay}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#cc785c] font-sans italic mb-1">{plan.who}</p>
                        <p className="text-xs text-[#6c6a64] font-sans mb-4 leading-relaxed">{plan.description}</p>

                        <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e6dfd8]">
                          <span className="font-serif text-4xl font-bold text-[#141413]">{plan.priceDisplay}</span>
                          <span className="text-xs font-mono text-[#8e8b82]">/month</span>
                        </div>

                        <ul className="space-y-2.5 mb-8">
                          {plan.features.slice(0, 7).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#141413]">
                              <Check size={14} className="text-[#cc785c] shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isCurrent ? (
                        <Button
                          variant="outline"
                          disabled
                          className="w-full text-xs font-semibold py-2.5 bg-white border-[#cc785c] text-[#cc785c]"
                        >
                          <CheckCircle2 size={13} className="mr-1.5" />
                          <span>Current Plan</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleCheckout(plan.id)}
                          disabled={loadingCheckout === plan.id}
                          className={`w-full text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                            plan.popular
                              ? 'bg-[#141413] hover:bg-[#252320] text-[#faf9f5]'
                              : 'bg-[#cc785c] hover:bg-[#b8674d] text-white'
                          }`}
                        >
                          {loadingCheckout === plan.id ? (
                            <Loader2 size={13} className="animate-spin text-white" />
                          ) : (
                            <>
                              <span>Switch to {plan.name}</span>
                              <ArrowRight size={13} />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};
