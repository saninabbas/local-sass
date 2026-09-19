import React from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  FileCode,
  RotateCcw,
  Zap
} from 'lucide-react';

export type ExecutionStatus = 
  | 'GENERATED'
  | 'PREVIEWED'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'WAITING_AUTHORIZATION'
  | 'APPLYING'
  | 'APPLIED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'VERIFICATION_FAILED'
  | 'ROLLED_BACK'
  | 'MANUAL_ACTION_REQUIRED'
  | 'PENDING';

interface Props {
  status: ExecutionStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export function ExecutionStatusBadge({ status, className = '', size = 'md' }: Props) {
  const norm = (status || 'PENDING').toUpperCase().replace(/[\s-]/g, '_');
  const isSm = size === 'sm';
  const pad = isSm ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]';

  switch (norm) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs ${pad} ${className}`}>
          <CheckCircle2 size={isSm ? 10 : 12} className="text-emerald-600" />
          <span>Verified Live</span>
        </span>
      );

    case 'VERIFICATION_FAILED':
    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-red-100 text-red-800 border border-red-300 shadow-2xs ${pad} ${className}`}>
          <XCircle size={isSm ? 10 : 12} className="text-red-600" />
          <span>Verification Failed</span>
        </span>
      );

    case 'VERIFYING':
    case 'VERIFICATION_PENDING':
    case 'APPLYING':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs ${pad} ${className}`}>
          <RefreshCw size={isSm ? 10 : 12} className="animate-spin text-amber-600" />
          <span>{norm === 'APPLYING' ? 'Deploying...' : 'Verifying Live Page...'}</span>
        </span>
      );

    case 'APPLIED':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs ${pad} ${className}`}>
          <Zap size={isSm ? 10 : 12} className="text-blue-600" />
          <span>Applied (Pending Verification)</span>
        </span>
      );

    case 'APPROVED':
    case 'WAITING_AUTHORIZATION':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs ${pad} ${className}`}>
          <Clock size={isSm ? 10 : 12} className="text-purple-600" />
          <span>Approved (Ready To Apply)</span>
        </span>
      );

    case 'MANUAL_ACTION_REQUIRED':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-amber-50 text-amber-900 border border-amber-400/60 shadow-2xs ${pad} ${className}`}>
          <FileCode size={isSm ? 10 : 12} className="text-amber-700" />
          <span>Manual Action Required</span>
        </span>
      );

    case 'ROLLED_BACK':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs ${pad} ${className}`}>
          <RotateCcw size={isSm ? 10 : 12} className="text-gray-500" />
          <span>Rolled Back</span>
        </span>
      );

    case 'GENERATED':
    case 'PREVIEWED':
    case 'WAITING_APPROVAL':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-full bg-[#efe9de] text-[#141413] border border-[#e6dfd8] shadow-2xs ${pad} ${className}`}>
          <Sparkles size={isSm ? 10 : 12} className="text-[#cc785c]" />
          <span>{norm === 'WAITING_APPROVAL' ? 'Waiting Approval' : 'Candidate Generated'}</span>
        </span>
      );
  }
}
