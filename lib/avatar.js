export function parseAvatar(avatar) {
  if (!avatar) return { type: 'initials' };
  if (avatar.startsWith('emoji:')) {
    return { type: 'emoji', value: avatar.slice(6) };
  }
  return { type: 'image', value: avatar };
}

export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const PROFILE_EMOJIS = ['😊', '🎯', '🌍', '💼', '📋', '🚀', '⭐', '🤝', '💡', '📊', '🏥', '📚', '💧', '🛡️', '🌱', '✨'];
