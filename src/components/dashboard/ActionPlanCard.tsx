import { ArrowRight, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface ActionPlanCardProps {
  id?: string;
  title: string;
  description: string;
  priority: string;
  priorityColor: string;
  impact?: string;
  estimatedTime?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  onComplete?: (id: string) => Promise<void>;
}

export function ActionPlanCard({ id, title, description, priority, priorityColor, impact, estimatedTime, status = 'pending', onComplete }: ActionPlanCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = status === 'completed';

  const handleComplete = async () => {
    if (!id || !onComplete || isCompleted) return;
    setIsCompleting(true);
    try {
      await onComplete(id);
    } catch (error) {
      console.error("Failed to complete action", error);
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl p-6 border ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all relative overflow-hidden`}>
      {isCompleted && (
        <div className="absolute top-0 right-0 p-4">
          <CheckCircle2 className="text-green-500" size={24} />
        </div>
      )}
      
      <div className="mb-4">
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${isCompleted ? 'border-green-200 text-green-700 bg-green-100' : priorityColor}`}>
          {isCompleted ? 'Completed' : priority}
        </span>
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isCompleted ? 'text-gray-700' : 'text-primary'}`}>{title}</h3>
      <p className="text-sm text-secondary mb-6 leading-relaxed">
        {description}
      </p>
      
      <div className={`grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg border ${isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <Activity size={12} /> Impact
          </span>
          <span className={`text-sm font-bold ${isCompleted ? 'text-green-700' : 'text-primary'}`}>{impact}</span>
        </div>
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <Clock size={12} /> Estimated time
          </span>
          <span className={`text-sm font-bold ${isCompleted ? 'text-green-700' : 'text-primary'}`}>{estimatedTime}</span>
        </div>
      </div>

      {!isCompleted && onComplete && (
        <button 
          onClick={handleComplete}
          disabled={isCompleting}
          className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center group w-full justify-between pt-4 border-t border-gray-100"
        >
          {isCompleting ? 'Marking as Complete...' : 'Mark as Complete'} 
          <CheckCircle2 className="ml-1 h-4 w-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
      
      {(!onComplete && !isCompleted) && (
        <button className="text-sm font-semibold text-primary-accent hover:text-blue-700 flex items-center group w-full justify-between pt-4 border-t border-gray-100">
          View Recommendation <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
