'use client';

import { useMemo, useState } from 'react';
import { REGIONS, getZonesForRegion } from '@/lib/ethiopia-locations';
import { ASSIGNABLE_ROLES } from '@/lib/roles';
import ReportWorkflowSection from '@/components/ReportWorkflowSection';

function ScopeTable({ head, children, empty }) {
  if (empty) return <div className="config-empty">{empty}</div>;
  return (
    <div className="config-table">
      <div className="config-table-head">{head.map((h) => <span key={h}>{h}</span>)}</div>
      {children}
    </div>
  );
}

export default function StaffManagementPage({
  users = [],
  configData,
  loading,
  canManage,
  submitting,
  newStaffForm,
  setNewStaffForm,
  onAddStaff,
  onEditUser,
  onCreateScope,
  onDeleteScope,
  onSaveWorkflow,
}) {
  const [scopeForm, setScopeForm] = useState({ userId: '', region: '', zone: '', woreda: '', kebele: '' });
  const zoneOptions = useMemo(() => getZonesForRegion(scopeForm.region), [scopeForm.region]);

  if (loading && !users.length && !configData) {
    return (
      <div className="page-loading">
        <div className="login-spinner" />
        <span>Loading staff…</span>
      </div>
    );
  }

  if (!canManage) {
    return (
      <>
        <div className="page-header">
          <h1>Staff Management</h1>
          <p>View and manage NGO staff accounts, roles, and field assignments.</p>
        </div>
        <div className="config-access-note">
          Staff management requires administrator or project manager access.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header page-header-row">
        <div>
          <h1>Staff Management</h1>
          <p>Add, update, and remove staff accounts, assign roles, and configure report workflows and field scopes.</p>
        </div>
      </div>

      <div className="settings-admin-wrap">
        <div className="settings-row">
          <div className="settings-card">
            <div className="settings-card-title">Add Staff Member</div>
            <form onSubmit={onAddStaff}>
              <div className="form-row">
                <div className="form-field"><label>Name *</label><input required value={newStaffForm.name} onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })} /></div>
                <div className="form-field"><label>Email *</label><input required type="email" value={newStaffForm.email} onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Password *</label><input required type="password" value={newStaffForm.password} onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })} /></div>
                <div className="form-field">
                  <label>Role *</label>
                  <select value={newStaffForm.role} onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}>
                    {ASSIGNABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Staff'}</button>
            </form>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">All Staff</div>
            <div className="settings-users-table staff-users-table">
              <div className="settings-users-head"><span>NAME</span><span>EMAIL</span><span>ROLE</span><span>STATUS</span></div>
              {users.map((u) => (
                <div key={u.id} className="settings-users-row staff-users-row" onClick={() => onEditUser?.(u)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onEditUser?.(u)}>
                  <span>{u.name}</span>
                  <span className="staff-email">{u.email}</span>
                  <span className="settings-role">{u.roleLabel}</span>
                  <span className={u.isActive ? 'settings-active' : 'settings-inactive'}>{u.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {configData?.reportWorkflow && (
          <ReportWorkflowSection
            reportWorkflow={configData.reportWorkflow}
            submitting={submitting}
            onSave={onSaveWorkflow}
          />
        )}

        <div className="settings-card staff-section">
          <div className="settings-card-title">User–Woreda Mapping</div>
          <p className="config-panel-desc">Assign staff to regions, zones, and woredas for scoped field access and reporting.</p>
          <div className="config-form-grid">
            <div className="form-field">
              <label>Staff member</label>
              <select value={scopeForm.userId} onChange={(e) => setScopeForm({ ...scopeForm, userId: e.target.value })}>
                <option value="">Select staff member…</option>
                {(configData?.users || users).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
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
            await onCreateScope?.(scopeForm);
            setScopeForm({ userId: '', region: '', zone: '', woreda: '', kebele: '' });
          }}>Add Mapping</button>

          <ScopeTable head={['Staff', 'Region', 'Zone', 'Woreda', 'Kebele', '']} empty={!configData?.userScopes?.length ? 'No field scope mappings yet.' : null}>
            {configData?.userScopes?.map((s) => (
              <div key={s.id} className="config-table-row scopes">
                <span>{s.userName}</span>
                <span>{s.region || '—'}</span>
                <span>{s.zone || '—'}</span>
                <span>{s.woreda || '—'}</span>
                <span>{s.kebele || '—'}</span>
                <span><button type="button" className="config-link-danger" onClick={() => onDeleteScope?.(s.id)}>Remove</button></span>
              </div>
            ))}
          </ScopeTable>
        </div>
      </div>
    </>
  );
}
