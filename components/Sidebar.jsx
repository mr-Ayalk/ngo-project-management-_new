'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { REPORT_TYPES } from '@/lib/report-types';
import { CONFIG_PAGES } from '@/lib/config-pages';
import { PLANNING_PAGES } from '@/lib/planning-pages';
import logo1 from '@/app/assets/logo1.png';

const Sidebar = ({
  currentPage,
  onPageChange,
  isOpen,
  onClose,
  pinnedProjects = [],
  onOpenProject,
  myTaskCount = 0,
  pendingApprovalCount = 0,
}) => {
  const { logout, user } = useAuth();
  const [reportsExpanded, setReportsExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [planningExpanded, setPlanningExpanded] = useState(true);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'budget', label: 'Budget', icon: 'budget' },
  ];

  const manageNav = [
    { id: 'beneficiaries', label: 'Beneficiaries', icon: 'beneficiaries' },
    { id: 'partners', label: 'Partners', icon: 'partners' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
    { id: 'logistics', label: 'Logistics', icon: 'logistics' },
  ];

  const isAdmin = user?.role === 'admin';

  const isReportPage = (id) => id === currentPage || (id === 'reports-overview' && currentPage === 'reports');

  const renderIcon = (type) => {
    const icons = {
      dashboard: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
      projects: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
          <path d="M16 3v4M8 3v4M3 11h18"/>
        </svg>
      ),
      calendar: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      budget: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      reports: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      approval: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      partners: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      beneficiaries: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      documents: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      ),
      logistics: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" rx="1"/>
          <path d="M16 8h4l3 5v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      messages: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
      settings: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    };
    return icons[type] || null;
  };

  const renderNavItem = (item) => (
    <div
      key={item.id}
      className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
      onClick={() => onPageChange(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPageChange(item.id)}
    >
      {renderIcon(item.icon)}
      {item.label}
      {item.id === 'projects' && myTaskCount > 0 && (
        <span className="nav-badge">{myTaskCount > 99 ? '99+' : myTaskCount}</span>
      )}
    </div>
  );

  const reportGroupActive = currentPage.startsWith('reports-') || currentPage === 'reports';
  const configGroupActive = currentPage.startsWith('config-');
  const planningGroupActive = currentPage === 'planning' || currentPage.startsWith('planning-');

  const configSubIcon = (pageId) => {
    const icons = {
      'config-units': '◫',
      'config-indicators': '◎',
      'config-locations': '⌖',
      'config-reporter-approver': '⇄',
      'config-user-woreda': '⊞',
      'config-landing': '⌂',
      'config-dashboard': '▦',
      'config-colors': '◑',
      'config-datetime': '⏲',
    };
    return icons[pageId] || '•';
  };

  return (
    <aside className={`sidebar${isOpen ? ' open mobile-drawer' : ''}`}>
      <div className="sidebar-header">
        <Image src={logo1} alt="Engage Now Africa" className="sidebar-logo-img" priority />
        <span className="sidebar-logo-text">Engage Now Africa</span>
      </div>
      {isOpen && (
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">✕</button>
      )}

      <div className="sidebar-body">
        <nav className="nav">
          <div className="nav-section-label">Menu</div>
          {mainNav.map(renderNavItem)}

          <div className="nav-section-label">Planning Module</div>
          <div className={`nav-group${planningExpanded ? ' open' : ''}${planningGroupActive ? ' active-group' : ''}`}>
            <button
              type="button"
              className="nav-group-toggle"
              onClick={() => setPlanningExpanded((v) => !v)}
              aria-expanded={planningExpanded}
            >
              {renderIcon('projects')}
              <span>Planning Module</span>
              <svg className="nav-group-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {planningExpanded && (
              <div className="nav-sub-list">
                <button
                  type="button"
                  className={`nav-sub-item${currentPage === 'planning' ? ' active' : ''}`}
                  onClick={() => onPageChange('planning')}
                >
                  Overview
                </button>
                {PLANNING_PAGES.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className={`nav-sub-item${currentPage === page.id ? ' active' : ''}`}
                    onClick={() => onPageChange(page.id)}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          <div
            className={`nav-item${currentPage === 'reports-approval' ? ' active' : ''}`}
            onClick={() => onPageChange('reports-approval')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPageChange('reports-approval')}
          >
            {renderIcon('approval')}
            Reports Approval
            {pendingApprovalCount > 0 && (
              <span className="nav-badge">{pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}</span>
            )}
          </div>

          <div className="nav-section-label">Manage</div>
          {manageNav.map(renderNavItem)}
          <div
            className={`nav-item${currentPage === 'messages' ? ' active' : ''}`}
            onClick={() => onPageChange('messages')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPageChange('messages')}
          >
            {renderIcon('messages')}
            Inbox
          </div>
          {isAdmin && (
            <div
              className={`nav-item${currentPage === 'audit-log' ? ' active' : ''}`}
              onClick={() => onPageChange('audit-log')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onPageChange('audit-log')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Audit Log
            </div>
          )}

          <div className="nav-section-label">M &amp; E</div>
          <div
            className={`nav-item${currentPage === 'config-indicators' ? ' active' : ''}`}
            onClick={() => onPageChange('config-indicators')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPageChange('config-indicators')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            M &amp; E Module
          </div>

          <div className="nav-section-label">Configurations</div>
          <div className={`nav-group${configExpanded ? ' open' : ''}${configGroupActive ? ' active-group' : ''}`}>
            <button
              type="button"
              className="nav-group-toggle"
              onClick={() => setConfigExpanded((v) => !v)}
              aria-expanded={configExpanded}
            >
              {renderIcon('settings')}
              <span>Configurations</span>
              <svg className="nav-group-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {configExpanded && (
              <div className="nav-sub-list config-sub-list">
                {CONFIG_PAGES.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className={`nav-sub-item config-sub-item${currentPage === page.id ? ' active' : ''}`}
                    onClick={() => onPageChange(page.id)}
                  >
                    <span className="config-sub-icon" aria-hidden="true">{configSubIcon(page.id)}</span>
                    {page.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`nav-item${currentPage === 'settings' ? ' active' : ''}`}
            onClick={() => onPageChange('settings')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPageChange('settings')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            User Management
          </div>
        </nav>

        {pinnedProjects.length > 0 && (
          <div className="sidebar-pinned">
            <div className="sidebar-pinned-label">Pinned Projects</div>
            {pinnedProjects.map((pin) => (
              <button
                key={pin.projectId}
                type="button"
                className="sidebar-pinned-row"
                onClick={() => onOpenProject?.(pin)}
                title={pin.name}
              >
                <span className="sidebar-pinned-dot" />
                <span className="sidebar-pinned-name">{pin.name.length > 24 ? `${pin.name.slice(0, 24)}…` : pin.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className={`sidebar-help${currentPage === 'help' ? ' active' : ''}`}
          onClick={() => onPageChange('help')}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Help
        </button>
        <button
          type="button"
          className="sidebar-sign-out"
          onClick={() => {
            onClose?.();
            logout();
          }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
