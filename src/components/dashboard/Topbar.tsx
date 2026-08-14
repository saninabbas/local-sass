import { Menu, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleNotificationClick = () => {
    alert("You have no new notifications.");
  };

  return (
    <header className="h-16 bg-[#faf9f5] border-b border-[#e6dfd8] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#6c6a64] hover:text-[#141413] rounded-md focus:outline-none"
        >
          <Menu size={22} />
        </button>
      </div>
      
      <div className="hidden lg:flex items-center gap-3 text-xs font-sans text-[#6c6a64]">
        <span className="text-[#141413] font-medium">Enterprise Growth Platform</span>
        <span>•</span>
        <span className="font-mono text-[#cc785c] bg-[#cc785c]/10 px-2 py-0.5 rounded border border-[#cc785c]/20">
          Sonnet 3.7 Intelligence
        </span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Link
          to="/claude"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#efe9de] hover:bg-[#e8e0d2] text-xs font-sans font-medium text-[#141413] rounded-lg border border-[#e6dfd8] transition-colors"
        >
          <Sparkles size={13} className="text-[#cc785c]" />
          <span>Computer Use Demo</span>
        </Link>

        <button onClick={handleNotificationClick} className="p-2 text-[#6c6a64] hover:text-[#141413] transition-colors relative">
          <Bell size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-[#181715] text-[#faf9f5] flex items-center justify-center text-xs font-serif font-semibold shadow-xs border border-[#252320]">
          {initial}
        </div>
      </div>
    </header>
  );
}
