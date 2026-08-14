import { Users, Building2, Zap, Trophy, CreditCard } from 'lucide-react';
import type { AdminStats } from '../../../types';

interface AdminStatsCardsProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export function AdminStatsCards({ stats, isLoading }: AdminStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#efe9de] border border-[#e6dfd8] rounded-xl shadow-xs animate-pulse" />
        ))}
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const verifiedUsers = stats?.verifiedUsers || 0;
  const verifiedPct = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
  const planBreakdown = stats?.planBreakdown || { free: 0, growth: 0, pro: 0, enterprise: 0 };
  const paidUsers = (planBreakdown.growth || 0) + (planBreakdown.pro || 0) + (planBreakdown.enterprise || 0);
  const paidPct = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Primary Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Total Users</span>
            <div className="p-2 bg-[#faf9f5] text-[#cc785c] rounded-lg border border-[#e6dfd8]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-[#141413]">{totalUsers}</span>
            <span className="text-[11px] font-mono text-[#5db872]">
              +{stats?.recentSignups7d || 0} this wk
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6c6a64] pt-2.5 border-t border-[#e6dfd8]">
            <span>Verified: <strong className="text-[#141413]">{verifiedUsers}</strong></span>
            <span className="font-mono text-[#cc785c]">{verifiedPct}%</span>
          </div>
        </div>

        {/* Paid Subscriptions */}
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Paid Subscribers</span>
            <div className="p-2 bg-[#faf9f5] text-[#cc785c] rounded-lg border border-[#e6dfd8]">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-[#141413]">{paidUsers}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30">
              {paidPct}% conv
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6c6a64] pt-2.5 border-t border-[#e6dfd8]">
            <span>Free Tier: <strong className="text-[#141413]">{planBreakdown.free || 0}</strong></span>
            <span className="text-[#cc785c] font-semibold">{(planBreakdown.growth || 0) + (planBreakdown.pro || 0)} active</span>
          </div>
        </div>

        {/* Businesses Tracked */}
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Businesses Tracked</span>
            <div className="p-2 bg-[#faf9f5] text-[#5db8a6] rounded-lg border border-[#e6dfd8]">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-[#141413]">{stats?.totalBusinesses || 0}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6c6a64] pt-2.5 border-t border-[#e6dfd8]">
            <span>Avg Density</span>
            <span className="font-mono text-[#141413]">
              {totalUsers > 0 ? ((stats?.totalBusinesses || 0) / totalUsers).toFixed(1) : '0'} / user
            </span>
          </div>
        </div>

        {/* Total Audits Run */}
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider">Audits Run</span>
            <div className="p-2 bg-[#faf9f5] text-[#e8a55a] rounded-lg border border-[#e6dfd8]">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-[#141413]">{stats?.totalAudits || 0}</span>
            <span className="text-[10px] font-mono text-[#e8a55a]">AI Deep Scans</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6c6a64] pt-2.5 border-t border-[#e6dfd8]">
            <span>Leads Captured</span>
            <span className="font-mono text-[#141413]">{stats?.totalLeads || 0}</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown Strip */}
      <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2">
              <Trophy size={16} className="text-[#cc785c]" /> Platform Tier Distribution
            </h3>
            <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
              Active plan allocation across all registered customer accounts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-[#faf9f5] text-[#6c6a64] border border-[#e6dfd8]">
              30d Signups: <strong className="text-[#141413]">+{stats?.recentSignups30d || 0}</strong>
            </span>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="h-2.5 w-full bg-[#faf9f5] rounded-full overflow-hidden flex mb-4 border border-[#e6dfd8]">
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.enterprise || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-[#e8a55a] transition-all duration-500" 
            title={`Enterprise: ${planBreakdown.enterprise || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.pro || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-[#181715] transition-all duration-500" 
            title={`Pro: ${planBreakdown.pro || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.growth || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-[#cc785c] transition-all duration-500" 
            title={`Growth: ${planBreakdown.growth || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.free || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-[#e6dfd8] transition-all duration-500" 
            title={`Free: ${planBreakdown.free || 0}`}
          />
        </div>

        {/* Legend Chips with correct Platform Pricing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center justify-between p-2.5 bg-[#faf9f5] rounded-lg border border-[#e6dfd8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6c6a64]" />
              <span className="text-xs text-[#3d3d3a] font-sans">Free Audit ($0)</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#141413]">{planBreakdown.free || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#faf9f5] rounded-lg border border-[#e6dfd8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#cc785c]" />
              <span className="text-xs text-[#cc785c] font-sans font-medium">Growth ($15/mo)</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#cc785c]">{planBreakdown.growth || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#faf9f5] rounded-lg border border-[#e6dfd8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#181715]" />
              <span className="text-xs text-[#141413] font-sans font-medium">Pro ($30/mo)</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#141413]">{planBreakdown.pro || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#faf9f5] rounded-lg border border-[#e6dfd8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e8a55a]" />
              <span className="text-xs text-[#e8a55a] font-sans font-medium">Enterprise VIP</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#e8a55a]">{planBreakdown.enterprise || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
