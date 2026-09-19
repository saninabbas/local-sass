import { ScoreExplanation } from './ScoreExplanation';

interface ScoreMetricProps {
  label: string;
  score: number | null;
}

export function ScoreMetric({ label, score }: ScoreMetricProps) {
  let bgClass = 'bg-[#e6dfd8]';
  
  const displayScore = score === -1 ? null : score;
  
  if (displayScore !== null) {
    if (displayScore >= 80) bgClass = 'bg-[#5db872]';
    else if (displayScore >= 60) bgClass = 'bg-[#e8a55a]';
    else bgClass = 'bg-[#c64545]';
  }

  return (
    <div className="bg-[#efe9de] p-5 rounded-xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
      <h4 className="text-xs font-sans font-medium text-[#6c6a64] mb-2">{label}</h4>
      <div className="flex items-end justify-between">
        {displayScore === null ? (
          <span className="text-xs font-mono text-[#8e8b82] mt-2">Not connected</span>
        ) : (
          <span className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">{displayScore}</span>
        )}
      </div>
      <div className="h-1.5 w-full bg-[#e6dfd8] rounded-full overflow-hidden mt-3 mb-2">
        <div className={`h-full ${bgClass} rounded-full transition-all duration-500`} style={{ width: displayScore === null ? '0%' : `${displayScore}%` }} />
      </div>
      <ScoreExplanation score={displayScore} type={label.toLowerCase() as any} />
    </div>
  );
}
