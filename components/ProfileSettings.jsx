'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@/components/AuthProvider';
import { getRoleLabel } from '@/lib/roles';

const CORE_FOCUS_OPTIONS = [
  'General NGO Operations',
  'Education & Youth',
  'Health & Nutrition',
  'WASH',
  'Livelihoods',
  'Protection',
  'Emergency Response',
];

function MetaRow({ icon, label, value }) {
  return (
    <div className="profile-meta-row">
      <span className="profile-meta-icon">{icon}</span>
      <div>
        <span className="profile-meta-label">{label}</span>
        <span className="profile-meta-value">{value || '—'}</span>
      </div>
    </div>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="profile-info-tile">
      <div className="profile-info-tile-head">
        {icon}
        <span>{label}</span>
      </div>
      <p>{value || 'Not set'}</p>
    </div>
  );
}

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [countryScope, setCountryScope] = useState('');
  const [coreFocus, setCoreFocus] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const photoInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.profile();
        setProfile(data.user);
        setName(data.user.name || '');
        setEmail(data.user.email || '');
        setPhone(data.user.phone || '');
        setBio(data.user.bio || '');
        setCountryScope(data.user.countryScope || '');
        setCoreFocus(data.user.coreFocus || 'General NGO Operations');
      } catch (err) {
        toast.error(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const syncFormFromProfile = (p) => {
    setName(p.name || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setBio(p.bio || '');
    setCountryScope(p.countryScope || '');
    setCoreFocus(p.coreFocus || 'General NGO Operations');
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be 4 MB or smaller');
      return;
    }
    setUploadingPhoto(true);
    try {
      const data = await api.uploadProfileAvatar(file);
      setProfile(data.user);
      await refreshUser?.();
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        countryScope: countryScope.trim(),
        coreFocus: coreFocus.trim(),
      };
      if ((profile || user)?.role === 'admin') {
        payload.email = email.trim();
      }
      const data = await api.updateProfile(payload);
      setProfile(data.user);
      await refreshUser?.();
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await api.updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="profile-settings-loading">Loading profile…</div>;
  }

  const displayUser = profile || user;
  const roleLabel = getRoleLabel(displayUser);
  const roleBadge = roleLabel.toUpperCase();
  const isAdmin = displayUser?.role === 'admin';

  return (
    <div className="profile-settings-page">
      <div className="profile-settings-tabs">
        <button
          type="button"
          className={`profile-tab${activeTab === 'profile' ? ' active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          type="button"
          className={`profile-tab${activeTab === 'security' ? ' active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-settings-layout">
          <div className="profile-summary-card">
            <div className="profile-avatar-wrap">
              <UserAvatar user={displayUser} size="xl" />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="profile-photo-input"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className="profile-avatar-upload"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
                aria-label="Upload photo"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <h2 className="profile-summary-name">{displayUser?.name}</h2>
            <p className="profile-summary-subtitle">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              NGO Team Member
            </p>
            <span className="profile-role-badge">{roleBadge}</span>
            <div className="profile-meta-list">
              <MetaRow
                label="Country Scope"
                value={displayUser?.countryScope || 'Not set'}
                icon={(
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                )}
              />
              <MetaRow
                label="Core Focus"
                value={displayUser?.coreFocus || 'General'}
                icon={(
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                )}
              />
              <MetaRow
                label="Email"
                value={displayUser?.email}
                icon={(
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              />
            </div>
          </div>

          <div className="profile-detail-card">
            <div className="profile-detail-header">
              <div>
                <h3>NGO Staff Profile</h3>
                <p>Manage your public humanitarian directory representation.</p>
              </div>
              {!editing && (
                <button
                  type="button"
                  className="btn-secondary profile-edit-btn"
                  onClick={() => {
                    syncFormFromProfile(displayUser);
                    setEditing(true);
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                {isAdmin && (
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <span className="profile-field-hint">Administrators can update their login email here.</span>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-field">
                    <label>Display Name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251..." />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Assigned Region / Scope</label>
                    <input value={countryScope} onChange={(e) => setCountryScope(e.target.value)} placeholder="Ethiopia" />
                  </div>
                  <div className="form-field">
                    <label>Core Sector Focus</label>
                    <select value={coreFocus} onChange={(e) => setCoreFocus(e.target.value)}>
                      {CORE_FOCUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Biography / Mission Statement</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your role, expertise, and mission focus..."
                  />
                </div>
                <div className="profile-edit-actions">
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-info-grid">
                  <InfoTile
                    label="Phone Number"
                    value={displayUser?.phone}
                    icon={(
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  />
                  <InfoTile
                    label="Core Sector Focus"
                    value={displayUser?.coreFocus || 'General NGO Operations'}
                    icon={(
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    )}
                  />
                  <InfoTile
                    label="Assigned Region / Scope"
                    value={displayUser?.countryScope ? `${displayUser.countryScope} (Scoped Tenant)` : null}
                    icon={(
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                    )}
                  />
                  <InfoTile
                    label="Registered Email"
                    value={displayUser?.email}
                    icon={(
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  />
                </div>
                <div className="profile-bio-section">
                  <div className="profile-bio-head">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Biography / Mission Statement</span>
                  </div>
                  <p className="profile-bio-text">
                    {displayUser?.bio || "This team member has not written a bio yet. Click 'Edit Profile' to define your bio and mission statement."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="profile-security-card settings-card">
          <div className="settings-card-title">Change Password</div>
          <p className="profile-settings-hint">
            Use a strong password with at least 8 characters.
            {isAdmin && ' You can also update your login email from the Profile tab.'}
          </p>
          <form onSubmit={handleSavePassword}>
            <div className="form-field">
              <label>Current Password</label>
              <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>New Password</label>
                <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div className="form-field">
                <label>Confirm New Password</label>
                <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
