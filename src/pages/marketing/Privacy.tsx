import { PageLayout } from '../../components/layout/PageLayout';

export function Privacy() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-16 sm:py-24 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 font-sans">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141413] mb-2">Privacy Policy</h1>
          <p className="text-xs font-mono text-[#8e8b82] mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-[#3d3d3a] leading-relaxed">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">1. Introduction</h2>
              <p>
                Welcome to Rankora. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">2. The Data We Collect About You</h2>
              <p className="mb-3">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#3d3d3a]">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">3. How We Use Your Data</h2>
              <p className="mb-3">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#3d3d3a]">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">4. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:support@rankora.com" className="text-[#cc785c] underline">support@rankora.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
