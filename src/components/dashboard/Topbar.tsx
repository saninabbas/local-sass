import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User as UserIcon, Settings, LogOut, ChevronDown, Globe, FolderKanban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { Link, useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="h-16 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Active Project Breadcrumb */}
        {activeBusiness && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[#8e8b82] font-mono text-[11px] uppercase tracking-wider">Project:</span>
            <Link 
              to="/dashboard/businesses"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#efe9de] border border-[#e6dfd8] text-[#141413] font-serif font-bold hover:border-[#cc785c]/40 transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#cc785c]" />
              <span className="truncate max-w-[200px]">{activeBusiness.name || activeBusiness.website_url.replace(/^https?:\/\//, '')}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] relative transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#cc785c]" />
        </button>

        <div className="h-4 w-[1px] bg-[#e6dfd8] mx-1" />

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#efe9de]/60 transition-colors cursor-pointer"
            aria-expanded={dropdownOpen}
          >
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
            <ChevronDown size={14} className="text-[#8e8b82] hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#e6dfd8] mb-1">
                <p className="text-xs font-serif font-medium text-[#141413] truncate">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[10px] font-mono text-[#8e8b82] truncate">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/dashboard/account"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <UserIcon size={15} className="text-[#8e8b82]" />
                <span>Account Profile</span>
              </Link>

              <Link
                to="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-[#4a4843] hover:text-[#141413] hover:bg-[#efe9de]/60 transition-colors"
              >
                <Settings size={15} className="text-[#8e8b82]" />
                <span>Settings & Data Sources</span>
              </Link>

              <div className="border-t border-[#e6dfd8] my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-sans font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
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
