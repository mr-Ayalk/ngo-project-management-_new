import { withAuth } from './middleware';

export function json(data, status = 200) {
  return Response.json(data, { status });
}

export function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function parseBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function requireAuth(req) {
  const auth = await withAuth(req);
  if (auth.error) return auth;
  return { user: auth.user };
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMonthYear(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AVATAR_COLORS = ['#1a6b3c', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
