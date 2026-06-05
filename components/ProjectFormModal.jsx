'use client';

import Modal from '@/components/Modal';
import AutocompleteInput from '@/components/AutocompleteInput';
import {
  REGIONS, ZONES, TOWNS, KEBELES, WOREDAS, WOREDA_BUDGETS,
  LOCATION_TYPES, formatBudgetInput, parseBudgetInput,
} from '@/lib/ethiopia-locations';
export const EMPTY_PROJECT_FORM = {
  name: '', description: '', status: 'on-track', icon: 'green',
  budget: '', income: '', startDate: '', endDate: '',
  donor: '', donorName: '', managerId: '', leadId: '',
  assumptions: '', risks: '', indicators: '', outcomes: '',
  mitigationStrategies: '', locationType: '',
  region: '', zone: '', town: '', kebele: '', woreda: '',
  woredaBudget: '', memberIds: [],
};

export default function ProjectFormModal({
  open, form, setForm, users, onSubmit, onClose, submitting, isManager,
}) {
  const managerUsers = users.filter((u) => ['admin', 'manager', 'project_manager'].includes(u.role));

  const toggleMember = (userId) => {
    const ids = form.memberIds || [];
    setForm({
      ...form,
      memberIds: ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    });
  };

  const handleWoredaSelect = (woreda) => {
    const budgetEntry = WOREDA_BUDGETS.find((w) => w.woreda === woreda);
    setForm({
      ...form,
      woreda,
      woredaBudget: budgetEntry ? formatBudgetInput(budgetEntry.budget) : form.woredaBudget,
    });
  };

  return (
    <Modal open={open} title={form.id ? 'Edit Project' : 'New Project'} onClose={onClose} width={920}>
      <form onSubmit={onSubmit}>
        <div className="project-form-section">
          <h4 className="form-section-title">Basic Information</h4>
          <div className="form-row">
            <div className="form-field"><label>Project Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
          <div className="form-field"><label>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field">
              <label>Budget (ETB) *</label>
              <input
                required
                value={form.budget}
                placeholder="1,000,000"
                onChange={(e) => setForm({ ...form, budget: formatBudgetInput(e.target.value) })}
              />
            </div>
            <div className="form-field">
              <label>Income (ETB)</label>
              <input
                value={form.income}
                placeholder="500,000"
                onChange={(e) => setForm({ ...form, income: formatBudgetInput(e.target.value) })}
              />
            </div>
            <div className="form-field">
              <label>Donor Name</label>
              <input value={form.donorName || form.donor} onChange={(e) => setForm({ ...form, donorName: e.target.value, donor: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Start Date *</label><input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="form-field"><label>End Date *</label><input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="form-field">
              <label>Icon Color</label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                <option value="green">Green</option><option value="blue">Blue</option>
                <option value="amber">Amber</option><option value="red">Red</option>
              </select>
            </div>
          </div>
        </div>

        <div className="project-form-section">
          <h4 className="form-section-title">Team Assignment</h4>
          <div className="form-row">
            <div className="form-field">
              <label>Project Manager *</label>
              <select required value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
                {managerUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Project Lead</label>
              <select value={form.leadId || ''} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
                <option value="">Same as Manager</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Team Members</label>
            <div className="team-member-picker">
              {users.filter((u) => u.id !== form.managerId).map((u) => (
                <label key={u.id} className={`team-member-chip${(form.memberIds || []).includes(u.id) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={(form.memberIds || []).includes(u.id)} onChange={() => toggleMember(u.id)} />
                  <span>{u.name}</span>
                  <small>{u.roleLabel || u.role}</small>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="project-form-section">
          <h4 className="form-section-title">Location & Site</h4>
          <div className="form-row">
            <div className="form-field">
              <label>Location Type</label>
              <select value={form.locationType || ''} onChange={(e) => setForm({ ...form, locationType: e.target.value })}>
                <option value="">Select type...</option>
                {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row form-row-3">
            <AutocompleteInput label="Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} options={REGIONS} placeholder="e.g. Addis Ababa" />
            <AutocompleteInput label="Zone" value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} options={ZONES} placeholder="e.g. East Shewa" />
            <AutocompleteInput label="Town / City" value={form.town} onChange={(v) => setForm({ ...form, town: v })} options={TOWNS} placeholder="e.g. Adama" />
          </div>
          <div className="form-row form-row-3">
            <AutocompleteInput label="Woreda" value={form.woreda} onChange={(v) => setForm({ ...form, woreda: v })} onSelect={handleWoredaSelect} options={WOREDAS} placeholder="e.g. Bole" />
            <AutocompleteInput label="Kebele" value={form.kebele} onChange={(v) => setForm({ ...form, kebele: v })} options={KEBELES} placeholder="e.g. Kebele 03" />
            <div className="form-field">
              <label>Donor Budget (Woreda)</label>
              <input
                value={form.woredaBudget}
                placeholder="Auto-filled from woreda"
                onChange={(e) => setForm({ ...form, woredaBudget: formatBudgetInput(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="project-form-section">
          <h4 className="form-section-title">Planning & Outcomes</h4>
          <div className="form-row">
            <div className="form-field"><label>Project Assumptions</label><textarea rows={2} value={form.assumptions} onChange={(e) => setForm({ ...form, assumptions: e.target.value })} placeholder="Key assumptions for project success..." /></div>
            <div className="form-field"><label>Project Risks</label><textarea rows={2} value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Identified risks and concerns..." /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Indicators</label><textarea rows={2} value={form.indicators} onChange={(e) => setForm({ ...form, indicators: e.target.value })} placeholder="Measurable indicators (e.g. # children enrolled, attendance rate)..." /></div>
            <div className="form-field"><label>Outcomes</label><textarea rows={2} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} placeholder="Expected outcomes and impact..." /></div>
          </div>
          <div className="form-field">
            <label>Outcome Mapping — Mitigation Strategies</label>
            <textarea rows={3} value={form.mitigationStrategies} onChange={(e) => setForm({ ...form, mitigationStrategies: e.target.value })} placeholder="Link risks to mitigation strategies and expected outcomes..." />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          {isManager && (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : form.id ? 'Update Project' : 'Create Project'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

export { parseBudgetInput };
