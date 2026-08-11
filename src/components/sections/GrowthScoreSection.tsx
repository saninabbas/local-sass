import { Check } from 'lucide-react';

export function GrowthScoreSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl mb-6">
              Know where your business stands.
            </h2>
            <p className="text-lg text-secondary mb-10 leading-relaxed max-w-lg">
              Get one simple score that shows the health of your local online presence. No complicated metrics or SEO jargon.
            </p>
            
            <div className="space-y-4">
              {[
                'See what is working',
                'Find your biggest problems',
                'Prioritize what matters',
                'Track improvement over time',
              ].map((benefit, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-primary-accent flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-base font-medium text-primary">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:pl-10">
            <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-xl border border-gray-200">
              <div className="text-center mb-10">
                <h4 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-6">Growth Score</h4>
                
                {/* Circular Visualization Concept */}
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                    {/* Progress circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="283" strokeDashoffset="62" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-primary tracking-tighter">78</span>
                    <span className="text-sm font-medium text-secondary">/ 100</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-success text-sm font-semibold">
                  <Check size={14} /> Good
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'SEO', score: 82, bg: 'bg-success' },
                  { label: 'Reviews', score: 74, bg: 'bg-warning' },
                  { label: 'Website', score: 86, bg: 'bg-success' },
                  { label: 'Visibility', score: 69, bg: 'bg-warning' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-secondary">{metric.label}</span>
                      <span className="font-bold text-primary text-lg">{metric.score}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${metric.bg} w-[${metric.score}%] rounded-full`} style={{ width: `${metric.score}%` }} />
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
