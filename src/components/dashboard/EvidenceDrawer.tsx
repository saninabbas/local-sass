import React from 'react';
import { X, Copy, Check, Code, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EvidenceData {
  title: string;
  category?: string;
  source?: string;
  timestamp?: string;
  impact?: string;
  evidence: string;
  codeSnippet?: string;
  technicalDetails?: Record<string, any>;
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceData | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !evidence) return null;

  const handleCopy = () => {
    const textToCopy = `${evidence.title}\n\nEvidence:\n${evidence.evidence}\n\n${
      evidence.codeSnippet ? `Code / Snippet:\n${evidence.codeSnippet}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#faf9f5] border-l border-[#e6dfd8] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#e6dfd8] bg-[#efe9de]/40 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82] px-2 py-0.5 rounded bg-[#efe9de] border border-[#e6dfd8]">
                {evidence.category || 'Technical Evidence'}
              </span>
              {evidence.source && (
                <span className="text-[11px] font-mono text-[#8e8b82]">
                  Src: {evidence.source}
                </span>
              )}
            </div>
            <h3 className="text-xl font-serif font-medium text-[#141413]">
              {evidence.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] rounded-lg cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Summary / Impact */}
          {evidence.impact && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8e8b82]">
                Observed Business Impact
              </h4>
              <p className="text-sm font-sans text-[#141413] leading-relaxed bg-[#efe9de]/30 p-3.5 rounded-xl border border-[#e6dfd8]">
                {evidence.impact}
              </p>
            </div>
          )}

          {/* Raw Crawl Evidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8e8b82] flex items-center gap-1.5">
                <Globe size={14} className="text-[#cc785c]" />
                <span>Raw Crawler Inspection</span>
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs font-mono text-[#cc785c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Evidence'}</span>
              </button>
            </div>
            <div className="bg-[#181715] text-[#f4efe6] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-[#252320]">
              <pre className="whitespace-pre-wrap">{evidence.evidence}</pre>
            </div>
          </div>

          {/* Code Snippet if applicable */}
          {evidence.codeSnippet && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8e8b82] flex items-center gap-1.5">
                <Code size={14} className="text-[#cc785c]" />
                <span>HTML / Schema / Header Snippet</span>
              </h4>
              <div className="bg-[#181715] text-[#f4efe6] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-[#252320]">
                <pre className="whitespace-pre-wrap">{evidence.codeSnippet}</pre>
              </div>
            </div>
          )}

          {/* Technical Details Map */}
          {evidence.technicalDetails && Object.keys(evidence.technicalDetails).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8e8b82] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#cc785c]" />
                <span>Diagnostic Attributes</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(evidence.technicalDetails).map(([key, val]) => (
                  <div key={key} className="bg-[#efe9de]/40 p-2.5 rounded-xl border border-[#e6dfd8] text-xs">
                    <span className="text-[10px] font-mono uppercase text-[#8e8b82] block truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-medium text-[#141413] truncate block">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-[#e6dfd8] bg-[#efe9de]/30 flex items-center justify-between">
          <span className="text-xs font-mono text-[#8e8b82]">
            Audited via Scorankio Deterministic Engine
          </span>
          <Button size="sm" onClick={onClose} variant="outline" className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
