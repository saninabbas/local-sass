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
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'pro':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'growth':
      case 'starter':
        return 'bg-blue-50 text-primary-accent border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlanDisplay = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'Enterprise VIP';
      case 'pro':
        return 'Pro ($30/mo)';
      case 'growth':
      case 'starter':
        return 'Growth ($15/mo)';
      default:
        return 'Free Audit';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            User Base Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-primary-accent border border-blue-200 font-mono">
              {users.length} Users
            </span>
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Search users, grant/revoke plan tiers, inspect telemetry, and manage accounts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, biz..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
            >
              <option value="all">All Plans</option>
              <option value="free">Free Audit ($0)</option>
              <option value="growth">Growth ($15/mo)</option>
              <option value="pro">Pro ($30/mo)</option>
              <option value="enterprise">Enterprise VIP</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
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
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-secondary uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">User Account</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Subscription Plan</th>
              <th className="py-3.5 px-4">Verification</th>
              <th className="py-3.5 px-4">Telemetry</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading user base directory...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX size={32} className="text-gray-300 mb-1" />
                    <p className="text-sm font-bold text-primary">No users match your criteria</p>
                    <p className="text-xs text-secondary">Try changing your search query or active filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isPrimaryAdmin = u.email === 'saninabbas@gmail.com';
                const isPaid = u.subscription_status && u.subscription_status !== 'free';

                return (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 text-primary flex items-center justify-center font-bold text-xs shadow-inner">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary text-sm leading-tight flex items-center gap-1.5">
                            {u.name}
                            {isPrimaryAdmin && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-100 text-primary-accent border border-blue-200 rounded">
                                Root Admin
                              </span>
                            )}
                          </span>
                          <span className="text-secondary font-mono text-[11px] mt-0.5">{u.email}</span>
                          {u.businessName && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Building2 size={10} className="text-gray-400" /> {u.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck size={12} />}
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* Subscription Plan */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getPlanBadge(u.subscription_status)}`}>
                        <CreditCard size={12} />
                        {getPlanDisplay(u.subscription_status)}
                      </span>
                    </td>

                    {/* Email Verification */}
                    <td className="py-4 px-4">
                      {u.email_verified ? (
                        <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px]">
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-warning font-semibold text-[11px]">
                          <Clock size={14} /> Unverified
                        </span>
                      )}
                    </td>

                    {/* Telemetry (Biz & Audits) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-secondary text-xs">
                        <span className="flex items-center gap-1" title={`${u.businessCount} Businesses`}>
                          <Building2 size={13} className="text-gray-400" />
                          <strong className="text-primary">{u.businessCount}</strong>
                        </span>
                        <span className="flex items-center gap-1" title={`${u.auditCount} Audits Run`}>
                          <Zap size={13} className="text-amber-500" />
                          <strong className="text-primary">{u.auditCount}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-secondary font-mono text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect Details */}
                        <button
                          onClick={() => onViewDetails(u)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Inspect Full User Data"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Grant / Change Plan */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onGrantPlan(u)}
                          className="px-2.5 py-1 text-[11px] h-7 font-bold"
                          title="Grant or Modify Plan"
                        >
                          Grant Plan
                        </Button>

                        {/* Revoke Plan (if paid) */}
                        {isPaid && (
                          <button
                            onClick={() => onRevokePlan(u)}
                            className="p-1.5 text-warning hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Plan (Revert to Free)"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}

                        {/* Delete User */}
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => onDeleteUser(u)}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
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
