import React from 'react';
import { ExternalLink, CheckCircle2, XCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CompetitorData {
  id?: string;
  name?: string;
  domain: string;
  url?: string;
  rank?: number;
  source?: string;
  signals?: {
    hasDedicatedServicePage?: boolean;
    hasLocalSchema?: boolean;
    wordCount?: number;
    titleOptimized?: boolean;
    pageSpeedScore?: number;
  };
  gapAnalysis?: {
    evidence: string;
    yourStatus: string;
    gap: string;
    recommendedAction: string;
  };
}

interface CompetitorCardProps {
  competitor: CompetitorData;
  onFixGapWithAI?: (competitor: CompetitorData) => void;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({
  competitor,
  onFixGapWithAI,
}) => {
  return (
    <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-5 shadow-xs hover:border-[#cc785c]/40 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Header: Domain + Rank */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-base font-serif font-medium text-[#141413]">
                {competitor.name || competitor.domain}
              </h4>
              <a
                href={competitor.url || `https://${competitor.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#8e8b82] hover:text-[#cc785c]"
                title="Visit competitor website"
              >
                <ExternalLink size={13} />
              </a>
            </div>
            <span className="text-xs font-mono text-[#8e8b82]">
              {competitor.domain}
            </span>
          </div>

          {competitor.rank !== undefined && competitor.rank > 0 && (
            <div className="flex items-center gap-1 bg-[#efe9de] text-[#141413] border border-[#e6dfd8] px-2.5 py-1 rounded-full text-xs font-mono font-bold">
              <TrendingUp size={12} className="text-[#cc785c]" />
              <span>Rank #{competitor.rank}</span>
            </div>
          )}
        </div>

        {/* Real Crawled Signals Breakdown */}
        {competitor.signals && (
          <div className="grid grid-cols-2 gap-2 text-xs font-sans py-2 border-y border-[#e6dfd8]/60">
            <div className="flex items-center gap-1.5">
              {competitor.signals.hasDedicatedServicePage ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <XCircle size={14} className="text-[#8e8b82]" />
              )}
              <span className="text-[#4a4843]">Dedicated Service Page</span>
            </div>
            <div className="flex items-center gap-1.5">
              {competitor.signals.hasLocalSchema ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <XCircle size={14} className="text-[#8e8b82]" />
              )}
              <span className="text-[#4a4843]">LocalBusiness Schema</span>
            </div>
          </div>
        )}

        {/* Why They Win Box */}
        {competitor.gapAnalysis && (
          <div className="bg-[#efe9de]/40 border border-[#e6dfd8] rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#cc785c]">
                Why They Win:
              </span>
              <span className="text-[10px] font-mono text-[#8e8b82]">
                SERP Advantage
              </span>
            </div>
            <p className="text-xs font-sans text-[#141413] leading-relaxed">
              <strong className="font-medium text-[#141413]">Gap: </strong>
              {competitor.gapAnalysis.gap}
            </p>
            <p className="text-[11px] font-sans text-[#6c6a64]">
              <strong className="font-medium text-[#4a4843]">Recommended Action: </strong>
              {competitor.gapAnalysis.recommendedAction}
            </p>
          </div>
        )}
      </div>

      {/* Footer / AI Action */}
      <div className="pt-3 border-t border-[#e6dfd8]/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#8e8b82]">
          Src: <span className="text-[#141413] font-medium">{competitor.source || 'SERP Analysis'}</span>
        </span>

        {onFixGapWithAI && competitor.gapAnalysis && (
          <Button
            size="sm"
            onClick={() => onFixGapWithAI(competitor)}
            className="flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#141413] hover:bg-[#252320] text-[#faf9f5]"
          >
            <Sparkles size={13} className="text-[#cc785c]" />
            <span>Fix Gap with AI</span>
          </Button>
        )}
      </div>
    </div>
  );
};
