import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ScoreCheckItem {
  id: string;
  name: string;
  category: 'Technical' | 'On-Page' | 'Local' | 'Performance' | 'Security';
  status: 'PASS' | 'FAIL' | 'WARNING';
  weight: number;
  pointsAwarded: number;
  pointsPossible: number;
  evidence: string;
}

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallScore: number;
  checks: ScoreCheckItem[];
  timestamp?: string;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({
  isOpen,
  onClose,
  overallScore,
  checks = [],
  timestamp,
}) => {
  if (!isOpen) return null;

  const totalPointsAwarded = checks.reduce((sum, c) => sum + (c.pointsAwarded || 0), 0);
  const totalPointsPossible = checks.reduce((sum, c) => sum + (c.pointsPossible || 10), 0);
  const passedCount = checks.filter(c => c.status === 'PASS').length;
  const failedCount = checks.filter(c => c.status === 'FAIL').length;
  const warningCount = checks.filter(c => c.status === 'WARNING').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e6dfd8] bg-[#efe9de]/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#141413] flex items-center justify-center text-[#faf9f5]">
              <Calculator size={20} className="text-[#cc785c]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                Deterministic Formula
              </span>
              <h3 className="text-xl font-serif font-medium text-[#141413]">
                Score Calculation Breakdown
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score Summary Banner */}
        <div className="px-6 py-4 bg-[#efe9de]/20 border-b border-[#e6dfd8] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-[#8e8b82] block">Verified Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-medium text-[#141413]">
                {overallScore}/100
              </span>
              <span className="text-xs font-mono text-[#6c6a64]">
                ({totalPointsAwarded} of {totalPointsPossible} weighted pts)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} /> {passedCount} Passed
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertTriangle size={12} /> {warningCount} Warnings
            </span>
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
              <XCircle size={12} /> {failedCount} Failed
            </span>
          </div>
        </div>

        {/* Scrollable Check List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {checks.length === 0 ? (
            <p className="text-xs text-[#8e8b82] font-mono text-center py-6">
              No individual telemetry checks recorded for this calculation.
            </p>
          ) : (
            checks.map((check) => {
              const isPass = check.status === 'PASS';
              const isWarning = check.status === 'WARNING';

              return (
                <div
                  key={check.id || check.name}
                  className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-3.5 hover:border-[#cc785c]/40 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isPass ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                      ) : isWarning ? (
                        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-rose-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-serif font-medium text-[#141413]">
                        {check.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-[#8e8b82] px-1.5 py-0.5 rounded bg-[#efe9de]">
                        {check.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#141413]">
                        +{check.pointsAwarded}/{check.pointsPossible} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#6c6a64] pl-6">
                    {check.evidence}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e6dfd8] bg-[#efe9de]/40 flex items-center justify-between text-xs font-mono text-[#8e8b82]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#cc785c]" />
            <span>Zero Randomization Guarantee {timestamp ? `• ${timestamp}` : ''}</span>
          </div>
          <Button size="sm" onClick={onClose} variant="outline" className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
