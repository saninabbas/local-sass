import { Search, Globe, BarChart2, CheckCircle2, TrendingUp } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Connect Business', desc: 'Identify your Google Business Profile & local NAP.', icon: Search },
    { num: '02', title: 'Verify Domain', desc: 'Map your primary domain and service area boundaries.', icon: Globe },
    { num: '03', title: 'Autonomous Audit', desc: 'Claude scans 100+ local search & UX signals.', icon: BarChart2 },
    { num: '04', title: 'Execute Action Plan', desc: 'Prioritized queue with 1-click AI workflows.', icon: CheckCircle2 },
    { num: '05', title: 'Track Rank Velocity', desc: 'Monitor your Growth Score gain week over week.', icon: TrendingUp },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#faf9f5] border-b border-[#e6dfd8] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Workflow Progression
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            From audit to action in minutes.
          </h2>
          <p className="text-base text-[#3d3d3a] font-sans max-w-xl mx-auto">
            Zero complicated setup. Connect your business details and watch autonomous diagnostic intelligence work.
          </p>
        </div>

        {/* Desktop Horizontal Process */}
        <div className="hidden lg:block relative max-w-6xl mx-auto">
          <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-[#e6dfd8] -z-0"></div>
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="relative z-10 text-center px-4">
                <div className="w-12 h-12 bg-[#efe9de] border border-[#e6dfd8] rounded-full flex items-center justify-center text-[#cc785c] mx-auto mb-6 shadow-sm">
                  <step.icon size={18} />
                </div>
                <div className="text-xs font-mono font-bold text-[#8e8b82] mb-1.5">{step.num}</div>
                <h3 className="text-sm font-serif font-medium text-[#141413] mb-1.5">{step.title}</h3>
                <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Process */}
        <div className="lg:hidden max-w-md mx-auto relative pl-6">
          <div className="absolute top-6 bottom-6 left-12 w-0.5 bg-[#e6dfd8]"></div>
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.num} className="relative z-10 flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 bg-[#efe9de] border border-[#e6dfd8] rounded-full flex items-center justify-center text-[#cc785c] shadow-sm">
                  <step.icon size={18} />
                </div>
                <div className="pt-1">
                  <div className="text-xs font-mono font-bold text-[#8e8b82] mb-1">{step.num}</div>
                  <h3 className="text-base font-serif font-medium text-[#141413] mb-1">{step.title}</h3>
                  <p className="text-xs text-[#6c6a64] font-sans">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
