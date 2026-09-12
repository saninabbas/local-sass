import { PageLayout } from '../../components/layout/PageLayout';

export function Contact() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#141413]">Contact Us</h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#6c6a64] font-sans">
              Have questions about Scorankio? We're here to help.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-xl">
            <div className="flex flex-col gap-y-8 bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-sm">
              <div className="flex gap-x-4">
                <div className="flex-none">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#cc785c] text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-[#141413]">Email Support</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#3d3d3a] font-sans">
                    You can reach us anytime at <a href="mailto:support@seoranko.site" className="text-[#cc785c] font-medium hover:underline">support@seoranko.site</a>. We typically reply within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
