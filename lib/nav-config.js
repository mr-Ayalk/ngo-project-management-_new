import { REPORT_TYPES } from '@/lib/report-types';
import { isDean } from '@/lib/roles';

export const NAV_CATEGORIES = [
  { id: 'home', label: 'Home', defaultPage: 'dashboard' },
  { id: 'programs', label: 'Programs', defaultPage: 'projects' },
  { id: 'reports', label: 'Reports', defaultPage: 'reports-daily' },
  { id: 'operations', label: 'Operations', defaultPage: 'beneficiaries' },
  { id: 'admin', label: 'Admin', defaultPage: 'settings' },
];

export function getCategoryForPage(pageId) {
  if (!pageId) return 'home';
  if (pageId === 'dashboard') return 'home';
  if (['projects', 'calendar', 'budget', 'units', 'indicators', 'reports-overview'].includes(pageId)) {
    return 'programs';
  }
  if (pageId.startsWith('reports-')) return 'reports';
  if (['beneficiaries', 'partners', 'documents', 'logistics', 'messages'].includes(pageId)) {
    return 'operations';
  }
  if (['staff-management', 'audit-log', 'settings', 'help'].includes(pageId)) return 'admin';
  return 'home';
}

export function buildSidebarItems(user, { canManageUsers: canManage }) {
  const programs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'home' },
    { id: 'projects', label: 'Projects', icon: 'projects', category: 'programs' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', category: 'programs' },
    { id: 'budget', label: 'Budget', icon: 'budget', category: 'programs' },
    { id: 'units', label: 'Units', icon: 'units', category: 'programs' },
    { id: 'indicators', label: 'Indicators', icon: 'indicators', category: 'programs' },
    { id: 'reports-overview', label: 'M&E Module', icon: 'me', category: 'programs' },
  ];

  const reportItems = REPORT_TYPES.map((t) => ({
    id: `reports-${t.value}`,
    label: t.shortLabel,
    icon: 'reports',
    category: 'reports',
    group: 'reports',
  }));

  const reports = [
    { id: 'reports-approval', label: 'Reports Approval', icon: 'approval', category: 'reports' },
    ...reportItems,
  ];

  const operations = [
    { id: 'beneficiaries', label: 'Beneficiaries', icon: 'beneficiaries', category: 'operations' },
    { id: 'partners', label: 'Partners', icon: 'partners', category: 'operations' },
    { id: 'documents', label: 'Documents', icon: 'documents', category: 'operations' },
    { id: 'logistics', label: 'Logistics', icon: 'logistics', category: 'operations' },
    { id: 'messages', label: 'Inbox', icon: 'messages', category: 'operations' },
  ];

  const admin = [
    ...(canManage ? [{ id: 'staff-management', label: 'Staff Management', icon: 'staff', category: 'admin' }] : []),
    ...(isDean(user) ? [{ id: 'audit-log', label: 'Audit Log', icon: 'reports', category: 'admin' }] : []),
    { id: 'settings', label: 'Settings', icon: 'settings', category: 'admin' },
  ];

  return { programs, reports, operations, admin, all: [...programs, ...reports, ...operations, ...admin] };
}
