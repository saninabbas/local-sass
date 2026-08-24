import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckout } from '../../lib/api';
import { useState } from 'react';

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      navigate(`/signup?plan=${planKey}`);
      return;
    }

    try {
      setLoadingPlan(planKey);
      const res = await createCheckout(planKey);
      const targetUrl = typeof res === 'string' ? res : (res?.url || res?.checkout_url);
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        navigate('/dashboard/billing');
      }
    } catch (err: any) {
      alert("Checkout failed: " + err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-[#faf9f5] border-b border-[#e6dfd8]" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Predictable Investment
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            Simple, transparent pricing.
          </h2>
          <p className="text-base text-[#3d3d3a] font-sans">
            No contracts. No hidden consultant retainers. Verified Polar subscriptions. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Starter Plan */}
          <div className="bg-[#faf9f5] rounded-2xl p-6 sm:p-8 border border-[#e6dfd8] flex flex-col justify-between shadow-xs transition-all hover:border-[#cc785c]/40">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#6c6a64] uppercase tracking-wider">Single Location</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8] uppercase">
                  1 Website
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#141413] mt-1 mb-2">Starter</h3>
              <p className="text-xs text-[#6c6a64] font-sans mb-6 leading-relaxed">
                Essential SEO audit, keyword tracking, and AI growth recommendations.
              </p>
              
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-bold text-[#141413]">$15</span>
                <span className="text-xs font-mono text-[#8e8b82]">/mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                {[
                  '1 Website Project',
                  '25 Tracked Keywords',
                  'Deterministic 7-Vector Audit',
                  'Technical & On-Page SEO Checks',
                  'Actionable AI Growth Recommendations',
                  'Basic Local Visibility Triage'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-[#5db872] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-3 bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#efe9de] text-xs font-sans font-semibold text-[#141413] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              onClick={() => handleCheckout('starter')}
              disabled={loadingPlan === 'starter'}
            >
              {loadingPlan === 'starter' ? (
                <Loader2 size={14} className="animate-spin text-[#cc785c]" />
              ) : (
                <>
                  <span>Start Starter ($15/mo)</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

          {/* Growth Plan (Featured Tier in Dark Navy/Ink) */}
          <div className="bg-[#181715] text-[#faf9f5] rounded-2xl p-6 sm:p-8 border border-[#252320] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#cc785c] text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-xs font-mono text-[#cc785c] uppercase tracking-wider font-semibold">Local Dominance</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#cc785c]/20 text-[#cc785c] border border-[#cc785c]/40 uppercase">
                  5 Websites
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#faf9f5] mt-1 mb-2">Growth Tier</h3>
              <p className="text-xs text-[#a09d96] font-sans mb-6 leading-relaxed">
                Dominate local Google search, automate fixes, and monitor top competitors.
              </p>
              
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-bold text-[#faf9f5]">$30</span>
                <span className="text-xs font-mono text-[#a09d96]">/mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#252320] text-xs font-sans text-[#faf9f5]">
                {[
                  'Up to 5 Website Projects',
                  '100 Tracked Keywords & SERP Radar',
                  'Deep Website Audit Engine',
                  'Google Business Profile & Review AI',
                  'Local Authority & Backlink Gap Analysis',
                  'Automated AI Fix & Code Generation',
                  'Closed-Loop SEO Change Verification'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-[#cc785c] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-3 bg-[#cc785c] hover:bg-[#b8674d] text-xs font-sans font-semibold text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              onClick={() => handleCheckout('growth')}
              disabled={loadingPlan === 'growth'}
            >
              {loadingPlan === 'growth' ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <>
                  <span>Start Growth ($30/mo)</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
          
          {/* Agency Pro Plan */}
          <div className="bg-[#faf9f5] rounded-2xl p-6 sm:p-8 border border-[#e6dfd8] flex flex-col justify-between shadow-xs transition-all hover:border-[#cc785c]/40">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#6c6a64] uppercase tracking-wider">Multi-Location & Agency</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8] uppercase">
                  Unlimited
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#141413] mt-1 mb-2">Agency Pro</h3>
              <p className="text-xs text-[#6c6a64] font-sans mb-6 leading-relaxed">
                For expanding practices, multi-location brands, and local SEO agencies.
              </p>
              
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-bold text-[#141413]">$80</span>
                <span className="text-xs font-mono text-[#6c6a64]">/mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                {[
                  'Unlimited Website Projects (∞)',
                  '1,000 Tracked Keywords & Radar',
                  'SEO Execution Engine (WP, Shopify, GitHub)',
                  'White-Label Executive Client Reports',
                  'Lead Generation Widget Embed',
                  'Internal Links & Campaign Engine',
                  'Priority 24/7 Support & SLA'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-[#5db872] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-3 bg-[#141413] hover:bg-[#252320] text-xs font-sans font-semibold text-[#faf9f5] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              onClick={() => handleCheckout('agency_pro')}
              disabled={loadingPlan === 'agency_pro'}
            >
              {loadingPlan === 'agency_pro' ? (
                <Loader2 size={14} className="animate-spin text-[#cc785c]" />
              ) : (
                <>
                  <span>Start Agency Pro ($80/mo)</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
