'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LoginPage from '@/components/LoginPage';

export default function LoginRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('login-page-active');
    return () => document.body.classList.remove('login-page-active');
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
      </div>
    );
  }

  if (user) return null;

  return <LoginPage />;
}
