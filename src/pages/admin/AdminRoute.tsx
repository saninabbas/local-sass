import { useAuth } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Shield } from 'lucide-react';

export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-secondary">
        <div className="w-10 h-10 border-3 border-primary-accent border-t-transparent rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
          <Shield size={16} className="text-primary-accent" />
          <span>Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  // If not logged in or role is not admin, show Admin Login page at /admin
  const isAdmin = Boolean(user && user.role === 'admin');
  if (!isAdmin) {
    return <AdminLogin />;
  }

  // If logged in as admin, render Admin Dashboard
  return <AdminDashboard />;
}
