'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import UserAvatar from '@/components/UserAvatar';
import api from '@/lib/api';
import { getRoleLabel } from '@/lib/roles';

const Topbar = ({
  onMenuToggle,
  onSearch,
  searchQuery = '',
  searchEnabled = true,
  searchPlaceholder = 'Search projects...',
  onOpenSettings,
  onOpenNotification,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchQuery);
  const [notifications, setNotifications] = useState({ unreadCount: 0, notifications: [] });
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, searchEnabled]);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications();
      setNotifications(data);
    } catch {
      setNotifications({ unreadCount: 0, notifications: [] });
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const roleLabel = getRoleLabel(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleNotifClick = async (notif) => {
    await api.markNotificationRead(notif.id);
    setShowNotifs(false);
    loadNotifications();
    onOpenNotification?.(notif);
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifications();
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
          placeholder={searchEnabled ? searchPlaceholder : 'Search not available on this page'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (searchEnabled) onSearch?.(e.target.value);
          }}
          disabled={!searchEnabled}
        />
      </form>
      <div className="topbar-right">
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          )}
        </button>

        <div className="notif-wrap" ref={notifRef}>
          <button
            className="notif-btn"
            type="button"
            onClick={() => { setShowNotifs((s) => !s); setShowProfile(false); }}
            aria-label="Notifications"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {notifications.unreadCount > 0 && (
              <span className="notif-dot active">{notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}</span>
            )}
          </button>
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {notifications.unreadCount > 0 && (
                  <button type="button" onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-dropdown-list">
                {notifications.notifications?.length ? notifications.notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`notif-item${!n.isRead ? ' unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </button>
                )) : (
                  <p className="notif-empty">No notifications yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="user-chip user-chip-btn"
            onClick={() => { setShowProfile((s) => !s); setShowNotifs(false); }}
          >
            <UserAvatar user={user} />
            <div>
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <UserAvatar user={user} size="lg" />
                <div>
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role">{user?.email}</div>
                </div>
              </div>
              <button type="button" className="profile-dropdown-item" onClick={() => { setShowProfile(false); onOpenSettings?.(); }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
