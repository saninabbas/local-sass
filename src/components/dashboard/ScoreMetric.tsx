interface ScoreMetricProps {
  label: string;
  score: number | null;
}

export function ScoreMetric({ label, score }: ScoreMetricProps) {
  let bgClass = 'bg-gray-200';
  
  if (score !== null) {
    if (score >= 80) bgClass = 'bg-success';
    else if (score >= 60) bgClass = 'bg-warning';
    else bgClass = 'bg-danger';
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-secondary mb-3">{label}</h4>
      <div className="flex items-end justify-between">
        {score === null ? (
          <span className="text-sm font-semibold text-gray-400 mt-2">Not connected</span>
        ) : (
          <span className="text-3xl font-bold text-primary">{score}</span>
        )}
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
        <div className={`h-full ${bgClass} rounded-full`} style={{ width: score === null ? '0%' : `${score}%` }} />
      </div>
    </div>
  );
}
