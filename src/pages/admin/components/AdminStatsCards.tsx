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
          <div key={i} className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const verifiedUsers = stats?.verifiedUsers || 0;
  const verifiedPct = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
  const planBreakdown = stats?.planBreakdown || { free: 0, starter: 0, pro: 0, enterprise: 0 };
  const paidUsers = (planBreakdown.starter || 0) + (planBreakdown.pro || 0) + (planBreakdown.enterprise || 0);
  const paidPct = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Primary Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalUsers}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
              +{stats?.recentSignups7d || 0} this week
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Verified: {verifiedUsers}</span>
            <span className="font-semibold text-slate-300">{verifiedPct}% rate</span>
          </div>
        </div>

        {/* Paid Subscriptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Subscribers</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{paidUsers}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {paidPct}% conversion
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Free Tier: {planBreakdown.free || 0}</span>
            <span className="text-indigo-400 font-semibold">Pro/Ent: {(planBreakdown.pro || 0) + (planBreakdown.enterprise || 0)}</span>
          </div>
        </div>

        {/* Businesses Tracked */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Businesses Tracked</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats?.totalBusinesses || 0}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Avg / User</span>
            <span className="font-semibold text-slate-300">
              {totalUsers > 0 ? ((stats?.totalBusinesses || 0) / totalUsers).toFixed(1) : '0'}
            </span>
          </div>
        </div>

        {/* Total Audits Run */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audits Completed</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats?.totalAudits || 0}</span>
            <span className="text-xs font-medium text-amber-400">AI Deep Scans</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Leads Captured</span>
            <span className="font-semibold text-slate-300">{stats?.totalLeads || 0} leads</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" /> Plan Distribution & User Base
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active plan allocation across all registered customer accounts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              30d Signups: <strong className="text-white">+{stats?.recentSignups30d || 0}</strong>
            </span>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.enterprise || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-amber-500 transition-all duration-500" 
            title={`Enterprise: ${planBreakdown.enterprise || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.pro || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-purple-600 transition-all duration-500" 
            title={`Pro: ${planBreakdown.pro || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.starter || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-blue-600 transition-all duration-500" 
            title={`Starter: ${planBreakdown.starter || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.free || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-slate-600 transition-all duration-500" 
            title={`Free: ${planBreakdown.free || 0}`}
          />
        </div>

        {/* Legend Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-300 font-medium">Free Tier</span>
            </div>
            <span className="text-xs font-bold text-white font-mono">{planBreakdown.free || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-300 font-medium">Starter</span>
            </div>
            <span className="text-xs font-bold text-blue-400 font-mono">{planBreakdown.starter || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-slate-300 font-medium">Pro Plan</span>
            </div>
            <span className="text-xs font-bold text-purple-400 font-mono">{planBreakdown.pro || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-300 font-medium">Enterprise</span>
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono">{planBreakdown.enterprise || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
