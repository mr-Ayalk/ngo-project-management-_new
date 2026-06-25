'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { canManageUsers } from '@/lib/roles';
import { REPORT_TYPES } from '@/lib/report-types';

const Sidebar = ({
  currentPage,
  onPageChange,
  isOpen,
  onClose,
  pinnedProjects = [],
  onOpenProject,
  pendingApprovalCount = 0,
}) => {
  const { logout, user } = useAuth();
  const [reportsExpanded, setReportsExpanded] = useState(true);
  const [menuQuery, setMenuQuery] = useState('');

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'budget', label: 'Budget', icon: 'budget' },
    ...(canManageUsers(user) ? [{ id: 'staff-management', label: 'Staff Management', icon: 'staff' }] : []),
    { id: 'units', label: 'Units', icon: 'units' },
    { id: 'indicators', label: 'Indicators', icon: 'indicators' },
  ];

  const manageNav = [
    { id: 'beneficiaries', label: 'Beneficiaries', icon: 'beneficiaries' },
    { id: 'partners', label: 'Partners', icon: 'partners' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
    { id: 'logistics', label: 'Logistics', icon: 'logistics' },
    { id: 'messages', label: 'Inbox', icon: 'messages' },
  ];

  const isReportPage = (id) => id === currentPage || (id === 'reports-overview' && currentPage === 'reports');
  const reportGroupActive = currentPage.startsWith('reports-') || currentPage === 'reports';

  const matchesQuery = (label) => !menuQuery.trim() || label.toLowerCase().includes(menuQuery.trim().toLowerCase());

  const renderIcon = (type) => {
    const icons = {
      dashboard: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      projects: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      ),
      calendar: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      budget: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      staff: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      units: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      indicators: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      reports: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      approval: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
        </svg>
      ),
      partners: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      beneficiaries: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      documents: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      ),
      logistics: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 5v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      messages: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      help: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    };
    return icons[type] || null;
  };

  const renderNavItem = (item) => {
    if (!matchesQuery(item.label)) return null;
    return (
      <button
        key={item.id}
        type="button"
        className={`shell-nav-item${currentPage === item.id ? ' active' : ''}`}
        onClick={() => onPageChange(item.id)}
      >
        {renderIcon(item.icon)}
        <span>{item.label}</span>
        {item.id === 'reports-approval' && pendingApprovalCount > 0 && (
          <span className="shell-nav-badge">{pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}</span>
        )}
      </button>
    );
  };

  return (
    <aside className={`shell-sidebar${isOpen ? ' open' : ''}`}>
      <div className="shell-sidebar-search">
        <div className="shell-sidebar-search-wrap">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search menu..."
            value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
            aria-label="Search menu"
          />
        </div>
      </div>

      {isOpen && (
        <button type="button" className="mobile-close" onClick={onClose} aria-label="Close menu">✕</button>
      )}

      <div className="sidebar-body">
        <nav className="nav">
          <div className="nav-section-label">Menu</div>
          {mainNav.map(renderNavItem)}

          <div className="nav-section-label">Reports</div>
          <div className={`nav-group${reportsExpanded ? ' open' : ''}${reportGroupActive ? ' active-group' : ''}`}>
            <button
              type="button"
              className="nav-group-toggle"
              onClick={() => setReportsExpanded((v) => !v)}
              aria-expanded={reportsExpanded}
            >
              {renderIcon('reports')}
              <span>Report Management</span>
              <svg className="nav-group-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {reportsExpanded && (
              <div className="nav-sub-list">
                <button
                  type="button"
                  className={`nav-sub-item${isReportPage('reports-overview') ? ' active' : ''}`}
                  onClick={() => onPageChange('reports-overview')}
                >
                  Overview &amp; Analytics
                </button>
                <button
                  type="button"
                  className={`nav-sub-item${currentPage === 'reports-approval' ? ' active' : ''}`}
                  onClick={() => onPageChange('reports-approval')}
                >
                  Reports Approval
                  {pendingApprovalCount > 0 && (
                    <span className="shell-nav-badge">{pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}</span>
                  )}
                </button>
                {REPORT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`nav-sub-item${currentPage === `reports-${t.value}` ? ' active' : ''}`}
                    onClick={() => onPageChange(`reports-${t.value}`)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="nav-section-label">Operations</div>
          {manageNav.map(renderNavItem)}

          {pinnedProjects.length > 0 && !menuQuery.trim() && (
            <div className="shell-sidebar-pinned">
              <div className="shell-nav-section-label">Pinned Projects</div>
              {pinnedProjects.map((pin) => (
                <button
                  key={pin.projectId}
                  type="button"
                  className="shell-nav-item"
                  onClick={() => onOpenProject?.(pin)}
                  title={pin.name}
                >
                  <span className="sidebar-pinned-dot" />
                  <span className="sidebar-pinned-name">{pin.name.length > 22 ? `${pin.name.slice(0, 22)}…` : pin.name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>

      <div className="shell-sidebar-footer">
        <button
          type="button"
          className={`shell-footer-btn${currentPage === 'help' ? ' active' : ''}`}
          onClick={() => onPageChange('help')}
        >
          {renderIcon('help')}
          Help &amp; Guide
        </button>
        <button
          type="button"
          className="shell-footer-btn danger"
          onClick={() => { onClose?.(); logout(); }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
