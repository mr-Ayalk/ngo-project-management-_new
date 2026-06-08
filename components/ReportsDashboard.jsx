'use client';

import { useMemo, useState } from 'react';

function exportBudgetCsv(rows, summary) {
  const header = ['Project Name', 'Budget Allocated', 'Budget Spent', 'Variance', 'Utilization %'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        r.budgetAllocatedRaw,
        r.budgetSpentRaw,
        r.varianceRaw,
        r.utilizationPct,
      ].join(',')
    ),
    '',
    `"Total Summary",${summary.totalBudgetedRaw},${summary.totalSpentRaw},${summary.totalBudgetedRaw - summary.totalSpentRaw},${summary.utilizationPct}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsDashboard({
  data,
  loading,
  isManager,
  onAddManualReport,
  onOpenReport,
  onDeleteReport,
}) {
  const [activeTab, setActiveTab] = useState('budget');
  const [search, setSearch] = useState('');

  const filteredBudget = useMemo(() => {
    if (!data?.budgetVsActuals) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.budgetVsActuals;
    return data.budgetVsActuals.filter((r) => r.name.toLowerCase().includes(q));
  }, [data, search]);

  const filteredImpact = useMemo(() => {
    if (!data?.impactKpis) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.impactKpis;
    return data.impactKpis.filter(
      (r) => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q)
    );
  }, [data, search]);

  if (loading || !data) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading reports dashboard…</span>
      </div>
    );
  }

  const { summary, manualReports = [] } = data;

  return (
    <div className="reports-dashboard">
      <div className="reports-dash-header">
        <div>
          <div className="reports-dash-title-row">
            <span className="reports-dash-icon" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </span>
            <h1>M&amp;E Module</h1>
          </div>
          <p className="reports-dash-subtitle">
            Monitoring and evaluation — budget utilization, impact targets, and strategic performance metrics.
          </p>
        </div>
        <div className="reports-dash-actions">
          <button
            type="button"
            className="btn-secondary reports-export-btn"
            onClick={() => exportBudgetCsv(data.budgetVsActuals, summary)}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export to CSV
          </button>
          <button type="button" className="btn-primary" onClick={onAddManualReport}>
            + Add Manual Report
          </button>
        </div>
      </div>

      <div className="reports-kpi-grid">
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon purple">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div>
            <div className="reports-kpi-label">Total Budgeted</div>
            <div className="reports-kpi-value">{summary.totalBudgeted}</div>
            <div className="reports-kpi-sub">Across {summary.projectCount} projects</div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <div className="reports-kpi-label">Total Spent</div>
            <div className="reports-kpi-value">{summary.totalSpent}</div>
            <div className="reports-kpi-sub">Current expenditures</div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="reports-kpi-label">Overall Utilization</div>
            <div className="reports-kpi-value">{summary.utilizationPct}%</div>
            <div className="reports-kpi-bar">
              <div className="reports-kpi-bar-fill" style={{ width: `${Math.min(summary.utilizationPct, 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon orange">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <div className="reports-kpi-label">Impact Target Progress</div>
            <div className="reports-kpi-value">{summary.kpiProgressPct}%</div>
            <div className="reports-kpi-sub">Across {summary.kpiTargetCount} global targets</div>
          </div>
        </div>
      </div>

      <div className="reports-table-panel">
        <div className="reports-table-toolbar">
          <div className="reports-tabs">
            <button
              type="button"
              className={`reports-tab${activeTab === 'budget' ? ' active' : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              Budget vs Actuals
            </button>
            <button
              type="button"
              className={`reports-tab${activeTab === 'impact' ? ' active' : ''}`}
              onClick={() => setActiveTab('impact')}
            >
              Impact Target
            </button>
            <button
              type="button"
              className={`reports-tab${activeTab === 'manual' ? ' active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              Manual Reports ({manualReports.length})
            </button>
          </div>
          {activeTab !== 'manual' && (
            <div className="reports-table-search">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by project name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {activeTab === 'budget' && (
          <div className="reports-table-wrap">
            <div className="reports-table-head budget">
              <span>Project Name</span>
              <span>Budget Allocated</span>
              <span>Budget Spent</span>
              <span>Variance</span>
              <span>Utilization %</span>
            </div>
            {filteredBudget.length === 0 ? (
              <div className="reports-table-empty">No projects match your search.</div>
            ) : (
              <>
                {filteredBudget.map((row) => (
                  <div key={row.id} className="reports-table-row budget">
                    <span className="reports-project-name">{row.name}</span>
                    <span>{row.budgetAllocated}</span>
                    <span>{row.budgetSpent}</span>
                    <span className={row.varianceRaw >= 0 ? 'variance-pos' : 'variance-neg'}>
                      {formatVariance(row.varianceRaw)}
                    </span>
                    <span className="reports-util-cell">
                      <div className="reports-util-bar">
                        <div
                          className={`reports-util-fill${row.overBudget ? ' over' : ''}`}
                          style={{ width: `${Math.min(row.utilizationPct, 100)}%` }}
                        />
                      </div>
                      <span className={row.overBudget ? 'util-over' : ''}>{row.utilizationPct}%</span>
                    </span>
                  </div>
                ))}
                <div className="reports-table-row budget total">
                  <span className="reports-project-name">Total Summary</span>
                  <span>{summary.totalBudgeted}</span>
                  <span>{summary.totalSpent}</span>
                  <span className={(summary.totalBudgetedRaw - summary.totalSpentRaw) >= 0 ? 'variance-pos' : 'variance-neg'}>
                    {formatVariance(summary.totalBudgetedRaw - summary.totalSpentRaw)}
                  </span>
                  <span>{summary.utilizationPct}%</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="reports-table-wrap">
            <div className="reports-table-head impact">
              <span>Project / Program</span>
              <span>Region</span>
              <span>Progress</span>
              <span>Target</span>
              <span>Beneficiaries</span>
              <span>Status</span>
            </div>
            {filteredImpact.length === 0 ? (
              <div className="reports-table-empty">No programs match your search.</div>
            ) : (
              filteredImpact.map((row) => (
                <div key={row.id} className="reports-table-row impact">
                  <span className="reports-project-name">{row.name}</span>
                  <span>{row.region}</span>
                  <span className="reports-util-cell">
                    <div className="reports-util-bar">
                      <div className="reports-util-fill" style={{ width: `${row.progress}%` }} />
                    </div>
                    <span>{row.progress}%</span>
                  </span>
                  <span>{row.target != null ? `${row.target}%` : '—'}</span>
                  <span>{row.beneficiaries.toLocaleString()}</span>
                  <span>
                    <span className={`reports-status-pill status-${row.status}`}>{row.statusLabel}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="reports-manual-section">
            {manualReports.length === 0 ? (
              <div className="reports-table-empty">
                <p>No manual reports yet.</p>
                <button type="button" className="btn-primary" onClick={onAddManualReport}>
                  + Add Manual Report
                </button>
              </div>
            ) : (
              <div className="reports-manual-grid">
                {manualReports.map((report) => (
                  <article
                    key={report.id}
                    className="reports-manual-card"
                    onClick={() => onOpenReport?.(report)}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenReport?.(report)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="reports-manual-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <h3>{report.name}</h3>
                    <p className="reports-manual-date">{report.date}</p>
                    {report.statusLabel && (
                      <span className={`ngo-report-status status-${report.status}`}>{report.statusLabel}</span>
                    )}
                    {report.description && (
                      <p className="reports-manual-preview">
                        {report.description.length > 100 ? `${report.description.slice(0, 100)}…` : report.description}
                      </p>
                    )}
                    {report.fileName && <span className="reports-manual-attach">📎 {report.fileName}</span>}
                    {isManager && (
                      <button
                        type="button"
                        className="reports-manual-delete"
                        onClick={(e) => { e.stopPropagation(); onDeleteReport?.(report.id); }}
                      >
                        Delete
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {data.globalKpis?.length > 0 && activeTab !== 'manual' && (
        <div className="reports-global-kpis">
          <h3>Organization Impact Targets</h3>
          <div className="reports-global-kpi-grid">
            {data.globalKpis.map((kpi) => (
              <div key={kpi.id} className="reports-global-kpi-card">
                <div className="reports-global-kpi-label">{kpi.label}</div>
                <div className="reports-global-kpi-values">
                  <strong>{kpi.current.toLocaleString()}</strong>
                  <span>/ {kpi.target.toLocaleString()} {kpi.unit}</span>
                </div>
                <div className="reports-util-bar">
                  <div className="reports-util-fill" style={{ width: `${kpi.progressPct}%` }} />
                </div>
                <span className="reports-global-kpi-pct">{kpi.progressPct}% of target</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatVariance(amount) {
  const prefix = amount >= 0 ? '' : '-';
  const abs = Math.abs(amount);
  return `${prefix}ETB ${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
