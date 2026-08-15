import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "FREE TRIAL",
      badge: "14 Days Free",
      who: "Try Rankora risk-free for 14 days with zero credit card required.",
      description: "Complete local SEO diagnostic baseline and 7-vector DOM crawl.",
      price: "$0",
      period: "14 Days",
      features: [
        "1 Website Project",
        "5 Tracked Keywords",
        "5 Diagnostic Audits",
        "1 GeoGrid Local Scan",
        "15 AI Fixes & Code Generations",
        "Live Change Verification"
      ],
      cta: "START FREE TRIAL",
      ctaHref: "/signup",
      popular: false
    },
    {
      name: "GROWTH",
      badge: "Most Popular",
      who: "For businesses serious about dominating local Google search.",
      description: "Scale local rankings, monitor top competitors, and execute automated AI fixes.",
      price: billingCycle === 'monthly' ? "$49" : "$39",
      period: "/month",
      features: [
        "5 Website Projects",
        "50 Tracked Keywords",
        "50 Diagnostic Audits",
        "10 GeoGrid Scans",
        "250 AI Fixes & Code Generations",
        "Competitor Radar Monitoring",
        "Google Business Profile Sync",
        "Internal Link Discovery"
      ],
      cta: "START GROWTH",
      ctaHref: "/signup",
      popular: true
    },
    {
      name: "AGENCY / PRO",
      badge: "For Agencies & Teams",
      who: "For agencies and multi-location business operations.",
      description: "White-label reports, multi-client workspace management, and high volume limits.",
      price: billingCycle === 'monthly' ? "$149" : "$119",
      period: "/month",
      features: [
        "25 Website Projects",
        "500 Tracked Keywords",
        "500 Diagnostic Audits",
        "50 GeoGrid Scans",
        "2,500 AI Fixes",
        "White-Label Executive Reports",
        "Lead Generation Widget Embed",
        "Priority 24/7 Support"
      ],
      cta: "START AGENCY",
      ctaHref: "/signup",
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
              Start your 14-day free trial. No credit card required. Upgrade or cancel anytime.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-[#efe9de] border-[#cc785c] shadow-md relative'
                    : 'bg-[#faf9f5] border-[#e6dfd8] shadow-xs'
                }`}
              >
                <div>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c] text-white uppercase tracking-wider shadow-xs">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-xl font-medium text-[#141413]">{plan.name}</h3>
                    {plan.badge && !plan.popular && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8] uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#cc785c] font-sans italic mb-1">{plan.who}</p>
                  <p className="text-xs text-[#6c6a64] font-sans mb-6 leading-relaxed">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e6dfd8]">
                    <span className="font-serif text-4xl font-normal text-[#141413]">{plan.price}</span>
                    <span className="text-xs font-mono text-[#8e8b82]">{plan.period}</span>
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

                <Link to={plan.ctaHref} className="w-full">
                  <Button
                    size="lg"
                    className={`w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular
                        ? 'bg-[#141413] hover:bg-[#252320] text-[#faf9f5]'
                        : 'bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] border border-[#e6dfd8]'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
