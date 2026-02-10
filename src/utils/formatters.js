/**
 * Format ISO date string to Indonesian locale
 * @param {string|Date} iso - ISO date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateID = (iso, options = {}) => {
  if (!iso) return 'TBA';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return 'TBA';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  };

  return d.toLocaleDateString('id-ID', { ...defaultOptions, ...options });
};

/**
 * Format ISO date string to Indonesian locale with full month name
 * @param {string|Date} iso - ISO date string or Date object
 * @returns {string} Formatted date string (e.g., "10 Februari 2026")
 */
export const formatDateLong = (iso) => {
  return formatDateID(iso, { month: 'long' });
};

/**
 * Format ISO date string to Indonesian locale with weekday
 * @param {string|Date} iso - ISO date string or Date object
 * @returns {string} Formatted date string (e.g., "Senin, 10 Februari 2026")
 */
export const formatDateWithWeekday = (iso) => {
  return formatDateID(iso, { weekday: 'long', month: 'long' });
};

/**
 * Format ISO datetime string to Indonesian locale with time
 * @param {string|Date} iso - ISO datetime string or Date object
 * @returns {string} Formatted datetime string (e.g., "10 Feb 2026, 14:30")
 */
export const formatDateTime = (iso) => {
  if (!iso) return 'TBA';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return 'TBA';

  const date = formatDateID(iso);
  const time = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });

  return `${date}, ${time} WIB`;
};

export const limitWords = (text, maxWords = 10) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ') + '…';
};

/**
 * Strip HTML tags from a string
 * @param {string} html - String potentially containing HTML tags
 * @returns {string} Plain text without HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return '';
  // Use DOMParser for browser environment, fallback to regex
  if (typeof window !== 'undefined' && window.DOMParser) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  // Fallback regex for non-browser environments
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};
