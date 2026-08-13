import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AIRecommendationsSection() {
  const recommendations = [
    {
      title: 'Respond to unanswered reviews',
      priority: 'HIGH IMPACT',
      priorityColor: 'text-danger bg-red-50 border-red-100',
      explanation: '8 recent reviews are waiting for a response.',
      impact: 'High'
    },
    {
      title: 'Create missing service pages',
      priority: 'MEDIUM IMPACT',
      priorityColor: 'text-warning bg-orange-50 border-orange-100',
      explanation: '3 important services don\'t have dedicated pages.',
      impact: 'Medium'
    },
    {
      title: 'Fix website issues',
      priority: 'MEDIUM IMPACT',
      priorityColor: 'text-warning bg-orange-50 border-orange-100',
      explanation: '2 technical issues may be affecting visibility.',
      impact: 'Medium'
    },
    {
      title: 'Improve local content',
      priority: 'OPPORTUNITY',
      priorityColor: 'text-primary-accent bg-blue-50 border-blue-100',
      explanation: '5 content opportunities could help attract more local searches.',
      impact: 'High'
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl mb-6">
            Stop guessing what to fix.
          </h2>
          <p className="text-xl text-secondary">
            Your AI action plan turns your audit into a simple list of things you can actually do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mb-5">
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border ${rec.priorityColor}`}>
                  {rec.priority}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">{rec.title}</h3>
              <p className="text-lg text-secondary mb-10 flex-1 leading-relaxed">
                {rec.explanation}
              </p>
              
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-base text-secondary">Impact:</span>
                  <span className="text-base font-semibold text-primary">{rec.impact}</span>
                </div>
                <Link to="/signup">
                  <button className="text-base font-semibold text-primary-accent hover:text-blue-700 flex items-center group">
                    View recommendation <ArrowRight className="ml-1.5 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
