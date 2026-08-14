import { 
  Search, 
  ShieldCheck, 
  Trash2, 
  CreditCard, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Zap, 
  UserX
} from 'lucide-react';
import type { AdminUser } from '../../../types';

interface AdminUserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onGrantPlan: (user: AdminUser) => void;
  onRevokePlan: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onViewDetails: (user: AdminUser) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export function AdminUserTable({
  users,
  isLoading,
  onGrantPlan,
  onRevokePlan,
  onDeleteUser,
  onViewDetails,
  searchQuery,
  onSearchChange,
  selectedPlan,
  onPlanChange,
  selectedRole,
  onRoleChange,
}: AdminUserTableProps) {
  const getPlanBadge = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'pro':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'starter':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            User Base Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {users.length} Users
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, search, grant/revoke tier access, inspect business telemetry, and manage accounts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, biz..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Plans</option>
              <option value="free">Free Tier</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Standard Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">User / Account</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Subscription Plan</th>
              <th className="py-3.5 px-4">Verification</th>
              <th className="py-3.5 px-4">Telemetry</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading user directory...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX size={32} className="text-slate-600 mb-1" />
                    <p className="text-sm font-semibold text-slate-300">No users match your criteria</p>
                    <p className="text-xs text-slate-500">Try changing your search query or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isPrimaryAdmin = u.email === 'saninabbas@gmail.com';
                const isPaid = u.subscription_status && u.subscription_status !== 'free';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shadow-inner">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                            {u.name}
                            {isPrimaryAdmin && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                                Root Admin
                              </span>
                            )}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] mt-0.5">{u.email}</span>
                          {u.businessName && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 size={10} /> {u.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin' 
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck size={12} />}
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* Subscription Plan */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getPlanBadge(u.subscription_status)}`}>
                        <CreditCard size={12} />
                        {u.subscription_status || 'free'}
                      </span>
                    </td>

                    {/* Email Verification */}
                    <td className="py-4 px-4">
                      {u.email_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                          <Clock size={14} /> Unverified
                        </span>
                      )}
                    </td>

                    {/* Telemetry (Biz & Audits) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-slate-300 text-xs">
                        <span className="flex items-center gap-1" title={`${u.businessCount} Businesses`}>
                          <Building2 size={13} className="text-slate-500" />
                          <strong className="text-white">{u.businessCount}</strong>
                        </span>
                        <span className="flex items-center gap-1" title={`${u.auditCount} Audits Run`}>
                          <Zap size={13} className="text-amber-500" />
                          <strong className="text-white">{u.auditCount}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect Details */}
                        <button
                          onClick={() => onViewDetails(u)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Inspect Full User Telemetry"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Grant / Change Plan */}
                        <button
                          onClick={() => onGrantPlan(u)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold text-[11px] transition-colors"
                          title="Grant or Modify Plan"
                        >
                          Grant Plan
                        </button>

                        {/* Revoke Plan (if paid) */}
                        {isPaid && (
                          <button
                            onClick={() => onRevokePlan(u)}
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Revoke Plan (Revert to Free)"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        {/* Delete User */}
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => onDeleteUser(u)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
