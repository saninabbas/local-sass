import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  previousScore: number;
  currentScore: number;
}

export function ProgressCard({ previousScore, currentScore }: ProgressCardProps) {
  const diff = currentScore - previousScore;
  const isPositive = diff >= 0;

  // Simple hardcoded data to match the visual mock for now
  const points = [
    { x: 10, y: 80, label: 'Jun' }, // 72 score (80% from top, assuming 70-80 scale)
    { x: 36, y: 60, label: '' },    // 74 score
    { x: 63, y: 40, label: 'Jul' }, // 76 score
    { x: 90, y: 20, label: 'Aug' }, // 78 score
  ];

  const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
          <TrendingUp size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-secondary">Growth Score</h4>
          <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[160px] relative mb-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-medium text-gray-400 pb-1">
          <span>80</span>
          <span>78</span>
          <span>76</span>
          <span>74</span>
          <span>72</span>
        </div>

        {/* Chart Area */}
        <div className="absolute left-10 right-2 top-2 bottom-6 border-l border-b border-gray-200">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines (optional, keeping minimal for now) */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />

            {/* Line connecting points */}
            <path
              d={linePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Dots */}
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 bg-white border-2 border-primary-accent rounded-full -ml-1 -mt-1 shadow-sm"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-10 right-2 bottom-0 h-6">
          <div className="relative w-full h-full text-[10px] font-medium text-gray-400 pt-2">
            <span className="absolute transform -translate-x-1/2" style={{ left: '10%' }}>Jun</span>
            <span className="absolute transform -translate-x-1/2" style={{ left: '63%' }}>Jul</span>
            <span className="absolute transform -translate-x-1/2" style={{ left: '90%' }}>Aug</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t border-gray-100 pt-4">
        <span className={`inline-flex items-center text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? '+' : ''}{diff} points this month
        </span>
      </div>
    </div>
  );
}
