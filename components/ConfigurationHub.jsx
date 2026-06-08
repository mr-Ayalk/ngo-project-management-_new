'use client';

import { useMemo, useState } from 'react';
import { getConfigPageMeta } from '@/lib/config-pages';
import { REPORT_TYPES } from '@/lib/report-types';
import { REGIONS, getZonesForRegion, getTownsForRegion } from '@/lib/ethiopia-locations';

/** Roles shown in workflow UI (manager + project_manager are one checkbox). */
const WORKFLOW_ROLES = [
  { value: 'staff', label: 'Staff', hint: 'General NGO staff' },
  { value: 'field_worker', label: 'Field Worker', hint: 'Frontline / community staff' },
  { value: 'program_staff', label: 'Program Staff', hint: 'Program officers & coordinators' },
  { value: 'finance_team', label: 'Finance Team', hint: 'Finance & grants staff' },
  { value: 'manager', label: 'Project Manager', hint: 'Managers who oversee projects', aliases: ['project_manager'] },
  { value: 'admin', label: 'Administrator', hint: 'System administrators' },
];

function expandWorkflowRoles(roles) {
  const set = new Set(roles.filter((r) => r !== 'project_manager'));
  if (set.has('manager')) {
    set.add('project_manager');
  }
  return [...set];
}

function hasWorkflowRole(selected, roleValue) {
  const role = WORKFLOW_ROLES.find((r) => r.value === roleValue);
  const keys = role?.aliases ? [role.value, ...role.aliases] : [roleValue];
  return keys.some((k) => selected.includes(k));
}

function toggleWorkflowRole(selected, roleValue) {
  const role = WORKFLOW_ROLES.find((r) => r.value === roleValue);
  const keys = role?.aliases ? [role.value, ...role.aliases] : [roleValue];
  const next = new Set(selected);
  const isOn = keys.some((k) => next.has(k));
  keys.forEach((k) => {
    if (isOn) next.delete(k);
    else next.add(k);
  });
  return [...next];
}

function normalizeWorkflowRolesForCompare(roles) {
  return expandWorkflowRoles(roles).sort().join(',');
}

function formatRoleList(roles) {
  const labels = WORKFLOW_ROLES
    .filter((r) => hasWorkflowRole(roles, r.value))
    .map((r) => r.label);
  return labels.length ? labels.join(', ') : 'None selected';
}

