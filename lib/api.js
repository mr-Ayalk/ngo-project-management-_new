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
  budget: () => request('/budget'),
  reports: () => request('/reports'),
  beneficiaries: (params) => request(`/beneficiaries${params ? `?${new URLSearchParams(params)}` : ''}`),
  documents: (params) => request(`/documents${params ? `?${new URLSearchParams(params)}` : ''}`),
  partners: (params) => request(`/partners${params ? `?${new URLSearchParams(params)}` : ''}`),
  organization: () => request('/organization'),
  updateOrganization: (body) => request('/organization', { method: 'PUT', body: JSON.stringify(body) }),
  users: () => request('/users'),
  updateUser: (body) => request('/users', { method: 'PUT', body: JSON.stringify(body) }),
  messages: () => request('/messages'),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

export default api;
