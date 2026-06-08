export const PLANNING_PAGES = [
  { id: 'planning-outcomes', label: 'Outcomes', icon: 'outcomes', description: 'Long-term changes your NGO aims to achieve for communities.' },
  { id: 'planning-outputs', label: 'Outputs', icon: 'outputs', description: 'Deliverables and tangible results that lead to outcomes.' },
  { id: 'planning-activities', label: 'Activities', icon: 'activities', description: 'Field actions, workshops, and operational work packages.' },
  { id: 'planning-my-activities', label: 'My Activities', icon: 'my-activities', description: 'Activities assigned to you across all programs.' },
];

export function isPlanningPage(pageId) {
  return pageId === 'planning' || pageId?.startsWith('planning-');
}

export function getPlanningPageMeta(pageId) {
  if (pageId === 'planning') {
    return { id: 'planning', label: 'Planning Module', description: 'Mission control for your LogFrame — projects, outcomes, outputs, and activities.' };
  }
  return PLANNING_PAGES.find((p) => p.id === pageId) || null;
}

export const OUTCOME_STATUSES = [
  { value: 'on-track', label: 'On Track' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' },
];

export const OUTPUT_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
];

export const PLAN_ACTIVITY_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];
