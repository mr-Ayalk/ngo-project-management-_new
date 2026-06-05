'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardPages from '../components/DashboardPages';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [pendingNav, setPendingNav] = useState(null);

  const loadPins = useCallback(async () => {
    try {
      const pins = await api.pins();
      setPinnedProjects(pins);
    } catch {
      setPinnedProjects([]);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadPins();
  }, [user, loadPins]);

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    if (query.trim()) {
      setCurrentPage('projects');
    }
  };

  const handleOpenPinnedProject = (pin) => {
    setCurrentPage('projects');
    setPendingNav({ projectId: pin.projectId, tab: pin.tab || 'overview' });
    setSidebarOpen(false);
  };

  const handleOpenSettings = () => {
    setCurrentPage('settings');
  };

  const handleOpenNotification = (notif) => {
    if (notif.projectId) {
      setCurrentPage('projects');
      setPendingNav({
        projectId: notif.projectId,
        tab: 'tasks',
        taskId: notif.taskId,
      });
    } else {
      setCurrentPage('messages');
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
        pinnedProjects={pinnedProjects}
        onOpenProject={handleOpenPinnedProject}
      />
      <div className="main-container">
        <Topbar
          onMenuToggle={() => setSidebarOpen((s) => !s)}
          onSearch={handleGlobalSearch}
          searchQuery={globalSearch}
          onOpenSettings={handleOpenSettings}
          onOpenNotification={handleOpenNotification}
        />
        <DashboardPages
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          globalSearch={globalSearch}
          pinnedProjects={pinnedProjects}
          onPinsChange={loadPins}
          pendingNav={pendingNav}
          onPendingNavHandled={() => setPendingNav(null)}
        />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
