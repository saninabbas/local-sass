import { PageLayout } from '../../components/layout/PageLayout';

export function Terms() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-16 sm:py-24 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 font-sans">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141413] mt-2 mb-2">Terms of Service</h1>
          <p className="text-xs font-mono text-[#8e8b82] mb-8">Last revised: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-[#3d3d3a] leading-relaxed">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">1. Agreement to Terms</h2>
              <p>
                By registering for an account or using Rankora's diagnostic audit platform, you agree to abide by these Terms of Service. If you disagree with any portion, you must terminate platform usage immediately.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">2. Service Provision & AI Diagnostics</h2>
              <p>
                Rankora provides automated SEO, mobile performance, and local visibility evaluations powered by Anthropic's visual reasoning models. While we strive for maximum accuracy, search engine algorithms shift dynamically and outcomes cannot be guaranteed.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">3. Subscription & Billing</h2>
              <p>
                Paid tiers (Growth $15/mo, Pro $30/mo) are billed on a recurring monthly cycle. You may cancel your subscription at any time via your account settings with zero penalty fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
