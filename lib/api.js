const BASE = '/api';

const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return token?.trim() || null;
}

function clearStoredToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

async function request(path, options = {}) {
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}?`));
  const token = isPublic ? null : getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Request failed' };
  }

  if (!res.ok) {
    if (res.status === 401 && !isPublic) {
      clearStoredToken();
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  dashboard: () => request('/dashboard'),
  projects: (params) => request(`/projects${params ? `?${new URLSearchParams(params)}` : ''}`),
  project: (id) => request(`/projects/${id}`),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  tasks: (params) => request(`/tasks${params ? `?${new URLSearchParams(params)}` : ''}`),
  task: (id) => request(`/tasks/${id}`),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  calendar: (year, month) => request(`/calendar?year=${year}&month=${month}`),
  createEvent: (body) => request('/calendar', { method: 'POST', body: JSON.stringify(body) }),
  budget: () => request('/budget'),
  addExpense: (body) => request('/budget', { method: 'POST', body: JSON.stringify(body) }),
  reports: (params) => request(`/reports${params ? `?${new URLSearchParams(params)}` : ''}`),
  reportsDashboard: () => request('/reports/dashboard'),
  reportsPendingCount: () => request('/reports/pending-count'),
  report: (id) => request(`/reports/${id}`),
  createReport: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
  updateReport: (id, body) => request(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  submitReport: (id) => request(`/reports/${id}/submit`, { method: 'POST' }),
  approveReport: (id, body) => request(`/reports/${id}/approve`, { method: 'POST', body: JSON.stringify(body || {}) }),
  rejectReport: (id, body) => request(`/reports/${id}/reject`, { method: 'POST', body: JSON.stringify(body) }),
  deleteReport: (id) => request(`/reports/${id}`, { method: 'DELETE' }),
  config: () => request('/config'),
  updateConfig: (body) => request('/config', { method: 'PUT', body: JSON.stringify(body) }),
  createConfigUnit: (body) => request('/config/units', { method: 'POST', body: JSON.stringify(body) }),
  deleteConfigUnit: (id) => request(`/config/units/${id}`, { method: 'DELETE' }),
  createConfigIndicator: (body) => request('/config/indicators', { method: 'POST', body: JSON.stringify(body) }),
  deleteConfigIndicator: (id) => request(`/config/indicators/${id}`, { method: 'DELETE' }),
  createConfigScope: (body) => request('/config/user-scopes', { method: 'POST', body: JSON.stringify(body) }),
  deleteConfigScope: (id) => request(`/config/user-scopes/${id}`, { method: 'DELETE' }),
  saveReportWorkflow: (body) => request('/config/report-workflow', { method: 'PUT', body: JSON.stringify(body) }),
  planning: () => request('/planning'),
  planningOutcomes: (params) => request(`/planning/outcomes${params ? `?${new URLSearchParams(params)}` : ''}`),
  createPlanningOutcome: (body) => request('/planning/outcomes', { method: 'POST', body: JSON.stringify(body) }),
  updatePlanningOutcome: (id, body) => request(`/planning/outcomes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlanningOutcome: (id) => request(`/planning/outcomes/${id}`, { method: 'DELETE' }),
  planningOutputs: (params) => request(`/planning/outputs${params ? `?${new URLSearchParams(params)}` : ''}`),
  createPlanningOutput: (body) => request('/planning/outputs', { method: 'POST', body: JSON.stringify(body) }),
  updatePlanningOutput: (id, body) => request(`/planning/outputs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlanningOutput: (id) => request(`/planning/outputs/${id}`, { method: 'DELETE' }),
  planningActivities: (params) => request(`/planning/activities${params ? `?${new URLSearchParams(params)}` : ''}`),
  createPlanningActivity: (body) => request('/planning/activities', { method: 'POST', body: JSON.stringify(body) }),
  updatePlanningActivity: (id, body) => request(`/planning/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlanningActivity: (id) => request(`/planning/activities/${id}`, { method: 'DELETE' }),
  beneficiaries: (params) => request(`/beneficiaries${params ? `?${new URLSearchParams(params)}` : ''}`),
  createBeneficiary: (body) => request('/beneficiaries', { method: 'POST', body: JSON.stringify(body) }),
  documents: (params) => request(`/documents${params ? `?${new URLSearchParams(params)}` : ''}`),
  uploadDocumentFile: async (file) => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  createDocument: (body) => request('/documents', { method: 'POST', body: JSON.stringify(body) }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  partners: (params) => request(`/partners${params ? `?${new URLSearchParams(params)}` : ''}`),
  createPartner: (body) => request('/partners', { method: 'POST', body: JSON.stringify(body) }),
  organization: () => request('/organization'),
  updateOrganization: (body) => request('/organization', { method: 'PUT', body: JSON.stringify(body) }),
  users: () => request('/users'),
  createUser: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (body) => request('/users', { method: 'PUT', body: JSON.stringify(body) }),
  activities: () => request('/activities'),
  messages: (params) => request(`/messages${params ? `?${new URLSearchParams(params)}` : ''}`),
  sendMessage: (body) => request('/messages', { method: 'POST', body: JSON.stringify(body) }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
  taskComments: (taskId) => request(`/task-comments?taskId=${taskId}`),
  postTaskComment: (body) => request('/task-comments', { method: 'POST', body: JSON.stringify(body) }),
  taskDeliverables: (taskId) => request(`/task-deliverables?taskId=${taskId}`),
  postTaskDeliverable: (body) => request('/task-deliverables', { method: 'POST', body: JSON.stringify(body) }),
  deleteTaskDeliverable: (id) => request(`/task-deliverables/${id}`, { method: 'DELETE' }),
  pins: () => request('/pins'),
  pinProject: (projectId) => request('/pins', { method: 'POST', body: JSON.stringify({ projectId }) }),
  unpinProject: (projectId) => request(`/pins?projectId=${projectId}`, { method: 'DELETE' }),
  notifications: () => request('/notifications'),
  markNotificationRead: (id) => request('/notifications', { method: 'PUT', body: JSON.stringify({ id }) }),
  markAllNotificationsRead: () => request('/notifications', { method: 'PUT', body: JSON.stringify({ markAllRead: true }) }),
  locations: (type, q) => request(`/locations?type=${type}&q=${encodeURIComponent(q || '')}`),
  auditLogs: (params) => request(`/audit-logs${params ? `?${new URLSearchParams(params)}` : ''}`),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  profile: () => request('/auth/profile'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  uploadProfileAvatar: async (file) => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/auth/profile/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  logistics: (params) => request(`/logistics${params ? `?${new URLSearchParams(params)}` : ''}`),
  createLogistics: (body) => request('/logistics', { method: 'POST', body: JSON.stringify(body) }),
  updateLogistics: (id, body) => request(`/logistics/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLogistics: (id) => request(`/logistics/${id}`, { method: 'DELETE' }),
};

export default api;
