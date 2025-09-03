const TONE_CLASSES = {
  success: 'bg-[color:var(--success-50)] text-[color:var(--success-700)] border-[color:var(--success-200)]',
  warning: 'bg-[color:var(--warning-50)] text-[color:var(--warning-700)] border-[color:var(--warning-200)]',
  danger: 'bg-[color:var(--secondary-50)] text-[color:var(--secondary-700)] border-[color:var(--secondary-200)]',
};

const MAP = {
  // HIJAU
  completed: { label: 'Lengkap', tone: 'success' },
  lengkap: { label: 'Lengkap', tone: 'success' },

  // KUNING
  pending: { label: 'Menunggu Verifikasi', tone: 'warning' },
  menunggu: { label: 'Menunggu Verifikasi', tone: 'warning' },
  in_review: { label: 'Menunggu Verifikasi', tone: 'warning' },

  // MERAH
  rejected: { label: 'Tidak Lengkap', tone: 'danger' },
  gagal: { label: 'Tidak Lengkap', tone: 'danger' },
  tidak_lengkap: { label: 'Tidak Lengkap', tone: 'danger' },
  ditolak: { label: 'Tidak Lengkap', tone: 'danger' },
};

export default function StatusBadge({ status }) {
  const key = String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  const meta = MAP[key] || MAP.pending; // fallback aman

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[meta.tone]}`}>{meta.label}</span>;
}
