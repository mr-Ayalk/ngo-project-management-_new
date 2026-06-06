'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { UploadButton } from '@/lib/uploadthing';
import UserAvatar from '@/components/UserAvatar';
import { PROFILE_EMOJIS } from '@/lib/avatar';
import { useAuth } from '@/components/AuthProvider';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.profile();
        setProfile(data.user);
        setName(data.user.name || '');
        if (data.user.avatar?.startsWith('emoji:')) {
          setSelectedEmoji(data.user.avatar.slice(6));
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getUploadHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { name: name.trim() };
      if (selectedEmoji) {
        body.avatar = `emoji:${selectedEmoji}`;
      }
      const data = await api.updateProfile(body);
      setProfile(data.user);
      await refreshUser?.();
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

  const handleEmojiSelect = async (emoji) => {
    setSelectedEmoji(emoji);
    try {
      const data = await api.updateProfile({ avatar: `emoji:${emoji}` });
      setProfile(data.user);
      await refreshUser?.();
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update avatar');
    }
  };

  if (loading) {
    return <div className="profile-settings-loading">Loading profile…</div>;
  }

  const displayUser = profile || user;

  return (
    <div className="profile-settings">
      <div className="settings-card profile-card">
        <div className="settings-card-title">My Profile</div>
        <p className="profile-settings-hint">Update your display name and avatar. Email cannot be changed.</p>

        <div className="profile-avatar-section">
          <UserAvatar user={displayUser} size="lg" className="profile-avatar-preview" />
          <div className="profile-avatar-controls">
            <div className="profile-email-readonly">
              <label>Email</label>
              <input value={displayUser?.email || ''} disabled readOnly />
            </div>
            <div className="profile-upload-row">
              <UploadButton
                endpoint="profileImage"
                headers={getUploadHeaders()}
                onClientUploadComplete={async () => {
                  await refreshUser?.();
                  const data = await api.profile();
                  setProfile(data.user);
                  setSelectedEmoji(null);
                  toast.success('Photo uploaded');
                }}
                onUploadError={(err) => toast.error(err.message || 'Upload failed')}
                appearance={{
                  button: 'btn-secondary profile-upload-btn',
                  allowedContent: 'hidden',
                }}
              />
              <span className="profile-upload-hint">JPG, PNG up to 4MB</span>
            </div>
          </div>
        </div>

        <div className="profile-emoji-grid">
          <span className="profile-emoji-label">Or pick an emoji avatar</span>
          <div className="profile-emojis">
            {PROFILE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`profile-emoji-btn${selectedEmoji === emoji ? ' selected' : ''}`}
                onClick={() => handleEmojiSelect(emoji)}
                aria-label={`Avatar ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="form-field">
            <label>Display Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="settings-card profile-card">
        <div className="settings-card-title">Change Password</div>
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
    </div>
  );
}
