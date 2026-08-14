import { PageLayout } from '../../components/layout/PageLayout';

export function About() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl lg:mx-0 space-y-4">
            <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
              Organization & Philosophy
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-normal tracking-[-1.5px] text-[#141413] leading-[1.05]">
              Empowering local enterprises with visual intelligence.
            </h1>
            <p className="text-base sm:text-lg text-[#3d3d3a] font-sans leading-relaxed pt-2">
              Rankora was founded on a simple premise: local business owners deserve access to cutting-edge visual reasoning and autonomous AI diagnostics without agency retainer friction or technical complexity.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl bg-[#efe9de] border border-[#e6dfd8] flex flex-col space-y-3">
                <h3 className="font-serif font-medium text-xl text-[#141413]">
                  Our Mission
                </h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  To equip regional service providers with autonomous diagnostic agents that translate raw search signals directly into local foot traffic, inbound appointments, and measurable revenue.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-[#efe9de] border border-[#e6dfd8] flex flex-col space-y-3">
                <h3 className="font-serif font-medium text-xl text-[#141413]">
                  Deterministic Signals
                </h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  We reject speculative SEO guesswork. Our visual evaluation engine audits real viewport assets, local citation matrices, and semantic review sentiment to build an uncompromising Growth Score.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-[#efe9de] border border-[#e6dfd8] flex flex-col space-y-3">
                <h3 className="font-serif font-medium text-xl text-[#141413]">
                  Autonomous Execution
                </h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  Diagnostics without action are useless. That is why every Rankora audit couples with direct action workflows and Claude Computer Use automation capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
