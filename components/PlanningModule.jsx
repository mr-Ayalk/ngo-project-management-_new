'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  getPlanningPageMeta,
  OUTCOME_STATUSES,
  OUTPUT_STATUSES,
  PLAN_ACTIVITY_STATUSES,
} from '@/lib/planning-pages';
import ProjectIcon from '@/components/ProjectIcon';
import logo1 from '@/app/assets/logo1.png';

const PLANNING_ICONS = {
  projects: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 3v4M8 3v4M3 11h18"/>
    </svg>
  ),
  outcomes: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  outputs: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  activities: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  'my-activities': (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

function StatusPill({ status, type = 'outcome' }) {
  return <span className={`plan-status plan-status-${type} plan-status-${status}`}>{status.replace(/_/g, ' ')}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="plan-progress">
      <div className="plan-progress-fill" style={{ width: `${Math.min(100, value || 0)}%` }} />
      <span>{value || 0}%</span>
    </div>
  );
}

function PlanningHero({ pageId, children }) {
  const meta = getPlanningPageMeta(pageId);
  const iconKey = meta?.icon || pageId?.replace('planning-', '');
  return (
    <div className="plan-hero">
      <div className="plan-hero-icon">{PLANNING_ICONS[iconKey] || PLANNING_ICONS.projects}</div>
      <div className="plan-hero-copy">
        <p className="plan-hero-label">Planning Module</p>
        <h1>{meta?.label || 'Planning'}</h1>
        <p className="plan-hero-desc">{meta?.description}</p>
      </div>
      {children}
    </div>
  );
}

function LogframeDiagram({ stats }) {
  return (
    <div className="plan-logframe">
      <div className="plan-logframe-step">
        <span className="plan-logframe-num">{stats?.projects || 0}</span>
        <span className="plan-logframe-label">Projects</span>
      </div>
      <div className="plan-logframe-arrow">→</div>
      <div className="plan-logframe-step accent">
        <span className="plan-logframe-num">{stats?.outcomes || 0}</span>
        <span className="plan-logframe-label">Outcomes</span>
      </div>
      <div className="plan-logframe-arrow">→</div>
      <div className="plan-logframe-step">
        <span className="plan-logframe-num">{stats?.outputs || 0}</span>
        <span className="plan-logframe-label">Outputs</span>
      </div>
      <div className="plan-logframe-arrow">→</div>
      <div className="plan-logframe-step gold">
        <span className="plan-logframe-num">{stats?.activities || 0}</span>
        <span className="plan-logframe-label">Activities</span>
      </div>
    </div>
  );
}

const EMPTY_OUTCOME = { title: '', projectId: '', description: '', indicator: '', targetValue: '', baseline: '', unit: '', status: 'on-track', progress: 0 };
const EMPTY_OUTPUT = { title: '', projectId: '', outcomeId: '', description: '', deliverable: '', targetQty: '', achievedQty: '', unit: '', dueDate: '', status: 'planned', progress: 0 };
const EMPTY_ACTIVITY = { title: '', projectId: '', outputId: '', description: '', assigneeId: '', startDate: '', endDate: '', status: 'planned', priority: 'medium', location: '', budget: '', progress: 0 };

