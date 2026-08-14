import { useAuth } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Shield } from 'lucide-react';

export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Shield size={14} className="text-blue-500" />
          <span>Authenticating Administrator...</span>
        </div>
      </div>
    );
  }

  // If not logged in or role is not admin, show Admin Login page at /admin
  if (!user || user.role !== 'admin') {
    return <AdminLogin />;
  }

  // If logged in as admin, render Admin Dashboard
  return <AdminDashboard />;
}
