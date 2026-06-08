'use client';

import { useState } from 'react';
import { getConfigPageMeta } from '@/lib/config-pages';

const INDICATOR_CATEGORIES = ['Impact', 'Output', 'Outcome', 'Process', 'Financial', 'Cross-cutting'];

function PageHero({ pageId, children }) {
  const meta = getConfigPageMeta(pageId);
  return (
    <div className="page-header page-header-row">
      <div>
        <h1>{meta?.label || 'Configuration'}</h1>
        <p>{meta?.description}</p>
      </div>
      {children}
    </div>
  );
}

function ConfigTable({ head, children, empty }) {
  if (empty) return <div className="config-empty">{empty}</div>;
  return (
    <div className="config-table">
      <div className="config-table-head">{head.map((h) => <span key={h}>{h}</span>)}</div>
      {children}
    </div>
  );
}

export default function ConfigurationHub({
  configPage,
  data,
  loading,
  canEdit,
  submitting,
  onRefresh,
  onCreateUnit,
  onDeleteUnit,
  onCreateIndicator,
  onDeleteIndicator,
}) {
  const [unitForm, setUnitForm] = useState({ name: '', code: '', description: '' });
  const [indicatorForm, setIndicatorForm] = useState({ name: '', code: '', category: 'Impact', unit: '', target: '', baseline: '' });

  if (loading || !data) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="config-page">
        <PageHero pageId={configPage} />
        <div className="config-access-note">
          Changes require administrator or project manager access.
        </div>
      </div>
    );
  }

  return (
    <div className="config-page">
      {configPage === 'units' && (
        <>
          <PageHero pageId={configPage}>
            <button type="button" className="btn-secondary" onClick={onRefresh}>Refresh</button>
          </PageHero>
          <div className="config-panel settings-card">
            <h3 className="settings-card-title">Add Organizational Unit</h3>
            <div className="config-form-grid three">
              <div className="form-field">
                <label>Unit name *</label>
                <input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Code</label>
                <input value={unitForm.code} onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Description</label>
                <input value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} />
              </div>
            </div>
            <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
              await onCreateUnit(unitForm);
              setUnitForm({ name: '', code: '', description: '' });
            }}>Add Unit</button>
          </div>
          <ConfigTable head={['Unit', 'Code', 'Status', '']} empty={!data.units?.length ? 'No units configured yet. Add program areas, departments, or field offices.' : null}>
            {data.units?.map((u) => (
              <div key={u.id} className="config-table-row">
                <span><strong>{u.name}</strong>{u.description && <small>{u.description}</small>}</span>
                <span>{u.code || '—'}</span>
                <span><span className={`config-status-pill${u.isActive ? ' active' : ''}`}>{u.isActive ? 'Active' : 'Inactive'}</span></span>
                <span><button type="button" className="config-link-danger" onClick={() => onDeleteUnit(u.id)}>Remove</button></span>
              </div>
            ))}
          </ConfigTable>
        </>
      )}

      {configPage === 'indicators' && (
        <>
          <PageHero pageId={configPage} />
          <div className="config-panel settings-card">
            <h3 className="settings-card-title">Add Program Indicator</h3>
            <div className="config-form-grid three">
              <div className="form-field">
                <label>Indicator name *</label>
                <input value={indicatorForm.name} onChange={(e) => setIndicatorForm({ ...indicatorForm, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Code</label>
                <input value={indicatorForm.code} onChange={(e) => setIndicatorForm({ ...indicatorForm, code: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select value={indicatorForm.category} onChange={(e) => setIndicatorForm({ ...indicatorForm, category: e.target.value })}>
                  {INDICATOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Unit (e.g. people, %)</label>
                <input value={indicatorForm.unit} onChange={(e) => setIndicatorForm({ ...indicatorForm, unit: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Baseline</label>
                <input type="number" value={indicatorForm.baseline} onChange={(e) => setIndicatorForm({ ...indicatorForm, baseline: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Target</label>
                <input type="number" value={indicatorForm.target} onChange={(e) => setIndicatorForm({ ...indicatorForm, target: e.target.value })} />
              </div>
            </div>
            <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
              await onCreateIndicator(indicatorForm);
              setIndicatorForm({ name: '', code: '', category: 'Impact', unit: '', target: '', baseline: '' });
            }}>Add Indicator</button>
          </div>
          <ConfigTable head={['Indicator', 'Category', 'Baseline → Target', '']} empty={!data.indicators?.length ? 'Define M&E indicators aligned with donor and organizational frameworks.' : null}>
            {data.indicators?.map((i) => (
              <div key={i.id} className="config-table-row">
                <span><strong>{i.name}</strong>{i.code && <small>{i.code}</small>}</span>
                <span>{i.category || '—'}</span>
                <span>{i.baseline ?? '—'} → {i.target ?? '—'} {i.unit || ''}</span>
                <span><button type="button" className="config-link-danger" onClick={() => onDeleteIndicator(i.id)}>Remove</button></span>
              </div>
            ))}
          </ConfigTable>
        </>
      )}
    </div>
  );
}
