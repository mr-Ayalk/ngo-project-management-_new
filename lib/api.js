const BASE = '/api';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
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
  reports: () => request('/reports'),
  createReport: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
  beneficiaries: (params) => request(`/beneficiaries${params ? `?${new URLSearchParams(params)}` : ''}`),
  createBeneficiary: (body) => request('/beneficiaries', { method: 'POST', body: JSON.stringify(body) }),
  documents: (params) => request(`/documents${params ? `?${new URLSearchParams(params)}` : ''}`),
  uploadDocumentFile: async (file) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
  taskComments: (taskId) => request(`/task-comments?taskId=${taskId}`),
  postTaskComment: (body) => request('/task-comments', { method: 'POST', body: JSON.stringify(body) }),
  pins: () => request('/pins'),
  pinProject: (projectId) => request('/pins', { method: 'POST', body: JSON.stringify({ projectId }) }),
  unpinProject: (projectId) => request(`/pins?projectId=${projectId}`, { method: 'DELETE' }),
  notifications: () => request('/notifications'),
  markNotificationRead: (id) => request('/notifications', { method: 'PUT', body: JSON.stringify({ id }) }),
  markAllNotificationsRead: () => request('/notifications', { method: 'PUT', body: JSON.stringify({ markAllRead: true }) }),
  locations: (type, q) => request(`/locations?type=${type}&q=${encodeURIComponent(q || '')}`),
  auditLogs: () => request('/audit-logs'),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

export default api;
