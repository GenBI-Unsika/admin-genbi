// src/pages/ScholarshipInterview.jsx
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { Search, CheckCircle2, XCircle, Calendar, Eye, Video } from 'lucide-react';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const fmtIDDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const interviewStatusLabel = (status) => {
  if (!status || status === 'MENUNGGU_JADWAL') return 'Belum Dijadwalkan';
  if (status === 'DIJADWALKAN') return 'Dijadwalkan';
  if (status === 'LOLOS_WAWANCARA') return 'Lolos Wawancara';
  if (status === 'GAGAL_WAWANCARA') return 'Tidak Lolos';
  return String(status);
};

const InterviewBadge = ({ status }) => {
  const config = {
    'Belum Dijadwalkan': 'bg-amber-50 text-amber-800 border-amber-200',
    Dijadwalkan: 'bg-blue-50 text-blue-800 border-blue-200',
    'Lolos Wawancara': 'bg-green-50 text-green-800 border-green-200',
    'Tidak Lolos': 'bg-red-50 text-red-800 border-red-200',
  };
  const className = config[status] || 'bg-neutral-50 text-neutral-700 border-neutral-200';
  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${className}`}>{status}</span>;
};

export default function ScholarshipInterview() {
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setRowsLoading(true);
      try {
        // Fetch only LOLOS_ADMINISTRASI applicants
        const payload = await apiRequest('/scholarships/applications?status=LOLOS_ADMINISTRASI', { method: 'GET' });
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((r) => ({
          ...r,
          photo: r?.createdBy?.profile?.avatar || r.photo || '',
          interviewLabel: interviewStatusLabel(r.interviewStatus),
          facultyName: r.faculty?.name || '',
          studyProgramName: r.studyProgram?.name || '',
        }));
        if (!alive) return;
        setRows(mapped);
      } catch (e) {
        if (!alive) return;
        toast.error(e?.message || 'Gagal memuat data.');
        setRows([]);
      } finally {
        if (alive) setRowsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ = `${r.name} ${r.npm} ${r.studyProgramName}`.toLowerCase().includes(s);
      const matchStatus = statusFilter ? r.interviewLabel === statusFilter : true;
      return matchQ && matchStatus;
    });
  }, [rows, q, statusFilter]);

  // Schedule modal
  const [schedModal, setSchedModal] = useState(null);
  const [schedForm, setSchedForm] = useState({ date: '', time: '', location: '' });
  const [schedSubmitting, setSchedSubmitting] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);

  const normalizeTimeForInput = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    // Accept "HH:MM" directly
    if (/^\d{2}:\d{2}$/.test(raw)) return raw;
    // Try to extract first "HH:MM" from any string
    const m = raw.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return '';
    const hh = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const openScheduleModal = (row) => {
    setSchedModal(row);
    setSchedForm({
      date: row.interviewDate ? new Date(row.interviewDate).toISOString().slice(0, 10) : '',
      time: normalizeTimeForInput(row.interviewTime),
      location: row.interviewLocation || '',
    });
  };

  const submitSchedule = async () => {
    if (!schedModal) return;
    if (!schedForm.date || !schedForm.time || !schedForm.location) {
      toast.error('Semua field jadwal wajib diisi.');
      return;
    }
    setSchedSubmitting(true);
    try {
      await apiRequest(`/scholarships/applications/${schedModal.id}/interview-schedule`, {
        method: 'PATCH',
        body: {
          interviewDate: schedForm.date,
          interviewTime: schedForm.time,
          interviewLocation: schedForm.location,
        },
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === schedModal.id
            ? {
                ...r,
                interviewStatus: 'DIJADWALKAN',
                interviewLabel: 'Dijadwalkan',
                interviewDate: schedForm.date,
                interviewTime: schedForm.time,
                interviewLocation: schedForm.location,
              }
            : r,
        ),
      );
      setSchedModal(null);
      toast.success(`Jadwal wawancara untuk ${schedModal.name} berhasil disimpan.`);
    } catch (e) {
      toast.error(e?.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSchedSubmitting(false);
    }
  };

  // Decision modal (lolos/ditolak wawancara)
  const [decModal, setDecModal] = useState(null);
  const openDecisionModal = (type, row) => setDecModal({ type, row, notes: '', confirm: false });

  const confirmDecision = async () => {
    if (!decModal?.row) return;
    const status = decModal.type === 'approve' ? 'LOLOS_WAWANCARA' : 'GAGAL_WAWANCARA';
    try {
      await apiRequest(`/scholarships/applications/${decModal.row.id}/interview`, {
        method: 'PATCH',
        body: { status, interviewNotes: decModal.notes },
      });
      const label = interviewStatusLabel(status);
      setRows((prev) => prev.map((r) => (r.id === decModal.row.id ? { ...r, interviewStatus: status, interviewLabel: label, interviewNotes: decModal.notes } : r)));
      setDecModal(null);
      toast.success(status === 'LOLOS_WAWANCARA' ? `${decModal.row.name} dinyatakan Lolos Wawancara.` : `${decModal.row.name} dinyatakan Tidak Lolos Wawancara.`);
    } catch (e) {
      toast.error(e?.message || 'Gagal memperbarui status.');
    }
  };

  return (
    <div className="px-6 md:px-10 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-neutral-900">Seleksi Wawancara</h2>
          <Link to="/beasiswa" className="text-sm text-neutral-600 hover:text-primary-600 hover:underline inline-flex items-center gap-1">
            ← Kembali
          </Link>
        </div>
        <p className="text-sm text-neutral-600">Kelola jadwal dan hasil wawancara pendaftar yang lolos administrasi.</p>
      </div>

      {/* Main Content */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        {/* Search + Filter */}
        <div className="mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama atau NPM..."
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-700 whitespace-nowrap font-medium">Status Detail:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Semua Status</option>
                <option value="Belum Dijadwalkan">Belum Dijadwalkan</option>
                <option value="Dijadwalkan">Dijadwalkan</option>
                <option value="Lolos Wawancara">Lolos Wawancara</option>
                <option value="Tidak Lolos">Tidak Lolos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                <th className="py-3 pr-2 w-16">Foto</th>
                <th className="px-2 py-3">Nama</th>
                <th className="px-2 py-3">NPM</th>
                <th className="px-2 py-3">Program Studi</th>
                <th className="px-2 py-3">Tanggal</th>
                <th className="px-2 py-3">Waktu</th>
                <th className="px-2 py-3">Lokasi</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rowsLoading && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600"></div>
                      <p className="text-sm text-neutral-500">Memuat data wawancara...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!rowsLoading &&
                filtered.map((row) => {
                  const isScheduled = row.interviewStatus === 'DIJADWALKAN';
                  const isLolos = row.interviewStatus === 'LOLOS_WAWANCARA';
                  const isDitolak = row.interviewStatus === 'GAGAL_WAWANCARA';
                  const canDecide = isScheduled;
                  const canSchedule = !row.interviewStatus || row.interviewStatus === 'MENUNGGU_JADWAL' || isScheduled;

                  return (
                    <tr key={row.id} className="border-t border-neutral-200 hover:bg-neutral-50/50 transition">
                      <td className="py-3 pr-2">
                        <Avatar name={row.name} src={row.photo} size={36} />
                      </td>
                      <td className="px-2 py-3">
                        <div className="font-medium text-neutral-900">{row.name}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-neutral-700">{row.npm}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-neutral-700 text-xs">{row.studyProgramName || '-'}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-neutral-700 text-xs">{row.interviewDate ? fmtIDDate(row.interviewDate) : '-'}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-neutral-700 text-xs">{row.interviewTime || '-'}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-neutral-700 text-xs max-w-[150px] truncate" title={row.interviewLocation}>
                          {row.interviewLocation || '-'}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <InterviewBadge status={row.interviewLabel} />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/beasiswa/${row.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                            title="Lihat Detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {canSchedule && (
                            <button
                              type="button"
                              onClick={() => openScheduleModal(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-600/20 bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                              title="Jadwalkan Wawancara"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {canDecide && (
                            <>
                              <button
                                type="button"
                                onClick={() => openDecisionModal('approve', row)}
                                disabled={isLolos}
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                                  isLolos ? 'cursor-not-allowed border border-green-100 bg-green-50 text-green-600' : 'border border-green-600/20 bg-green-600 text-white hover:bg-green-700'
                                }`}
                                title="Lolos Wawancara"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDecisionModal('reject', row)}
                                disabled={isDitolak}
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                                  isDitolak ? 'cursor-not-allowed border border-red-100 bg-red-50 text-red-600' : 'border border-red-600/20 bg-red-600 text-white hover:bg-red-700'
                                }`}
                                title="Tidak Lolos Wawancara"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!rowsLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState
                      icon={q.trim() || statusFilter ? 'search' : 'inbox'}
                      title={q.trim() || statusFilter ? 'Tidak ada hasil' : 'Belum ada peserta'}
                      description={q.trim() || statusFilter ? 'Coba ubah filter atau kata kunci pencarian.' : 'Peserta yang lolos seleksi administrasi akan muncul di sini.'}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
          <div className="text-sm text-neutral-500">
            Menampilkan <span className="font-semibold text-neutral-900">{filtered.length}</span> dari <span className="font-semibold text-neutral-900">{rows.length}</span> peserta
          </div>
          {(q.trim() || statusFilter) && (
            <button
              onClick={() => {
                setQ('');
                setStatusFilter('');
              }}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {schedModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h4 className="text-base font-semibold text-neutral-900">Jadwalkan Wawancara</h4>
              <button className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50" onClick={() => setSchedModal(null)} aria-label="Tutup">
                Tutup
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={schedModal.name} src={schedModal.photo} size={36} />
                  <div>
                    <div className="font-semibold text-neutral-900">{schedModal.name}</div>
                    <div className="text-neutral-600">
                      NPM {schedModal.npm} • {schedModal.studyProgramName || '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-1">Tanggal Wawancara</label>
                  <input
                    type="date"
                    value={schedForm.date}
                    onChange={(e) => setSchedForm((f) => ({ ...f, date: e.target.value }))}
                    min={todayISO}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-1">Waktu Wawancara</label>
                  <input
                    type="time"
                    step={300}
                    value={schedForm.time}
                    onChange={(e) => setSchedForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-1">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" /> Link / Lokasi Wawancara
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://us02web.zoom.us/j/... atau Ruang 301 Gedung A"
                    value={schedForm.location}
                    onChange={(e) => setSchedForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setSchedModal(null)}>
                Batal
              </button>
              <button className={`rounded-lg px-3 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 ${schedSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={submitSchedule} disabled={schedSubmitting}>
                {schedSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h4 className="text-base font-semibold text-neutral-900">{decModal.type === 'approve' ? 'Konfirmasi Lolos Wawancara' : 'Konfirmasi Tidak Lolos Wawancara'}</h4>
              <button className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50" onClick={() => setDecModal(null)} aria-label="Tutup">
                Tutup
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={decModal.row.name} src={decModal.row.photo} size={36} />
                  <div>
                    <div className="font-semibold text-neutral-900">{decModal.row.name}</div>
                    <div className="text-neutral-600">
                      NPM {decModal.row.npm} • {decModal.row.studyProgramName || '-'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  Status saat ini: <span className="font-medium text-neutral-700">{decModal.row.interviewLabel}</span>
                </div>
                {decModal.row.interviewDate && (
                  <div className="mt-1 text-xs text-neutral-500">
                    Jadwal: {fmtIDDate(decModal.row.interviewDate)} • {decModal.row.interviewTime || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-800">Catatan wawancara (opsional)</label>
                <textarea
                  rows={3}
                  value={decModal.notes}
                  onChange={(e) => setDecModal((m) => ({ ...m, notes: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="Catatan hasil wawancara..."
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                <input type="checkbox" checked={decModal.confirm} onChange={(e) => setDecModal((m) => ({ ...m, confirm: e.target.checked }))} />
                <span>Saya sudah yakin dengan keputusan ini.</span>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setDecModal(null)}>
                Batal
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${decModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${!decModal.confirm ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={confirmDecision}
                disabled={!decModal.confirm}
              >
                {decModal.type === 'approve' ? 'Ya, Tetapkan Lolos Wawancara' : 'Ya, Tetapkan Tidak Lolos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
