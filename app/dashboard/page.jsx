'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import DashboardPages from '@/components/DashboardPages';
import api from '@/lib/api';

const SEARCHABLE_PAGES = ['projects', 'beneficiaries'];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topbarSearch, setTopbarSearch] = useState('');
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [pendingNav, setPendingNav] = useState(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const loadPins = useCallback(async () => {
    try {
      const pins = await api.pins();
      setPinnedProjects(pins);
    } catch {
      setPinnedProjects([]);
    }
  }, []);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const data = await api.reportsPendingCount();
      setPendingApprovalCount(data.count || 0);
    } catch {
      setPendingApprovalCount(0);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadPins();
      loadPendingApprovals();
    }
  }, [user, loadPins, loadPendingApprovals]);

  const handlePageChange = (page) => {
    setTopbarSearch('');
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleTopbarSearch = (query) => {
    setTopbarSearch(query);
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
    if (notif.linkType === 'reports_approval' || notif.type === 'report_approval') {
      setCurrentPage('reports-approval');
      return;
    }
    if (notif.projectId) {
      setCurrentPage('messages');
      setPendingNav({
        projectId: notif.projectId,
        openMessages: true,
      });
    } else {
      setCurrentPage('messages');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="login-spinner" />
        <p className="app-loading-text">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) return null;

  const searchEnabled = SEARCHABLE_PAGES.includes(currentPage);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pinnedProjects={pinnedProjects}
        onOpenProject={handleOpenPinnedProject}
        pendingApprovalCount={pendingApprovalCount}
      />
      <div className="main-container">
        <Topbar
          onMenuToggle={() => setSidebarOpen((s) => !s)}
          onSearch={handleTopbarSearch}
          searchQuery={searchEnabled ? topbarSearch : ''}
          searchEnabled={searchEnabled}
          searchPlaceholder={
            currentPage === 'beneficiaries'
              ? 'Search beneficiaries...'
              : currentPage === 'projects'
                ? 'Search projects...'
                : 'Search...'
          }
          onOpenSettings={handleOpenSettings}
          onOpenNotification={handleOpenNotification}
        />
        <DashboardPages
          currentPage={currentPage}
          onNavigate={handlePageChange}
          topbarSearch={topbarSearch}
          onTopbarSearchSync={setTopbarSearch}
          pinnedProjects={pinnedProjects}
          onPinsChange={loadPins}
          pendingNav={pendingNav}
          onPendingNavHandled={() => setPendingNav(null)}
          onReportsChange={loadPendingApprovals}
        />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
