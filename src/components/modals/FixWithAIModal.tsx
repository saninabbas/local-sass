import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Edit3, 
  RefreshCw, 
  FileCheck 
} from 'lucide-react';
import { fetchAIFix } from '../../lib/api';
import type { AIFixResult } from '../../types';

interface FixWithAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixType: 'title' | 'meta_description' | 'service_page_structure' | 'faq_schema' | 'review_response' | 'outreach_email' | 'content_brief';
  title?: string;
  context: {
    businessName?: string;
    websiteUrl?: string;
    city?: string;
    category?: string;
    targetKeyword?: string;
    issueEvidence?: string;
    reviewerName?: string;
    reviewRating?: number;
    reviewText?: string;
    prospectDomain?: string;
  };
}

export function FixWithAIModal({
  isOpen,
  onClose,
  fixType,
  title,
  context
}: FixWithAIModalProps) {
  const [loading, setLoading] = useState(false);
  const [fixResult, setFixResult] = useState<AIFixResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const generateFix = async (promptOverride?: string) => {
    setLoading(true);
    try {
      const res = await fetchAIFix(fixType, {
        ...context,
        targetKeyword: promptOverride || context.targetKeyword
      });
      setFixResult(res);
      setEditedContent(res.generatedContent);
    } catch (err) {
      console.error("AI fix generation error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setCopied(false);
      generateFix();
    }
  }, [isOpen, fixType]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent || fixResult?.generatedContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#faf9f5] rounded-2xl border border-[#e6dfd8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#efe9de] border-b border-[#e6dfd8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#cc785c] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">FIX WITH AI</span>
                <span className="text-[10px] font-mono text-[#8e8b82]">Local SEO Optimizer</span>
              </div>
              <h2 className="font-serif text-base text-[#141413] font-normal mt-0.5">
                {title || fixResult?.title || 'AI Solution Generator'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8b82] hover:text-[#141413] hover:bg-[#e8e0d2] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans text-xs space-y-4">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="animate-spin text-[#cc785c] mb-3" size={32} />
              <h4 className="font-serif text-sm font-medium text-[#141413]">Generating optimized solution...</h4>
              <p className="text-[11px] text-[#6c6a64] mt-1 font-sans">
                Analyzing DOM parameters and benchmarking against local competitors.
              </p>
            </div>
          ) : (
            <>
              {/* Target Context Pill */}
              <div className="p-3 bg-[#efe9de] rounded-xl border border-[#e6dfd8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#6c6a64] uppercase block">Target Keyword / Focus</span>
                  <span className="font-medium text-[#141413]">{context.targetKeyword || context.category || 'Primary Local Service'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#6c6a64] uppercase block">Market</span>
                  <span className="font-medium text-[#141413]">{context.city || 'Your Area'}</span>
                </div>
              </div>

              {/* Output / Editor Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#6c6a64]">
                    {isEditing ? 'Direct Editor (Custom modifications)' : 'Generated Solution'}
                  </label>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 text-[11px] text-[#cc785c] hover:underline font-medium"
                  >
                    <Edit3 size={12} />
                    <span>{isEditing ? 'Preview Output' : 'Edit In-Place'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={10}
                    className="w-full p-3.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-xs font-mono text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] leading-relaxed"
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-xs font-mono text-[#141413] whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                    {editedContent || fixResult?.generatedContent}
                  </div>
                )}
              </div>

              {/* Explanation Note */}
              <div className="p-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl text-[11px] text-[#3d3d3a] flex items-start gap-2.5">
                <FileCheck size={16} className="text-[#5db872] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#141413]">Why this works: </span>
                  <span>{fixResult?.explanation || 'Tailored to Google local search quality and click-through algorithms.'}</span>
                </div>
              </div>

              {/* Regenerate with instructions */}
              <div className="pt-2 border-t border-[#e6dfd8] flex gap-2">
                <input
                  type="text"
                  placeholder="Optional: Refine (e.g. 'Make it shorter' or 'Mention 24/7 availability')..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs font-sans text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                />
                <button
                  onClick={() => generateFix(customPrompt)}
                  className="px-3.5 py-1.5 bg-[#efe9de] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Regenerate</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-[#efe9de] border-t border-[#e6dfd8] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#8e8b82]">
            Ready to deploy to your CMS / HTML header
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#faf9f5] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={loading}
              className="px-5 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
