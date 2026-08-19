import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Navigation,
  Link2,
  LogOut,
  ShieldAlert,
  ChevronsUpDown,
  FolderKanban,
  Plus,
  Check,
  Flag,
  History,
  GitBranch
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../context/BusinessContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    businesses, 
    activeBusiness, 
    activeBusinessId, 
    switchBusiness, 
    openAddWebsiteModal,
    websitesUsed,
    planLimit 
  } = useBusiness();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Growth Score', href: '/dashboard/score', icon: TrendingUp },
      ]
    },
    {
      title: 'GROWTH',
      items: [
        { name: 'Campaign', href: '/dashboard/campaign', icon: Flag },
        { name: 'Keywords', href: '/dashboard/keywords', icon: Search },
        { name: 'Competitors', href: '/dashboard/competitors', icon: Users },
        { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
        { name: 'Local Geo-Grid', href: '/dashboard/geogrid', icon: Navigation },
        { name: 'Backlinks', href: '/dashboard/backlinks', icon: Link2 },
      ]
    },
    {
      title: 'WEBSITE',
      items: [
        { name: 'Website Audit', href: '/dashboard/website', icon: Globe },
        { name: 'Content Studio', href: '/dashboard/content', icon: Sparkles },
        { name: 'Internal Links', href: '/dashboard/internal-links', icon: Link2 },
        { name: 'Connections', href: '/dashboard/connections', icon: GitBranch },
        { name: 'Websites & Projects', href: '/dashboard/websites', icon: FolderKanban },
      ]
    },
    {
      title: 'ACTIVITY',
      items: [
        { name: 'Change History', href: '/dashboard/changes', icon: History },
        { name: 'Leads & CRM', href: '/dashboard/leads', icon: Building },
        { name: 'Reports & Audits', href: '/dashboard/reports', icon: FileText },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Plan & Billing', href: '/dashboard/billing', icon: ShieldAlert },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        { name: 'Account Profile', href: '/dashboard/account', icon: User },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      if (onClose) onClose();
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error("Logout failed:", e);
      navigate('/login', { replace: true });
    }
  };

  const handleSelectBusiness = async (bizId: string) => {
    setIsSwitcherOpen(false);
    await switchBusiness(bizId);
    if (onClose) onClose();
  };

  return (
    <aside className={`w-64 border-r border-[#e6dfd8] bg-[#faf9f5] flex flex-col h-screen fixed lg:static left-0 top-0 z-50 transition-transform duration-200 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e6dfd8] bg-[#efe9de]/40">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/brand/logo.svg" 
            alt="Rankora" 
            className="w-[135px] h-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 text-[#6c6a64] hover:text-[#141413] cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-mono font-bold tracking-wider text-[#8e8b82] uppercase mb-1.5">
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

      {/* Footer / Permanent Logout */}
      <div className="p-4 border-t border-[#e6dfd8] bg-[#efe9de]/30 space-y-1 font-sans text-xs">

        {/* Permanent Desktop Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 hover:border hover:border-rose-200 transition-all cursor-pointer text-left"
          title="Sign out of your account"
        >
          <LogOut size={16} className="text-rose-600" />
          <span>Logout</span>
        </button>

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
