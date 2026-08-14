import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ListTodo,
  Globe,
  Users,
  Search,
  Star,
  FileText,
  Settings,
  User,
  Building,
  Sparkles,
  Bot,
  X,
  Award,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Growth Score', href: '/dashboard/score', icon: TrendingUp },
        { name: 'AI Action Plan', href: '/dashboard/actions', icon: ListTodo },
      ]
    },
    {
      title: 'GROWTH ENGINE',
      items: [
        { name: 'Website Audit', href: '/dashboard/website', icon: Globe },
        { name: 'Local Rankings', href: '/dashboard/keywords', icon: Search },
        { name: 'Local Geo-Grid', href: '/dashboard/geogrid', icon: Navigation },
        { name: 'Competitor Radar', href: '/dashboard/competitors', icon: Users },
      ]
    },
    {
      title: 'LOCAL PRESENCE',
      items: [
        { name: 'Reviews & Reputation', href: '/dashboard/reviews', icon: Star },
        { name: 'Citations & Authority', href: '/dashboard/authority', icon: Award },
      ]
    },
    {
      title: 'CONTENT & LEADS',
      items: [
        { name: 'Content Studio', href: '/dashboard/content', icon: Sparkles },
        { name: 'Lead Gen Widget', href: '/dashboard/leads', icon: Building },
      ]
    },
    {
      title: 'AI & REPORTING',
      items: [
        { name: 'RANKORA AI Agent', href: '/dashboard/copilot', icon: Bot },
        { name: 'Executive Reports', href: '/dashboard/reports', icon: FileText },
      ]
    }
  ];

  const bottomNavItems = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e6dfd8] bg-[#efe9de]/40">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/brand/logo.png" 
            alt="Rankora" 
            className="h-10 w-auto max-w-[180px] object-contain transition-transform hover:scale-105" 
          />
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 text-[#6c6a64] hover:text-[#141413] cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-mono font-bold tracking-wider text-[#8e8b82] uppercase mb-2">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
                    active 
                      ? 'bg-[#efe9de] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]' 
                      : 'text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de]/50'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[#cc785c]' : 'text-[#6c6a64]'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Account / Admin */}
      <div className="p-4 border-t border-[#e6dfd8] bg-[#efe9de]/30 space-y-1 font-sans text-xs">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                active 
                  ? 'bg-[#efe9de] text-[#141413] font-semibold border border-[#e6dfd8]' 
                  : 'text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de]/50'
              }`}
            >
              <Icon size={16} className={active ? 'text-[#cc785c]' : 'text-[#6c6a64]'} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#cc785c] hover:bg-[#efe9de]/50 transition-colors mt-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#cc785c] animate-pulse" />
            <span>Admin Console</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
