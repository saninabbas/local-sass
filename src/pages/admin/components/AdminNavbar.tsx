import { Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
                <Shield size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">Rankora</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
                    Admin Portal
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">User Dashboard</span>
              <ExternalLink size={12} className="text-slate-400" />
            </Link>

            <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            {/* Current Admin Tag */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-blue-400 font-mono">
                  {user?.email || 'saninabbas@gmail.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
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
