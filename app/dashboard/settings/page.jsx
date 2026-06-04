'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [formData, setFormData] = useState({
    orgName: 'Engage Now Africa',
    orgEmail: 'info@engagenow.org',
    orgPhone: '+254 702 123456',
    orgLocation: 'Nairobi, Kenya',
    orgDescription: 'Leading NGO focused on community development and sustainable impact.',
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'Ayalkbet Teketel', email: 'ayalkbet@bamah.com', role: 'admin', status: 'active', joinedDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@engagenow.org', role: 'manager', status: 'active', joinedDate: '2023-05-20' },
    { id: 3, name: 'James Kipchoge', email: 'james.k@engagenow.org', role: 'staff', status: 'active', joinedDate: '2023-08-10' },
    { id: 4, name: 'Ruth Mwangi', email: 'ruth.m@engagenow.org', role: 'staff', status: 'active', joinedDate: '2023-09-15' },
    { id: 5, name: 'Samuel Oduor', email: 'samuel.o@engagenow.org', role: 'donor', status: 'inactive', joinedDate: '2023-02-28' },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    alert('Organization settings saved successfully!');
  };

  const handleRemoveUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    alert('User removed successfully!');
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert('User role updated successfully!');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#1a6b3c',
      manager: '#3b82f6',
      staff: '#f59e0b',
      donor: '#8b5cf6',
    };
    return colors[role] || '#6b7280';
  };

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage organization and user settings.</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('organization')}
            style={{
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === 'organization' ? '#1a6b3c' : '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'organization' ? '2px solid #1a6b3c' : 'none',
              marginBottom: -1,
            }}
          >
            Organization
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === 'users' ? '#1a6b3c' : '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'users' ? '2px solid #1a6b3c' : 'none',
              marginBottom: -1,
            }}
          >
            Users & Roles
          </button>
        </div>
      </div>

      {activeTab === 'organization' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Organization Details</span>
          </div>
          <form style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Organization Name
              </label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                name="orgEmail"
                value={formData.orgEmail}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="orgPhone"
                value={formData.orgPhone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Location
              </label>
              <input
                type="text"
                name="orgLocation"
                value={formData.orgLocation}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                name="orgDescription"
                value={formData.orgDescription}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  minHeight: 100,
                  resize: 'vertical',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '8px 20px',
                background: '#1a6b3c',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Users & Roles</span>
            <button
              onClick={() => alert('Add new user functionality coming soon!')}
              style={{
                padding: '6px 14px',
                background: '#1a6b3c',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              + Add User
            </button>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Joined</th>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 0', fontSize: 12, color: '#111827', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 0', fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '12px 0' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          border: '1px solid #e5e7eb',
                          borderRadius: 6,
                          background: '#fff',
                          cursor: 'pointer',
                          color: '#374151',
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="donor">Donor</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: u.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: u.status === 'active' ? '#166534' : '#6b7280',
                      }}>
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 12, color: '#6b7280' }}>
                      {new Date(u.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        style={{
                          padding: '4px 10px',
                          background: 'none',
                          color: '#ef4444',
                          border: 'none',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
