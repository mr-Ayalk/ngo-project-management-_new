'use client';

import { useState } from 'react';
import { REGIONS } from '@/lib/ethiopia-locations';

export default function SettingsAdminPanel({
  orgForm,
  setOrgForm,
  enabledRegions = [],
  submitting,
  onSaveDateTime,
  onSaveLocations,
  isAdmin,
}) {
  const [localRegions, setLocalRegions] = useState(null);
  const regions = localRegions ?? enabledRegions;

  if (!isAdmin) return null;

  const toggleRegion = (region) => {
    const list = regions.includes(region) ? regions.filter((r) => r !== region) : [...regions, region];
    setLocalRegions(list);
  };

  return (
    <div className="settings-admin-wrap">
      <div className="settings-row">
        <div className="settings-card">
          <div className="settings-card-title">Date &amp; Time</div>
          <p className="profile-settings-hint">Organization-wide date format, timezone, and fiscal year settings.</p>
          <div className="form-field">
            <label>Date Format</label>
            <select value={orgForm.dateFormat} onChange={(e) => setOrgForm({ ...orgForm, dateFormat: e.target.value })}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="form-field">
            <label>Timezone</label>
            <select value={orgForm.timezone} onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}>
              <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="form-field">
            <label>Fiscal Year Start</label>
            <select value={orgForm.fiscalYearStart} onChange={(e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value })}>
              {['January', 'April', 'July', 'October'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button type="button" className="btn-primary" onClick={onSaveDateTime} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Date & Time'}
          </button>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">Operating Locations</div>
          <p className="config-panel-desc">Select regions where your NGO operates. These appear in project forms, beneficiary records, and field scope filters.</p>
          <div className="config-region-grid">
            {REGIONS.map((region) => {
              const active = regions.includes(region);
              return (
                <button key={region} type="button" className={`config-region-chip${active ? ' active' : ''}`} onClick={() => toggleRegion(region)}>
                  {region}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: '16px' }} disabled={submitting} onClick={() => onSaveLocations(regions)}>
            {submitting ? 'Saving…' : 'Save Locations'}
          </button>
        </div>
      </div>
    </div>
  );
}
