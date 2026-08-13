import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-secondary hover:text-primary rounded-md focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="hidden lg:block text-sm font-medium text-secondary">
        Dashboard
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button onClick={handleNotificationClick} className="p-2 text-secondary hover:text-primary relative">
          <Bell size={20} />
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white"></span> */}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {initial}
        </div>
      </div>
    </header>
  );
}
