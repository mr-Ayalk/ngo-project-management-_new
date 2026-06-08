'use client';

import { useMemo, useState } from 'react';
import { getReportTypeMeta } from '@/lib/report-types';
import { TYPE_ICONS } from '@/components/ReportsManagement';

function StatusPill({ status, label }) {
  return <span className={`ngo-report-status status-${status}`}>{label}</span>;
}

export default function ReportsApproval({
  reports = [],
  loading,
  onOpenReport,
  onApprove,
  onReject,
}) {
  const [typeFilter, setTypeFilter] = useState('all');

  const pending = useMemo(
    () => reports.filter((r) => ['submitted', 'pending_approval'].includes(r.status)),
    [reports]
  );

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return pending;
    return pending.filter((r) => r.type === typeFilter);
  }, [pending, typeFilter]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading approval queue…</span>
      </div>
    );
  }

  return (
    <div className="ngo-reports-page ngo-reports-approval">
      <div className="page-header page-header-row">
        <div>
          <p className="page-section-label">Reports</p>
          <h1>Reports Approval</h1>
          <p>Review, approve, or return field and program reports before they are published to stakeholders.</p>
        </div>
        <div className="bene-card" style={{ minWidth: '120px', padding: '12px 16px' }}>
          <div className="bene-num">{pending.length}</div>
          <div className="bene-label">Pending Review</div>
        </div>
      </div>

      <div className="ngo-reports-toolbar">
        <div className="ngo-reports-filters">
          <button type="button" className={`ngo-reports-filter${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>All Types</button>
          {['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'incident'].map((t) => (
            <button key={t} type="button" className={`ngo-reports-filter${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>
              {getReportTypeMeta(t).shortLabel}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ngo-reports-empty">
          <div className="ngo-reports-empty-icon approval">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h3>All caught up</h3>
          <p>No reports are waiting for your approval right now.</p>
        </div>
      ) : (
        <div className="ngo-reports-approval-list">
          {filtered.map((report) => (
            <article key={report.id} className="ngo-reports-approval-card">
              <div className="ngo-reports-approval-card-head">
                <span className="ngo-reports-row-icon">{TYPE_ICONS[report.type]}</span>
                <div>
                  <h3>{report.name}</h3>
                  <p>{getReportTypeMeta(report.type).label} · {report.submittedBy?.name || 'Unknown'} · {report.date}</p>
                </div>
                <StatusPill status={report.status} label={report.statusLabel} />
              </div>
              {(report.description || report.content) && (
                <p className="ngo-reports-approval-preview">
                  {(report.content || report.description).slice(0, 220)}
                  {(report.content || report.description).length > 220 ? '…' : ''}
                </p>
              )}
              <div className="ngo-reports-approval-meta">
                <span>Project: {report.project?.name || 'Organization-wide'}</span>
                {report.periodLabel && <span>Period: {report.periodLabel}</span>}
                {report.incidentSeverity && <span>Severity: {report.incidentSeverity}</span>}
              </div>
              <div className="ngo-reports-approval-actions">
                <button type="button" className="btn-secondary" onClick={() => onOpenReport?.(report)}>Review Details</button>
                <button type="button" className="btn-primary" onClick={() => onApprove?.(report)}>Approve</button>
                <button type="button" className="btn-danger-outline" onClick={() => onReject?.(report)}>Return for Revision</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
