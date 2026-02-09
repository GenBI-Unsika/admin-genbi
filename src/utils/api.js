const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export const API_BASE_URL = API_BASE;

// Environment check - only show technical errors in development
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Normalize error messages for user display
 * Technical errors are hidden from users in production
 * Admin users get slightly more detail but still no raw technical errors
 */
function normalizeErrorMessage(message, status) {
  const msg = String(message || '').trim();
  if (!msg) return 'Terjadi kesalahan. Silakan coba lagi.';
  const lower = msg.toLowerCase();

  // === INTERNAL/TECHNICAL ERRORS - Never show to users ===
  const isInternalError =
    // Database errors
    lower.includes("can't reach database server") ||
    lower.includes('p1001') ||
    lower.includes('localhost:3306') ||
    lower.includes('127.0.0.1:3306') ||
    lower.includes('econnrefused') ||
    lower.includes('prisma') ||
    lower.includes('mysql') ||
    lower.includes('mariadb') ||
    lower.includes('invalid `prisma') ||
    // Server errors
    lower.includes('internal server error') ||
    lower.includes('syntax error') ||
    lower.includes('undefined') ||
    lower.includes('null pointer') ||
    lower.includes('stack trace') ||
    lower.includes('at line') ||
    // Network errors
    lower.includes('fetch failed') ||
    lower.includes('network error');

  if (isInternalError) {
    // Log for debugging (only visible in dev tools)
    if (isDev) console.error('[API Error - Hidden from UI]:', msg);
    return 'Terjadi gangguan pada sistem. Hubungi tim teknis jika masalah berlanjut.';
  }

  // === HTTP STATUS BASED MESSAGES ===
  if (status === 500) {
    if (isDev) console.error('[500 Error]:', msg);
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
    // Bad request might have user-relevant validation messages
    if (lower.includes('validation') || lower.includes('wajib') || lower.includes('harus') || lower.includes('tidak valid')) {
      return msg;
    }
    return 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
  }

  if (status === 409) {
    return msg || 'Data sudah ada (duplikat).';
  }

  // === SAFE USER-FACING MESSAGES ===
  // Only return raw message if it looks safe/user-friendly
  const looksUserFriendly = !lower.includes('error') && !lower.includes('exception') && !lower.includes('failed') && msg.length < 200;

  if (looksUserFriendly) {
    return msg;
  }

  // Default fallback
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

// Helper API Generik
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

/**
 * Upload file ke staging/temporary storage untuk preview
 * File akan expired setelah 30 menit jika tidak di-finalize
 * @param {File} file - File object dari input
 * @returns {Promise<Object>} - { tempId, name, mimeType, size, previewUrl, expiresAt, isStaged }
 */
export async function apiUploadStaging(file) {
  const formData = new FormData();
  formData.append('file', file);

  const payload = await apiRequest('/files/staging', { method: 'POST', body: formData });
  return payload?.data || payload;
}

/**
 * Finalisasi file staged - upload ke Google Drive
 * @param {string} tempId - ID file temp dari upload staging
 * @param {string} [folder] - Nama folder opsional
 * @returns {Promise<Object>} - Object file final dengan URL
 */
export async function apiFinalizeUpload(tempId, folder) {
  const payload = await apiRequest('/files/finalize', {
    method: 'POST',
    body: { tempId, folder },
  });
  return payload?.data || payload;
}

/**
 * Finalisasi banyak file staged sekaligus
 * @param {Array<{tempId: string, folder?: string}>} files
 * @returns {Promise<Object>} - { uploaded: [], errors: [], totalSuccess, totalErrors }
 */
export async function apiFinalizeBulkUpload(files) {
  const payload = await apiRequest('/files/finalize-bulk', {
    method: 'POST',
    body: { files },
  });
  return payload?.data || payload;
}

/**
 * Hapus file staged
 * @param {string} tempId
 */
export async function apiDeleteStaging(tempId) {
  const payload = await apiRequest(`/files/temp/${tempId}`, { method: 'DELETE' });
  return payload?.data || payload;
}

/**
 * Dapatkan URL preview file temp
 * @param {string} tempId
 * @returns {string}
 */
export function getTempPreviewUrl(tempId) {
  return apiUrl(`/files/temp/${tempId}`);
}

/**
 * Get the public proxy URL for a permanent file
 * This URL does not expire and works for public viewing
 * @param {number|string} fileId - The FileObject ID
 * @returns {string} The public proxy URL
 */
export function getPublicFileUrl(fileId) {
  if (!fileId) return '';
  return apiUrl(`/files/${fileId}/public`);
}

/**
 * Check if a URL is a public file proxy URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isPublicFileUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\/api\/v1\/files\/\d+\/public/.test(url);
}

/**
 * Convert various file URL formats to the best displayable URL
 * Prioritizes public proxy URLs over direct Drive URLs
 * @param {string} url - The original URL
 * @returns {string} The best URL for display
 */
export function normalizeFileUrl(url) {
  if (!url) return '';
  // If already a public proxy URL, return as-is
  if (isPublicFileUrl(url)) return url;
  // If it's a temp preview URL, return as-is (for staged files)
  if (url.includes('/files/temp/')) return url;
  // Return other URLs as-is (legacy support)
  return url;
}
