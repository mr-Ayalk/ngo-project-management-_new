'use client';

import { useMemo, useState } from 'react';
import { getConfigPageMeta } from '@/lib/config-pages';
import { REPORT_TYPES } from '@/lib/report-types';
import { REGIONS, getZonesForRegion, getTownsForRegion } from '@/lib/ethiopia-locations';
import { STAFF_ROLES } from '@/lib/roles';

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'field_worker', label: 'Field Worker' },
  { value: 'program_staff', label: 'Program Staff' },
  { value: 'finance_team', label: 'Finance Team' },
  { value: 'manager', label: 'Project Manager' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'admin', label: 'Administrator' },
];

const INDICATOR_CATEGORIES = ['Impact', 'Output', 'Outcome', 'Process', 'Financial', 'Cross-cutting'];
const DASHBOARD_WIDGETS = [
  { id: 'kpi', label: 'KPI Summary Cards' },
  { id: 'tasks', label: 'Upcoming Tasks' },
  { id: 'budget', label: 'Budget Overview' },
  { id: 'reports', label: 'Recent Reports' },
  { id: 'beneficiaries', label: 'Beneficiary Stats' },
  { id: 'calendar', label: 'Calendar Events' },
  { id: 'activities', label: 'Activity Feed' },
];

function ConfigHero({ pageId, children }) {
  const meta = getConfigPageMeta(pageId);
  return (
    <div className="config-hero">
      <div>
        <p className="config-hero-label">Configurations</p>
        <h1>{meta?.label || 'Configuration'}</h1>
        <p className="config-hero-desc">{meta?.description}</p>
      </div>
      {children}
    </div>
  );
}

