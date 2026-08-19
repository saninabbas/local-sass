import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationItem } from '../types';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from './BusinessContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const activeBusinessIdRef = useRef<string | undefined>(activeBusiness?.id);
  activeBusinessIdRef.current = activeBusiness?.id;

  const loadNotifications = useCallback(async (isBackground = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!isBackground) {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getNotifications(activeBusinessIdRef.current, 30);
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(typeof res.unreadCount === 'number' ? res.unreadCount : 0);
      }
    } catch (err: any) {
      console.warn("Failed to load notifications:", err);
      if (!isBackground) {
        setError(err.message || 'Unable to load notifications');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [user]);

  // Initial load & when user or active business changes
  useEffect(() => {
    loadNotifications(false);
  }, [loadNotifications, activeBusiness?.id]);

  // Lightweight 45s polling loop when tab is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        loadNotifications(true);
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotifications(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, loadNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic local state update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      // Re-sync on failure
      loadNotifications(true);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic local state update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead(activeBusinessIdRef.current);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      loadNotifications(true);
    }
  };

  const deleteItem = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    const wasUnread = target ? !target.read : false;

    // Optimistic remove
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      loadNotifications(true);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications: () => loadNotifications(false),
        markAsRead,
        markAllAsRead,
        deleteItem
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
