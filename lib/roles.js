/** Normalize legacy role values from existing databases. */
export function normalizeRole(role) {
  if (role === 'admin') return 'dean';
  if (role === 'manager') return 'project_manager';
  return role;
}

export const ROLE_LABELS = {
  dean: 'General Country Dean',
  project_manager: 'Project Manager',
  staff: 'Staff',
  field_worker: 'Field Worker',
  finance_team: 'Finance Team',
  program_staff: 'Program Staff',
  // legacy labels (display only)
  admin: 'General Country Dean',
  manager: 'Project Manager',
  donor: 'Donor',
};

export const ASSIGNABLE_ROLES = [
  { value: 'dean', label: 'General Country Dean' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'staff', label: 'Staff' },
];

export const STAFF_ROLES = [
  { value: 'field_worker', label: 'Field Worker' },
  { value: 'finance_team', label: 'Finance Team' },
  { value: 'program_staff', label: 'Program Staff' },
];

export function isDean(user) {
  if (!user) return false;
  return normalizeRole(user.role) === 'dean';
}

export function isProjectManagerRole(user) {
  if (!user) return false;
  return normalizeRole(user.role) === 'project_manager';
}

/** Dean or project manager role (not necessarily assigned to a project). */
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
  if (isDean(user)) return true;
  if (isProjectManagerRole(user)) return true;
  return user.staffRole === 'finance_team';
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
  if (user.role === 'staff' && user.staffRole) {
    return ROLE_LABELS[user.staffRole] || user.staffRole;
  }
  return ROLE_LABELS[normalizeRole(user.role)] || ROLE_LABELS[user.role] || user.role;
}

export function hasLeadershipRole(user) {
  const role = normalizeRole(user?.role);
  return role === 'dean' || role === 'project_manager';
}

/** Raw role values stored in DB (includes legacy aliases). */
export const LEADER_ROLE_DB_VALUES = ['dean', 'admin', 'project_manager', 'manager'];

export const MANAGER_PICKER_ROLES = ['dean', 'admin', 'project_manager', 'manager'];

export function formatUserRole(u) {
  const role = normalizeRole(u.role);
  return {
    ...u,
    role,
    roleLabel: role === 'staff' && u.staffRole
      ? (ROLE_LABELS[u.staffRole] || u.staffRole)
      : (ROLE_LABELS[role] || role),
  };
}
