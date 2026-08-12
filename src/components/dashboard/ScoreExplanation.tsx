import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ScoreExplanationProps {
  score: number | null;
  type: 'overall' | 'seo' | 'website' | 'visibility' | 'reviews';
}

export function ScoreExplanation({ score, type }: ScoreExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);

  let status = "Needs Work";
  let color = "text-danger";
  
  if (score === null) {
    status = "Not Connected";
    color = "text-gray-400";
  } else if (score >= 80) {
    status = "Excellent";
    color = "text-success-dark";
  } else if (score >= 60) {
    status = "Good";
    color = "text-warning-dark";
  }

  const getExplanation = () => {
    switch (type) {
      case 'seo':
        return {
          why: "SEO measures how easily search engines can read and index your website content.",
          improve: "Fix missing meta descriptions, add H1 tags, and ensure your services match search intent."
        };
      case 'website':
        return {
          why: "Website score evaluates the technical health, speed, and mobile responsiveness of your site.",
          improve: "Reduce large images, minify scripts, and ensure all links are working."
        };
      case 'visibility':
        return {
          why: "Visibility checks how often your location and local keywords appear on your homepage.",
          improve: "Include your city name and primary service directly in your headings and main text."
        };
      case 'reviews':
        return {
          why: "Reviews measure your reputation across Google and other local directories.",
          improve: "Connect your Google Business Profile to track reviews."
        };
      case 'overall':
      default:
        return {
          why: "Your Growth Score is an aggregate metric of your online health, calculated deterministically from available signals.",
          improve: "Follow your AI Action Plan below to improve your score systematically."
        };
    }
  };

  const explanation = getExplanation();

  return (
    <div className="relative inline-block mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <HelpCircle size={14} />
        What does this mean?
      </button>

      {isOpen && (
        <div className="absolute z-10 left-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-primary capitalize">{type} Score</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-50 ${color}`}>{status}</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Why it matters</span>
              <p className="text-sm text-secondary leading-relaxed">{explanation.why}</p>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">How to improve</span>
              <p className="text-sm text-primary font-medium leading-relaxed">{explanation.improve}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
