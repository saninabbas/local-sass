import { Check } from 'lucide-react';

export function GrowthScoreSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#faf9f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold block">
              Continuous Benchmarking
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
              Know where your business stands in seconds.
            </h2>
            <p className="text-base text-[#3d3d3a] leading-relaxed max-w-lg font-sans">
              Get one simple, rigorous score that translates search indexing, local map pack rankings, review sentiment, and mobile page velocity into actionable clarity.
            </p>
            
            <div className="space-y-3 pt-2">
              {[
                'Pinpoint competitive keyword gaps against top 3 local rivals',
                'Uncover critical negative sentiment clusters in customer reviews',
                'Prioritize highest-converting page speed & UX fixes',
                'Track historical growth trajectory with automated re-audits',
              ].map((benefit, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cc785c]/15 text-[#cc785c] flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-sans font-medium text-[#252523]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:pl-10">
            <div className="rounded-2xl bg-[#efe9de] p-5 sm:p-10 shadow-lg border border-[#e6dfd8]">
              <div className="text-center mb-8">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#6c6a64] mb-4">
                  Growth Score Diagnostic
                </h4>
                
                {/* Circular Visualization Concept */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e6dfd8" strokeWidth="7" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#cc785c" 
                      strokeWidth="7" 
                      strokeDasharray="283" 
                      strokeDashoffset="56" 
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-serif font-normal text-[#141413] tracking-tight">84</span>
                    <span className="text-xs font-mono text-[#6c6a64]">/ 100</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5db872]/20 text-[#2b753e] text-xs font-semibold">
                  <Check size={13} /> Strong Market Position
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Local Maps Pack', score: 88, color: 'bg-[#5db872]' },
                  { label: 'Review Velocity', score: 76, color: 'bg-[#e8a55a]' },
                  { label: 'Mobile UX & Speed', score: 92, color: 'bg-[#5db872]' },
                  { label: 'Content Authority', score: 71, color: 'bg-[#e8a55a]' },
                ].map(metric => (
                  <div key={metric.label} className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8]">
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#6c6a64]">{metric.label}</span>
                      <span className="font-bold text-[#141413]">{metric.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#e6dfd8] rounded-full overflow-hidden">
                      <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
