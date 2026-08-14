import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  previousScore: number;
  currentScore: number;
}

export function ProgressCard({ previousScore, currentScore }: ProgressCardProps) {
  const diff = currentScore - previousScore;
  const isPositive = diff >= 0;

  const points = [
    { x: 10, y: 80, label: 'Jun' },
    { x: 36, y: 60, label: '' },
    { x: 63, y: 40, label: 'Jul' },
    { x: 90, y: 20, label: 'Aug' },
  ];

  const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  return (
    <div className="bg-[#efe9de] p-6 rounded-xl border border-[#e6dfd8] shadow-xs h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPositive ? 'bg-[#5db872]/20 text-[#2b753e]' : 'bg-[#c64545]/20 text-[#c64545]'}`}>
          <TrendingUp size={18} />
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#6c6a64]">Rank Trajectory</h4>
          <p className="text-[11px] text-[#8e8b82]">Rolling 30-day evaluation</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[160px] relative mb-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-mono text-[#8e8b82] pb-1">
          <span>80</span>
          <span>78</span>
          <span>76</span>
          <span>74</span>
          <span>72</span>
        </div>

        {/* Chart Area */}
        <div className="absolute left-9 right-2 top-2 bottom-6 border-l border-b border-[#e6dfd8]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="100" y2="20" stroke="#e6dfd8" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#e6dfd8" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="#e6dfd8" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="#e6dfd8" strokeWidth="0.5" strokeDasharray="2 2" />

            <path
              d={linePath}
              fill="none"
              stroke="#cc785c"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {points.map((p, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 bg-white border-2 border-[#cc785c] rounded-full -ml-1 -mt-1 shadow-sm"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-9 right-2 bottom-0 h-6">
          <div className="relative w-full h-full text-[10px] font-mono text-[#8e8b82] pt-2">
            <span className="absolute transform -translate-x-1/2" style={{ left: '10%' }}>Jun</span>
            <span className="absolute transform -translate-x-1/2" style={{ left: '63%' }}>Jul</span>
            <span className="absolute transform -translate-x-1/2" style={{ left: '90%' }}>Aug</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t border-[#e6dfd8] pt-3">
        <span className={`inline-flex items-center text-xs font-mono font-bold ${isPositive ? 'text-[#2b753e]' : 'text-[#c64545]'}`}>
          {isPositive ? '+' : ''}{diff} points this cycle
        </span>
      </div>
    </div>
  );
}
