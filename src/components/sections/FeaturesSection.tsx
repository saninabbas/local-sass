import { Search, MapPin, MessageSquare, TrendingUp, Zap, Calendar, BarChart } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    { name: 'AI Website Audit', icon: Search, desc: 'Find broken links, slow pages, and technical issues instantly.' },
    { name: 'Local SEO Analysis', icon: MapPin, desc: 'See how you rank for important local search terms vs competitors.' },
    { name: 'Review Management', icon: MessageSquare, desc: 'Monitor all your reviews in one place and get AI-drafted replies.' },
    { name: 'Competitor Insights', icon: TrendingUp, desc: 'Track what your top local competitors are doing right.' },
    { name: 'Growth Recommendations', icon: Zap, desc: 'Get specific, prioritized tasks that actually move the needle.' },
    { name: 'Weekly Growth Reports', icon: Calendar, desc: 'Simple, jargon-free updates on your progress in your inbox.' },
    { name: 'Business Growth Score', icon: BarChart, desc: 'A single, easy-to-understand metric for your entire online presence.' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Everything you need to grow locally.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-start bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary-accent">
                <feature.icon size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{feature.name}</h3>
              <p className="text-base text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
