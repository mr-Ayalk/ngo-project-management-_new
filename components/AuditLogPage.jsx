'use client';

import { useMemo, useState } from 'react';

const ACTION_LABELS = {
  'user.create': 'User Created',
  'user.update': 'User Updated',
  'user.login': 'User Login',
  'organization.update': 'Organization Updated',
  'profile.update': 'Profile Updated',
  'profile.avatar': 'Avatar Updated',
  'logistics.create': 'Shipment Created',
  'logistics.update': 'Shipment Updated',
  'logistics.delete': 'Shipment Deleted',
};

function formatAction(action) {
  return ACTION_LABELS[action] || action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDetails(details) {
  if (!details) return '—';
  if (typeof details === 'string') return details;
  const parts = Object.entries(details)
    .filter(([, v]) => v != null && v !== '')
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`);
  return parts.length ? parts.join(' · ') : '—';
}

export default function AuditLogPage({ logs = [], loading, onRefresh }) {
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [search, setSearch] = useState('');

  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [logs]);

  const resources = useMemo(() => {
    const set = new Set(logs.map((l) => l.resource).filter(Boolean));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    let list = logs;
    if (actionFilter !== 'all') list = list.filter((l) => l.action === actionFilter);
    if (resourceFilter !== 'all') list = list.filter((l) => l.resource === resourceFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) => l.userName?.toLowerCase().includes(q)
          || l.userEmail?.toLowerCase().includes(q)
          || l.action?.toLowerCase().includes(q)
          || l.resource?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, actionFilter, resourceFilter, search]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = logs.filter((l) => new Date(l.createdAt) >= today).length;
    const users = new Set(logs.map((l) => l.userId)).size;
    return { total: logs.length, today: todayCount, actors: users };
  }, [logs]);

  const exportCsv = () => {
    const header = ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'IP Address', 'Details'];
    const rows = filtered.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.userName,
      l.userEmail,
      l.action,
      l.resource,
      l.ipAddress || '',
      formatDetails(l.details),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading audit log…</span>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="page-header page-header-row">
        <div>
          <p className="page-section-label">Compliance &amp; Security</p>
          <h1>Audit Log</h1>
          <p>Immutable record of administrative actions for donor compliance, accountability, and security reviews.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-secondary" onClick={onRefresh}>Refresh</button>
          <button type="button" className="btn-primary" onClick={exportCsv} disabled={!filtered.length}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bene-stats">
        <div className="bene-card">
          <div className="bene-num">{stats.total}</div>
          <div className="bene-label">Total Events</div>
        </div>
        <div className="bene-card">
          <div className="bene-num">{stats.today}</div>
          <div className="bene-label">Today</div>
        </div>
        <div className="bene-card">
          <div className="bene-num">{stats.actors}</div>
          <div className="bene-label">Active Users</div>
        </div>
        <div className="bene-card">
          <div className="bene-num">{filtered.length}</div>
          <div className="bene-label">Showing</div>
        </div>
      </div>

      <div className="audit-toolbar">
        <input
          className="search-inline"
          placeholder="Search by user, action, or resource…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{formatAction(a)}</option>)}
        </select>
        <select className="filter-select" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
          <option value="all">All Resources</option>
          {resources.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="audit-table-wrap">
        <div className="audit-log-table audit-log-table-page">
          <div className="audit-log-row audit-log-head">
            <span>Timestamp</span>
            <span>User</span>
            <span>Action</span>
            <span>Resource</span>
            <span>Details</span>
            <span>IP</span>
          </div>
          {filtered.map((log) => (
            <div key={log.id} className="audit-log-row">
              <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>
              <span>
                <strong className="audit-user-name">{log.userName}</strong>
                <small className="audit-user-email">{log.userEmail}</small>
              </span>
              <span className="audit-action">{formatAction(log.action)}</span>
              <span className="audit-resource">{log.resource}</span>
              <span className="audit-details">{formatDetails(log.details)}</span>
              <span className="audit-ip">{log.ipAddress || '—'}</span>
            </div>
          ))}
        </div>
        {!filtered.length && (
          <div className="audit-empty">No audit events match your filters.</div>
        )}
      </div>

      <p className="audit-footer-note">
        Audit entries are retained for organizational accountability. Export regularly for donor audits and ISO compliance reviews.
      </p>
    </div>
  );
}
