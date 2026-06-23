'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { collectLoginLocation } from '@/lib/login-location';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token')?.trim() : null;

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.me();
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const location = await collectLoginLocation().catch(() => ({}));
    const data = await api.login(email, password, location);
    if (!data?.token) {
      throw new Error('Login failed — no token received');
    }
    localStorage.setItem('token', data.token.trim());
    try {
      const me = await api.me();
      setUser(me.user);
      return me.user;
    } catch {
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    try {
      const data = await api.me();
      setUser(data.user);
    } catch {
      /* keep current user */
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
