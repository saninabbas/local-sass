import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ListTodo,
  Globe,
  Users,
  Star,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  Shield,
  Building,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const mainNavItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Growth Score', href: '/dashboard/score', icon: TrendingUp },
    { name: 'AI Action Plan', href: '/dashboard/actions', icon: ListTodo },
    { name: 'Website', href: '/dashboard/website', icon: Globe },
    { name: 'Competitors', href: '/dashboard/competitors', icon: Users },
    { name: 'Authority Builder', href: '/dashboard/authority', icon: Shield },
    { name: 'Blog Content', href: '/dashboard/content', icon: Sparkles },
    { name: 'Lead Gen Widget', href: '/dashboard/leads', icon: Building },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  ];

  const bottomNavItems = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Help', href: '/contact', icon: HelpCircle },
    { name: 'Account', href: '/dashboard/account', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`w-64 border-r border-[#e6dfd8] bg-[#faf9f5] flex flex-col h-screen fixed lg:static left-0 top-0 z-50 transition-transform duration-200 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e6dfd8]">
        <Link to="/" className="flex items-center gap-1.5">
          <img 
            src="/brand/logo.png" 
            alt="Rankora Logo" 
            className="h-9 w-auto object-contain scale-[1.25] -mr-1" 
          />
          <span className="text-xl font-bold font-serif text-[#141413] tracking-tight">
            Rankora
          </span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 text-[#6c6a64] hover:text-[#141413]"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-mono font-bold tracking-wider text-[#8e8b82] uppercase">
            Menu
          </span>
          <nav className="mt-2 space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-sans font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-[#efe9de] text-[#cc785c] font-semibold'
                      : 'text-[#3d3d3a] hover:bg-[#efe9de] hover:text-[#141413]'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[#cc785c]' : 'text-[#6c6a64]'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Link if admin */}
      {user?.role === 'admin' && (
        <div className="px-3 pb-2">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-[#cc785c]/10 text-[#cc785c] border border-[#cc785c]/25 hover:bg-[#cc785c]/20 transition-colors"
          >
            <ShieldCheck size={16} />
            <span>Admin Console</span>
          </Link>
        </div>
      )}

      {/* Bottom Nav / Settings */}
      <div className="p-3 border-t border-[#e6dfd8] space-y-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-1.5 text-xs font-sans font-medium rounded-lg transition-colors ${
                active
                  ? 'bg-[#efe9de] text-[#cc785c]'
                  : 'text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413]'
              }`}
            >
              <Icon size={15} className={active ? 'text-[#cc785c]' : 'text-[#8e8b82]'} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-1.5 text-xs font-sans font-medium text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#c64545] rounded-lg transition-colors"
        >
          <LogOut size={15} className="text-[#8e8b82]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
