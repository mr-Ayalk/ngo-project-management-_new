'use client';

import { useMemo, useState } from 'react';
import {
  OUTCOME_STATUSES,
  OUTPUT_STATUSES,
  PLAN_ACTIVITY_STATUSES,
  EMPTY_OUTCOME,
  EMPTY_OUTPUT,
  EMPTY_ACTIVITY,
} from '@/lib/planning-constants';

function StatusPill({ status, type = 'outcome' }) {
  return <span className={`plan-status plan-status-${type} plan-status-${status}`}>{String(status).replace(/_/g, ' ')}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="plan-progress">
      <div className="plan-progress-fill" style={{ width: `${Math.min(100, value || 0)}%` }} />
      <span>{value || 0}%</span>
    </div>
  );
}

export default function ProjectLogframePanel({
  tab,
  projectId,
  data,
  loading,
  isManager,
  submitting,
  currentUserId,
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
  const [modal, setModal] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ ...EMPTY_OUTCOME, projectId });
  const [outputForm, setOutputForm] = useState({ ...EMPTY_OUTPUT, projectId });
  const [activityForm, setActivityForm] = useState({ ...EMPTY_ACTIVITY, projectId });

  const q = search.trim().toLowerCase();
  const outcomes = useMemo(() => {
    const list = data?.outcomes || [];
    return q ? list.filter((o) => o.title.toLowerCase().includes(q)) : list;
  }, [data?.outcomes, q]);
  const outputs = useMemo(() => {
    const list = data?.outputs || [];
    return q ? list.filter((o) => o.title.toLowerCase().includes(q)) : list;
  }, [data?.outputs, q]);
  const activities = useMemo(() => {
    const list = data?.activities || [];
    return q ? list.filter((a) => a.title.toLowerCase().includes(q)) : list;
  }, [data?.activities, q]);
  const projectOutcomes = useMemo(() => (data?.outcomes || []).filter((o) => o.projectId === projectId), [data?.outcomes, projectId]);
  const projectOutputs = useMemo(() => (data?.outputs || []).filter((o) => o.projectId === projectId), [data?.outputs, projectId]);

  if (loading && !data) {
    return <div className="page-loading"><div className="login-spinner" /><span>Loading…</span></div>;
  }

  const toolbar = (addLabel, onAdd) => (
    <div className="filter-row project-logframe-toolbar">
      <input className="search-inline" placeholder={`Search ${tab}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
      {isManager && onAdd && (
        <button type="button" className="btn-primary" onClick={onAdd}>{addLabel}</button>
      )}
    </div>
  );

  if (tab === 'outcomes') {
    return (
      <div className="project-logframe-panel">
        {toolbar('+ Add Outcome', () => { setOutcomeForm({ ...EMPTY_OUTCOME, projectId }); setModal('outcome'); })}
        <div className="plan-cards-grid">
          {outcomes.map((o) => (
            <article key={o.id} className="plan-entity-card">
              <div className="plan-entity-head">
                <StatusPill status={o.status} type="outcome" />
                {isManager && (
                  <div className="plan-entity-actions">
                    <button type="button" onClick={() => { setOutcomeForm({ ...o, targetValue: o.targetValue ?? '', baseline: o.baseline ?? '', projectId }); setModal('outcome'); }}>Edit</button>
                    <button type="button" className="danger" onClick={() => onDeleteOutcome?.(o.id).then?.(onRefresh)}>Remove</button>
                  </div>
                )}
              </div>
              <h3>{o.title}</h3>
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
        {!outcomes.length && <div className="plan-empty">No outcomes defined for this project yet.</div>}
        {modal === 'outcome' && (
          <div className="plan-modal-overlay" onClick={() => setModal(null)}>
            <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{outcomeForm.id ? 'Edit Outcome' : 'Add Outcome'}</h2>
              <div className="plan-form-grid">
                <div className="form-field full"><label>Title *</label><input value={outcomeForm.title} onChange={(e) => setOutcomeForm({ ...outcomeForm, title: e.target.value })} /></div>
                <div className="form-field full"><label>Description</label><textarea rows={3} value={outcomeForm.description || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, description: e.target.value })} /></div>
                <div className="form-field"><label>Indicator</label><input value={outcomeForm.indicator || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, indicator: e.target.value })} /></div>
                <div className="form-field"><label>Status</label><select value={outcomeForm.status} onChange={(e) => setOutcomeForm({ ...outcomeForm, status: e.target.value })}>{OUTCOME_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                <div className="form-field"><label>Baseline</label><input type="number" value={outcomeForm.baseline} onChange={(e) => setOutcomeForm({ ...outcomeForm, baseline: e.target.value })} /></div>
                <div className="form-field"><label>Target</label><input type="number" value={outcomeForm.targetValue} onChange={(e) => setOutcomeForm({ ...outcomeForm, targetValue: e.target.value })} /></div>
                <div className="form-field"><label>Unit</label><input value={outcomeForm.unit || ''} onChange={(e) => setOutcomeForm({ ...outcomeForm, unit: e.target.value })} /></div>
                <div className="form-field"><label>Progress %</label><input type="number" min="0" max="100" value={outcomeForm.progress} onChange={(e) => setOutcomeForm({ ...outcomeForm, progress: e.target.value })} /></div>
              </div>
              <div className="plan-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                  const payload = { ...outcomeForm, projectId };
                  if (outcomeForm.id) await onUpdateOutcome?.(outcomeForm.id, payload);
                  else await onCreateOutcome?.(payload);
                  setModal(null);
                  onRefresh?.();
                }}>Save Outcome</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'outputs') {
    return (
      <div className="project-logframe-panel">
        {toolbar('+ Add Output', () => { setOutputForm({ ...EMPTY_OUTPUT, projectId }); setModal('output'); })}
        <div className="plan-table">
          <div className="plan-table-head outputs"><span>Output</span><span>Outcome</span><span>Due</span><span>Status</span><span>Progress</span><span /></div>
          {outputs.map((o) => (
            <div key={o.id} className="plan-table-row outputs">
              <span><strong>{o.title}</strong>{o.deliverable && <small>{o.deliverable}</small>}</span>
              <span>{o.outcomeTitle || '—'}</span>
              <span>{o.dueDateLabel || '—'}</span>
              <span><StatusPill status={o.status} type="output" /></span>
              <span><ProgressBar value={o.progress} /></span>
              <span className="plan-row-actions">
                {isManager && (
                  <>
                    <button type="button" onClick={() => { setOutputForm({ ...o, targetQty: o.targetQty ?? '', achievedQty: o.achievedQty ?? '', dueDate: o.dueDate ? o.dueDate.slice(0, 10) : '', projectId }); setModal('output'); }}>Edit</button>
                    <button type="button" className="danger" onClick={() => onDeleteOutput?.(o.id).then?.(onRefresh)}>Remove</button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
        {!outputs.length && <div className="plan-empty">No outputs defined for this project yet.</div>}
        {modal === 'output' && (
          <div className="plan-modal-overlay" onClick={() => setModal(null)}>
            <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{outputForm.id ? 'Edit Output' : 'Add Output'}</h2>
              <div className="plan-form-grid">
                <div className="form-field"><label>Title *</label><input value={outputForm.title} onChange={(e) => setOutputForm({ ...outputForm, title: e.target.value })} /></div>
                <div className="form-field"><label>Linked Outcome</label>
                  <select value={outputForm.outcomeId || ''} onChange={(e) => setOutputForm({ ...outputForm, outcomeId: e.target.value })}>
                    <option value="">Optional</option>
                    {projectOutcomes.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                </div>
                <div className="form-field full"><label>Description</label><textarea rows={2} value={outputForm.description || ''} onChange={(e) => setOutputForm({ ...outputForm, description: e.target.value })} /></div>
                <div className="form-field"><label>Deliverable</label><input value={outputForm.deliverable || ''} onChange={(e) => setOutputForm({ ...outputForm, deliverable: e.target.value })} /></div>
                <div className="form-field"><label>Due Date</label><input type="date" value={outputForm.dueDate || ''} onChange={(e) => setOutputForm({ ...outputForm, dueDate: e.target.value })} /></div>
                <div className="form-field"><label>Status</label><select value={outputForm.status} onChange={(e) => setOutputForm({ ...outputForm, status: e.target.value })}>{OUTPUT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                <div className="form-field"><label>Target Qty</label><input type="number" value={outputForm.targetQty} onChange={(e) => setOutputForm({ ...outputForm, targetQty: e.target.value })} /></div>
                <div className="form-field"><label>Achieved Qty</label><input type="number" value={outputForm.achievedQty} onChange={(e) => setOutputForm({ ...outputForm, achievedQty: e.target.value })} /></div>
                <div className="form-field"><label>Progress %</label><input type="number" min="0" max="100" value={outputForm.progress} onChange={(e) => setOutputForm({ ...outputForm, progress: e.target.value })} /></div>
              </div>
              <div className="plan-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                  const payload = { ...outputForm, projectId };
                  if (outputForm.id) await onUpdateOutput?.(outputForm.id, payload);
                  else await onCreateOutput?.(payload);
                  setModal(null);
                  onRefresh?.();
                }}>Save Output</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="project-logframe-panel">
      {toolbar('+ Add Activity', () => { setActivityForm({ ...EMPTY_ACTIVITY, projectId }); setModal('activity'); })}
      <div className="plan-activity-list">
        {activities.map((a) => (
          <article key={a.id} className="plan-activity-card">
            <div className="plan-activity-head">
              <div><h3>{a.title}</h3><p>{a.outputTitle ? `Output: ${a.outputTitle}` : 'Project activity'}</p></div>
              <StatusPill status={a.status} type="activity" />
            </div>
            {a.description && <p className="plan-entity-desc">{a.description}</p>}
            <div className="plan-activity-meta">
              {a.assigneeName && <span>{a.assigneeName}</span>}
              {a.location && <span>{a.location}</span>}
              {a.endLabel && <span>{a.endLabel}</span>}
            </div>
            <ProgressBar value={a.progress} />
            <div className="plan-entity-actions">
              {(isManager || a.assigneeId === currentUserId) && (
                <button type="button" onClick={() => {
                  setActivityForm({ ...a, startDate: a.startDate?.slice(0, 10) || '', endDate: a.endDate?.slice(0, 10) || '', projectId });
                  setModal('activity');
                }}>Update</button>
              )}
              {isManager && <button type="button" className="danger" onClick={() => onDeleteActivity?.(a.id).then?.(onRefresh)}>Remove</button>}
            </div>
          </article>
        ))}
      </div>
      {!activities.length && <div className="plan-empty">No activities scheduled for this project yet.</div>}
      {modal === 'activity' && (
        <div className="plan-modal-overlay" onClick={() => setModal(null)}>
          <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{activityForm.id ? 'Update Activity' : 'Add Activity'}</h2>
            <div className="plan-form-grid">
              <div className="form-field"><label>Title *</label><input value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} disabled={!!activityForm.id && !isManager} /></div>
              <div className="form-field"><label>Linked Output</label>
                <select value={activityForm.outputId || ''} onChange={(e) => setActivityForm({ ...activityForm, outputId: e.target.value })} disabled={!!activityForm.id && !isManager}>
                  <option value="">Optional</option>
                  {projectOutputs.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
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
              <div className="form-field"><label>Status</label><select value={activityForm.status} onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}>{PLAN_ACTIVITY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div className="form-field"><label>Priority</label><select value={activityForm.priority} onChange={(e) => setActivityForm({ ...activityForm, priority: e.target.value })} disabled={!isManager}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              <div className="form-field"><label>Location</label><input value={activityForm.location || ''} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} disabled={!isManager} /></div>
              <div className="form-field"><label>Progress %</label><input type="number" min="0" max="100" value={activityForm.progress} onChange={(e) => setActivityForm({ ...activityForm, progress: e.target.value })} /></div>
              <div className="form-field full"><label>Description</label><textarea rows={2} value={activityForm.description || ''} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} disabled={!isManager} /></div>
            </div>
            <div className="plan-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="button" className="btn-primary" disabled={submitting} onClick={async () => {
                const payload = { ...activityForm, projectId };
                if (activityForm.id) await onUpdateActivity?.(activityForm.id, payload);
                else await onCreateActivity?.(payload);
                setModal(null);
                onRefresh?.();
              }}>Save Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
