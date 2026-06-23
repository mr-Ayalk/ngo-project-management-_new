'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import DashboardPages from '@/components/DashboardPages';
import api from '@/lib/api';
import { getCategoryForPage, NAV_CATEGORIES } from '@/lib/nav-config';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageHistory, setPageHistory] = useState(['dashboard']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [pendingNav, setPendingNav] = useState(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const activeCategory = useMemo(() => getCategoryForPage(currentPage), [currentPage]);

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

  const handlePageChange = useCallback((page) => {
    setSidebarOpen(false);
    setPageHistory((prev) => {
      if (prev[prev.length - 1] === page) {
        setCurrentPage(page);
        return prev;
      }
      setCurrentPage(page);
      return [...prev, page];
    });
  }, []);

  const handleBack = useCallback(() => {
    setPageHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setCurrentPage(next[next.length - 1]);
      return next;
    });
    setSidebarOpen(false);
  }, []);

  const canGoBack = pageHistory.length > 1;

  const handleCategoryChange = (categoryId) => {
    const cat = NAV_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) handlePageChange(cat.defaultPage);
  };

  const handleOpenPinnedProject = (pin) => {
    handlePageChange('projects');
    setPendingNav({ projectId: pin.projectId, tab: pin.tab || 'overview' });
  };

  const handleOpenSettings = () => {
    handlePageChange('settings');
  };

  const handleOpenNotification = (notif) => {
    if (notif.linkType === 'reports_approval' || notif.type === 'report_approval') {
      handlePageChange('reports-approval');
      return;
    }
    if (notif.projectId) {
      handlePageChange('messages');
      setPendingNav({
        projectId: notif.projectId,
        openMessages: true,
      });
    } else {
      handlePageChange('messages');
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

  return (
    <div className="app-frame">
      <Topbar
        onMenuToggle={() => setSidebarOpen((s) => !s)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onOpenSettings={handleOpenSettings}
        onOpenNotification={handleOpenNotification}
      />
      <div className="app-body">
        <Sidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          pinnedProjects={pinnedProjects}
          onOpenProject={handleOpenPinnedProject}
          pendingApprovalCount={pendingApprovalCount}
        />
        <div className="main-container">
          <DashboardPages
            currentPage={currentPage}
            onNavigate={handlePageChange}
            onBack={handleBack}
            canGoBack={canGoBack}
            pinnedProjects={pinnedProjects}
            onPinsChange={loadPins}
            pendingNav={pendingNav}
            onPendingNavHandled={() => setPendingNav(null)}
            onReportsChange={loadPendingApprovals}
          />
        </div>
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
