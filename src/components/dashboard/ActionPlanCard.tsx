import { ArrowRight, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ActionPlanCardProps {
  id?: string;
  title: string;
  description: string;
  priority: string;
  priorityColor: string;
  impact?: string;
  estimatedTime?: string;
  difficulty?: string;
  seoImpact?: string;
  localImpact?: string;
  conversionImpact?: string;
  businessOutcome?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  onComplete?: (id: string) => Promise<void>;
}

export function ActionPlanCard({ 
  id, title, description, priority, priorityColor, 
  impact, estimatedTime, difficulty, seoImpact, localImpact, 
  conversionImpact, businessOutcome, status = 'pending', onComplete 
}: ActionPlanCardProps) {
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
    <div className={`rounded-xl p-6 border transition-all relative overflow-hidden ${
      isCompleted 
        ? 'border-[#5db872]/30 bg-[#5db872]/10' 
        : 'border-[#e6dfd8] bg-[#efe9de] hover:shadow-md'
    }`}>
      {isCompleted && (
        <div className="absolute top-0 right-0 p-4">
          <CheckCircle2 className="text-[#5db872]" size={22} />
        </div>
      )}
      
      <div className="mb-3">
        <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
          isCompleted ? 'border-[#5db872]/30 text-[#2b753e] bg-[#5db872]/20' : priorityColor
        }`}>
          {isCompleted ? 'Completed' : priority}
        </span>
      </div>
      <h3 className={`text-base font-serif font-medium mb-1.5 ${isCompleted ? 'text-[#3d3d3a]' : 'text-[#141413]'}`}>
        {title}
      </h3>
      <p className="text-xs font-sans text-[#3d3d3a] mb-4 leading-relaxed">
        {description}
      </p>
      
      {businessOutcome && (
        <div className="mb-3 text-xs font-sans">
          <span className="font-semibold text-[#141413]">Target Outcome: </span>
          <span className="text-[#6c6a64]">{businessOutcome}</span>
        </div>
      )}

      <div className={`grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg border ${
        isCompleted ? 'bg-white/60 border-[#5db872]/20' : 'bg-[#faf9f5] border-[#e6dfd8]'
      }`}>
        <div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#8e8b82] uppercase tracking-wider mb-0.5">
            <Activity size={11} /> Impact
          </span>
          <span className={`text-xs font-sans font-bold ${isCompleted ? 'text-[#2b753e]' : 'text-[#141413]'}`}>
            {impact}
          </span>
        </div>
        <div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#8e8b82] uppercase tracking-wider mb-0.5">
            <Clock size={11} /> Time
          </span>
          <span className={`text-xs font-sans font-bold ${isCompleted ? 'text-[#2b753e]' : 'text-[#141413]'}`}>
            {estimatedTime}
          </span>
        </div>
      </div>
      
      {(difficulty || seoImpact || localImpact || conversionImpact) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {difficulty && (
            <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#faf9f5] text-[#3d3d3a] border border-[#e6dfd8]">
              Diff: {difficulty}
            </span>
          )}
          {seoImpact && (
            <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]">
              SEO: {seoImpact}
            </span>
          )}
          {localImpact && (
            <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#faf9f5] text-[#5db8a6] border border-[#e6dfd8]">
              Local: {localImpact}
            </span>
          )}
          {conversionImpact && (
            <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#faf9f5] text-[#e8a55a] border border-[#e6dfd8]">
              Conv: {conversionImpact}
            </span>
          )}
        </div>
      )}

      {!isCompleted && onComplete && (
        <button 
          onClick={handleComplete}
          disabled={isCompleting}
          className="text-xs font-sans font-medium text-[#2b753e] hover:text-[#1e582e] flex items-center group w-full justify-between pt-3 border-t border-[#e6dfd8] transition-colors"
        >
          <span>{isCompleting ? 'Finalizing with Claude...' : 'Mark Task as Completed'}</span>
          <CheckCircle2 className="ml-1 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>
      )}
      
      {(!onComplete && !isCompleted) && (
        <Link to="/dashboard/actions" className="block w-full">
          <button className="text-xs font-sans font-medium text-[#cc785c] hover:text-[#a9583e] flex items-center group w-full justify-between pt-3 border-t border-[#e6dfd8] transition-colors">
            <span>View Recommendation Plan</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      )}
    </div>
  );
}
