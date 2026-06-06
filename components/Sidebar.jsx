'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import logo1 from '@/app/assets/logo1.png';

const Sidebar = ({
  currentPage,
  onPageChange,
  isOpen,
  onClose,
  pinnedProjects = [],
  onOpenProject,
  myTaskCount = 0,
  isAdmin = false,
}) => {
  const { logout } = useAuth();
  const [expandedPins, setExpandedPins] = useState({});

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'budget', label: 'Budget', icon: 'budget' },
  ];

  const manageNav = [
    { id: 'reports', label: 'Reports', icon: 'reports' },
    { id: 'partners', label: 'Partners', icon: 'partners' },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: 'beneficiaries' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
    { id: 'logistics', label: 'Logistics', icon: 'logistics' },
    { id: 'messages', label: 'Inbox', icon: 'messages' },
  ];

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
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
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

  return (
    <aside className={`sidebar${isOpen ? ' open mobile-drawer' : ''}`}>
      <div className="sidebar-logo">
        <Image src={logo1} alt="Engage Now Africa" className="sidebar-logo-img" priority />
        <span className="sidebar-logo-text">Engage Now Africa</span>
      </div>
      {isOpen && (
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">✕</button>
      )}

      <nav className="nav">
        <div className="nav-section-label">Overview</div>
        {mainNav.map(renderNavItem)}

        <div className="nav-section-label">Manage</div>
        {manageNav.map(renderNavItem)}
      </nav>

      {pinnedProjects.length > 0 && (
        <div className="sidebar-pinned">
          <div className="sidebar-pinned-label">Pinned Projects</div>
          {pinnedProjects.map((pin) => (
            <div key={pin.projectId} className="sidebar-pinned-item">
              <button
                type="button"
                className="sidebar-pinned-toggle"
                onClick={() => setExpandedPins((prev) => ({ ...prev, [pin.projectId]: !prev[pin.projectId] }))}
                aria-label="Expand project"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="12" height="12"
                  style={{ transform: expandedPins[pin.projectId] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <span className="sidebar-pinned-dot" />
              <button
                type="button"
                className="sidebar-pinned-name"
                onClick={() => onOpenProject?.(pin)}
                title={pin.name}
              >
                {pin.name.length > 22 ? `${pin.name.slice(0, 22)}…` : pin.name}
              </button>
              {expandedPins[pin.projectId] && (
                <div className="sidebar-pinned-sub">
                  <button type="button" onClick={() => onOpenProject?.({ ...pin, tab: 'tasks' })}>Tasks</button>
                  <button type="button" onClick={() => onOpenProject?.({ ...pin, tab: 'overview' })}>Overview</button>
                  <button type="button" onClick={() => onOpenProject?.({ ...pin, tab: 'budget' })}>Budget</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <div
          className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onPageChange('settings')}
          role="button"
          tabIndex={0}
        >
          {renderIcon('settings')}
          Settings
        </div>
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => {
            onClose?.();
            logout();
          }}
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
