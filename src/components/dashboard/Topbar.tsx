import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User as UserIcon, Settings, LogOut, ChevronDown, Globe, Sparkles, CreditCard, Link2, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Link, useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { businesses, activeBusiness, switchBusiness, planLimit, openAddWebsiteModal } = useBusiness();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);


  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const userInitials = getInitials(user?.name, user?.email);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setProjectDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error("Logout failed:", e);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="h-16 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Global Project Switcher Dropdown */}
        <div className="relative" ref={projectDropdownRef}>
          <button 
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#efe9de] border border-[#e6dfd8] text-[#141413] hover:border-[#cc785c]/40 transition-colors shadow-2xs cursor-pointer text-xs"
            aria-expanded={projectDropdownOpen}
            aria-label="Select active website"
          >
            <Globe className="w-3.5 h-3.5 text-[#cc785c]" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono uppercase text-[#8e8b82] leading-none">Current Website</span>
              <span className="font-serif font-bold text-xs truncate max-w-[140px] sm:max-w-[200px]">
                {activeBusiness?.name || activeBusiness?.website_url.replace(/^https?:\/\//, '') || 'Select Website'}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#8e8b82] ml-1" />
          </button>

          {/* Project Dropdown Menu */}
          {projectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#e6dfd8] flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                  Your Websites ({businesses.length}/{planLimit})
                </span>
                <Link 
                  to="/dashboard/businesses" 
                  onClick={() => setProjectDropdownOpen(false)}
                  className="text-[10px] font-mono text-[#cc785c] hover:underline font-bold"
                >
                  Manage All
                </Link>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-[#e6dfd8]/50">
                {businesses.map((biz) => {
                  const isActive = biz.id === activeBusiness?.id;
                  return (
                    <button
                      key={biz.id}
                      onClick={async () => {
                        await switchBusiness(biz.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[#efe9de]/60 transition-colors cursor-pointer ${
                        isActive ? 'bg-[#efe9de]/40 font-bold' : ''
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span className="text-xs font-serif text-[#141413] truncate">{biz.name || biz.website_url.replace(/^https?:\/\//, '')}</span>
                        </div>
                        <span className="text-[10px] text-[#8e8b82] font-mono block pl-3">
                          {biz.city ? `${biz.city} • ` : ''}{biz.type || 'Local Business'}
                        </span>
                      </div>
                      {biz.score != null && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181715] text-[#faf9f5]">
                          {biz.score}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[#e6dfd8]">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    openAddWebsiteModal();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>+ Add Website Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Commercial Status Badge */}
        <Link
          to="/dashboard/billing"
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] hover:border-[#cc785c]/60 transition-colors text-xs font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-[#cc785c]" />
          <span className="font-bold uppercase text-[#141413]">
            {user?.subscription_tier === 'pro' ? 'AGENCY PRO' : user?.subscription_tier === 'growth' ? 'GROWTH' : 'STARTER'}
          </span>
          <span className="text-[#8e8b82] text-[10px]">&bull; Billing</span>
        </Link>

        <Link to="/dashboard/billing" className="hidden sm:block">
          <button className="px-3 py-1 rounded-xl bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
            <Sparkles size={12} className="text-[#cc785c]" />
            <span>Upgrade</span>
          </button>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] relative transition-colors cursor-pointer border border-transparent hover:border-[#e6dfd8] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
            aria-haspopup="dialog"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#cc785c] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs border-2 border-[#faf9f5]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
          />
        </div>


        <div className="h-4 w-[1px] bg-[#e6dfd8] mx-1" />

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#efe9de]/60 transition-colors cursor-pointer border border-transparent hover:border-[#e6dfd8] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || 'User Avatar'} 
                className="w-8 h-8 rounded-full object-cover border border-[#252320]" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#181715] flex items-center justify-center text-xs font-semibold text-[#faf9f5] border border-[#252320]">
                {userInitials}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#141413] leading-tight tracking-tight">
                {user?.name || 'Sanin Abbas'}
              </span>
              <span className="text-[10px] text-[#8e8b82] font-mono truncate max-w-[130px]">
                {user?.email || 'user@example.com'}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#8e8b82] hidden sm:block ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-[#e6dfd8] mb-1 flex items-center gap-3">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || 'Avatar'} 
                    className="w-10 h-10 rounded-full object-cover border border-[#e6dfd8]" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#181715] text-[#faf9f5] flex items-center justify-center text-sm font-semibold border border-[#252320]">
                    {userInitials}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#141413] truncate tracking-tight">
                    {user?.name || 'Sanin Abbas'}
                  </p>
                  <p className="text-[10px] font-mono text-[#8e8b82] truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard/account"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <UserIcon size={15} className="text-[#8e8b82]" />
                <span>Account Profile</span>
              </Link>

              <Link
                to="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <Settings size={15} className="text-[#8e8b82]" />
                <span>Settings & Data Sources</span>
              </Link>

              <Link
                to="/dashboard/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <CreditCard size={15} className="text-[#8e8b82]" />
                <span>Billing & Plan</span>
              </Link>

              <Link
                to="/dashboard/connections"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <Link2 size={15} className="text-[#8e8b82]" />
                <span>Integrations & Connections</span>
              </Link>

              <Link
                to="/dashboard/changes"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <Activity size={15} className="text-[#8e8b82]" />
                <span>Activity & Notifications</span>
              </Link>

              <div className="border-t border-[#e6dfd8] my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut size={15} className="text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
