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
  Users, 
  Award, 
  Shield,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AnthropicLogo } from '../claude/AnthropicLogo';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Overview', icon: Home, href: '/dashboard' },
    { name: 'Growth Score', icon: Target, href: '/dashboard/score' },
    { name: 'AI Action Plan', icon: Zap, href: '/dashboard/actions' },
    { name: 'Website Diagnostic', icon: Globe, href: '/dashboard/website' },
    { name: 'Competitors', icon: Target, href: '/dashboard/competitors' },
    { name: 'Authority Builder', icon: Award, href: '/dashboard/authority' },
    { name: 'Blog Content', icon: FileText, href: '/dashboard/content' },
    { name: 'Lead Gen Widget', icon: Users, href: '/dashboard/leads' },
    { name: 'Review Sentiment', icon: Star, href: '/dashboard/reviews' },
    { name: 'Reports & Audits', icon: FileText, href: '/dashboard/reports' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const bottomItems = [
    { name: 'Computer Use Agent', icon: Eye, href: '/claude', highlightCoral: true },
    ...(user?.role === 'admin' ? [{ name: 'Admin Portal', icon: Shield, href: '/admin', highlightDark: true }] : []),
    { name: 'Help & Docs', icon: HelpCircle, href: '/resources' },
    { name: 'Account Profile', icon: User, href: '/dashboard/account' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-[#faf9f5] border-r border-[#e6dfd8] transform transition-transform duration-200 ease-in-out
      lg:relative lg:translate-x-0 flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-[#e6dfd8] shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2">
          <AnthropicLogo size={20} color="#cc785c" showWordmark={true} wordmarkColor="#141413" brandName="Rankora" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1 custom-claude-scrollbar">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
            : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
                isActive 
                  ? 'bg-[#efe9de] text-[#cc785c] font-semibold shadow-xs border border-[#e6dfd8]' 
                  : 'text-[#6c6a64] hover:bg-[#efe9de]/70 hover:text-[#141413]'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-[#cc785c]' : 'text-[#8e8b82]'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#e6dfd8] flex flex-col gap-1 bg-[#faf9f5]">
        {bottomItems.map((item: any) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
              item.highlightCoral
                ? 'bg-[#cc785c]/10 text-[#cc785c] hover:bg-[#cc785c]/20 border border-[#cc785c]/30 font-semibold'
                : item.highlightDark
                ? 'bg-[#181715] text-[#faf9f5] hover:bg-[#252320] font-semibold'
                : 'text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413]'
            }`}
          >
            <item.icon size={16} />
            <span className="flex-1 truncate">{item.name}</span>
            {item.highlightCoral && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#cc785c] text-white font-bold">
                BETA
              </span>
            )}
            {item.highlightDark && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#cc785c] text-white font-bold">
                ADMIN
              </span>
            )}
          </Link>
        ))}
      </div>
    </aside>
  );
}
