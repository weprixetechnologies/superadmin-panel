'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthUser } from '../utils/auth';
import api from '../utils/axiosInstance';
const APP_ROLE = 'SUPERADMIN' as const;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async () => {
    try {
      console.log('Validating session...');
      const res = await api.get('/auth/validate-me');
      const body = res.data;

      if (body.success && body.data?.user?.role === APP_ROLE) {
        setUser(body.data.user);
      } else {
        // Wrong role or bad response — just clear state, redirect handled by router
        setUser(null);
      }
    } catch {
      // validate-me failed (401/network) — just clear state, no cascade logout
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();

    const handleSessionExpired = () => {
      setUser(null);
      window.location.href = '/';
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [validateSession]);

  const login = useCallback((userData: AuthUser) => { setUser(userData); }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ } finally {
      setUser(null);
      window.location.href = '/';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user?.isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
