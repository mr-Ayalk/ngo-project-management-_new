function parseJsonArray(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function formatOrgPortal(org) {
  if (!org) return null;
  return {
    title: org.landingTitle || org.name,
    subtitle: org.landingSubtitle || org.description || '',
    tagline: org.landingTagline || '',
    mission: org.missionText || '',
    vision: org.visionText || '',
    aboutWork: org.description || '',
    strategicGoals: parseJsonArray(org.strategicGoals, []),
    primaryColor: org.primaryColor || '#2563eb',
  };
}

export function formatOutcome(o) {
  return {
    id: o.id,
    projectId: o.projectId,
    projectName: o.project?.name,
    title: o.title,
    description: o.description,
    indicator: o.indicator,
    targetValue: o.targetValue,
    baseline: o.baseline,
    unit: o.unit,
    status: o.status,
    progress: o.progress,
    outputCount: o._count?.outputs ?? o.outputs?.length ?? 0,
    createdAt: o.createdAt,
  };
}

export function formatOutput(o) {
  return {
    id: o.id,
    outcomeId: o.outcomeId,
    outcomeTitle: o.outcome?.title,
    projectId: o.projectId,
    projectName: o.project?.name,
    title: o.title,
    description: o.description,
    deliverable: o.deliverable,
    targetQty: o.targetQty,
    achievedQty: o.achievedQty,
    unit: o.unit,
    dueDate: o.dueDate,
    dueDateLabel: o.dueDate ? new Date(o.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    status: o.status,
    progress: o.progress,
    activityCount: o._count?.planActivities ?? 0,
    createdAt: o.createdAt,
  };
}

export function formatPlanActivity(a) {
  return {
    id: a.id,
    outputId: a.outputId,
    outputTitle: a.output?.title,
    projectId: a.projectId,
    projectName: a.project?.name,
    title: a.title,
    description: a.description,
    assigneeId: a.assigneeId,
    assigneeName: a.assignee?.name,
    startDate: a.startDate,
    endDate: a.endDate,
    startLabel: a.startDate ? new Date(a.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    endLabel: a.endDate ? new Date(a.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    status: a.status,
    priority: a.priority,
    location: a.location,
    budget: a.budget,
    progress: a.progress,
    createdAt: a.createdAt,
  };
}
