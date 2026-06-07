'use client';

import { useEffect, useRef, useState } from 'react';

export default function TeamMemberSelect({ users, value = [], onChange, excludeIds = [] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const available = users.filter((u) => !excludeIds.includes(u.id));

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggleMember = (userId) => {
    const ids = value || [];
    onChange(ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]);
  };

  const removeMember = (userId) => {
    onChange((value || []).filter((id) => id !== userId));
  };

  const selectedUsers = (value || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <div className="team-member-select" ref={rootRef}>
      <button
        type="button"
        className="team-member-select-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{selectedUsers.length ? `${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} selected` : 'Select team members…'}</span>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16" className={open ? 'rotated' : ''}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="team-member-select-dropdown">
          {available.length ? available.map((u) => (
            <label key={u.id} className={`team-member-select-option${(value || []).includes(u.id) ? ' selected' : ''}`}>
              <input
                type="checkbox"
                checked={(value || []).includes(u.id)}
                onChange={() => toggleMember(u.id)}
              />
              <span className="team-member-select-name">{u.name}</span>
              <span className="team-member-select-role">{u.roleLabel || u.role}</span>
            </label>
          )) : (
            <p className="team-member-select-empty">No staff members available.</p>
          )}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="team-member-selected-tags">
          {selectedUsers.map((u) => (
            <span key={u.id} className="team-member-tag">
              {u.name}
              <button type="button" onClick={() => removeMember(u.id)} aria-label={`Remove ${u.name}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
