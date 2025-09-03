export const formatDateID = (iso) => {
  if (!iso) return 'TBA';
  const d = new Date(iso);
  if (Number.isNaN(d)) return 'TBA';
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
};

export const limitWords = (text, maxWords = 10) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ') + '…';
};
