import React from 'react';
import { AlertCircle, AlertTriangle, Info, Sparkles, ChevronRight, FileCode } from 'lucide-react';
import { Button } from '../ui/Button';

export interface IssueItem {
  id?: string;
  title: string;
  category?: 'technical' | 'content' | 'local' | 'authority' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';
  impact: string;
  evidence: string;
  actionableStep?: string;
  codeSnippet?: string;
}

interface IssueCardProps {
  issue: IssueItem;
  onFixWithAI?: (issue: IssueItem) => void;
  onViewEvidence?: (issue: IssueItem) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onFixWithAI,
  onViewEvidence,
}) => {
  const getSeverityConfig = () => {
    const sev = issue.severity?.toLowerCase();
    if (sev === 'critical' || sev === 'high') {
      return {
        icon: AlertCircle,
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'CRITICAL',
        border: 'border-rose-200/80',
      };
    }
    if (sev === 'medium' || sev === 'warning') {
      return {
        icon: AlertTriangle,
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'WARNING',
        border: 'border-amber-200/80',
      };
    }
    return {
      icon: Info,
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      label: 'OPTIMIZATION',
      border: 'border-[#e6dfd8]',
    };
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-[#faf9f5] border ${config.border} rounded-2xl p-5 transition-all shadow-xs hover:border-[#cc785c]/40 flex flex-col justify-between gap-4`}>
      <div className="space-y-3">
        {/* Header: Severity Badge + Category */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
            {config.label}
          </span>
          {issue.category && (
            <span className="text-[10px] font-mono text-[#8e8b82] uppercase tracking-wider">
              {issue.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-serif font-medium text-[#141413] leading-snug flex items-start gap-2">
          <Icon size={18} className="text-[#cc785c] flex-shrink-0 mt-0.5" />
          <span>{issue.title}</span>
        </h4>

        {/* 1-Line Impact Explanation */}
        <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
          <strong className="text-[#141413] font-medium">Impact: </strong>
          {issue.impact}
        </p>

        {/* Evidence Box */}
        {issue.evidence && (
          <div className="bg-[#efe9de]/50 border border-[#e6dfd8] rounded-xl p-3 text-xs font-mono text-[#4a4843] flex items-start justify-between gap-2">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] font-mono text-[#8e8b82] uppercase block font-bold">
                Observed Evidence:
              </span>
              <p className="truncate text-xs text-[#141413] font-mono">
                {issue.evidence}
              </p>
            </div>
            {onViewEvidence && (
              <button
                onClick={() => onViewEvidence(issue)}
                className="text-[11px] font-mono text-[#cc785c] hover:underline flex items-center gap-0.5 flex-shrink-0 mt-1 cursor-pointer"
                title="View Full Code / Header Evidence"
              >
                <FileCode size={12} />
                <span>Details</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-[#e6dfd8]/60 flex items-center justify-between gap-2">
        {onViewEvidence && (
          <button
            onClick={() => onViewEvidence(issue)}
            className="text-xs font-sans text-[#6c6a64] hover:text-[#141413] flex items-center gap-1 cursor-pointer"
          >
            <span>View Evidence</span>
            <ChevronRight size={14} />
          </button>
        )}

        {onFixWithAI && (
          <Button
            size="sm"
            onClick={() => onFixWithAI(issue)}
            className="ml-auto flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#141413] hover:bg-[#252320] text-[#faf9f5]"
          >
            <Sparkles size={13} className="text-[#cc785c]" />
            <span>Fix with AI</span>
          </Button>
        )}
      </div>
    </div>
  );
};
