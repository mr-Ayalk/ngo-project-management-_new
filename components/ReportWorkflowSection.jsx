'use client';

import { useState } from 'react';
import { REPORT_TYPES } from '@/lib/report-types';

const WORKFLOW_ROLES = [
  { value: 'staff', label: 'Staff', hint: 'General NGO staff' },
  { value: 'field_worker', label: 'Field Worker', hint: 'Frontline / community staff' },
  { value: 'program_staff', label: 'Program Staff', hint: 'Program officers & coordinators' },
  { value: 'finance_team', label: 'Finance Team', hint: 'Finance & grants staff' },
  { value: 'manager', label: 'Project Manager', hint: 'Managers who oversee projects', aliases: ['project_manager'] },
  { value: 'dean', label: 'General Country Dean', hint: 'Ultimate organizational authority', aliases: ['admin'] },
];

function expandWorkflowRoles(roles) {
  const set = new Set(roles.filter((r) => r !== 'project_manager'));
  if (set.has('manager')) set.add('project_manager');
  if (set.has('dean')) set.add('admin');
  if (set.has('admin')) set.add('dean');
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
  keys.forEach((k) => { if (isOn) next.delete(k); else next.add(k); });
  return [...next];
}

function normalizeWorkflowRolesForCompare(roles) {
  return expandWorkflowRoles(roles).sort().join(',');
}

function formatRoleList(roles) {
  return WORKFLOW_ROLES.filter((r) => hasWorkflowRole(roles, r.value)).map((r) => r.label).join(', ') || 'None selected';
}

function WorkflowRoleChips({ selected, onChange, variant }) {
  return (
    <div className="workflow-role-chips" role="group">
      {WORKFLOW_ROLES.map((role) => {
        const active = hasWorkflowRole(selected, role.value);
        return (
          <button key={role.value} type="button" className={`workflow-role-chip ${variant}${active ? ' active' : ''}`} title={role.hint} aria-pressed={active} onClick={() => onChange(toggleWorkflowRole(selected, role.value))}>
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
            <div><strong>Reporters</strong><span>Who can create &amp; submit this report</span></div>
          </div>
          <WorkflowRoleChips variant="reporter" selected={submitterRoles} onChange={(roles) => patchRule({ submitterRoles: roles })} />
        </section>
        <div className="workflow-flow-arrow" aria-hidden="true">
          <span>submits to</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </div>
        <section className="workflow-role-section">
          <div className="workflow-role-heading">
            <span className="workflow-role-icon approver">2</span>
            <div><strong>Approvers</strong><span>Who can review in Reports Approval</span></div>
          </div>
          <WorkflowRoleChips variant="approver" selected={approverRoles} onChange={(roles) => patchRule({ approverRoles: roles })} />
        </section>
      </div>
      <footer className="workflow-rule-footer">
        <p className="workflow-summary"><strong>Summary:</strong> {formatRoleList(submitterRoles)} submit → {formatRoleList(approverRoles)} approve</p>
        <button type="button" className={isDirty ? 'btn-primary' : 'btn-secondary'} disabled={submitting || !isDirty} onClick={() => onSave({ reportType: rule.reportType, submitterRoles: expandWorkflowRoles(submitterRoles), approverRoles: expandWorkflowRoles(approverRoles) })}>
          {isDirty ? 'Save changes' : 'Saved'}
        </button>
      </footer>
    </article>
  );
}

export default function ReportWorkflowSection({ reportWorkflow = [], submitting, onSave }) {
  const [workflowEdits, setWorkflowEdits] = useState({});

  return (
    <div className="settings-card staff-section">
      <div className="settings-card-title">Reporter–Approver Workflow</div>
      <p className="config-panel-desc">Define which roles can submit and approve each report type.</p>
      <div className="workflow-rules">
        {reportWorkflow.map((rule) => (
          <WorkflowRuleCard key={rule.reportType} rule={rule} workflowEdits={workflowEdits} setWorkflowEdits={setWorkflowEdits} submitting={submitting} onSave={onSave} />
        ))}
      </div>
    </div>
  );
}
