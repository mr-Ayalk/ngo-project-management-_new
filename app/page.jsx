'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LandingPage from '@/components/LandingPage';
import './landing.css';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('landing-page');
    document.documentElement.classList.add('landing-page');
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('landing-page');
    };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#1273de] rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return <LandingPage />;
}
