import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, signup, logout } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<any>;
  signup: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async (data: any) => {
    if (data && data.id && data.email) {
      setUser(data);
      return data;
    }
    const authData = await login(data);
    if (authData && !authData.require2FA) {
      setUser(authData);
    }
    return authData;
  };

  const handleSignup = async (data: any) => {
    const res = await signup(data);
    if (res && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login: handleLogin, signup: handleSignup, logout: handleLogout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
