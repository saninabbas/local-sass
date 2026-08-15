import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Globe,
  FileCode,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { ExecutionStatusBadge } from '../dashboard/ExecutionStatusBadge';
import { Button } from '../ui/Button';

interface FixWithAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixType: string;
  title?: string;
  taskId?: string;
  context: {
    businessName?: string;
    websiteUrl?: string;
    city?: string;
    category?: string;
    targetKeyword?: string;
    issueEvidence?: string;
    currentValue?: string;
    expectedValue?: string;
  };
  onSuccess?: () => void;
}

export function FixWithAIModal({
  isOpen,
  onClose,
  fixType,
  title,
  taskId,
  context,
  onSuccess
}: FixWithAIModalProps) {
  const [step, setStep] = useState<'GENERATE' | 'PREVIEW' | 'APPLY_MANUAL' | 'VERIFYING' | 'RESULT'>('GENERATE');
  const [loading, setLoading] = useState(false);
  const [changeRecord, setChangeRecord] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Normalize changeType
  const normalizedChangeType = fixType.toUpperCase().includes('TITLE') ? 'SEO_TITLE' :
    fixType.toUpperCase().includes('META') ? 'META_DESCRIPTION' :
    fixType.toUpperCase().includes('H1') ? 'H1' :
    fixType.toUpperCase().includes('SCHEMA') ? 'LOCALBUSINESS_SCHEMA' :
    fixType.toUpperCase().includes('SECURITY') || fixType.toUpperCase().includes('HSTS') ? 'SECURITY_HEADERS' :
    fixType.toUpperCase().includes('LINK') ? 'INTERNAL_LINK' : 'SEO_TITLE';

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchApi('/api/seo/changes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          pageUrl: context.websiteUrl,
          changeType: normalizedChangeType,
          currentValue: context.currentValue || context.issueEvidence,
          issueDescription: title,
          targetKeyword: context.targetKeyword
        })
      });

      if (res.success && res.data) {
        setChangeRecord(res.data);
        setEditedContent(res.data.proposedValue);
        setStep('PREVIEW');
      } else {
        setErrorMessage(res.error || 'Failed to generate solution');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('GENERATE');
      setChangeRecord(null);
      setVerificationResult(null);
      setErrorMessage(null);
      setIsEditing(false);
      setCopied(false);
      handleGenerate();
    }
  }, [isOpen, fixType]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!changeRecord) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const approveRes = await fetchApi(`/api/seo/changes/${changeRecord.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedContent })
      });

      if (!approveRes.success) {
        throw new Error(approveRes.error || 'Approval failed');
      }

      // Apply step
      const applyRes = await fetchApi(`/api/seo/changes/${changeRecord.id}/apply`, {
        method: 'POST'
      });

      if (applyRes.success) {
        setChangeRecord({
          ...changeRecord,
          after_value: editedContent,
          execution_status: applyRes.executionStatus,
          implementationPackage: applyRes.implementationPackage
        });
        setStep('APPLY_MANUAL');
      } else {
        throw new Error(applyRes.error || 'Application failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve & apply change');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!changeRecord) return;
    setStep('VERIFYING');
    setLoading(true);
    setErrorMessage(null);
    try {
      const verifyRes = await fetchApi(`/api/seo/changes/${changeRecord.id}/verify`, {
        method: 'POST'
      });

      setVerificationResult(verifyRes);
      setStep('RESULT');
      if (verifyRes.success && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification crawl failed');
      setStep('RESULT');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent || changeRecord?.proposedValue || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#efe9de] border-b border-[#e6dfd8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#141413] text-[#faf9f5] flex items-center justify-center shadow-xs">
              <Sparkles size={16} className="text-[#cc785c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">SEO Execution Engine</span>
                <span className="text-[10px] font-mono text-[#8e8b82]">&bull; {normalizedChangeType}</span>
              </div>
              <h2 className="font-serif text-base text-[#141413] font-medium mt-0.5">
                {title || 'Verified Solution Generator'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8e8b82] hover:text-[#141413] hover:bg-[#e8e0d2] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="px-6 py-2.5 bg-[#f5f1ea] border-b border-[#e6dfd8] flex items-center justify-between text-[11px] font-mono text-[#8e8b82] overflow-x-auto">
          <span className={`flex items-center gap-1 ${step === 'GENERATE' ? 'text-[#cc785c] font-bold' : 'text-[#141413]'}`}>
            1. Generate
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'PREVIEW' ? 'text-[#cc785c] font-bold' : step === 'APPLY_MANUAL' || step === 'RESULT' ? 'text-[#141413]' : ''}`}>
            2. Preview & Diff
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'APPLY_MANUAL' ? 'text-[#cc785c] font-bold' : step === 'RESULT' ? 'text-[#141413]' : ''}`}>
            3. Approve & Deploy
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'VERIFYING' || step === 'RESULT' ? 'text-[#cc785c] font-bold' : ''}`}>
            4. Live Verify
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-xs space-y-5">
          
          {loading && step === 'GENERATE' ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="animate-spin text-[#cc785c]" size={32} />
              <h4 className="font-serif text-sm font-medium text-[#141413]">Extracting DOM Context & Generating Fix...</h4>
              <p className="text-[11px] text-[#6c6a64] max-w-md">
                Analyzing live HTML evidence, keyword intent, and competitor signals for {context.websiteUrl || 'your domain'}.
              </p>
            </div>
          ) : step === 'PREVIEW' && changeRecord ? (
            <div className="space-y-4">
              
              {/* Context Information */}
              <div className="p-3 rounded-xl bg-[#efe9de]/50 border border-[#e6dfd8] flex items-center justify-between text-xs font-mono">
                <span className="text-[#6c6a64]">Target URL: <strong className="text-[#141413]">{changeRecord.pageUrl}</strong></span>
                <span className="text-[#cc785c] font-bold uppercase">{changeRecord.impact} Impact</span>
              </div>

              {/* Diff View */}
              <div className="space-y-3">
                {changeRecord.beforeValue && (
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-1 font-bold">
                      Current Live DOM Value (Before)
                    </span>
                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-200/80 text-red-950 font-mono text-xs overflow-x-auto">
                      <code>{changeRecord.beforeValue}</code>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase text-[#cc785c] font-bold flex items-center gap-1">
                      <Sparkles size={11} /> Proposed Solution (After)
                    </span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-[11px] text-[#8e8b82] hover:text-[#141413] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={11} /> {isEditing ? 'Cancel Edit' : 'Edit Text'}
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-white border border-[#cc785c] text-[#141413] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#181715] text-[#faf9f5] border border-[#252320] font-mono text-xs overflow-x-auto">
                      <pre className="leading-relaxed whitespace-pre-wrap">{editedContent}</pre>
                    </div>
                  )}
                </div>

                {changeRecord.reason && (
                  <p className="text-xs text-[#6c6a64] font-sans pt-1">
                    <strong className="text-[#141413]">Why this matters: </strong>
                    {changeRecord.reason}
                  </p>
                )}
              </div>

            </div>
          ) : step === 'APPLY_MANUAL' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-sans">
                <FileCode size={18} className="text-amber-700 shrink-0" />
                <div>
                  <strong className="block text-xs">Manual Deployment Package Ready</strong>
                  <span className="text-[11px] text-amber-800">
                    No authorized CMS integration detected. Deploy the approved code below to your live website, then click "Verify Live Page".
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#8e8b82] font-bold">Approved Code Snippet</span>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-[#cc785c] font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#181715] text-[#faf9f5] border border-[#252320] font-mono text-xs overflow-x-auto max-h-48">
                  <pre className="leading-relaxed whitespace-pre-wrap">{editedContent}</pre>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#efe9de]/60 border border-[#e6dfd8] text-xs font-sans space-y-1">
                <strong className="text-[#141413] block font-mono text-[11px] uppercase">Deployment Instructions:</strong>
                <p className="text-[#6c6a64]">
                  {changeRecord?.implementationPackage?.instructions || 'Insert this code snippet into your website template or header tags.'}
                </p>
              </div>
            </div>
          ) : step === 'VERIFYING' ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="animate-spin text-[#cc785c]" size={36} />
              <h4 className="font-serif text-sm font-medium text-[#141413]">Crawling Live Website & Inspecting DOM...</h4>
              <p className="text-[11px] text-[#6c6a64] max-w-md">
                Executing HTTP GET to {context.websiteUrl} to verify that the approved changes are active on the live web.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verificationResult?.success ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-center">
                  <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-sm">Live Verification Passed!</h4>
                  <p className="text-xs text-emerald-800 font-sans">
                    Rankora crawled your live site and confirmed that the target element now satisfies the approved optimization.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2 text-center">
                  <XCircle size={32} className="text-red-600 mx-auto" />
                  <h4 className="font-serif font-bold text-sm">Verification Failed</h4>
                  <p className="text-xs text-red-800 font-sans">
                    {verificationResult?.message || 'The live page does not yet reflect the approved change. Changes may take a few minutes to propagate if cached.'}
                  </p>
                </div>
              )}

              {verificationResult?.evidence && (
                <div className="p-3.5 rounded-xl bg-[#181715] text-[#faf9f5] border border-[#252320] font-mono text-[11px] overflow-x-auto">
                  <span className="text-[10px] text-[#8e8b82] uppercase block mb-1">Live Crawl Evidence:</span>
                  <pre>{JSON.stringify(verificationResult.evidence, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#efe9de] border-t border-[#e6dfd8] flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#e6dfd8] text-[#141413] hover:bg-[#e8e0d2] text-xs font-semibold"
          >
            {step === 'RESULT' ? 'Close' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            {step === 'PREVIEW' && (
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={loading}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold"
              >
                <Check size={13} className="text-emerald-400" />
                <span>Approve & Continue</span>
              </Button>
            )}

            {step === 'APPLY_MANUAL' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[#e6dfd8] text-[#141413] hover:bg-[#e8e0d2] flex items-center gap-1 text-xs font-semibold"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={loading}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#cc785c]"} />
                  <span>Verify Live Page</span>
                </Button>
              </>
            )}

            {step === 'RESULT' && !verificationResult?.success && (
              <Button
                size="sm"
                onClick={handleVerify}
                disabled={loading}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#cc785c]"} />
                <span>Re-Check Live Page</span>
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
