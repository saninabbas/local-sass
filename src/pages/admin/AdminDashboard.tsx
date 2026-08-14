import { useState, useEffect, useCallback } from 'react';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserPlan, 
  revokeUserPlan, 
  deleteUser 
} from '../../lib/api';
import type { AdminStats, AdminUser } from '../../types';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminStatsCards } from './components/AdminStatsCards';
import { AdminUserTable } from './components/AdminUserTable';
import { GrantPlanModal } from './components/GrantPlanModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { UserDetailModal } from './components/UserDetailModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Modals state
  const [selectedUserForGrant, setSelectedUserForGrant] = useState<AdminUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUser | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUser | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats(),
        getAdminUsers({ search: searchQuery, plan: selectedPlan, role: selectedRole })
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      showToast(err.message || "Failed to load dashboard data", 'error');
    } finally {
      setIsLoadingStats(false);
      setIsLoadingUsers(false);
      if (showSpin) setIsRefreshing(false);
    }
  }, [searchQuery, selectedPlan, selectedRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for plan granting / revoking / deletion
  const handleGrantPlan = async (userId: string, plan: string) => {
    try {
      const res = await updateUserPlan(userId, plan);
      showToast(res.message || `Plan updated to ${plan.toUpperCase()}`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan', 'error');
      throw err;
    }
  };

  const handleRevokePlan = async (user: AdminUser) => {
    if (!window.confirm(`Are you sure you want to revoke the plan for ${user.name}? This will reset their account to Free tier.`)) {
      return;
    }
    try {
      const res = await revokeUserPlan(user.id);
      showToast(res.message || 'Plan revoked to Free tier');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke plan', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await deleteUser(userId);
      showToast(res.message || 'User permanently deleted');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold ${
            toast.type === 'success' 
              ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-900 border-red-500/40 text-red-300'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Top Navigation */}
      <AdminNavbar onRefresh={() => loadData(true)} isRefreshing={isRefreshing} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Base Statistics */}
        <AdminStatsCards stats={stats} isLoading={isLoadingStats} />

        {/* User Management Hub */}
        <AdminUserTable
          users={users}
          isLoading={isLoadingUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          onGrantPlan={(user) => setSelectedUserForGrant(user)}
          onRevokePlan={handleRevokePlan}
          onDeleteUser={(user) => setSelectedUserForDelete(user)}
          onViewDetails={(user) => setSelectedUserForDetail(user)}
        />
      </main>

      {/* Modals */}
      <GrantPlanModal
        user={selectedUserForGrant}
        isOpen={!!selectedUserForGrant}
        onClose={() => setSelectedUserForGrant(null)}
        onGrant={handleGrantPlan}
      />

      <DeleteUserModal
        user={selectedUserForDelete}
        isOpen={!!selectedUserForDelete}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirmDelete={handleDeleteUser}
      />

      <UserDetailModal
        user={selectedUserForDetail}
        isOpen={!!selectedUserForDetail}
        onClose={() => setSelectedUserForDetail(null)}
      />
    </div>
  );
}