function WorkflowRoleChips({ selected, onChange, variant }) {
  return (
    <div className="workflow-role-chips" role="group">
      {WORKFLOW_ROLES.map((role) => {
        const active = hasWorkflowRole(selected, role.value);
        return (
          <button
            key={role.value}
            type="button"
            className={`workflow-role-chip ${variant}${active ? ' active' : ''}`}
            title={role.hint}
            aria-pressed={active}
            onClick={() => onChange(toggleWorkflowRole(selected, role.value))}
          >
            {active && <span className="workflow-role-check" aria-hidden="true">✓</span>}
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

function WorkflowRuleCard({ rule, workflowEdits, setWorkflowEdits, submitting, onSave }) {
  const meta = REPORT_TYPES.find((t) => t.value === rule.reportType);
  const submitterRoles = workflowEdits[rule.reportType]?.submitterRoles ?? rule.submitterRoles;
  const approverRoles = workflowEdits[rule.reportType]?.approverRoles ?? rule.approverRoles;
  const isDirty = normalizeWorkflowRolesForCompare(submitterRoles) !== normalizeWorkflowRolesForCompare(rule.submitterRoles)
    || normalizeWorkflowRolesForCompare(approverRoles) !== normalizeWorkflowRolesForCompare(rule.approverRoles);

  const patchRule = (patch) => {
    setWorkflowEdits((prev) => ({
      ...prev,
      [rule.reportType]: {
        ...rule,
        ...prev[rule.reportType],
        submitterRoles: prev[rule.reportType]?.submitterRoles ?? rule.submitterRoles,
        approverRoles: prev[rule.reportType]?.approverRoles ?? rule.approverRoles,
        ...patch,
      },
    }));
  };

  return (
    <article className={`workflow-rule-card${isDirty ? ' dirty' : ''}`}>
      <header className="workflow-rule-header">
        <div>
          <h4>{rule.reportLabel}</h4>
          {meta?.cadence && <p className="workflow-rule-cadence">{meta.cadence}</p>}
        </div>
        {isDirty && <span className="workflow-unsaved-badge">Unsaved changes</span>}
      </header>

      <div className="workflow-flow">
        <section className="workflow-role-section">
          <div className="workflow-role-heading">
            <span className="workflow-role-icon reporter">1</span>
            <div>
              <strong>Reporters</strong>
              <span>Who can create &amp; submit this report</span>
            </div>
          </div>
          <WorkflowRoleChips
            variant="reporter"
            selected={submitterRoles}
            onChange={(roles) => patchRule({ submitterRoles: roles })}
          />
        </section>

        <div className="workflow-flow-arrow" aria-hidden="true">
          <span>submits to</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </div>

        <section className="workflow-role-section">
          <div className="workflow-role-heading">
            <span className="workflow-role-icon approver">2</span>
            <div>
              <strong>Approvers</strong>
              <span>Who can review in Reports Approval</span>
            </div>
          </div>
          <WorkflowRoleChips
            variant="approver"
            selected={approverRoles}
            onChange={(roles) => patchRule({ approverRoles: roles })}
          />
        </section>
      </div>

      <footer className="workflow-rule-footer">
        <p className="workflow-summary">
          <strong>Summary:</strong> {formatRoleList(submitterRoles)} submit → {formatRoleList(approverRoles)} approve
        </p>
        <button
          type="button"
          className={isDirty ? 'btn-primary' : 'btn-secondary'}
          disabled={submitting || !isDirty}
          onClick={() => onSave({
            reportType: rule.reportType,
            submitterRoles: expandWorkflowRoles(submitterRoles),
            approverRoles: expandWorkflowRoles(approverRoles),
          })}
        >
          {isDirty ? 'Save changes' : 'Saved'}
        </button>
      </footer>
    </article>
  );
}

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
    <div className="page-header page-header-row">
      <div>
        <p className="page-section-label">Configurations</p>
        <h1>{meta?.label || 'Configuration'}</h1>
        <p>{meta?.description}</p>
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

  if (!canEdit) {
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
          <div className="config-panel workflow-howto">
            <h3 className="settings-card-title">How this works</h3>
            <ol className="workflow-steps">
              <li><strong>Reporters</strong> create and submit reports under Report Management.</li>
              <li>Submitted reports appear as <strong>Pending Approval</strong> for the roles you choose below.</li>
              <li><strong>Approvers</strong> review and approve or return reports in Reports Approval.</li>
            </ol>
            <p className="config-panel-desc workflow-howto-tip">
              Click role chips to turn permissions on or off for each report type. Changes apply only after you click <strong>Save changes</strong> on that report card.
            </p>
          </div>
          <div className="workflow-rules">
            {data.reportWorkflow.map((rule) => (
              <WorkflowRuleCard
                key={rule.reportType}
                rule={rule}
                workflowEdits={workflowEdits}
                setWorkflowEdits={setWorkflowEdits}
                submitting={submitting}
                onSave={async (body) => {
                  const saved = await onSaveWorkflow(body);
                  if (saved) {
                    setWorkflowEdits((prev) => {
                      const next = { ...prev };
                      delete next[body.reportType];
                      return next;
                    });
                  }
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ── USER WOREDA ── */}
      {configPage === 'config-user-woreda' && (
        <>
          <ConfigHero pageId={configPage} />
          <div className="config-panel settings-card">
            <h3 className="settings-card-title">Assign Staff to Field Scope</h3>
            <div className="config-form-grid">
              <div className="form-field">
                <label>Staff member</label>
                <select value={scopeForm.userId} onChange={(e) => setScopeForm({ ...scopeForm, userId: e.target.value })}>
                  <option value="">Select staff member…</option>
                  {data.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Region</label>
                <select value={scopeForm.region} onChange={(e) => setScopeForm({ ...scopeForm, region: e.target.value, zone: '' })}>
                  <option value="">Select region…</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Zone</label>
                <select value={scopeForm.zone} onChange={(e) => setScopeForm({ ...scopeForm, zone: e.target.value })}>
                  <option value="">Select zone…</option>
                  {zoneOptions.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Woreda</label>
                <input value={scopeForm.woreda} onChange={(e) => setScopeForm({ ...scopeForm, woreda: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Kebele</label>
                <input value={scopeForm.kebele} onChange={(e) => setScopeForm({ ...scopeForm, kebele: e.target.value })} />
              </div>
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
              <div className="form-field">
                <label>Add strategic goal</label>
                <input id="new-goal-input" placeholder="Type a goal and press Enter…" onKeyDown={(e) => {
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

    </div>
  );
}
