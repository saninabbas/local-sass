import { PageLayout } from '../../components/layout/PageLayout';

export function About() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl sm:text-5xl font-serif font-normal tracking-[-1.5px] text-[#141413]">About Scorankio</h2>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#3d3d3a] font-sans">
              Scorankio was founded on a simple premise: local businesses deserve access to the same high-end digital growth tools that large corporations use, but without the complexity and enterprise pricing.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 md:max-w-none">
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col bg-[#efe9de] p-6 sm:p-8 rounded-xl border border-[#e6dfd8]">
                <dt className="text-base font-serif font-medium text-[#141413]">
                  Our Mission
                </dt>
                <dd className="mt-3 flex flex-auto flex-col text-xs leading-relaxed text-[#3d3d3a] font-sans">
                  <p className="flex-auto">To empower local business owners with AI-driven insights that translate directly into foot traffic, online visibility, and revenue growth.</p>
                </dd>
              </div>
              <div className="flex flex-col bg-[#efe9de] p-6 sm:p-8 rounded-xl border border-[#e6dfd8]">
                <dt className="text-base font-serif font-medium text-[#141413]">
                  Data-Driven
                </dt>
                <dd className="mt-3 flex flex-auto flex-col text-xs leading-relaxed text-[#3d3d3a] font-sans">
                  <p className="flex-auto">We don't believe in guesswork. Our audit engine analyzes hundreds of specific signals across SEO, website performance, and local directories to build your Growth Score.</p>
                </dd>
              </div>
              <div className="flex flex-col bg-[#efe9de] p-6 sm:p-8 rounded-xl border border-[#e6dfd8]">
                <dt className="text-base font-serif font-medium text-[#141413]">
                  Action-Oriented
                </dt>
                <dd className="mt-3 flex flex-auto flex-col text-xs leading-relaxed text-[#3d3d3a] font-sans">
                  <p className="flex-auto">An audit is useless if you don't know what to do next. That's why every Scorankio audit comes with a prioritized, step-by-step AI Action Plan.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
