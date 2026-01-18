const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export const API_BASE_URL = API_BASE;

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeErrorMessage(message, status) {
  const msg = String(message || '').trim();
  if (!msg) return status ? `Request failed (${status})` : 'Terjadi kesalahan.';

  // Prisma/MySQL connection issues (avoid leaking raw prisma invocation text)
  if (msg.includes("Can't reach database server") || msg.includes('Invalid `prisma.') || msg.includes('prisma.') || /P1001\b/.test(msg)) {
    return 'Database server tidak bisa diakses. Pastikan MySQL/MariaDB berjalan di localhost:3306.';
  }

  return msg;
}

function getAccessToken() {
  return localStorage.getItem('authToken');
}

function setAccessToken(token) {
  if (!token) return;
  localStorage.setItem('authToken', token);
}

function clearAccessToken() {
  localStorage.removeItem('authToken');
}

export { clearAccessToken };

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, auth = true, headers: extraHeaders = {}, credentials = 'include' } = options;

  const headers = { ...extraHeaders };

  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers['content-type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    credentials,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = normalizeErrorMessage(data?.error?.message, res.status);
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export async function authLogin(email, password) {
  const payload = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  const token = payload?.data?.accessToken;
  if (token) setAccessToken(token);
  return payload;
}

export async function authAdminLogin(email, password) {
  const payload = await apiRequest('/auth/admin/login', { method: 'POST', body: { email, password }, auth: false });
  const token = payload?.data?.accessToken;
  if (token) setAccessToken(token);
  return payload;
}

export async function authAdminGoogle(idToken) {
  const payload = await apiRequest('/auth/admin/google', { method: 'POST', body: { idToken }, auth: false });
  const token = payload?.data?.accessToken;
  if (token) setAccessToken(token);
  return payload;
}

export async function authRefresh() {
  const payload = await apiRequest('/auth/refresh', { method: 'POST', auth: false });
  const token = payload?.data?.accessToken;
  if (token) setAccessToken(token);
  return payload;
}

export async function authLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: false });
  } finally {
    clearAccessToken();
  }
}

export async function fetchMe() {
  const payload = await apiRequest('/me', { method: 'GET' });
  return payload?.data;
}

export function hasAccessToken() {
  return !!getAccessToken();
}
