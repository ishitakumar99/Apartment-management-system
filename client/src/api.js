// In development, Vite proxies /api to localhost:5000.
// In production, set VITE_API_URL to your backend URL, e.g. https://smart-society-api.onrender.com
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(method, path, body) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b || {}),
  put: (p, b) => request('PUT', p, b || {}),
  del: (p) => request('DELETE', p),
};
