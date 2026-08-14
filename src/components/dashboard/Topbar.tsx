import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] relative transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#cc785c]" />
        </button>

        <div className="h-4 w-[1px] bg-[#e6dfd8] mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#181715] flex items-center justify-center text-xs font-serif font-semibold text-[#faf9f5] border border-[#252320]">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-[#141413] leading-tight font-sans">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-[#8e8b82] font-mono">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
