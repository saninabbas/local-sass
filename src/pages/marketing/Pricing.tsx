import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PLANS } from '../../config/plans';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckout } from '../../lib/api';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanClick = async (planKey: string) => {
    if (!user) {
      navigate(`/signup?plan=${planKey}`);
      return;
    }

    try {
      setLoadingPlan(planKey);
      const res = await createCheckout(planKey);
      const checkoutUrl = typeof res === 'string' ? res : (res?.url || res?.checkout_url);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        navigate('/dashboard/billing');
      }
    } catch (err: any) {
      alert(err.message || 'Could not start checkout session.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plansList = [
    {
      ...PLANS.starter,
      priceFormatted: billingCycle === 'monthly' ? '$15' : '$12',
      badge: "1 Website",
      cta: "Start Starter",
      popular: false
    },
    {
      ...PLANS.growth,
      priceFormatted: billingCycle === 'monthly' ? '$30' : '$24',
      badge: "MOST POPULAR",
      cta: "Start Growth",
      popular: true
    },
    {
      ...PLANS.agency_pro,
      priceFormatted: billingCycle === 'monthly' ? '$80' : '$64',
      badge: "Unlimited Websites",
      cta: "Start Agency Pro",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans flex flex-col justify-between selection:bg-[#cc785c] selection:text-white">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-6 sm:px-8 border-b border-[#e6dfd8] bg-[#efe9de]/40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono uppercase tracking-wider text-[#cc785c] mb-6 shadow-2xs">
              <Sparkles size={13} /> Transparent Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#141413] tracking-tight mb-6">
              Invest in predictable <span className="italic text-[#cc785c]">local revenue growth</span>.
            </h1>
            <p className="text-base sm:text-lg text-[#6c6a64] max-w-2xl mx-auto leading-relaxed mb-8">
              Verified Polar subscriptions. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center p-1 bg-[#efe9de] border border-[#e6dfd8] rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                    : 'text-[#6c6a64] hover:text-[#141413]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                    : 'text-[#6c6a64] hover:text-[#141413]'
                }`}
              >
                Yearly Billing (Save 20%)
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-6 sm:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plansList.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 sm:p-8 rounded-2xl border transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-[#efe9de] border-[#cc785c] shadow-md relative'
                    : 'bg-[#faf9f5] border-[#e6dfd8] shadow-xs'
                }`}
              >
                <div>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c] text-white uppercase tracking-wider shadow-xs">
                      MOST POPULAR
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-xl text-[#141413] tracking-tight">{plan.name}</h3>
                    {plan.badge && !plan.popular && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8] uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#cc785c] font-sans italic mb-1">{plan.who}</p>
                  <p className="text-xs text-[#6c6a64] font-sans mb-6 leading-relaxed">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e6dfd8]">
                    <span className="font-semibold text-4xl text-[#141413] tracking-tight">{plan.priceFormatted}</span>
                    <span className="text-xs font-mono text-[#8e8b82]">
                      {billingCycle === 'yearly' ? '/month (billed annually)' : plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#141413]">
                        <Check size={14} className="text-[#cc785c] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="lg"
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-[#141413] hover:bg-[#252320] text-[#faf9f5]'
                      : 'bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] border border-[#e6dfd8]'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 size={13} className="animate-spin text-[#cc785c]" />
                  ) : (
                    <>
                      <span>{user ? `Upgrade to ${plan.name}` : plan.cta}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
