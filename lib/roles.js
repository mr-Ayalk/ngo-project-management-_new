/** Normalize legacy role values from existing databases. */
export function normalizeRole(role) {
  if (role === 'admin') return 'dean';
  if (role === 'manager') return 'project_manager';
  return role;
}

export const ROLE_LABELS = {
  dean: 'General Country Dean',
  project_manager: 'Project Manager / Lead',
  staff: 'Staff',
  // legacy display only
  admin: 'General Country Dean',
  manager: 'Project Manager / Lead',
  donor: 'Donor',
};

/** Only three assignable roles in the system. */
export const ASSIGNABLE_ROLES = [
  { value: 'dean', label: 'General Country Dean' },
  { value: 'project_manager', label: 'Project Manager / Lead' },
  { value: 'staff', label: 'Staff' },
];

export function isDean(user) {
  if (!user) return false;
  return normalizeRole(user.role) === 'dean';
}

export function isProjectManagerRole(user) {
  if (!user) return false;
  return normalizeRole(user.role) === 'project_manager';
}

export function isProjectManager(user) {
  return isDean(user) || isProjectManagerRole(user);
}

export function canManageUsers(user) {
  return isDean(user);
}

export function canCreateProjects(user) {
  return isDean(user);
}

export function canManageBudget(user) {
  if (!user) return false;
  return isDean(user) || isProjectManagerRole(user);
}

export function canManageOrgSettings(user) {
  return isDean(user);
}

export function userLeadsProject(user, project) {
  if (!user || !project) return false;
  if (isDean(user)) return true;
  if (!isProjectManagerRole(user)) return false;
  const uid = user.id;
  return project.managerId === uid || project.leadId === uid;
}

export function getRoleLabel(user) {
  if (!user) return '';
  return ROLE_LABELS[normalizeRole(user.role)] || ROLE_LABELS[user.role] || user.role;
}

export function hasLeadershipRole(user) {
  const role = normalizeRole(user?.role);
  return role === 'dean' || role === 'project_manager';
}

export const MANAGER_PICKER_ROLES = ['dean', 'admin', 'project_manager', 'manager'];

/** Raw role values stored in DB (includes legacy aliases). */
export const LEADER_ROLE_DB_VALUES = ['dean', 'admin', 'project_manager', 'manager'];

/** Roles that may submit reports. */
export const REPORT_SUBMITTER_ROLES = ['staff', 'project_manager', 'dean'];

/** Roles that may approve reports. */
export const REPORT_APPROVER_ROLES = ['project_manager', 'dean'];

export function formatUserRole(u) {
  const role = normalizeRole(u.role);
  return {
    ...u,
    role,
    roleLabel: ROLE_LABELS[role] || role,
  };
}
