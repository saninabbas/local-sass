import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AIRecommendationsSection() {
  const recommendations = [
    {
      title: 'Respond to unanswered customer reviews',
      priority: 'HIGH IMPACT',
      priorityColor: 'text-[#c64545] bg-[#c64545]/10 border-[#c64545]/20',
      explanation: '8 recent customer reviews are waiting for replies. Responding within 24h boosts local search ranking authority by up to 18%.',
      impact: 'High'
    },
    {
      title: 'Generate missing geo-targeted service pages',
      priority: 'MEDIUM IMPACT',
      priorityColor: 'text-[#e8a55a] bg-[#e8a55a]/10 border-[#e8a55a]/20',
      explanation: '3 core high-intent service keywords lack dedicated landing pages in your top zip codes.',
      impact: 'Medium'
    },
    {
      title: 'Resolve mobile DOM & LCP speed bottlenecks',
      priority: 'MEDIUM IMPACT',
      priorityColor: 'text-[#e8a55a] bg-[#e8a55a]/10 border-[#e8a55a]/20',
      explanation: '2 technical asset delivery issues slow down mobile user experiences on 4G connections.',
      impact: 'Medium'
    },
    {
      title: 'Publish localized clinical FAQ authority content',
      priority: 'OPPORTUNITY',
      priorityColor: 'text-[#5db8a6] bg-[#5db8a6]/10 border-[#5db8a6]/20',
      explanation: '5 high-volume search queries in your service area can be captured with verified FAQ schema.',
      impact: 'High'
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#efe9de] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Actionable Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            Stop guessing what to fix next.
          </h2>
          <p className="text-base text-[#3d3d3a] font-sans max-w-xl mx-auto">
            Your AI action plan transforms complex diagnostics into a clear prioritized sequence of executable steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-[#faf9f5] rounded-xl p-5 sm:p-8 border border-[#e6dfd8] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <span className={`inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${rec.priorityColor}`}>
                  {rec.priority}
                </span>
                <h3 className="text-xl font-serif font-normal text-[#141413]">{rec.title}</h3>
                <p className="text-sm text-[#3d3d3a] font-sans leading-relaxed">
                  {rec.explanation}
                </p>
              </div>
              
              <div className="pt-6 mt-6 border-t border-[#e6dfd8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sans text-[#6c6a64]">
                  <span>Estimated Impact:</span>
                  <span className="font-semibold text-[#141413]">{rec.impact}</span>
                </div>
                <Link to="/signup" className="text-xs font-sans font-medium text-[#cc785c] hover:text-[#a9583e] flex items-center gap-1 group">
                  <span>Execute recommendation</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
