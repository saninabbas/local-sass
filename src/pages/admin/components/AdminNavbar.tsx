import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface AdminNavbarProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AdminNavbar({ onRefresh, isRefreshing }: AdminNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-1.5 group">
              <img 
                src="/brand/logo.png" 
                alt="Rankora Logo" 
                className="h-9 w-auto object-contain scale-[1.25] -mr-1" 
              />
              <span className="text-xl font-bold text-primary">Rankora</span>
              <span className="ml-2 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-primary-accent border border-blue-200 rounded-md">
                Admin Console
              </span>
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary hover:text-primary border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-primary-accent' : ''} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 hover:bg-gray-100 text-secondary hover:text-primary border border-gray-200 transition-colors"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">User Dashboard</span>
              <ExternalLink size={12} className="text-gray-400" />
            </Link>

            <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

            {/* Current Admin Tag */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {initial}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-primary leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-secondary font-mono">
                  {user?.email || 'saninabbas@gmail.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-secondary hover:text-danger hover:bg-red-50 rounded-xl transition-colors ml-1 cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
