import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Zap, 
  Globe, 
  Star, 
  FileText, 
  Settings, 
  HelpCircle, 
  User,
  Users 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', icon: Home, href: '/dashboard' },
    { name: 'Growth Score', icon: Target, href: '/dashboard/score' },
    { name: 'AI Action Plan', icon: Zap, href: '/dashboard/actions' },
    { name: 'Website', icon: Globe, href: '/dashboard/website' },
    { name: 'Competitors', icon: Target, href: '/dashboard/competitors' },
    { name: 'Blog Content', icon: FileText, href: '/dashboard/content' },
    { name: 'Lead Gen Widget', icon: Users, href: '/dashboard/leads' },
    { name: 'Reviews', icon: Star, href: '/dashboard/reviews' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const bottomItems = [
    { name: 'Help', icon: HelpCircle, href: '/help' },
    { name: 'Account', icon: User, href: '/account' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
      lg:relative lg:translate-x-0 flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-1">
          <img src="/brand/logo.png" alt="Rankora Logo" className="h-10 w-auto object-contain scale-[1.35] -mr-1" />
          <span className="text-xl font-bold text-primary">Rankora</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {navItems.map((item) => {
          // Exact match for dashboard overview, otherwise check if path starts with href for sub-pages
          const isActive = item.href === '/dashboard' 
            ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
            : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-primary-accent' 
                  : 'text-secondary hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-1">
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
          >
            <item.icon size={18} strokeWidth={2} />
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
