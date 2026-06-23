import { withAuth } from './middleware';
import { isDean, isProjectManager, canManageBudget } from './roles';

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
  if (auth.error) return { error: error(auth.error, auth.status || 401) };
  return { user: auth.user };
}

export async function requireRole(req, ...roles) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (!roles.includes(auth.user.role)) {
    return { error: error('Forbidden', 403) };
  }
  return { user: auth.user };
}

export async function requireManager(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (!isProjectManager(auth.user)) {
    return { error: error('Forbidden — manager access required', 403) };
  }
  return { user: auth.user };
}

export async function requireDean(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (!isDean(auth.user)) {
    return { error: error('Forbidden — dean access required', 403) };
  }
  return { user: auth.user };
}

export async function requireBudgetAccess(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (!canManageBudget(auth.user)) {
    return { error: error('Forbidden — budget access required', 403) };
  }
  return { user: auth.user };
}

export async function requireAdmin(req) {
  return requireDean(req);
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
  return `ETB ${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
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
