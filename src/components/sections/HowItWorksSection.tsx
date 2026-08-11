import { Search, Link, BarChart2, CheckCircle2, TrendingUp } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Add your business', desc: 'Search for your business name.', icon: Search },
    { num: '02', title: 'Connect your website', desc: 'Enter your domain name.', icon: Link },
    { num: '03', title: 'Run your audit', desc: 'We scan your entire online presence.', icon: BarChart2 },
    { num: '04', title: 'Get your action plan', desc: 'A prioritized list of what to fix.', icon: CheckCircle2 },
    { num: '05', title: 'Track your growth', desc: 'Watch your score improve over time.', icon: TrendingUp },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background border-y border-gray-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            From audit to action in minutes.
          </h2>
        </div>

        {/* Desktop Horizontal Process */}
        <div className="hidden lg:block relative max-w-6xl mx-auto">
          {/* Subtle connecting line */}
          <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="relative z-10 text-center px-4">
                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-primary-accent mx-auto mb-6 shadow-sm">
                  <step.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="text-sm font-bold text-gray-400 mb-2">{step.num}</div>
                <h3 className="text-base font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Process */}
        <div className="lg:hidden max-w-md mx-auto relative pl-6">
          <div className="absolute top-6 bottom-6 left-12 w-0.5 bg-gray-200"></div>
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.num} className="relative z-10 flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-primary-accent shadow-sm">
                  <step.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <div className="text-xs font-bold text-gray-400 mb-1">{step.num}</div>
                  <h3 className="text-base font-bold text-primary mb-1">{step.title}</h3>
                  <p className="text-sm text-secondary">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
