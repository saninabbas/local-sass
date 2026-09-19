import { Search, MapPin, MessageSquare, TrendingUp, Zap, Calendar, BarChart, Eye } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    { name: 'Visual AI Website Audit', icon: Search, desc: 'Perceives desktop and mobile viewports, identifying speed, layout, and UX bottlenecks.' },
    { name: 'Local Map Pack Analysis', icon: MapPin, desc: 'Tracks local 3-pack rankings across target zip codes against top market competitors.' },
    { name: 'Autonomous Review Triage', icon: MessageSquare, desc: 'Synthesizes customer sentiment and drafts human-sounding review replies in seconds.' },
    { name: 'Competitive Matrix Insights', icon: TrendingUp, desc: 'Monitors backlink velocity, content frequency, and review volume of direct rivals.' },
    { name: 'Prioritized Growth Tasks', icon: Zap, desc: 'Receive high-impact, high-confidence action items with step-by-step guidance.' },
    { name: 'Automated Progress Digests', icon: Calendar, desc: 'Weekly executive summaries on rank shifts, traffic changes, and completed actions.' },
    { name: 'Verified Growth Score', icon: BarChart, desc: 'A unified single benchmark measuring the entire health of your local digital footprint.' },
    { name: 'Computer Use Agent', icon: Eye, desc: 'Autonomous browser agent that executes complex research, audits, and data extraction.' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#efe9de] border-b border-[#e6dfd8]" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Capabilities Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            Everything required to dominate local search.
          </h2>
          <p className="text-base text-[#3d3d3a] font-sans max-w-xl mx-auto">
            A comprehensive suite of autonomous intelligence tools built specifically for local market leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-start bg-[#faf9f5] p-6 rounded-xl border border-[#e6dfd8] shadow-sm hover:shadow-md transition-all">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe9de] text-[#cc785c]">
                <feature.icon size={18} />
              </div>
              <h3 className="text-base font-serif font-medium text-[#141413] mb-1.5">{feature.name}</h3>
              <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
