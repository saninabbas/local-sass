import { PageLayout } from '../../components/layout/PageLayout';

export function Privacy() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-16 sm:py-24 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 font-sans">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141413] mt-2 mb-2">Privacy Policy</h1>
          <p className="text-xs font-mono text-[#8e8b82] mb-8">Last revised: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-[#3d3d3a] leading-relaxed">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">1. Introduction & Scope</h2>
              <p>
                Rankora PBC ("Rankora", "we", "us", or "our") respects your privacy and is dedicated to securing all customer business data. This Privacy Policy details how we process diagnostic telemetry, website URLs, review streams, and authentication identifiers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">2. Data Telemetry Collection</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#3d3d3a]">
                <li><strong>Identity & Account Data:</strong> Name, business email, encrypted authentication credentials.</li>
                <li><strong>Diagnostic & Viewport Data:</strong> Website domain, mobile rendering telemetry, public review signals.</li>
                <li><strong>Technical Usage:</strong> IP headers, session cookies, browser user-agent tokens.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">3. Purpose of Processing</h2>
              <p>
                All collected telemetry is utilized strictly to compute deterministic Growth Scores, generate automated action queues, and orchestrate AI-assisted marketing diagnostics. We do not sell customer data to third-party ad brokers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">4. Contact & Inquiries</h2>
              <p>
                For data access or deletion requests, contact our compliance officer at <a href="mailto:support@rankora.com" className="text-[#cc785c] underline">support@rankora.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
