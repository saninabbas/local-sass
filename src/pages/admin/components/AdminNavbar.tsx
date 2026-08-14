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
    <header className="sticky top-0 z-40 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6dfd8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Admin Badge */}
            <Link to="/admin" className="flex items-center gap-2 group">
              <img 
                src="/brand/logo.svg" 
                alt="Rankora" 
                className="w-[105px] sm:w-[115px] h-auto object-contain" 
              />
              <span className="ml-2 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30 rounded-md">
                Admin Console
              </span>
            </Link>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg bg-[#efe9de] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#cc785c]' : 'text-[#cc785c]'} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg bg-[#efe9de] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] transition-colors"
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">User Dashboard</span>
              <ExternalLink size={11} className="text-[#8e8b82]" />
            </Link>

            <div className="h-5 w-[1px] bg-[#e6dfd8] mx-1 hidden sm:block" />

            {/* Current Admin Tag */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#181715] flex items-center justify-center text-xs font-serif font-semibold text-[#faf9f5] shadow-xs border border-[#252320]">
                {initial}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-[#141413] leading-tight font-sans">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-[#8e8b82] font-mono">
                  {user?.email || 'admin@rankora.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-[#6c6a64] hover:text-[#c64545] hover:bg-[#efe9de] rounded-lg transition-colors ml-1 cursor-pointer"
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
