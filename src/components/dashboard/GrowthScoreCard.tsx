import { ScoreExplanation } from './ScoreExplanation';

interface GrowthScoreCardProps {
  score: number;
}

export function GrowthScoreCard({ score }: GrowthScoreCardProps) {
  return (
    <div className="bg-[#efe9de] p-6 sm:p-8 rounded-xl border border-[#e6dfd8] shadow-sm flex flex-col justify-center items-center h-full">
      <h4 className="text-xs font-mono text-[#6c6a64] uppercase tracking-widest mb-4">Growth Score Benchmark</h4>
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
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
            strokeDashoffset={283 - (283 * score) / 100} 
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-serif font-normal text-[#141413] tracking-tight">{score}</span>
          <span className="text-xs font-mono text-[#6c6a64]">/ 100</span>
        </div>
      </div>
      <ScoreExplanation score={score} type="overall" />
    </div>
  );
}