function ConfigTable({ head, children, empty }) {
  if (empty) {
    return <div className="config-empty">{empty}</div>;
  }
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
  onSaveOrg,
  onCreateUnit,
  onDeleteUnit,
  onCreateIndicator,
  onDeleteIndicator,
  onCreateScope,
  onDeleteScope,
  onSaveWorkflow,
  showToast,
}) {
  const [orgForm, setOrgForm] = useState(null);
  const [unitForm, setUnitForm] = useState({ name: '', code: '', description: '' });
  const [indicatorForm, setIndicatorForm] = useState({ name: '', code: '', category: 'Impact', unit: '', target: '', baseline: '' });
  const [scopeForm, setScopeForm] = useState({ userId: '', region: '', zone: '', woreda: '', kebele: '' });
  const [workflowEdits, setWorkflowEdits] = useState({});

  const org = orgForm || data?.organization;
  const zoneOptions = useMemo(() => getZonesForRegion(scopeForm.region), [scopeForm.region]);

  if (loading || !data) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading configuration…</span>
      </div>
    );
  }

  if (!canEdit && configPage !== 'config-guide') {
    return (
      <div className="config-page">
        <ConfigHero pageId={configPage} />
        <div className="config-access-note">
          Configuration changes require administrator or project manager access. Contact your NGO leadership team for updates.
        </div>
      </div>
    );
  }

  const initOrgForm = () => {
    if (!orgForm && data.organization) {
      setOrgForm({ ...data.organization });
    }
  };

  const updateOrg = (patch) => {
    initOrgForm();
    setOrgForm((prev) => ({ ...(prev || data.organization), ...patch }));
  };

  const saveOrgFields = async (fields) => {
    initOrgForm();
    const payload = { ...(orgForm || data.organization), ...fields };
    await onSaveOrg(payload);
    setOrgForm(null);
  };

  const toggleRegion = (region) => {
    const list = org?.enabledRegionsList || data.organization?.enabledRegionsList || [];
    const next = list.includes(region) ? list.filter((r) => r !== region) : [...list, region];
    updateOrg({ enabledRegionsList: next });
  };

  const toggleWidget = (id) => {
    const list = org?.dashboardWidgets || data.organization?.dashboardWidgets || [];
    const next = list.includes(id) ? list.filter((w) => w !== id) : [...list, id];
    updateOrg({ dashboardWidgets: next });
  };

  const toggleGoal = (index) => {
    const list = [...(org?.strategicGoalsList || data.organization?.strategicGoalsList || [])];
    if (list[index] !== undefined) list.splice(index, 1);
    updateOrg({ strategicGoalsList: list });
  };

  const addGoal = (text) => {
    if (!text.trim()) return;
    const list = [...(org?.strategicGoalsList || data.organization?.strategicGoalsList || []), text.trim()];
    updateOrg({ strategicGoalsList: list });
  };

  return (
    <div className="config-page">
      {/* ── UNITS ── */}
      {configPage === 'config-units' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-secondary" onClick={onRefresh}>Refresh</button>
          </ConfigHero>
          <div className="config-panel">
            <h3>Add Organizational Unit</h3>
            <div className="config-inline-form">
              <input placeholder="Unit name *" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
              <input placeholder="Code" value={unitForm.code} onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })} />
              <input placeholder="Description" value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} />
              <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                await onCreateUnit(unitForm);
                setUnitForm({ name: '', code: '', description: '' });
              }}>Add Unit</button>
            </div>
          </div>
          <ConfigTable head={['Unit', 'Code', 'Status', '']} empty={!data.units?.length ? 'No units configured yet. Add program areas, departments, or field offices.' : null}>
            {data.units.map((u) => (
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

      {/* ── INDICATORS ── */}
      {configPage === 'config-indicators' && (
        <>
          <ConfigHero pageId={configPage} />
          <div className="config-panel">
            <h3>Add Program Indicator</h3>
            <div className="config-form-grid">
              <input placeholder="Indicator name *" value={indicatorForm.name} onChange={(e) => setIndicatorForm({ ...indicatorForm, name: e.target.value })} />
              <input placeholder="Code" value={indicatorForm.code} onChange={(e) => setIndicatorForm({ ...indicatorForm, code: e.target.value })} />
              <select value={indicatorForm.category} onChange={(e) => setIndicatorForm({ ...indicatorForm, category: e.target.value })}>
                {INDICATOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Unit (e.g. people, %)" value={indicatorForm.unit} onChange={(e) => setIndicatorForm({ ...indicatorForm, unit: e.target.value })} />
              <input placeholder="Baseline" type="number" value={indicatorForm.baseline} onChange={(e) => setIndicatorForm({ ...indicatorForm, baseline: e.target.value })} />
              <input placeholder="Target" type="number" value={indicatorForm.target} onChange={(e) => setIndicatorForm({ ...indicatorForm, target: e.target.value })} />
            </div>
            <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
              await onCreateIndicator(indicatorForm);
              setIndicatorForm({ name: '', code: '', category: 'Impact', unit: '', target: '', baseline: '' });
            }}>Add Indicator</button>
          </div>
          <ConfigTable head={['Indicator', 'Category', 'Baseline → Target', '']} empty={!data.indicators?.length ? 'Define M&E indicators aligned with donor and organizational frameworks.' : null}>
            {data.indicators.map((i) => (
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

      {/* ── LOCATIONS ── */}
      {configPage === 'config-locations' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields({ enabledRegionsList: org?.enabledRegionsList || data.organization.enabledRegionsList })}>Save Regions</button>
          </ConfigHero>
          <div className="config-panel">
            <p className="config-panel-desc">Select regions where your NGO operates. These appear in project forms, beneficiary records, and field scope filters.</p>
            <div className="config-region-grid">
              {REGIONS.map((region) => {
                const active = (org?.enabledRegionsList || data.organization?.enabledRegionsList || []).includes(region);
                return (
                  <button key={region} type="button" className={`config-region-chip${active ? ' active' : ''}`} onClick={() => toggleRegion(region)}>
                    {region}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── REPORTER APPROVER ── */}
      {configPage === 'config-reporter-approver' && (
        <>
          <ConfigHero pageId={configPage} />
          <div className="config-panel">
            <p className="config-panel-desc">Define which roles can submit and approve each report type. This governs your humanitarian reporting workflow.</p>
          </div>
          <div className="config-workflow-list">
            {data.reportWorkflow.map((rule) => (
              <div key={rule.reportType} className="config-workflow-card">
                <h4>{rule.reportLabel}</h4>
                <div className="config-form-row">
                  <div className="form-field">
                    <label>Submitter Roles</label>
                    <select multiple className="config-multi-select" value={workflowEdits[rule.reportType]?.submitterRoles || rule.submitterRoles} onChange={(e) => {
                      const vals = [...e.target.selectedOptions].map((o) => o.value);
                      setWorkflowEdits((prev) => ({ ...prev, [rule.reportType]: { ...rule, ...prev[rule.reportType], submitterRoles: vals } }));
                    }}>
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Approver Roles</label>
                    <select multiple className="config-multi-select" value={workflowEdits[rule.reportType]?.approverRoles || rule.approverRoles} onChange={(e) => {
                      const vals = [...e.target.selectedOptions].map((o) => o.value);
                      setWorkflowEdits((prev) => ({ ...prev, [rule.reportType]: { ...rule, ...prev[rule.reportType], submitterRoles: prev[rule.reportType]?.submitterRoles || rule.submitterRoles, approverRoles: vals } }));
                    }}>
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <button type="button" className="btn-secondary config-save-row" disabled={submitting} onClick={() => onSaveWorkflow({
                    reportType: rule.reportType,
                    submitterRoles: workflowEdits[rule.reportType]?.submitterRoles || rule.submitterRoles,
                    approverRoles: workflowEdits[rule.reportType]?.approverRoles || rule.approverRoles,
                  })}>Save</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── USER WOREDA ── */}
      {configPage === 'config-user-woreda' && (
        <>
          <ConfigHero pageId={configPage} />
          <div className="config-panel">
            <h3>Assign Staff to Field Scope</h3>
            <div className="config-form-grid">
              <select value={scopeForm.userId} onChange={(e) => setScopeForm({ ...scopeForm, userId: e.target.value })}>
                <option value="">Select staff member…</option>
                {data.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={scopeForm.region} onChange={(e) => setScopeForm({ ...scopeForm, region: e.target.value, zone: '' })}>
                <option value="">Region</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={scopeForm.zone} onChange={(e) => setScopeForm({ ...scopeForm, zone: e.target.value })}>
                <option value="">Zone</option>
                {zoneOptions.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              <input placeholder="Woreda" value={scopeForm.woreda} onChange={(e) => setScopeForm({ ...scopeForm, woreda: e.target.value })} />
              <input placeholder="Kebele" value={scopeForm.kebele} onChange={(e) => setScopeForm({ ...scopeForm, kebele: e.target.value })} />
            </div>
            <button type="button" className="btn-primary" disabled={submitting || !scopeForm.userId} onClick={async () => {
              await onCreateScope(scopeForm);
              setScopeForm({ userId: '', region: '', zone: '', woreda: '', kebele: '' });
            }}>Add Mapping</button>
          </div>
          <ConfigTable head={['Staff', 'Region', 'Zone', 'Woreda', 'Kebele', '']} empty={!data.userScopes?.length ? 'Map field staff to woredas for scoped data access and reporting accountability.' : null}>
            {data.userScopes.map((s) => (
              <div key={s.id} className="config-table-row scopes">
                <span>{s.userName}</span>
                <span>{s.region || '—'}</span>
                <span>{s.zone || '—'}</span>
                <span>{s.woreda || '—'}</span>
                <span>{s.kebele || '—'}</span>
                <span><button type="button" className="config-link-danger" onClick={() => onDeleteScope(s.id)}>Remove</button></span>
              </div>
            ))}
          </ConfigTable>
        </>
      )}

      {/* ── LANDING PAGE ── */}
      {configPage === 'config-landing' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields(org || data.organization)}>Save Landing Page</button>
          </ConfigHero>
          <div className="config-panel config-split">
            <div>
              <div className="form-field"><label>Portal Title</label><input value={org?.landingTitle || ''} onChange={(e) => updateOrg({ landingTitle: e.target.value })} placeholder="Engage Now Africa" /></div>
              <div className="form-field"><label>Welcome Subtitle</label><textarea rows={3} value={org?.landingSubtitle || ''} onChange={(e) => updateOrg({ landingSubtitle: e.target.value })} placeholder="Welcome to our Impact Portal…" /></div>
              <div className="form-field"><label>Tagline</label><input value={org?.landingTagline || ''} onChange={(e) => updateOrg({ landingTagline: e.target.value })} placeholder="Empowering Communities Since 2010" /></div>
            </div>
            <div className="config-preview-card">
              <p className="config-preview-label">Preview</p>
              <div className="config-landing-preview">
                <h3>{org?.landingTitle || data.organization?.name || 'Engage Now Africa'}</h3>
                <p>{org?.landingSubtitle || 'Welcome to your humanitarian impact portal.'}</p>
                <span className="tag">{org?.landingTagline || 'Empowering Communities Since 2010'}</span>
              </div>
            </div>
          </div>
          <div className="config-panel">
            <div className="form-field"><label>Our Mission</label><textarea rows={4} value={org?.missionText || ''} onChange={(e) => updateOrg({ missionText: e.target.value })} /></div>
            <div className="form-field"><label>Our Vision</label><textarea rows={4} value={org?.visionText || ''} onChange={(e) => updateOrg({ visionText: e.target.value })} /></div>
            <div className="form-field">
              <label>Strategic Goals</label>
              <ul className="config-goals-list">
                {(org?.strategicGoalsList || data.organization?.strategicGoalsList || []).map((g, i) => (
                  <li key={i}>{g} <button type="button" onClick={() => toggleGoal(i)}>×</button></li>
                ))}
              </ul>
              <div className="config-inline-form">
                <input id="new-goal-input" placeholder="Add a strategic goal…" onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addGoal(e.target.value); e.target.value = ''; }
                }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DASHBOARD ── */}
      {configPage === 'config-dashboard' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields(org || data.organization)}>Save Dashboard</button>
          </ConfigHero>
          <div className="config-panel">
            <p className="config-panel-desc">Choose which widgets appear on the leadership dashboard home page.</p>
            <div className="config-widget-grid">
              {DASHBOARD_WIDGETS.map((w) => {
                const active = (org?.dashboardWidgets || data.organization?.dashboardWidgets || []).includes(w.id);
                return (
                  <button key={w.id} type="button" className={`config-widget-card${active ? ' active' : ''}`} onClick={() => toggleWidget(w.id)}>
                    <span className="config-widget-check">{active ? '✓' : ''}</span>
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── COLORS ── */}
      {configPage === 'config-colors' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields(org || data.organization)}>Save Colors</button>
          </ConfigHero>
          <div className="config-panel config-split">
            <div className="config-color-fields">
              <div className="form-field">
                <label>Primary Brand Color</label>
                <div className="config-color-input">
                  <input type="color" value={org?.primaryColor || '#2563eb'} onChange={(e) => updateOrg({ primaryColor: e.target.value })} />
                  <input value={org?.primaryColor || '#2563eb'} onChange={(e) => updateOrg({ primaryColor: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Accent Color</label>
                <div className="config-color-input">
                  <input type="color" value={org?.accentColor || '#16a34a'} onChange={(e) => updateOrg({ accentColor: e.target.value })} />
                  <input value={org?.accentColor || '#16a34a'} onChange={(e) => updateOrg({ accentColor: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="config-preview-card">
              <p className="config-preview-label">Brand Preview</p>
              <div className="config-brand-preview" style={{ '--preview-primary': org?.primaryColor || '#2563eb', '--preview-accent': org?.accentColor || '#16a34a' }}>
                <div className="config-brand-bar" />
                <button type="button" className="config-brand-btn">Primary Action</button>
                <button type="button" className="config-brand-btn accent">Accent Action</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DATE TIME ── */}
      {configPage === 'config-datetime' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields(org || data.organization)}>Save Settings</button>
          </ConfigHero>
          <div className="config-panel">
            <div className="config-form-grid three">
              <div className="form-field">
                <label>Date Format</label>
                <select value={org?.dateFormat || 'DD/MM/YYYY'} onChange={(e) => updateOrg({ dateFormat: e.target.value })}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-field">
                <label>Timezone</label>
                <select value={org?.timezone || 'Africa/Addis_Ababa'} onChange={(e) => updateOrg({ timezone: e.target.value })}>
                  <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="form-field">
                <label>Fiscal Year Start</label>
                <select value={org?.fiscalYearStart || 'July'} onChange={(e) => updateOrg({ fiscalYearStart: e.target.value })}>
                  {['January', 'April', 'July', 'October'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── KOBO ── */}
      {configPage === 'config-kobo' && (
        <>
          <ConfigHero pageId={configPage}>
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => saveOrgFields(org || data.organization)}>Save Integration</button>
          </ConfigHero>
          <div className="config-panel">
            <label className="config-toggle-row">
              <input type="checkbox" checked={org?.koboEnabled ?? data.organization?.koboEnabled} onChange={(e) => updateOrg({ koboEnabled: e.target.checked })} />
              Enable KoboToolbox integration for mobile field data collection
            </label>
            <div className="form-field"><label>Kobo Server URL</label><input value={org?.koboApiUrl || ''} onChange={(e) => updateOrg({ koboApiUrl: e.target.value })} placeholder="https://kf.kobotoolbox.org" /></div>
            <div className="form-field"><label>Default Project UID</label><input value={org?.koboProjectId || ''} onChange={(e) => updateOrg({ koboProjectId: e.target.value })} placeholder="Project identifier from Kobo" /></div>
            <p className="config-panel-desc">KoboToolbox is widely used by NGOs for surveys, beneficiary registration, and M&E data collection in low-connectivity environments.</p>
          </div>
        </>
      )}

      {/* ── USER GUIDE ── */}
      {configPage === 'config-guide' && (
        <>
          <ConfigHero pageId={configPage} />
          <div className="config-guide-grid">
            {[
              { title: 'Getting Started', body: 'Log in with your NGO email, review your assigned projects, and check the Inbox for field updates.' },
              { title: 'Creating Reports', body: 'Use Report Management to submit daily, weekly, monthly, or incident reports. Draft first, then submit for manager approval.' },
              { title: 'Project Access', body: 'You can only open project details and messaging for projects you are assigned to as manager, lead, or team member.' },
              { title: 'Beneficiaries & M&E', body: 'Record beneficiary data by program and region. Indicators configured here drive impact tracking on the Reports dashboard.' },
              { title: 'Documents & Compliance', body: 'Upload donor agreements, budgets, and audit files under Documents. Use categories for easy retrieval.' },
              { title: 'Need Help?', body: 'Contact your NGO administrator or project manager for account access, scope changes, or training sessions.' },
            ].map((item) => (
              <article key={item.title} className="config-guide-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
