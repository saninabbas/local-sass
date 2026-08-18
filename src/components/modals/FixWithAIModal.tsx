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
  ExternalLink,
  GitBranch,
  GitPullRequest,
  CheckCheck,
  Layout,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchApi, 
  getConnections, 
  executeUniversalFix
} from '../../lib/api';
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
  const [step, setStep] = useState<'GENERATE' | 'PREVIEW' | 'EXECUTING' | 'PR_CREATED' | 'APPLY_MANUAL' | 'VERIFYING' | 'RESULT'>('GENERATE');
  const [loading, setLoading] = useState(false);
  const [changeRecord, setChangeRecord] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Connection states
  const [activeGitHubConnection, setActiveGitHubConnection] = useState<any | null>(null);
  const [activeWpConnection, setActiveWpConnection] = useState<any | null>(null);
  const [activeShopifyConnection, setActiveShopifyConnection] = useState<any | null>(null);
  const [targetFilePath, setTargetFilePath] = useState('index.html');
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  // Determine provider name
  const providerName = activeShopifyConnection ? 'Shopify' :
    activeWpConnection ? 'WordPress' :
    activeGitHubConnection ? 'GitHub' : 'Manual';

  // Determine target resource type
  const targetResource = activeShopifyConnection ? 'Product / Page' :
    activeWpConnection ? 'Page / Post' :
    activeGitHubConnection ? 'Source Code / Repo' : 'Website DOM';

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
      // 1. Check connections in parallel
      const conns = await getConnections().catch(() => []);
      const gh = Array.isArray(conns) ? conns.find((c: any) => c.provider === 'github' && c.status === 'CONNECTED') : null;
      const wp = Array.isArray(conns) ? conns.find((c: any) => c.provider === 'wordpress' && c.status === 'CONNECTED') : null;
      const sh = Array.isArray(conns) ? conns.find((c: any) => c.provider === 'shopify' && c.status === 'CONNECTED') : null;
      setActiveGitHubConnection(gh);
      setActiveWpConnection(wp);
      setActiveShopifyConnection(sh);

      // 2. Generate solution
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

      const changeData = res?.data || (res?.id || res?.proposedValue ? res : null);
      if (changeData && (changeData.proposedValue || changeData.proposed_value)) {
        setChangeRecord(changeData);
        setEditedContent(changeData.proposedValue || changeData.proposed_value);
        setStep('PREVIEW');
      } else {
        setErrorMessage(res?.error || res?.message || 'Failed to generate solution');
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
      setExecutionResult(null);
      setErrorMessage(null);
      setIsEditing(false);
      setCopied(false);
      handleGenerate();
    }
  }, [isOpen, fixType]);

  if (!isOpen) return null;

  // Phase 5: Universal Execution Entry Point
  const handleApproveAndExecute = async () => {
    if (!changeRecord) return;
    setStep('EXECUTING');
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Record customer approval
      await fetchApi(`/api/seo/changes/${changeRecord.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedContent })
      });

      // 2. Execute via Universal Router
      const execRes = await executeUniversalFix(changeRecord.id, {
        targetFilePath: targetFilePath.trim() || 'index.html',
        customContent: editedContent,
        customCommitMessage: `Rankora SEO Fix: ${normalizedChangeType} for ${context.businessName || 'website'}`
      });

      const execData = execRes?.data || execRes;
      if (!execRes?.success && !execData?.provider && !execData?.status) {
        throw new Error(execRes?.message || execRes?.error || 'Execution failed');
      }

      setExecutionResult(execData);

      if (execData?.provider === 'github') {
        setStep('PR_CREATED');
      } else if (execData?.provider === 'manual') {
        setStep('APPLY_MANUAL');
      } else {
        // WordPress or Shopify with live verification
        setVerificationResult({
          success: execData?.status === 'VERIFIED',
          message: execData?.message,
          evidence: execData?.verification
        });
        setStep('RESULT');
        if (execData?.status === 'VERIFIED' && onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution error');
      setStep('PREVIEW');
    } finally {
      setLoading(false);
    }
  };

  // Re-Crawl & Verify Live Page
  const handleVerify = async () => {
    if (!changeRecord) return;
    setStep('VERIFYING');
    setLoading(true);
    setErrorMessage(null);
    try {
      const verifyRes = await fetchApi(`/api/seo/changes/${changeRecord.id}/verify`, {
        method: 'POST'
      });

      const verifyData = verifyRes?.data || verifyRes;
      setVerificationResult(verifyData);
      setStep('RESULT');
      if ((verifyData?.success || verifyData?.status === 'VERIFIED') && onSuccess) {
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">Universal SEO Execution Engine</span>
                <span className="text-[10px] font-mono text-[#8e8b82]">&bull; {normalizedChangeType}</span>
              </div>
              <h2 className="text-base font-semibold text-[#141413] tracking-tight mt-0.5">
                {title || 'SEO Fix Generator'}
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

        {/* Stepper */}
        <div className="px-6 py-2.5 bg-[#f5f1ea] border-b border-[#e6dfd8] flex items-center justify-between text-[11px] font-mono text-[#8e8b82] overflow-x-auto">
          <span className={`flex items-center gap-1 ${step === 'GENERATE' ? 'text-[#cc785c] font-bold' : 'text-[#141413]'}`}>
            1. Generate
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'PREVIEW' ? 'text-[#cc785c] font-bold' : step !== 'GENERATE' ? 'text-[#141413]' : ''}`}>
            2. Preview & Diff
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'EXECUTING' || step === 'PR_CREATED' || step === 'APPLY_MANUAL' ? 'text-[#cc785c] font-bold' : step === 'RESULT' ? 'text-[#141413]' : ''}`}>
            3. {providerName} Execute
          </span>
          <ArrowRight size={12} />
          <span className={`flex items-center gap-1 ${step === 'VERIFYING' || step === 'RESULT' ? 'text-[#cc785c] font-bold' : ''}`}>
            4. Live Verify
          </span>
        </div>

        {/* Modal Body */}
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
              
              {/* Context Header */}
              <div className="p-3.5 rounded-2xl bg-[#efe9de]/60 border border-[#e6dfd8] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#8e8b82] uppercase block">Provider:</span>
                  <strong className="text-[#141413] flex items-center gap-1">
                    {providerName === 'Shopify' && <ShoppingBag size={12} className="text-[#5e8e3e]" />}
                    {providerName === 'WordPress' && <Globe size={12} className="text-[#0073aa]" />}
                    {providerName === 'GitHub' && <GitBranch size={12} className="text-[#cc785c]" />}
                    {providerName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#8e8b82] uppercase block">Target Resource:</span>
                  <strong className="text-[#141413] truncate block">{targetResource}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#8e8b82] uppercase block">Element:</span>
                  <strong className="text-[#cc785c]">{normalizedChangeType}</strong>
                </div>
              </div>

              {/* Diff View */}
              <div className="space-y-3">
                {changeRecord.beforeValue && (
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-1 font-bold">
                      Current Live Value (Before)
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

                {/* Target File Configuration (for GitHub Mode) */}
                {activeGitHubConnection && !activeShopifyConnection && !activeWpConnection && (
                  <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#cc785c]/30 flex items-center gap-2">
                    <label className="text-[11px] font-mono text-[#6c6a64] whitespace-nowrap">Target Repo File:</label>
                    <input
                      type="text"
                      value={targetFilePath}
                      onChange={(e) => setTargetFilePath(e.target.value)}
                      placeholder="index.html, app/page.tsx, or header.php"
                      className="flex-1 h-8 px-2.5 text-xs font-mono bg-white border border-[#e6dfd8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  </div>
                )}

                {/* Explicit Safety Notice */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-sans">
                  <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Pre-Execution Safety Verification:</strong>
                    <span>
                      {providerName === 'GitHub' 
                        ? 'This action will create a safe, isolated feature branch and submit a GitHub Pull Request.'
                        : providerName === 'Shopify'
                        ? 'This action will update the connected Shopify store metadata upon explicit execution.'
                        : providerName === 'WordPress'
                        ? 'This action will apply the approved update directly via WordPress REST API.'
                        : 'This action will prepare a manual deployment package for your live site.'}
                    </span>
                  </div>
                </div>

                {changeRecord.reason && (
                  <p className="text-xs text-[#6c6a64] font-sans pt-1">
                    <strong className="text-[#141413]">Why this matters: </strong>
                    {changeRecord.reason}
                  </p>
                )}
              </div>

            </div>
          ) : step === 'EXECUTING' ? (
            <div className="py-12 space-y-4 max-w-md mx-auto font-mono text-xs">
              <div className="text-center space-y-2 mb-6">
                <RefreshCw className="animate-spin text-[#cc785c] mx-auto" size={32} />
                <h4 className="font-serif text-base text-[#141413]">
                  Executing Fix via {providerName} & Inspecting Live DOM...
                </h4>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-white border border-[#e6dfd8] shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check size={14} className="shrink-0" />
                  <span>1. User approval confirmed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check size={14} className="shrink-0" />
                  <span>2. Freshness check verified (No stale conflicts)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check size={14} className="shrink-0" />
                  <span>3. Applied change via {providerName} Provider</span>
                </div>
                <div className="flex items-center gap-2 text-[#cc785c] font-bold animate-pulse">
                  <RefreshCw size={12} className="animate-spin shrink-0" />
                  <span>4. Inspecting live public DOM...</span>
                </div>
              </div>
            </div>
          ) : step === 'PR_CREATED' && executionResult ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-center">
                <CheckCheck size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-base">Pull Request Created Successfully!</h4>
                <p className="text-xs text-emerald-800 font-sans max-w-md mx-auto">
                  Rankora created branch <strong className="font-mono">{executionResult.details?.branch || executionResult.branch}</strong> and submitted Pull Request #{executionResult.details?.pullRequestNumber || executionResult.pullRequestNumber}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#181715] text-[#faf9f5] border border-[#252320] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#252320]">
                  <span className="text-[#a09d96]">Pull Request:</span>
                  <span className="font-bold text-[#cc785c]">#{executionResult.details?.pullRequestNumber || executionResult.pullRequestNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#252320]">
                  <span className="text-[#a09d96]">Feature Branch:</span>
                  <span className="text-white truncate max-w-[220px]">{executionResult.details?.branch || executionResult.branch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a09d96]">Commit SHA:</span>
                  <span className="text-emerald-400">{(executionResult.details?.commitSha || executionResult.commitSha || '').substring(0, 7)}</span>
                </div>
              </div>
            </div>
          ) : step === 'APPLY_MANUAL' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-sans">
                <FileCode size={18} className="text-amber-700 shrink-0" />
                <div>
                  <strong className="block text-xs">Manual Deployment Package Ready</strong>
                  <span className="text-[11px] text-amber-800">
                    Deploy the approved code below to your live website, then click "Verify Live Page".
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
                  <h4 className="font-serif font-bold text-sm">Verification Pending / Failed</h4>
                  <p className="text-xs text-red-800 font-sans">
                    {verificationResult?.message || 'The live page does not yet reflect the change. If you use caching (e.g. Cloudflare or WP Rocket), it may take a few moments.'}
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

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#efe9de] border-t border-[#e6dfd8] flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#e6dfd8] text-[#141413] hover:bg-[#e8e0d2] text-xs font-semibold"
          >
            {step === 'RESULT' || step === 'PR_CREATED' ? 'Close' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            {step === 'PREVIEW' && (
              <Button
                size="sm"
                onClick={handleApproveAndExecute}
                disabled={loading}
                className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold"
              >
                <Check size={13} className="text-emerald-400" />
                <span>Approve & Execute Fix</span>
              </Button>
            )}

            {step === 'PR_CREATED' && executionResult && (
              <>
                <a
                  href={executionResult.details?.pullRequestUrl || executionResult.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e6dfd8] bg-white hover:bg-[#efe9de] text-[#141413] text-xs font-semibold"
                >
                  <span>View PR on GitHub</span>
                  <ExternalLink size={12} />
                </a>
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={loading}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#cc785c]"} />
                  <span>Re-Crawl & Verify Live Page</span>
                </Button>
              </>
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
