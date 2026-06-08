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

export const EMPTY_OUTCOME = { title: '', projectId: '', description: '', indicator: '', targetValue: '', baseline: '', unit: '', status: 'on-track', progress: 0 };
export const EMPTY_OUTPUT = { title: '', projectId: '', outcomeId: '', description: '', deliverable: '', targetQty: '', achievedQty: '', unit: '', dueDate: '', status: 'planned', progress: 0 };
export const EMPTY_ACTIVITY = { title: '', projectId: '', outputId: '', description: '', assigneeId: '', startDate: '', endDate: '', status: 'planned', priority: 'medium', location: '', budget: '', progress: 0 };
