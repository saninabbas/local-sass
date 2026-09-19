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
import { Button } from '../../../components/ui/Button';

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
        return 'bg-[#e8a55a]/15 text-[#e8a55a] border-[#e8a55a]/30';
      case 'pro':
        return 'bg-[#181715] text-[#faf9f5] border-[#252320]';
      case 'growth':
      case 'starter':
        return 'bg-[#cc785c]/15 text-[#cc785c] border-[#cc785c]/30';
      default:
        return 'bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8]';
    }
  };

  const getPlanDisplay = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'Enterprise VIP';
      case 'agency_pro':
      case 'pro':
        return 'Agency Pro ($80/mo)';
      case 'growth':
        return 'Growth ($30/mo)';
      case 'starter':
        return 'Starter ($15/mo)';
      default:
        return 'Starter ($15/mo)';
    }
  };

  return (
    <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-[#e6dfd8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
            User Base Directory
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30 font-mono">
              {users.length} Users
            </span>
          </h2>
          <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
            Search users, grant/revoke plan tiers, inspect telemetry, and manage accounts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8b82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, email, biz..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs text-[#141413] placeholder-[#8e8b82] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] transition-all font-sans"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] transition-all font-sans"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter ($15/mo)</option>
              <option value="growth">Growth ($30/mo)</option>
              <option value="agency_pro">Agency Pro ($80/mo)</option>
              <option value="enterprise">Enterprise VIP</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] transition-all font-sans"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Standard Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#e8e0d2] border-b border-[#e6dfd8] text-[#6c6a64] font-mono uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4 sm:px-6">User Account</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Subscription Plan</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4">Telemetry</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6dfd8]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#6c6a64]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#cc785c] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono">Loading user directory...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#6c6a64]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX size={28} className="text-[#8e8b82] mb-1" />
                    <p className="text-sm font-serif font-medium text-[#141413]">No matching user accounts</p>
                    <p className="text-xs text-[#6c6a64]">Adjust your search query or role/plan filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isPrimaryAdmin = u.email === 'saninabbas@gmail.com';
                const isPaid = u.subscription_status && u.subscription_status !== 'free';

                return (
                  <tr key={u.id} className="hover:bg-[#e8e0d2]/40 transition-colors bg-[#faf9f5] group">
                    {/* User info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#181715] text-[#faf9f5] flex items-center justify-center font-serif text-xs font-semibold">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#141413] text-xs leading-tight flex items-center gap-1.5">
                            {u.name}
                            {isPrimaryAdmin && (
                              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase tracking-wider bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30 rounded">
                                Root Admin
                              </span>
                            )}
                          </span>
                          <span className="text-[#6c6a64] font-mono text-[10px] mt-0.5">{u.email}</span>
                          {u.businessName && (
                            <span className="text-[10px] text-[#8e8b82] flex items-center gap-1 mt-0.5">
                              <Building2 size={10} /> {u.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                        u.role === 'admin' 
                          ? 'bg-[#181715] text-[#faf9f5] border-[#252320]' 
                          : 'bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8]'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck size={11} />}
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* Subscription Plan */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getPlanBadge(u.subscription_status)}`}>
                        <CreditCard size={11} />
                        {getPlanDisplay(u.subscription_status)}
                      </span>
                    </td>

                    {/* Email Verification */}
                    <td className="py-3.5 px-4">
                      {u.email_verified ? (
                        <span className="inline-flex items-center gap-1 text-[#5db872] font-mono text-[10px]">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#e8a55a] font-mono text-[10px]">
                          <Clock size={12} /> Unverified
                        </span>
                      )}
                    </td>

                    {/* Telemetry (Biz & Audits) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-[#6c6a64] text-xs font-mono">
                        <span className="flex items-center gap-1" title={`${u.businessCount} Businesses`}>
                          <Building2 size={11} className="text-[#8e8b82]" />
                          <strong className="text-[#141413]">{u.businessCount}</strong>
                        </span>
                        <span className="flex items-center gap-1" title={`${u.auditCount} Audits Run`}>
                          <Zap size={11} className="text-[#cc785c]" />
                          <strong className="text-[#141413]">{u.auditCount}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-[#6c6a64] font-mono text-[10px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Inspect Details */}
                        <button
                          onClick={() => onViewDetails(u)}
                          className="p-1.5 text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] rounded-lg transition-colors cursor-pointer"
                          title="Inspect Full User Data"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Grant / Change Plan */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onGrantPlan(u)}
                          className="px-2 py-0.5 text-[10px] h-6 bg-[#cc785c] hover:bg-[#a9583e] font-sans font-medium"
                          title="Grant or Modify Plan"
                        >
                          Grant Plan
                        </Button>

                        {/* Revoke Plan (if paid) */}
                        {isPaid && (
                          <button
                            onClick={() => onRevokePlan(u)}
                            className="p-1.5 text-[#e8a55a] hover:text-[#c64545] hover:bg-[#efe9de] rounded-lg transition-colors cursor-pointer"
                            title="Revoke Plan (Revert to Free)"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}

                        {/* Delete User */}
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => onDeleteUser(u)}
                            className="p-1.5 text-[#8e8b82] hover:text-[#c64545] hover:bg-[#efe9de] rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
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
