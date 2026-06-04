'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';

const Topbar = ({ onMenuToggle, onSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const roleLabel = user?.role
    ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <form className="search-wrap" onSubmit={handleSubmit}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div className="topbar-right">
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          )}
        </button>
        <button className="notif-btn" type="button" onClick={() => alert('No new notifications')} aria-label="Notifications">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notif-dot"></span>
        </button>
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
