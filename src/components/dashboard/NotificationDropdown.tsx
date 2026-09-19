import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  Link2, 
  CheckCircle2, 
  Plug, 
  CreditCard, 
  AlertTriangle, 
  X, 
  Trash2, 
  Check, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem, NotificationType, NotificationSeverity } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function getNotificationIcon(type: NotificationType, severity: NotificationSeverity) {
  const iconSize = 16;
  switch (type) {
    case 'ranking':
      return <TrendingUp size={iconSize} className={severity === 'warning' || severity === 'error' ? 'text-amber-600' : 'text-emerald-600'} />;
    case 'review':
      return <Star size={iconSize} className="text-amber-500" />;
    case 'audit':
      return <ShieldCheck size={iconSize} className={severity === 'error' ? 'text-red-600' : 'text-[#cc785c]'} />;
    case 'authority':
      return <Link2 size={iconSize} className="text-indigo-600" />;
    case 'execution':
      return <CheckCircle2 size={iconSize} className="text-emerald-600" />;
    case 'connection':
      return <Plug size={iconSize} className="text-blue-600" />;
    case 'billing':
      return <CreditCard size={iconSize} className="text-amber-600" />;
    default:
      return <Bell size={iconSize} className="text-[#8e8b82]" />;
  }
}

function getSeverityBadge(severity: NotificationSeverity) {
  switch (severity) {
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, loading, error, refreshNotifications, markAsRead, markAllAsRead, deleteItem } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape or outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markAsRead(item.id);
    }
    if (item.action_url) {
      onClose();
      navigate(item.action_url);
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications panel"
      className="absolute right-0 top-12 mt-2 w-[calc(100vw-32px)] sm:w-[400px] max-w-[420px] bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-serif font-semibold text-[#141413]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#cc785c] text-white">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[11px] font-mono text-[#cc785c] hover:underline flex items-center gap-1 cursor-pointer transition-colors font-medium"
              title="Mark all notifications as read"
            >
              <Check size={12} />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413] hover:bg-[#efe9de] transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body / List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-[#e6dfd8]/60 font-sans">
        {loading && notifications.length === 0 ? (
          // Skeleton loading state
          <div className="p-4 space-y-3.5">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#efe9de] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#efe9de] rounded w-3/4" />
                  <div className="h-2.5 bg-[#efe9de] rounded w-full" />
                  <div className="h-2 bg-[#efe9de] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />
            <div>
              <p className="text-xs font-serif font-medium text-[#141413]">
                Unable to load notifications
              </p>
              <p className="text-[11px] text-[#6c6a64] mt-0.5">
                Please check your connection and try again.
              </p>
            </div>
            <button
              onClick={() => refreshNotifications()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141413] text-[#faf9f5] text-xs font-medium hover:bg-[#252320] transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="py-12 px-6 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-[#efe9de] flex items-center justify-center mx-auto text-[#8e8b82]">
              <Bell size={22} className="opacity-70" />
            </div>
            <h4 className="text-sm font-serif font-medium text-[#141413]">
              All caught up
            </h4>
            <p className="text-xs text-[#6c6a64] max-w-[220px] mx-auto leading-relaxed">
              You don't have any new notifications right now.
            </p>
          </div>
        ) : (
          // Notification item list
          notifications.map(item => {
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                  isUnread ? 'bg-[#efe9de]/40 hover:bg-[#efe9de]/70' : 'bg-[#faf9f5] hover:bg-[#efe9de]/30'
                }`}
              >
                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUnread ? 'bg-white border-[#e6dfd8]' : 'bg-[#efe9de]/50 border-transparent'
                }`}>
                  {getNotificationIcon(item.type, item.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c] shrink-0" />
                    )}
                    <h4 className={`text-xs truncate ${isUnread ? 'font-serif font-bold text-[#141413]' : 'font-sans font-medium text-[#4a4843]'}`}>
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#6c6a64] leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-[#8e8b82]">
                    <span>{formatRelativeTime(item.created_at)}</span>
                    {item.action_url && (
                      <span className="flex items-center gap-0.5 text-[#cc785c] font-sans font-medium group-hover:underline">
                        <span>View</span>
                        <ExternalLink size={9} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="absolute right-2.5 top-3 p-1 rounded text-[#8e8b82] hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 bg-[#efe9de]/30 border-t border-[#e6dfd8] flex items-center justify-between text-[11px] font-mono text-[#8e8b82]">
          <span>Scorankio Telemetry Stream</span>
          <button
            onClick={() => refreshNotifications()}
            className="hover:text-[#141413] flex items-center gap-1 cursor-pointer transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw size={11} className={loading ? "animate-spin text-[#cc785c]" : ""} />
            <span>Sync</span>
          </button>
        </div>
      )}
    </div>
  );
}
