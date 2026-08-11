import { ArrowRight, Clock, Activity } from 'lucide-react';

interface ActionPlanCardProps {
  title: string;
  description: string;
  priority: string;
  priorityColor: string;
  impact?: string;
  estimatedTime?: string;
}

export function ActionPlanCard({ title, description, priority, priorityColor, impact, estimatedTime }: ActionPlanCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${priorityColor}`}>
          {priority}
        </span>
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary mb-6 leading-relaxed">
        {description}
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <Activity size={12} /> Impact
          </span>
          <span className="text-sm font-bold text-primary">{impact}</span>
        </div>
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <Clock size={12} /> Estimated time
          </span>
          <span className="text-sm font-bold text-primary">{estimatedTime}</span>
        </div>
      </div>

      <button className="text-sm font-semibold text-primary-accent hover:text-blue-700 flex items-center group w-full justify-between pt-2 border-t border-gray-100">
        View Recommendation <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
