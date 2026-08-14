import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ScoreExplanationProps {
  score: number | null;
  type: 'overall' | 'seo' | 'website' | 'visibility' | 'reviews';
}

export function ScoreExplanation({ score, type }: ScoreExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);

  let status = "Needs Work";
  let color = "text-[#c64545] bg-[#c64545]/15";
  
  if (score === null) {
    status = "Not Connected";
    color = "text-[#8e8b82] bg-[#252320]";
  } else if (score >= 80) {
    status = "Strong";
    color = "text-[#5db872] bg-[#5db872]/15";
  } else if (score >= 60) {
    status = "Moderate";
    color = "text-[#e8a55a] bg-[#e8a55a]/15";
  }

  const getExplanation = () => {
    switch (type) {
      case 'seo':
        return {
          why: "SEO measures how easily search engines can read, index, and surface your local content.",
          improve: "Fix missing meta descriptions, add semantic H1 tags, and align service pages with high-volume search intent."
        };
      case 'website':
        return {
          why: "Website score evaluates Core Web Vitals, mobile DOM rendering speed, and viewport responsiveness.",
          improve: "Compress hero media, resolve blocking scripts, and eliminate layout shifts."
        };
      case 'visibility':
        return {
          why: "Visibility tracks local 3-pack geographic coverage and keyword density in target zip codes.",
          improve: "Inject city name, regional landmark references, and NAP consistency across service pages."
        };
      case 'reviews':
        return {
          why: "Review sentiment and velocity directly influence Google Maps algorithmic ranking authority.",
          improve: "Connect your Google Business Profile and activate automated review reply drafts."
        };
      case 'overall':
      default:
        return {
          why: "Your Growth Score is an aggregate metric of your complete local digital footprint.",
          improve: "Execute your prioritized AI Action Plan items to systematically elevate your score."
        };
    }
  };

  const explanation = getExplanation();

  return (
    <div className="relative inline-block mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[#6c6a64] hover:text-[#141413] transition-colors font-sans"
        aria-expanded={isOpen}
      >
        <HelpCircle size={13} className="text-[#cc785c]" />
        <span>Interpret this score</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#181715] text-[#faf9f5] rounded-xl shadow-2xl border border-[#252320] p-4 text-left font-sans">
          <div className="flex justify-between items-center mb-3">
            <span className="font-serif font-medium text-sm text-[#faf9f5] capitalize">{type} Score</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${color}`}>{status}</span>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="block text-[10px] font-mono text-[#a09d96] uppercase tracking-wider mb-0.5">Why it matters</span>
              <p className="text-[#a09d96] leading-relaxed">{explanation.why}</p>
            </div>
            <div className="pt-2 border-t border-[#252320]">
              <span className="block text-[10px] font-mono text-[#cc785c] uppercase tracking-wider mb-0.5">Recommended Action</span>
              <p className="text-[#faf9f5] font-medium leading-relaxed">{explanation.improve}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
