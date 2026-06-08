export const CONFIG_PAGES = [
  { id: 'config-units', label: 'Unit', description: 'Organizational units, program areas, and operational divisions.' },
  { id: 'config-indicators', label: 'Indicators', description: 'M&E indicators, targets, and measurement frameworks.' },
  { id: 'config-locations', label: 'Location', description: 'Active regions, zones, and field operation geography.' },
  { id: 'config-reporter-approver', label: 'Reporter–Approver', description: 'Choose which staff roles can submit reports and which roles can approve them.' },
  { id: 'config-user-woreda', label: 'User–Woreda Mapping', description: 'Assign staff to regions, woredas, and field scopes.' },
  { id: 'config-landing', label: 'Landing Page', description: 'Welcome banner, mission, vision, and portal messaging.' },
  { id: 'config-dashboard', label: 'Dashboard', description: 'Default widgets and KPI visibility for leadership.' },
  { id: 'config-colors', label: 'Brand Colors', description: 'Primary and accent colors for the workspace.' },
  { id: 'config-datetime', label: 'Date & Time', description: 'Timezone, date format, and fiscal year settings.' },
];

export const CONFIG_EXTRA = [];

export function isConfigPage(pageId) {
  return pageId?.startsWith('config-');
}

export function getConfigPageMeta(pageId) {
  return CONFIG_PAGES.find((p) => p.id === pageId) || null;
}
