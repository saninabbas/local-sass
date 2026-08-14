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
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse" />
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Total Users</span>
            <div className="p-2.5 bg-blue-50 text-primary-accent rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{totalUsers}</span>
            <span className="text-xs font-semibold text-success flex items-center gap-0.5">
              +{stats?.recentSignups7d || 0} this week
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-secondary pt-3 border-t border-gray-100">
            <span>Verified: <strong>{verifiedUsers}</strong></span>
            <span className="font-semibold text-primary">{verifiedPct}% verified</span>
          </div>
        </div>

        {/* Paid Subscriptions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Paid Subscribers</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{paidUsers}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {paidPct}% conversion
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-secondary pt-3 border-t border-gray-100">
            <span>Free Tier: <strong>{planBreakdown.free || 0}</strong></span>
            <span className="text-purple-700 font-semibold">Growth/Pro: {(planBreakdown.growth || 0) + (planBreakdown.pro || 0)}</span>
          </div>
        </div>

        {/* Businesses Tracked */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Businesses Tracked</span>
            <div className="p-2.5 bg-emerald-50 text-success rounded-xl">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{stats?.totalBusinesses || 0}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-secondary pt-3 border-t border-gray-100">
            <span>Avg Per User</span>
            <span className="font-semibold text-primary">
              {totalUsers > 0 ? ((stats?.totalBusinesses || 0) / totalUsers).toFixed(1) : '0'} biz
            </span>
          </div>
        </div>

        {/* Total Audits Run */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Audits Run</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{stats?.totalAudits || 0}</span>
            <span className="text-xs font-semibold text-amber-600">AI Deep Scans</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-secondary pt-3 border-t border-gray-100">
            <span>Leads Captured</span>
            <span className="font-semibold text-primary">{stats?.totalLeads || 0} leads</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown Strip */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Platform Tier Distribution
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Active plan allocation across all registered customer accounts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-3 py-1 rounded-lg bg-gray-50 text-secondary border border-gray-200">
              30d Signups: <strong className="text-primary">+{stats?.recentSignups30d || 0}</strong>
            </span>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex mb-4">
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.enterprise || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-amber-500 transition-all duration-500" 
            title={`Enterprise: ${planBreakdown.enterprise || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.pro || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-indigo-600 transition-all duration-500" 
            title={`Pro: ${planBreakdown.pro || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.growth || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-primary-accent transition-all duration-500" 
            title={`Growth: ${planBreakdown.growth || 0}`}
          />
          <div 
            style={{ width: `${totalUsers > 0 ? ((planBreakdown.free || 0) / totalUsers) * 100 : 0}%` }} 
            className="bg-gray-300 transition-all duration-500" 
            title={`Free: ${planBreakdown.free || 0}`}
          />
        </div>

        {/* Legend Chips with correct Platform Pricing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-xs text-secondary font-medium">Free Audit ($0)</span>
            </div>
            <span className="text-xs font-bold text-primary font-mono">{planBreakdown.free || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-accent" />
              <span className="text-xs text-blue-900 font-medium">Growth ($15/mo)</span>
            </div>
            <span className="text-xs font-bold text-primary-accent font-mono">{planBreakdown.growth || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-xs text-indigo-900 font-medium">Pro ($30/mo)</span>
            </div>
            <span className="text-xs font-bold text-indigo-600 font-mono">{planBreakdown.pro || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-900 font-medium">Enterprise VIP</span>
            </div>
            <span className="text-xs font-bold text-amber-600 font-mono">{planBreakdown.enterprise || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
