'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { canManageUsers } from '@/lib/roles';
import { buildSidebarItems, NAV_CATEGORIES } from '@/lib/nav-config';

const ICONS = {
  dashboard: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
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
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  me: (
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
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
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
  settings: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
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

const Sidebar = ({
  currentPage,
  onPageChange,
  isOpen,
  onClose,
  activeCategory = 'home',
  pinnedProjects = [],
  onOpenProject,
  pendingApprovalCount = 0,
}) => {
  const { logout, user } = useAuth();
  const [menuQuery, setMenuQuery] = useState('');

  const categoryLabel = NAV_CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Menu';

  const items = useMemo(() => {
    const groups = buildSidebarItems(user, { canManageUsers: canManageUsers(user) });
    const categoryItems = groups.all.filter((item) => item.category === activeCategory);
    const q = menuQuery.trim().toLowerCase();
    if (!q) return categoryItems;
    return groups.all.filter((item) => item.label.toLowerCase().includes(q));
  }, [user, activeCategory, menuQuery]);

  const renderItem = (item) => (
    <button
      key={item.id}
      type="button"
      className={`shell-nav-item${currentPage === item.id ? ' active' : ''}`}
      onClick={() => onPageChange(item.id)}
    >
      {ICONS[item.icon]}
      {item.label}
      {item.id === 'reports-approval' && pendingApprovalCount > 0 && (
        <span className="shell-nav-badge">{pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}</span>
      )}
    </button>
  );

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

      <div className="shell-sidebar-body">
        <div className="shell-nav-section">
          <div className="shell-nav-section-label">{menuQuery ? 'Results' : categoryLabel}</div>
          {items.length ? items.map(renderItem) : (
            <p style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>No matching items</p>
          )}
        </div>

        {pinnedProjects.length > 0 && !menuQuery && (
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
      </div>

      <div className="shell-sidebar-footer">
        <button
          type="button"
          className={`shell-footer-btn${currentPage === 'help' ? ' active' : ''}`}
          onClick={() => onPageChange('help')}
        >
          {ICONS.help}
          Help & Guide
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
