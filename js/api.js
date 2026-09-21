const API_BASE = (globalThis.ARCADE_API_BASE || '').replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, ...options });
  let payload = null;
  try { payload = await response.json(); } catch { /* empty response */ }
  if (!response.ok) { const error = new Error(payload?.error || `Request failed (${response.status})`); error.status = response.status; error.fields = payload?.fields || {}; throw error; }
  return payload;
}

export const getGames = () => apiRequest('/api/games');
export const getGame = slug => apiRequest(`/api/games/${encodeURIComponent(slug)}`);
export const login = credentials => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' });
export const getAdmin = () => apiRequest('/api/admin/me');
export const getAdminGames = () => apiRequest('/api/admin/games');
export const getStats = () => apiRequest('/api/admin/stats');
export const createGame = game => apiRequest('/api/admin/games', { method: 'POST', body: JSON.stringify(game) });
export const updateGame = (id, game) => apiRequest(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(game) });
export const setPublished = (id, published) => apiRequest(`/api/admin/games/${encodeURIComponent(id)}/${published ? 'publish' : 'unpublish'}`, { method: 'POST' });
export const deleteGame = id => apiRequest(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'DELETE' });
