export const ROLE_LABELS = {
  admin: 'Administrator',
  project_manager: 'Project Manager',
  manager: 'Project Manager',
  staff: 'Staff',
  field_worker: 'Field Worker',
  finance_team: 'Finance Team',
  program_staff: 'Program Staff',
  donor: 'Donor',
};

export const STAFF_ROLES = [
  { value: 'field_worker', label: 'Field Worker' },
  { value: 'finance_team', label: 'Finance Team' },
  { value: 'program_staff', label: 'Program Staff' },
];

export function isProjectManager(user) {
  if (!user) return false;
  return ['admin', 'project_manager', 'manager'].includes(user.role);
}

export function canManageUsers(user) {
  return isProjectManager(user);
}

export function canCreateProjects(user) {
  return isProjectManager(user);
}

export function canManageBudget(user) {
  if (!user) return false;
  return isProjectManager(user) || user.staffRole === 'finance_team';
}

export function getRoleLabel(user) {
  if (!user) return '';
  if (user.role === 'staff' && user.staffRole) {
    return ROLE_LABELS[user.staffRole] || user.staffRole;
  }
  return ROLE_LABELS[user.role] || user.role;
}

export function formatUserRole(u) {
  return {
    ...u,
    roleLabel: u.role === 'staff' && u.staffRole
      ? (ROLE_LABELS[u.staffRole] || u.staffRole)
      : (ROLE_LABELS[u.role] || u.role),
  };
}
