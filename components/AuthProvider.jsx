'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
