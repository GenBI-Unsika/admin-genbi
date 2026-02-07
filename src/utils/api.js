const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export const API_BASE_URL = API_BASE;

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeErrorMessage(message, status) {
  const msg = String(message || '').trim();
  if (!msg) return status ? `Request failed (${status})` : 'Terjadi kesalahan.';

  // Avoid leaking raw permission messages into UI; let the UI render a proper forbidden state.
  if (status === 403) {
    return 'Anda tidak memiliki izin untuk mengakses fitur ini.';
  }

  if (status === 401) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

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

// Generic API helpers
export async function apiGet(path) {
  const payload = await apiRequest(path, { method: 'GET' });
  return payload?.data || payload;
}

export async function apiPost(path, body) {
  const payload = await apiRequest(path, { method: 'POST', body });
  return payload?.data || payload;
}

export async function apiPatch(path, body) {
  const payload = await apiRequest(path, { method: 'PATCH', body });
  return payload?.data || payload;
}

export async function apiPut(path, body) {
  const payload = await apiRequest(path, { method: 'PUT', body });
  return payload?.data || payload;
}

export async function apiDelete(path) {
  const payload = await apiRequest(path, { method: 'DELETE' });
  return payload?.data || payload;
}

export async function apiUpload(path, file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (options.folder) formData.append('folder', options.folder);

  const payload = await apiRequest(path, { method: 'POST', body: formData });
  return payload?.data || payload;
}
