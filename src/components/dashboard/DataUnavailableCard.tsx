import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Database, ArrowRight, ShieldAlert, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface DataUnavailableCardProps {
  title: string;
  providerName: string;
  reason: string;
  sourceRequired: string;
  howToConnect: string;
  connectUrl?: string;
  connectLabel?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
}

export const DataUnavailableCard: React.FC<DataUnavailableCardProps> = ({
  title,
  providerName,
  reason,
  sourceRequired,
  howToConnect,
  connectUrl = '/dashboard/settings',
  connectLabel = 'Connect Provider',
  icon: Icon = Database,
  onRetry,
}) => {
  return (
    <div className="bg-[#faf9f5] border border-dashed border-[#dcd4c8] rounded-2xl p-6 transition-all hover:border-[#cc785c]/40 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header with provider status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#efe9de] flex items-center justify-center text-[#8e8b82]">
              <Icon size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                Telemetry Status
              </span>
              <h4 className="text-base font-serif font-medium text-[#141413]">
                {title}
              </h4>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8]">
            DATA NOT AVAILABLE
          </span>
        </div>

        {/* 3 Clear Policy Explanations */}
        <div className="space-y-2 text-xs font-sans bg-[#efe9de]/30 rounded-xl p-4 border border-[#e6dfd8]/60">
          <div className="flex items-start gap-2">
            <ShieldAlert size={14} className="text-[#cc785c] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-medium text-[#141413]">Why it is unavailable: </strong>
              <span className="text-[#6c6a64]">{reason}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Database size={14} className="text-[#8e8b82] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-medium text-[#141413]">Required Source: </strong>
              <span className="text-[#6c6a64]">{sourceRequired} ({providerName})</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Key size={14} className="text-[#8e8b82] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-medium text-[#141413]">How to Connect: </strong>
              <span className="text-[#6c6a64]">{howToConnect}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Connect Action */}
      <div className="mt-5 pt-4 border-t border-[#e6dfd8]/60 flex items-center justify-between gap-3">
        <p className="text-[11px] font-mono text-[#8e8b82]">
          Zero Fabricated Data Guarantee
        </p>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-sans font-medium text-[#6c6a64] hover:text-[#141413] px-3 py-1.5 rounded-lg border border-[#e6dfd8] hover:bg-[#efe9de] cursor-pointer"
            >
              Retry Check
            </button>
          )}
          <Link to={connectUrl}>
            <Button
              size="sm"
              className="flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#141413] hover:bg-[#252320] text-[#faf9f5]"
            >
              <span>{connectLabel}</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
