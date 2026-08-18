import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  source?: string;
  lastChecked?: string;
  status?: 'PASS' | 'WARNING' | 'FAIL' | 'UNAVAILABLE' | 'CONNECTED' | 'DISCONNECTED';
  action?: {
    label: string;
    onClick: () => void;
  };
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  source,
  lastChecked,
  status,
  action,
  tooltip,
}) => {
  const getStatusBadge = () => {
    if (!status) return null;
    const styles = {
      PASS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
      FAIL: 'bg-rose-50 text-rose-700 border-rose-200',
      UNAVAILABLE: 'bg-[#efe9de] text-[#8e8b82] border-[#e6dfd8]',
      CONNECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      DISCONNECTED: 'bg-[#efe9de] text-[#6c6a64] border-[#e6dfd8]',
    };

    return (
      <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white border border-[#e6dfd8] rounded-2xl p-6 shadow-2xs hover:border-[#cc785c]/40 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Title, Icon, Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#efe9de]/60 border border-[#e6dfd8]/60 flex items-center justify-center text-[#cc785c]">
              <Icon size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#8e8b82] uppercase">
                  {title}
                </span>
                {tooltip && (
                  <span title={tooltip} className="text-[#8e8b82] hover:text-[#141413] cursor-help">
                    <HelpCircle size={11} />
                  </span>
                )}
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Primary Metric Value */}
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-semibold text-[#141413] tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium ${
                trend.isNeutral
                  ? 'text-[#8e8b82]'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {trend.isNeutral ? (
                <Minus size={12} />
              ) : trend.isPositive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {trend.value}
              {trend.label && <span className="text-[10px] text-[#8e8b82] ml-0.5">{trend.label}</span>}
            </span>
          )}
        </div>

        {/* Subtitle / 1-line note */}
        {subtitle && (
          <p className="text-xs text-[#6c6a64] font-sans line-clamp-1 mb-3">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer: Provenance (Source + Checked) & Action */}
      <div className="mt-3 pt-3 border-t border-[#e6dfd8]/60 flex items-center justify-between text-[11px] font-mono text-[#8e8b82]">
        <div className="flex items-center gap-1.5 truncate">
          {source && (
            <span className="truncate">
              Src: <span className="text-[#141413] font-medium">{source}</span>
            </span>
          )}
          {source && lastChecked && <span>•</span>}
          {lastChecked && <span>{lastChecked}</span>}
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="text-[#cc785c] hover:text-[#b36248] font-sans font-semibold text-xs ml-2 hover:underline cursor-pointer flex-shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
