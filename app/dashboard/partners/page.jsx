'use client';

import { useState } from 'react';

export default function PartnersPage() {
  const [selectedType, setSelectedType] = useState('all');

  const partners = [
    { id: 1, name: 'African Health Foundation', type: 'Health', contact: 'John Mwangi', email: 'john@ahf.org', phone: '+254 722 123456', since: '2022' },
    { id: 2, name: 'Global Education Initiative', type: 'Education', contact: 'Sarah Johnson', email: 'sarah@gei.org', phone: '+1 202 555 0123', since: '2021' },
    { id: 3, name: 'Water for Communities', type: 'WASH', contact: 'Ahmed Hassan', email: 'ahmed@watercom.org', phone: '+256 701 234567', since: '2023' },
    { id: 4, name: 'Women Empowerment Network', type: 'Gender', contact: 'Grace Onyango', email: 'grace@wen.org', phone: '+233 24 123456', since: '2022' },
    { id: 5, name: 'Youth Development Program', type: 'Youth', contact: 'James Kipchoge', email: 'james@ydp.org', phone: '+254 703 234567', since: '2023' },
    { id: 6, name: 'Community Foundation Ltd', type: 'Donor', contact: 'Michael Brown', email: 'michael@commfound.org', phone: '+44 20 7946 0958', since: '2021' },
  ];

  const types = ['all', 'Health', 'Education', 'WASH', 'Gender', 'Youth', 'Donor'];
  
  const filteredPartners = selectedType === 'all' 
    ? partners 
    : partners.filter(p => p.type === selectedType);

  const getColorForType = (type) => {
    const colors = {
      Health: '#1a6b3c',
      Education: '#3b82f6',
      WASH: '#06b6d4',
      Gender: '#d946ef',
      Youth: '#f59e0b',
      Donor: '#8b5cf6',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <>
      <div className="page-header">
        <h1>Partners</h1>
        <p>Manage relationships with your strategic partners and stakeholders.</p>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '6px 14px',
              background: selectedType === type ? '#1a6b3c' : '#fff',
              color: selectedType === type ? '#fff' : '#6b7280',
              border: selectedType === type ? 'none' : '1px solid #e5e7eb',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {type === 'all' ? 'All Partners' : type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: getColorForType(partner.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {partner.name.charAt(0)}
              </div>
              <div
                style={{
                  background: '#e8f5ee',
                  color: '#1a6b3c',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {partner.type}
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
              {partner.name}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>
              Partner since {partner.since}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              <strong>Contact:</strong> {partner.contact}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              <strong>Email:</strong> {partner.email}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
              <strong>Phone:</strong> {partner.phone}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => alert(`Sending email to ${partner.email}`)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: '#1a6b3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Email
              </button>
              <button
                onClick={() => alert(`Calling ${partner.phone}`)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: '#f9fafb',
                  color: '#1a6b3c',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
