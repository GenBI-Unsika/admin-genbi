const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export const API_BASE_URL = API_BASE;

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Bikin pesan error jadi lebih ramah buat dibaca user (error teknis disembunyikan)
function normalizeErrorMessage(message, status) {
  const msg = String(message || '').trim();
  if (!msg) return 'Terjadi kesalahan. Silakan coba lagi.';
  const lower = msg.toLowerCase();

  const isInternalError =
    lower.includes("can't reach database server") ||
    lower.includes('p1001') ||
    lower.includes('localhost:3306') ||
    lower.includes('127.0.0.1:3306') ||
    lower.includes('econnrefused') ||
    lower.includes('prisma') ||
    lower.includes('mysql') ||
    lower.includes('mariadb') ||
    lower.includes('invalid `prisma') ||
    lower.includes('internal server error') ||
    lower.includes('syntax error') ||
    lower.includes('undefined') ||
    lower.includes('null pointer') ||
    lower.includes('stack trace') ||
    lower.includes('at line') ||
    lower.includes('fetch failed') ||
    lower.includes('network error');

  if (isInternalError) {
    if (isDev) { /* API Error - Hidden */ }
    return 'Terjadi gangguan pada sistem. Hubungi tim teknis jika masalah berlanjut.';
  }

  if (status === 500) {
    if (isDev) { /* 500 Error */ }
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'Layanan sedang tidak tersedia. Silakan coba lagi beberapa saat.';
  }

  if (status === 404) {
    return 'Data yang Anda cari tidak ditemukan.';
  }

  if (status === 403) {
    return 'Anda tidak memiliki izin untuk mengakses fitur ini.';
  }

  if (status === 401) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

  if (status === 400) {
    if (lower.includes('validation') || lower.includes('wajib') || lower.includes('harus') || lower.includes('tidak valid')) {
      return msg;
    }
    return 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
  }

  if (status === 409) {
    return msg || 'Data sudah ada (duplikat).';
  }

  const looksUserFriendly = !lower.includes('error') && !lower.includes('exception') && !lower.includes('failed') && msg.length < 200;

  if (looksUserFriendly) {
    return msg;
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
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

// Upload file ke tempat sementara buat preview (bakal ilang setelah 30 menit kalau nggak disave max)
export async function apiUploadStaging(file) {
  const formData = new FormData();
  formData.append('file', file);

  const payload = await apiRequest('/files/staging', { method: 'POST', body: formData });
  return payload?.data || payload;
}

// Simpan permanen file yang ada di tempat sementara ke Google Drive
export async function apiFinalizeUpload(tempId, folder) {
  const payload = await apiRequest('/files/finalize', {
    method: 'POST',
    body: { tempId, folder },
  });
  return payload?.data || payload;
}

// Simpan permanen banyak file sekaligus ke Google Drive
export async function apiFinalizeBulkUpload(files) {
  const payload = await apiRequest('/files/finalize-bulk', {
    method: 'POST',
    body: { files },
  });
  return payload?.data || payload;
}

// Hapus file dari tempat sementara
export async function apiDeleteStaging(tempId) {
  const payload = await apiRequest(`/files/temp/${tempId}`, { method: 'DELETE' });
  return payload?.data || payload;
}

// Ambil URL buat lihat preview file yang masih sementara
export function getTempPreviewUrl(tempId) {
  return apiUrl(`/files/temp/${tempId}`);
}

// Ambil URL publik yang aman buat nampilin file permanen
export function getPublicFileUrl(fileId) {
  if (!fileId) return '';
  return apiUrl(`/files/${fileId}/public`);
}

// Cek apakah URL ini tuh URL proxy publik atau bukan
export function isPublicFileUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\/api\/v1\/files\/\d+\/public/.test(url);
}

// Bikin URL file jadi rapi dan siap ditampilin (ubah path relatif jadi absolut)
export function normalizeFileUrl(url) {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/api/v1/files/') && url.includes('/public')) {
    return apiUrl(url.replace('/api/v1', ''));
  }

  if (url.startsWith('/api/v1/')) {
    return apiUrl(url.replace('/api/v1', ''));
  }

  if (url.includes('/files/temp/')) {
    return apiUrl(url.startsWith('/') ? url : `/${url}`);
  }

  return url;
}
