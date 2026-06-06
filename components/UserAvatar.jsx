'use client';

import { getInitials, parseAvatar } from '@/lib/avatar';

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const name = user?.name || '';
  const parsed = parseAvatar(user?.avatar);
  const sizeClass = size === 'lg' ? 'avatar lg' : size === 'sm' ? 'avatar sm' : 'avatar';

  if (parsed.type === 'emoji') {
    return (
      <div className={`${sizeClass} avatar-emoji ${className}`} aria-hidden="true">
        {parsed.value}
      </div>
    );
  }

  if (parsed.type === 'image') {
    return (
      <div className={`${sizeClass} avatar-image-wrap ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={parsed.value} alt={name} className="avatar-image" />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className}`} aria-hidden="true">
      {getInitials(name)}
    </div>
  );
}