export default function PlanningModule({
  planningPage,
  data,
  loading,
  isManager,
  submitting,
  firstName,
  projects = [],
  onNavigate,
  onOpenProject,
  onCreateProject,
  onRefresh,
  onCreateOutcome,
  onUpdateOutcome,
  onDeleteOutcome,
  onCreateOutput,
  onUpdateOutput,
  onDeleteOutput,
  onCreateActivity,
  onUpdateActivity,
  onDeleteActivity,
}) {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState(EMPTY_OUTCOME);
  const [outputForm, setOutputForm] = useState(EMPTY_OUTPUT);
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY);

  const meta = getPlanningPageMeta(planningPage);

  const filteredProjects = useMemo(() => {
    let list = projects;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.manager?.name?.toLowerCase()?.includes(q));
    return list;
  }, [projects, search]);

  const filterByProject = (items) => {
    if (projectFilter === 'all') return items;
    return items?.filter((i) => i.projectId === projectFilter) || [];
  };

  if (loading && !data) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading planning module…</span>
      </div>
    );
  }

  /* ── LANDING OVERVIEW ── */
  if (planningPage === 'planning') {
    const portal = data?.portal;
    const stats = data?.stats;
    return (
      <div className="plan-page">
        <div className="portal-topbar">
          <div>
            <p className="portal-greeting">Welcome! <strong>{firstName}</strong>,</p>
            <p className="portal-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {portal && (
          <section className="plan-landing-hero">
            <div className="plan-landing-hero-inner">
              <Image src={logo1} alt="" className="plan-landing-logo" width={56} height={56} />
              <div>
                <h1>{portal.title}</h1>
                <p>{portal.subtitle}</p>
                {portal.tagline && <span className="plan-landing-tag">{portal.tagline}</span>}
              </div>
            </div>
          </section>
        )}

        <div className="plan-stats-row">
          <div className="plan-stat-card">
            <span className="plan-stat-val">{stats?.projects || 0}</span>
            <span className="plan-stat-label">Active Projects</span>
          </div>
          <div className="plan-stat-card">
            <span className="plan-stat-val">{stats?.outcomes || 0}</span>
            <span className="plan-stat-label">Outcomes Defined</span>
          </div>
          <div className="plan-stat-card">
            <span className="plan-stat-val">{stats?.outputs || 0}</span>
            <span className="plan-stat-label">Outputs Tracked</span>
          </div>
          <div className="plan-stat-card highlight">
            <span className="plan-stat-val">{stats?.logframeProgress || 0}%</span>
            <span className="plan-stat-label">LogFrame Progress</span>
          </div>
        </div>

        <LogframeDiagram stats={stats} />

        <div className="portal-info-grid">
          {portal?.mission && (
            <article className="portal-info-card">
              <h2>Our Mission</h2>
              <p>{portal.mission}</p>
            </article>
          )}
          {portal?.vision && (
            <article className="portal-info-card">
              <h2>Our Vision</h2>
              <p>{portal.vision}</p>
            </article>
          )}
          {portal?.strategicGoals?.length > 0 && (
            <article className="portal-info-card portal-info-goals">
              <h2>Our Strategic Goals</h2>
              <ul>
                {portal.strategicGoals.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </article>
          )}
        </div>

        {portal?.aboutWork && (
          <article className="plan-about-card">
            <h2>About Our Work</h2>
            <p>{portal.aboutWork}</p>
          </article>
        )}

        <div className="plan-quick-grid">
          <div className="plan-quick-card" onClick={() => onNavigate?.('planning-outcomes')} role="button" tabIndex={0}>
            <h3>Recent Outcomes</h3>
            {(data?.recentOutcomes || []).slice(0, 3).map((o) => (
              <div key={o.id} className="plan-quick-row">
                <strong>{o.title}</strong>
                <span>{o.projectName}</span>
                <ProgressBar value={o.progress} />
              </div>
            ))}
            {!data?.recentOutcomes?.length && <p className="plan-empty-inline">No outcomes yet — define your theory of change.</p>}
          </div>
          <div className="plan-quick-card" onClick={() => onNavigate?.('planning-activities')} role="button" tabIndex={0}>
            <h3>Upcoming Activities</h3>
            {(data?.upcomingActivities || []).slice(0, 4).map((a) => (
              <div key={a.id} className="plan-quick-row">
                <strong>{a.title}</strong>
                <span>{a.endLabel || a.projectName}</span>
                <StatusPill status={a.status} type="activity" />
              </div>
            ))}
            {!data?.upcomingActivities?.length && <p className="plan-empty-inline">Schedule field activities to track delivery.</p>}
          </div>
          <div className="plan-quick-card gold" onClick={() => onNavigate?.('planning-my-activities')} role="button" tabIndex={0}>
            <h3>My Activities</h3>
            <p className="plan-my-count">{stats?.myActivities || 0} assigned to you</p>
            {(data?.myUpcoming || []).slice(0, 3).map((a) => (
              <div key={a.id} className="plan-quick-row">
                <strong>{a.title}</strong>
                <span>{a.endLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── PROJECTS ── */
  if (planningPage === 'planning-projects') {
    return (
      <div className="plan-page">
        <PlanningHero pageId={planningPage}>
          {isManager && <button type="button" className="btn-primary" onClick={onCreateProject}>+ New Project</button>}
        </PlanningHero>
        <div className="plan-toolbar">
          <input className="plan-search" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="plan-table">
          <div className="plan-table-head projects">
            <span>Project</span><span>Manager</span><span>Status</span><span>Progress</span><span>Timeline</span>
          </div>
          {filteredProjects.map((p) => (
            <div key={p.id} className="plan-table-row projects" onClick={() => onOpenProject?.(p)} role="button" tabIndex={0}>
              <span className="plan-project-cell">
                <ProjectIcon icon={p.icon} />
                <strong>{p.name}</strong>
              </span>
              <span>{p.manager?.name || '—'}</span>
              <span><StatusPill status={p.status} type="project" /></span>
              <span><ProgressBar value={p.progress} /></span>
              <span className="plan-muted">{p.date || p.startDate} – {p.dueDate || p.endDate}</span>
            </div>
          ))}
          {!filteredProjects.length && <div className="plan-empty">No projects found. Create a project to begin your LogFrame planning.</div>}
        </div>
      </div>
    );
  }

  /* ── OUTCOMES ── */
  if (planningPage === 'planning-outcomes') {
    const outcomes = filterByProject(data?.outcomes || []);
    const q = search.trim().toLowerCase();
    const list = q ? outcomes.filter((o) => o.title.toLowerCase().includes(q)) : outcomes;

    return (
      <div className="plan-page">
        <PlanningHero pageId={planningPage}>
          {isManager && (
            <button type="button" className="btn-primary" onClick={() => { setOutcomeForm(EMPTY_OUTCOME); setModal('outcome'); }}>
              + Add Outcome
            </button>
          )}
        </PlanningHero>
        <div className="plan-toolbar">
          <input className="plan-search" placeholder="Search outcomes…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All Projects</option>
            {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="plan-cards-grid">
          {list.map((o) => (
            <article key={o.id} className="plan-entity-card">
              <div className="plan-entity-head">
                <StatusPill status={o.status} type="outcome" />
                {isManager && (
                  <div className="plan-entity-actions">
                    <button type="button" onClick={() => { setOutcomeForm({ ...o, targetValue: o.targetValue ?? '', baseline: o.baseline ?? '' }); setModal('outcome'); }}>Edit</button>
                    <button type="button" className="danger" onClick={() => onDeleteOutcome?.(o.id)}>Remove</button>
                  </div>
                )}
              </div>
              <h3>{o.title}</h3>
              <p className="plan-entity-project">{o.projectName}</p>
              {o.description && <p className="plan-entity-desc">{o.description}</p>}
              {o.indicator && <p className="plan-entity-meta"><strong>Indicator:</strong> {o.indicator}</p>}
              <ProgressBar value={o.progress} />
              <div className="plan-entity-footer">
                <span>{o.outputCount} outputs linked</span>
                {o.targetValue != null && <span>Target: {o.targetValue}{o.unit ? ` ${o.unit}` : ''}</span>}
              </div>
            </article>
          ))}
        </div>
        {!list.length && <div className="plan-empty">No outcomes defined. Outcomes describe the long-term changes your NGO seeks for communities.</div>}

        {modal === 'outcome' && (
          <div className="plan-modal-overlay" onClick={() => setModal(null)}>
            <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{outcomeForm.id ? 'Edit Outcome' : 'Add Outcome'}</h2>
              <div className="plan-form-grid">
                <div className="form-field"><label>Title *</label><input value={outcomeForm.title} onChange={(e) => setOutcomeForm({ ...outcomeForm, title: e.target.value })} /></div>
                <div className="form-field"><label>Project *</label>
                  <select value={outcomeForm.projectId} onChange={(e) => setOutcomeForm({ ...outcomeForm, projectId: e.target.value })}>
                    <option value="">Select project</option>
                    {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-field full"><label>Description</label><textarea rows={3} value={outcomeForm.description || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, description: e.target.value })} /></div>
                <div className="form-field"><label>Indicator</label><input value={outcomeForm.indicator || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, indicator: e.target.value })} /></div>
                <div className="form-field"><label>Status</label>
                  <select value={outcomeForm.status} onChange={(e) => setOutcomeForm({ ...outcomeForm, status: e.target.value })}>
                    {OUTCOME_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-field"><label>Baseline</label><input type="number" value={outcomeForm.baseline} onChange={(e) => setOutcomeForm({ ...outcomeForm, baseline: e.target.value })} /></div>
                <div className="form-field"><label>Target</label><input type="number" value={outcomeForm.targetValue} onChange={(e) => setOutcomeForm({ ...outcomeForm, targetValue: e.target.value })} /></div>
                <div className="form-field"><label>Unit</label><input value={outcomeForm.unit || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, unit: e.target.value })} placeholder="people, %, sites…" /></div>
                <div className="form-field"><label>Progress %</label><input type="number" min="0" max="100" value={outcomeForm.progress} onChange={(e) => setOutcomeForm({ ...outcomeForm, progress: e.target.value })} /></div>
              </div>
              <div className="plan-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                  if (outcomeForm.id) await onUpdateOutcome?.(outcomeForm.id, outcomeForm);
                  else await onCreateOutcome?.(outcomeForm);
                  setModal(null);
                }}>Save Outcome</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── OUTPUTS ── */
  if (planningPage === 'planning-outputs') {
    const outputs = filterByProject(data?.outputs || []);
    const q = search.trim().toLowerCase();
    const list = q ? outputs.filter((o) => o.title.toLowerCase().includes(q)) : outputs;

    return (
      <div className="plan-page">
        <PlanningHero pageId={planningPage}>
          {isManager && (
            <button type="button" className="btn-primary" onClick={() => { setOutputForm(EMPTY_OUTPUT); setModal('output'); }}>
              + Add Output
            </button>
          )}
        </PlanningHero>
        <div className="plan-toolbar">
          <input className="plan-search" placeholder="Search outputs…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All Projects</option>
            {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="plan-table">
          <div className="plan-table-head outputs">
            <span>Output</span><span>Outcome</span><span>Project</span><span>Due</span><span>Status</span><span>Progress</span><span />
          </div>
          {list.map((o) => (
            <div key={o.id} className="plan-table-row outputs">
              <span><strong>{o.title}</strong>{o.deliverable && <small>{o.deliverable}</small>}</span>
              <span>{o.outcomeTitle || '—'}</span>
              <span>{o.projectName}</span>
              <span>{o.dueDateLabel || '—'}</span>
              <span><StatusPill status={o.status} type="output" /></span>
              <span><ProgressBar value={o.progress} /></span>
              <span className="plan-row-actions">
                {isManager && (
                  <>
                    <button type="button" onClick={() => { setOutputForm({ ...o, targetQty: o.targetQty ?? '', achievedQty: o.achievedQty ?? '', dueDate: o.dueDate ? o.dueDate.slice(0, 10) : '' }); setModal('output'); }}>Edit</button>
                    <button type="button" className="danger" onClick={() => onDeleteOutput?.(o.id)}>Remove</button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
        {!list.length && <div className="plan-empty">No outputs yet. Outputs are the deliverables that contribute to your outcomes.</div>}

        {modal === 'output' && (
          <div className="plan-modal-overlay" onClick={() => setModal(null)}>
            <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{outputForm.id ? 'Edit Output' : 'Add Output'}</h2>
              <div className="plan-form-grid">
                <div className="form-field"><label>Title *</label><input value={outputForm.title} onChange={(e) => setOutputForm({ ...outputForm, title: e.target.value })} /></div>
                <div className="form-field"><label>Project *</label>
                  <select value={outputForm.projectId} onChange={(e) => setOutputForm({ ...outputForm, projectId: e.target.value, outcomeId: '' })}>
                    <option value="">Select project</option>
                    {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-field"><label>Outcome *</label>
                  <select value={outputForm.outcomeId} onChange={(e) => setOutputForm({ ...outputForm, outcomeId: e.target.value })}>
                    <option value="">Select outcome</option>
                    {(data?.outcomes || []).filter((oc) => !outputForm.projectId || oc.projectId === outputForm.projectId).map((oc) => (
                      <option key={oc.id} value={oc.id}>{oc.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field"><label>Deliverable</label><input value={outputForm.deliverable || ''} onChange={(e) => setOutputForm({ ...outputForm, deliverable: e.target.value })} /></div>
                <div className="form-field"><label>Due Date</label><input type="date" value={outputForm.dueDate || ''} onChange={(e) => setOutputForm({ ...outputForm, dueDate: e.target.value })} /></div>
                <div className="form-field"><label>Status</label>
                  <select value={outputForm.status} onChange={(e) => setOutputForm({ ...outputForm, status: e.target.value })}>
                    {OUTPUT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-field"><label>Target Qty</label><input type="number" value={outputForm.targetQty} onChange={(e) => setOutputForm({ ...outputForm, targetQty: e.target.value })} /></div>
                <div className="form-field"><label>Achieved</label><input type="number" value={outputForm.achievedQty} onChange={(e) => setOutputForm({ ...outputForm, achievedQty: e.target.value })} /></div>
                <div className="form-field full"><label>Description</label><textarea rows={2} value={outputForm.description || ''} onChange={(e) => setOutputForm({ ...outputForm, description: e.target.value })} /></div>
              </div>
              <div className="plan-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                  if (outputForm.id) await onUpdateOutput?.(outputForm.id, outputForm);
                  else await onCreateOutput?.(outputForm);
                  setModal(null);
                }}>Save Output</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── ACTIVITIES & MY ACTIVITIES ── */
  const isMine = planningPage === 'planning-my-activities';
  const activities = filterByProject(data?.activities || []);
  const q = search.trim().toLowerCase();
  const actList = q ? activities.filter((a) => a.title.toLowerCase().includes(q)) : activities;

  return (
    <div className="plan-page">
      <PlanningHero pageId={planningPage}>
        {isManager && !isMine && (
          <button type="button" className="btn-primary" onClick={() => { setActivityForm(EMPTY_ACTIVITY); setModal('activity'); }}>
            + Add Activity
          </button>
        )}
      </PlanningHero>
      <div className="plan-toolbar">
        <input className="plan-search" placeholder="Search activities…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {!isMine && (
          <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All Projects</option>
            {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>
      <div className="plan-activity-list">
        {actList.map((a) => (
          <article key={a.id} className="plan-activity-card">
            <div className="plan-activity-head">
              <div>
                <h3>{a.title}</h3>
                <p>{a.projectName}{a.outputTitle ? ` · ${a.outputTitle}` : ''}</p>
              </div>
              <StatusPill status={a.status} type="activity" />
            </div>
            {a.description && <p className="plan-entity-desc">{a.description}</p>}
            <div className="plan-activity-meta">
              {a.assigneeName && <span>👤 {a.assigneeName}</span>}
              {a.location && <span>📍 {a.location}</span>}
              {a.endLabel && <span>📅 {a.startLabel ? `${a.startLabel} – ` : ''}{a.endLabel}</span>}
              <span className={`priority-badge ${a.priority}`}>{a.priority}</span>
            </div>
            <ProgressBar value={a.progress} />
            <div className="plan-entity-actions">
              {(isManager || a.assigneeId) && (
                <button type="button" onClick={() => {
                  setActivityForm({
                    ...a,
                    startDate: a.startDate ? a.startDate.slice(0, 10) : '',
                    endDate: a.endDate ? a.endDate.slice(0, 10) : '',
                    budget: a.budget ?? '',
                  });
                  setModal('activity');
                }}>Update Progress</button>
              )}
              {isManager && <button type="button" className="danger" onClick={() => onDeleteActivity?.(a.id)}>Remove</button>}
            </div>
          </article>
        ))}
      </div>
      {!actList.length && (
        <div className="plan-empty">
          {isMine ? 'No activities assigned to you yet.' : 'No activities scheduled. Add field work, trainings, or operational tasks.'}
        </div>
      )}

      {modal === 'activity' && (
        <div className="plan-modal-overlay" onClick={() => setModal(null)}>
          <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{activityForm.id ? 'Update Activity' : 'Add Activity'}</h2>
            <div className="plan-form-grid">
              <div className="form-field"><label>Title *</label><input value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} disabled={!!activityForm.id && !isManager} /></div>
              <div className="form-field"><label>Project *</label>
                <select value={activityForm.projectId} onChange={(e) => setActivityForm({ ...activityForm, projectId: e.target.value })} disabled={!!activityForm.id}>
                  <option value="">Select project</option>
                  {(data?.projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Linked Output</label>
                <select value={activityForm.outputId || ''} onChange={(e) => setActivityForm({ ...activityForm, outputId: e.target.value })} disabled={!!activityForm.id && !isManager}>
                  <option value="">Optional</option>
                  {(data?.outputs || []).filter((o) => !activityForm.projectId || o.projectId === activityForm.projectId).map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-field"><label>Assignee</label>
                <select value={activityForm.assigneeId || ''} onChange={(e) => setActivityForm({ ...activityForm, assigneeId: e.target.value })} disabled={!isManager}>
                  <option value="">Unassigned</option>
                  {(data?.users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Start Date</label><input type="date" value={activityForm.startDate || ''} onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })} disabled={!isManager} /></div>
              <div className="form-field"><label>End Date</label><input type="date" value={activityForm.endDate || ''} onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })} disabled={!isManager} /></div>
              <div className="form-field"><label>Status</label>
                <select value={activityForm.status} onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}>
                  {PLAN_ACTIVITY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Priority</label>
                <select value={activityForm.priority} onChange={(e) => setActivityForm({ ...activityForm, priority: e.target.value })} disabled={!isManager}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="form-field"><label>Location</label><input value={activityForm.location || ''} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} disabled={!isManager} /></div>
              <div className="form-field"><label>Progress %</label><input type="number" min="0" max="100" value={activityForm.progress} onChange={(e) => setActivityForm({ ...activityForm, progress: e.target.value })} /></div>
              <div className="form-field full"><label>Description</label><textarea rows={2} value={activityForm.description || ''} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} disabled={!isManager} /></div>
            </div>
            <div className="plan-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                if (activityForm.id) await onUpdateActivity?.(activityForm.id, activityForm);
                else await onCreateActivity?.(activityForm);
                setModal(null);
              }}>Save Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
