import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Free Baseline Audit",
      description: "Essential website health evaluation and baseline Growth Score for local businesses.",
      price: "$0",
      period: "forever",
      features: [
        "Full 7-Vector Diagnostic Audit",
        "Overall Growth Score (0-100)",
        "Top 5 Biggest Problems Identification",
        "Executive PDF Report Export",
        "Email Support"
      ],
      cta: "Run Free Audit",
      popular: false
    },
    {
      name: "Growth Plan",
      description: "Complete competitive intelligence, daily keyword tracking, and AI action plans.",
      price: billingCycle === 'monthly' ? "$15" : "$12",
      period: "/month",
      features: [
        "Everything in Free Audit",
        "Unlimited Website Re-Crawls",
        "Track up to 25 Local Keywords",
        "Live SERP Competitor Spy Tool",
        "9-Point Gap Analysis Matrix",
        "Rankora Growth Copilot Assistant",
        "Weekly Progress Tracking"
      ],
      cta: "Start 14-Day Free Trial",
      popular: true
    },
    {
      name: "Pro Plan",
      description: "Advanced automation, AI content generation, reputation management, and lead widgets.",
      price: billingCycle === 'monthly' ? "$30" : "$25",
      period: "/month",
      features: [
        "Everything in Growth Plan",
        "AI Local Content & Article Studio",
        "Reputation & Review AI Replies",
        "Embeddable Lead Gen Widget",
        "Authority Link Prospecting & Tracking",
        "Track up to 100 Local Keywords",
        "Priority 24/7 Strategic Support"
      ],
      cta: "Upgrade to Pro",
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
              Choose the plan that fits your business stage. No lock-in contracts. Cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center p-1 bg-[#efe9de] border border-[#e6dfd8] rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs'
                    : 'text-[#6c6a64] hover:text-[#141413]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
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

                  <h3 className="font-serif text-xl font-medium text-[#141413] mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#6c6a64] font-sans mb-6 leading-relaxed">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e6dfd8]">
                    <span className="font-serif text-4xl font-normal text-[#141413]">{plan.price}</span>
                    <span className="text-xs font-mono text-[#8e8b82]">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 text-xs font-sans mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[#3d3d3a]">
                        <Check size={15} className="text-[#5db872] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/signup" className="w-full block">
                  <Button
                    className={`w-full py-2.5 text-xs font-medium rounded-xl shadow-xs ${
                      plan.popular
                        ? 'bg-[#cc785c] hover:bg-[#a9583e] text-white'
                        : 'bg-[#efe9de] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8]'
                    }`}
                  >
                    {plan.cta}
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
