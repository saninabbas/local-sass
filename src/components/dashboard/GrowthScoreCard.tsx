import { ScoreExplanation } from './ScoreExplanation';

interface GrowthScoreCardProps {
  score: number;
}

export function GrowthScoreCard({ score }: GrowthScoreCardProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center h-full">
      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Growth Score</h4>
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * score) / 100} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black text-primary tracking-tighter leading-none">{score}</span>
          <span className="text-xl font-medium text-secondary mb-2">/ 100</span>
        </div>
      </div>
      <ScoreExplanation score={score} type="overall" />
    </div>
  );
}
