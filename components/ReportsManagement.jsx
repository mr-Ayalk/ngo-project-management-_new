'use client';

import { useMemo, useState } from 'react';
import { getReportTypeMeta } from '@/lib/report-types';

const TYPE_ICONS = {
  daily: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  weekly: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  monthly: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  ),
  quarterly: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  biannual: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  annual: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  incident: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

function StatusPill({ status, label }) {
  return <span className={`ngo-report-status status-${status}`}>{label}</span>;
}

export default function ReportsManagement({
  reportType,
  reports = [],
  loading,
  isManager,
  onCreateReport,
  onOpenReport,
  onDeleteReport,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const meta = getReportTypeMeta(reportType);

  const filtered = useMemo(() => {
    let list = reports;
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q)
          || r.submittedBy?.name?.toLowerCase().includes(q)
          || r.project?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, statusFilter, search]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length,
    approved: reports.filter((r) => r.status === 'approved').length,
    draft: reports.filter((r) => r.status === 'draft').length,
  }), [reports]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading reports…</span>
      </div>
    );
  }

  return (
    <div className="ngo-reports-page">
      <div className="page-header page-header-row">
        <div>
          <p className="page-section-label">Report Management</p>
          <h1>{meta.label}</h1>
          <p>{meta.cadence}</p>
        </div>
        <button type="button" className="btn-primary" onClick={onCreateReport}>
          + New {meta.shortLabel} Report
        </button>
      </div>

      <div className="bene-stats">
        <div className="bene-card"><div className="bene-num">{stats.total}</div><div className="bene-label">Total</div></div>
        <div className="bene-card"><div className="bene-num">{stats.draft}</div><div className="bene-label">Drafts</div></div>
        <div className="bene-card"><div className="bene-num">{stats.pending}</div><div className="bene-label">Pending</div></div>
        <div className="bene-card"><div className="bene-num">{stats.approved}</div><div className="bene-label">Approved</div></div>
      </div>

      <div className="ngo-reports-toolbar">
        <div className="ngo-reports-filters">
          {[
            { id: 'all', label: 'All' },
            { id: 'draft', label: 'Drafts' },
            { id: 'pending_approval', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'revision_requested', label: 'Revision' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ngo-reports-filter${statusFilter === f.id ? ' active' : ''}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ngo-reports-search">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ngo-reports-empty">
          <div className="ngo-reports-empty-icon">{TYPE_ICONS[reportType]}</div>
          <h3>No {meta.shortLabel.toLowerCase()} reports yet</h3>
          <p>Create structured {meta.shortLabel.toLowerCase()} reports for donor accountability, M&amp;E, and field operations.</p>
          <button type="button" className="btn-primary" onClick={onCreateReport}>+ Create Report</button>
        </div>
      ) : (
        <div className="ngo-reports-table">
          <div className="ngo-reports-table-head">
            <span>Report Title</span>
            <span>Project</span>
            <span>Submitted By</span>
            <span>Period / Date</span>
            <span>Status</span>
            <span />
          </div>
          {filtered.map((report) => (
            <div key={report.id} className="ngo-reports-table-row" onClick={() => onOpenReport?.(report)}>
              <span className="ngo-reports-title-cell">
                <span className="ngo-reports-row-icon">{TYPE_ICONS[reportType]}</span>
                <span>
                  <strong>{report.name}</strong>
                  {report.fileName && <small>Attachment: {report.fileName}</small>}
                </span>
              </span>
              <span>{report.project?.name || 'Organization-wide'}</span>
              <span>{report.submittedBy?.name || '—'}</span>
              <span>{report.periodLabel || report.date}</span>
              <span><StatusPill status={report.status} label={report.statusLabel} /></span>
              <span className="ngo-reports-row-actions">
                {isManager && (
                  <button
                    type="button"
                    className="ngo-reports-delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteReport?.(report.id); }}
                  >
                    Delete
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { TYPE_ICONS };
