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
  Check
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
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Growth Score', href: '/dashboard/score', icon: TrendingUp },
        { name: 'Websites & Projects', href: '/dashboard/businesses', icon: FolderKanban },
      ]
    },
    {
      title: 'GROWTH',
      items: [
        { name: 'Local Rankings', href: '/dashboard/keywords', icon: Search },
        { name: 'Local Geo-Grid', href: '/dashboard/geogrid', icon: Navigation },
        { name: 'Competitor Radar', href: '/dashboard/competitors', icon: Users },
      ]
    },
    {
      title: 'LOCAL PRESENCE',
      items: [
        { name: 'Website Audit', href: '/dashboard/website', icon: Globe },
        { name: 'Reviews & Reputation', href: '/dashboard/reviews', icon: Star },
        { name: 'Backlinks & Authority', href: '/dashboard/backlinks', icon: Link2 },
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
        { name: 'AI Action Plan', href: '/dashboard/actions', icon: ListTodo },
        { name: 'RANKORA AI Agent', href: '/dashboard/copilot', icon: Bot },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
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

      {/* Workspace / Business Switcher */}
      <div className="px-4 pt-4 pb-2 relative" ref={switcherRef}>
        <button
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#efe9de] border border-[#e6dfd8] hover:border-[#cc785c]/40 transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#cc785c] font-serif font-bold text-xs shrink-0 shadow-2xs">
              {activeBusiness?.name ? activeBusiness.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-serif font-bold text-[#141413] truncate group-hover:text-[#cc785c] transition-colors">
                {activeBusiness?.name || 'My Website'}
              </div>
              <div className="text-[10px] text-[#605f5b] truncate font-mono">
                {activeBusiness?.website_url ? activeBusiness.website_url.replace(/^https?:\/\//, '').replace(/^www\./, '') : 'Add website'}
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-[#605f5b] shrink-0 ml-1 opacity-70 group-hover:opacity-100" />
        </button>

        {/* Dropdown Menu */}
        {isSwitcherOpen && (
          <div className="absolute left-4 right-4 top-16 z-50 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in duration-150">
            <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-[#605f5b] uppercase flex items-center justify-between border-b border-[#e6dfd8] mb-1">
              <span>Websites ({websitesUsed}/{planLimit})</span>
              <Link
                to="/dashboard/businesses"
                onClick={() => setIsSwitcherOpen(false)}
                className="text-[#cc785c] hover:underline normal-case font-sans text-[11px]"
              >
                Manage
              </Link>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {businesses.map((biz) => {
                const isCurrent = biz.id === activeBusinessId;
                return (
                  <button
                    key={biz.id}
                    onClick={() => handleSelectBusiness(biz.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isCurrent 
                        ? 'bg-[#efe9de] text-[#141413] font-bold' 
                        : 'text-[#605f5b] hover:bg-[#efe9de]/50 hover:text-[#141413]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-serif">{biz.name || 'Untitled'}</div>
                      <div className="text-[10px] opacity-70 truncate font-mono">
                        {biz.website_url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#cc785c] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-[#e6dfd8] mt-1 space-y-1">
              <button
                onClick={() => {
                  setIsSwitcherOpen(false);
                  openAddWebsiteModal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#cc785c] hover:bg-[#cc785c]/10 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Website Project</span>
              </button>
            </div>
          </div>
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

      {/* Footer / Account / Settings / Permanent Logout */}
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
