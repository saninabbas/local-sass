import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckout } from '../../lib/api';
import { useState } from 'react';

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    try {
      setLoadingId(productId);
      const res = await createCheckout(productId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert("Checkout failed: " + err.message);
    } finally {
      setLoadingId(null);
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
            No contracts. No hidden consultant retainers. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Free Audit Plan */}
          <div className="bg-[#faf9f5] rounded-xl p-8 border border-[#e6dfd8] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono text-[#6c6a64] uppercase tracking-wider">Evaluation</span>
              <h3 className="text-2xl font-serif font-normal text-[#141413] mt-1 mb-2">Free Audit</h3>
              <p className="text-xs text-[#6c6a64] font-sans mb-6">See where your business ranks right now.</p>
              
              <div className="mb-6">
                <span className="text-5xl font-serif font-normal text-[#141413]">$0</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                {[
                  'Instant Growth Score Diagnostic',
                  'Basic Local Search Overview',
                  'Top 3 Prioritized Action Items',
                  'Public Shareable Report Link'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#5db872] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-2.5 bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#efe9de] text-xs font-sans font-medium text-[#141413] rounded-lg transition-colors"
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
            >
              Run Free Audit
            </button>
          </div>

          {/* Growth Plan (Featured Tier in Dark Navy) */}
          <div className="bg-[#181715] text-[#faf9f5] rounded-xl p-8 border border-[#252320] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#cc785c] text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>

            <div>
              <span className="text-xs font-mono text-[#cc785c] uppercase tracking-wider">Single Location</span>
              <h3 className="text-2xl font-serif font-normal text-[#faf9f5] mt-1 mb-2">Growth Tier</h3>
              <p className="text-xs text-[#a09d96] font-sans mb-6">Perfect for dedicated single-location businesses.</p>
              
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-normal text-[#faf9f5]">$15</span>
                <span className="text-xs font-mono text-[#a09d96]">/mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#252320] text-xs font-sans text-[#faf9f5]">
                {[
                  'Weekly Automated Growth Audits',
                  'Full AI Action Queue Execution',
                  'Live Google Review Sentiment Triage',
                  'Local Map Pack Competitor Tracking',
                  'Direct Computer Use Workflow Access'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#cc785c] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-xs font-sans font-medium text-white rounded-lg transition-colors shadow-sm"
              onClick={() => handleCheckout('7594755d-5580-4b77-86ae-90baae0e20d8')}
              disabled={loadingId === '7594755d-5580-4b77-86ae-90baae0e20d8'}
            >
              {loadingId === '7594755d-5580-4b77-86ae-90baae0e20d8' ? 'Redirecting...' : 'Start 14-Day Free Trial'}
            </button>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-[#faf9f5] rounded-xl p-8 border border-[#e6dfd8] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono text-[#6c6a64] uppercase tracking-wider">Multi-Location & Agency</span>
              <h3 className="text-2xl font-serif font-normal text-[#141413] mt-1 mb-2">Pro Scale</h3>
              <p className="text-xs text-[#6c6a64] font-sans mb-6">For expanding practices and local agencies.</p>
              
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-normal text-[#141413]">$30</span>
                <span className="text-xs font-mono text-[#6c6a64]">/mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 pt-4 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                {[
                  'Up to 3 Managed Business Locations',
                  'Daily Continuous Rank Updates',
                  'Autonomous 1-Click AI Review Drafts',
                  'Local Authority Citation Engine',
                  'Priority Model Execution & SLA'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#5db872] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="w-full py-2.5 bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#efe9de] text-xs font-sans font-medium text-[#141413] rounded-lg transition-colors"
              onClick={() => handleCheckout('97ffea75-9d0c-490f-b652-b2bfd360abe2')}
              disabled={loadingId === '97ffea75-9d0c-490f-b652-b2bfd360abe2'}
            >
              {loadingId === '97ffea75-9d0c-490f-b652-b2bfd360abe2' ? 'Redirecting...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
