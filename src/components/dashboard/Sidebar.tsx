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
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  Shield,
  Building,
  Sparkles,
  Bot,
  X,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'GROWTH ENGINE',
      items: [
        { name: 'Growth Score', href: '/dashboard/score', icon: TrendingUp },
        { name: 'AI Action Plan', href: '/dashboard/actions', icon: ListTodo },
        { name: 'Website Audit', href: '/dashboard/website', icon: Globe },
        { name: 'Local Rankings', href: '/dashboard/keywords', icon: Search },
        { name: 'Competitors', href: '/dashboard/competitors', icon: Users },
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
        { name: 'Content Engine', href: '/dashboard/content', icon: Sparkles },
        { name: 'Lead Generation', href: '/dashboard/leads', icon: Building },
      ]
    },
    {
      title: 'AI & REPORTING',
      items: [
        { name: 'Rankora AI Agent', href: '/dashboard/copilot', icon: Bot },
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
    <aside className={`w-64 border-r border-gray-200 bg-white flex flex-col h-screen fixed lg:static left-0 top-0 z-50 transition-transform duration-200 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
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
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-secondary uppercase mb-2">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active 
                      ? 'bg-blue-50 text-primary-accent shadow-xs' 
                      : 'text-secondary hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-primary-accent' : 'text-secondary'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Account / Admin */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors mb-2"
          >
            <ShieldCheck size={16} className="text-purple-600" />
            <span>Admin Portal</span>
          </Link>
        )}

        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active 
                  ? 'bg-blue-50 text-primary-accent shadow-xs' 
                  : 'text-secondary hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={active ? 'text-primary-accent' : 'text-secondary'} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
