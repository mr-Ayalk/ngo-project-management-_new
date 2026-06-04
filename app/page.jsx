'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardPages from '../components/DashboardPages';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    if (query.trim()) {
      setCurrentPage('projects');
    }
  };

  if (loading) {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentPage={currentPage}
        onPageChange={(p) => { setCurrentPage(p); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-container">
        <Topbar onMenuToggle={() => setSidebarOpen((s) => !s)} onSearch={handleGlobalSearch} />
        <DashboardPages
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          globalSearch={globalSearch}
          onGlobalSearchClear={() => setGlobalSearch('')}
        />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
