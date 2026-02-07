// src/pages/ScholarshipList.jsx
import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { Search, CheckCircle2, XCircle, Upload, FileDown, Download, Eye, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { trpc } from '../utils/trpc';

/* ===================== Constants & Helpers ===================== */
const fmtIDDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const statusLabel = (status) => {
  if (!status) return 'Menunggu Verifikasi';
  if (status === 'MENUNGGU_VERIFIKASI') return 'Menunggu Verifikasi';
  if (status === 'LOLOS_ADMINISTRASI') return 'Lolos Administrasi';
  if (status === 'ADMINISTRASI_DITOLAK') return 'Administrasi Ditolak';
  return String(status);
};

const normalizeDecision = (v) => {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  if (['lolos administrasi', 'lolos', 'accepted', 'accept', 'diterima', 'pass'].includes(s)) return 'Lolos Administrasi';
  if (['administrasi ditolak', 'ditolak', 'rejected', 'reject', 'gagal', 'fail'].includes(s)) return 'Administrasi Ditolak';
  return '';
};
const isValidNPM = (v) => /^\d{6,20}$/.test(String(v || '').trim());

const AdminBadge = ({ status }) => {
  const m = {
    'Menunggu Verifikasi': 'bg-amber-50 text-amber-700 border-amber-200',
    'Lolos Administrasi': 'bg-green-50 text-green-700 border-green-200',
    'Administrasi Ditolak': 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = m[status] || 'bg-neutral-50 text-neutral-700 border-neutral-200';
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
};

// Muat SheetJS via CDN (tanpa install paket) — untuk baca & tulis XLSX
async function loadXLSXFromCDN() {
  const mod = await import(/* @vite-ignore */ 'https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
  return mod;
}

/* ===================== Toasts ===================== */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const push = (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 3000);
  };
  return { toasts, push, remove };
}
const Toasts = ({ items, onClose }) => (
  <div className="fixed bottom-4 right-4 z-60 flex w-[320px] flex-col gap-2">
    {items.map((t) => {
      const style =
        {
          info: 'border-blue-200 bg-blue-50 text-blue-800',
          success: 'border-green-200 bg-green-50 text-green-800',
          warning: 'border-amber-200 bg-amber-50 text-amber-800',
          error: 'border-red-200 bg-red-50 text-red-800',
        }[t.type] || 'border-neutral-200 bg-white text-neutral-800';
      return (
        <div key={t.id} className={`flex items-start justify-between rounded-lg border p-3 text-sm shadow ${style}`}>
          <div className="pr-2">{t.message}</div>
          <button onClick={() => onClose(t.id)} className="text-xs underline opacity-70 hover:opacity-100">
            Tutup
          </button>
        </div>
      );
    })}
  </div>
);

/* ===================== Page ===================== */
export default function ScholarshipList() {
  /* ========= Toasts ========= */
  const { toasts, push: toast, remove: closeToast } = useToasts();

  /* ========= Beasiswa Dibuka/Ditutup (server-side) ========= */
  const [regOpen, setRegOpen] = useState(false);
  const [regLoading, setRegLoading] = useState(true);
  const [toggleModal, setToggleModal] = useState(null); // {action:'open'|'close', confirm:false, phrase:''}

  useEffect(() => {
    let alive = true;
    (async () => {
      setRegLoading(true);
      try {
        const payload = await trpc.scholarships.getRegistration.query();
        if (!alive) return;
        setRegOpen(Boolean(payload?.open));
      } catch (e) {
        if (!alive) return;
        toast(e?.message || 'Gagal memuat status pendaftaran.', 'error');
        setRegOpen(false);
      } finally {
        if (alive) setRegLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========= Data (server) ========= */
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setRowsLoading(true);
      try {
        const payload = await apiRequest('/scholarships/applications', { method: 'GET' });
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((r) => {
          const birth = r.birthDate ? new Date(r.birthDate).toISOString().slice(0, 10) : '';
          return {
            ...r,
            birth,
            administrasi: statusLabel(r.administrasiStatus),
            files: r.files || {},
          };
        });
        if (!alive) return;
        setRows(mapped);
      } catch (e) {
        if (!alive) return;
        toast(e?.message || 'Gagal memuat data pendaftar.', 'error');
        setRows([]);
      } finally {
        if (alive) setRowsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pendingCount = useMemo(() => rows.filter((r) => r.administrasi === 'Menunggu Verifikasi').length, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ = `${r.name} ${r.npm} ${r.prodi || r.study}`.toLowerCase().includes(s);
      const matchStatus = statusFilter ? r.administrasi === statusFilter : true;
      return matchQ && matchStatus;
    });
  }, [rows, q, statusFilter]);

  /* ========= Toggle Beasiswa Dibuka/Ditutup ========= */
  const requestToggle = (nextOpen) => {
    if (regLoading) return;
    setToggleModal({
      action: nextOpen ? 'open' : 'close',
      confirm: false,
      phrase: '',
    });
  };
  const confirmToggle = () => {
    if (!toggleModal) return;
    (async () => {
      try {
        const nextOpen = toggleModal.action === 'open';
        const payload = await trpc.scholarships.setRegistration.mutate({ open: nextOpen });
        setRegOpen(Boolean(payload?.open));
        setToggleModal(null);
        toast(nextOpen ? 'Pendaftaran dibuka.' : 'Pendaftaran ditutup.', 'success');
      } catch (e) {
        toast(e?.message || 'Gagal mengubah status pendaftaran.', 'error');
      }
    })();
  };

  /* ========= Single actions: Approve/Reject ========= */
  const [modal, setModal] = useState(null); // {type:'approve'|'reject', row, note:'', confirm:false}
  const openDecisionModal = (type, row) => setModal({ type, row, note: '', confirm: false });

  const updateRowStatus = (id, newStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, administrasi: newStatus } : r)));
  };
  const confirmDecision = async () => {
    if (!modal?.row) return;
    const status = modal.type === 'approve' ? 'Lolos Administrasi' : 'Administrasi Ditolak';
    try {
      await apiRequest(`/scholarships/applications/${modal.row.id}/administrasi`, { method: 'PATCH', body: { status } });
      updateRowStatus(modal.row.id, status);
      setModal(null);
      toast(status === 'Lolos Administrasi' ? `Ditandai Lolos Administrasi: ${modal.row.name}` : `Ditandai Administrasi Ditolak: ${modal.row.name}`, status === 'Lolos Administrasi' ? 'success' : 'warning');
    } catch {
      toast('Gagal memperbarui status. Coba lagi.', 'error');
    }
  };

  /* ========= Download TEMPLATE (Excel) ========= */
  const onDownloadTemplate = async () => {
    try {
      const XLSX = await loadXLSXFromCDN();
      // Template upload massal hanya header 4 kolom (tanpa data contoh)
      const data = [];
      const ws = XLSX.utils.json_to_sheet(data, { header: ['Nama', 'NPM', 'Prodi', 'Status'] });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-keputusan.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Template Excel diunduh.', 'info');
    } catch {
      toast('Gagal mengunduh template.', 'error');
    }
  };

  /* ========= Download DATA (Excel - seluruh field termasuk link dokumen) ========= */
  const onDownloadData = async () => {
    try {
      const XLSX = await loadXLSXFromCDN();
      const data = rows.map((r) => ({
        Nama: r.name,
        Email: r.email,
        'Tanggal Lahir': r.birth,
        Gender: r.gender,
        NIK: r.nik,
        'No Telp': r.phone,
        Fakultas: r.faculty,
        'Program Studi': r.study,
        NPM: r.npm,
        Semester: r.semester,
        IPK: r.gpa,
        Usia: r.age,
        'Mengetahui GenBI': r.knowGenbi,
        'Deskripsi GenBI': r.knowDesc,
        'Status Administrasi': r.administrasi,
        'Tanggal Submit': r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
        // Link dokumen (Google Drive / URL)
        File_FormA1: r.files?.formA1 || '',
        File_KTMKTP: r.files?.ktmKtp || '',
        File_Transkrip: r.files?.transkrip || '',
        File_Motivation: r.files?.motivation || '',
        File_SKTM_Slip: r.files?.sktmSlip || '',
        File_Rekomendasi: r.files?.rekomendasi || '',
        URL_VideoIG: r.files?.videoUrl || '',
        File_Lainnya1: r.files?.lainnya1 || '',
        File_Lainnya2: r.files?.lainnya2 || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      // Lebar kolom auto-ish
      const colWidths = Object.keys(data[0] || {}).map((k) => ({ wch: Math.min(Math.max(String(k).length + 2, 18), 40) }));
      ws['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar');
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-pendaftar-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(`Excel data (${rows.length} baris) diunduh.`, 'success');
    } catch {
      toast('Gagal mengunduh data.', 'error');
    }
  };

  /* ========= APPLY BULK (setelah submit di modal upload) ========= */
  const applyBulkUpdates = (updates) => {
    // updates: Map<NPM, {status, nama, prodi}>
    let updated = 0;
    const next = rows.map((r) => {
      const u = updates.get(r.npm);
      if (!u) return r;
      updated += 1;
      return { ...r, administrasi: u.status };
    });
    setRows(next);
    return updated;
  };

  /* ========= Upload Modal (XLSX saja) ========= */
  const [upModalOpen, setUpModalOpen] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const [upFileName, setUpFileName] = useState('');
  const [upPreview, setUpPreview] = useState([]); // [{nama,npm,prodi,statusRaw,statusNorm,valid,reason,line}]
  const [upIssues, setUpIssues] = useState(null); // ringkasan validasi
  const [upUpdates, setUpUpdates] = useState(new Map()); // Map<NPM,{status,nama,prodi}>
  const dropRef = useRef(null);

  const handleDrop = async (ev) => {
    ev.preventDefault();
    if (upLoading) return;
    const file = ev.dataTransfer.files?.[0];
    if (file) await parseUploadFile(file);
  };
  const handleDragOver = (ev) => {
    ev.preventDefault();
  };
  const onPickFile = async (e) => {
    const file = e.target.files?.[0] || null;
    if (file) await parseUploadFile(file);
  };

  const parseUploadFile = async (file) => {
    setUpLoading(true);
    setUpFileName(file.name);
    setUpPreview([]);
    setUpIssues(null);
    setUpUpdates(new Map());

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const issues = {
      missingHeaders: [],
      invalidStatus: [],
      invalidRow: [],
      unknownNPM: [],
      prodiMismatch: [],
      nameMismatch: [],
      duplicates: [],
      totalRows: 0,
    };

    try {
      if (!['xlsx', 'xls'].includes(ext)) {
        throw new Error('Format tidak didukung. Unggah file Excel (.xlsx / .xls).');
      }
      const XLSX = await loadXLSXFromCDN();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 }); // AoA
      if (!json.length) throw new Error('File kosong.');
      issues.totalRows = Math.max(0, json.length - 1);

      const header = json[0].map((h) =>
        String(h || '')
          .trim()
          .toLowerCase(),
      );
      const want = ['nama', 'npm', 'prodi', 'status'];
      want.forEach((h) => {
        if (!header.includes(h)) issues.missingHeaders.push(h);
      });
      if (issues.missingHeaders.length) {
        throw new Error(`Header wajib tidak lengkap: ${issues.missingHeaders.join(', ')}`);
      }

      const idx = (key) => header.indexOf(key);
      const seen = new Set();
      const updates = new Map();
      const previewRows = [];

      json.slice(1).forEach((row, i) => {
        const line = i + 2;
        const nama = String(row[idx('nama')] ?? '').trim();
        const npm = String(row[idx('npm')] ?? '').trim();
        const prodi = String(row[idx('prodi')] ?? '').trim();
        const statusRaw = String(row[idx('status')] ?? '').trim();
        const statusNorm = normalizeDecision(statusRaw);

        let valid = true;
        let reason = '';

        if (!nama || !npm || !prodi || !isValidNPM(npm)) {
          valid = false;
          reason = 'Field kosong/format salah';
          issues.invalidRow.push(line);
        } else if (!statusNorm) {
          valid = false;
          reason = 'Status tidak valid (hanya "Lolos Administrasi" atau "Administrasi Ditolak")';
          issues.invalidStatus.push(line);
        } else if (seen.has(npm)) {
          valid = false;
          reason = 'Duplikat NPM di file';
          issues.duplicates.push(npm);
        } else {
          seen.add(npm);
          const local = rows.find((x) => x.npm === npm);
          if (!local) {
            valid = false;
            reason = 'NPM tidak ditemukan di sistem';
            issues.unknownNPM.push(npm);
          } else {
            if (local.study && local.study !== prodi) {
              issues.prodiMismatch.push({ npm, file: prodi, db: local.study });
            }
            if (local.name && local.name !== nama) {
              issues.nameMismatch.push({ npm, file: nama, db: local.name });
            }
            updates.set(npm, { status: statusNorm, nama, prodi });
          }
        }

        previewRows.push({ nama, npm, prodi, statusRaw, statusNorm, valid, reason, line });
      });

      setUpPreview(previewRows);
      setUpIssues(issues);
      setUpUpdates(updates);
    } catch (e) {
      setUpIssues({ error: e.message || 'Gagal memproses file.' });
    } finally {
      setUpLoading(false);
    }
  };

  const submitUpload = async () => {
    if (!upUpdates || upUpdates.size === 0) return;
    const updated = applyBulkUpdates(upUpdates);

    // Persist changes to server
    try {
      const tasks = rows.filter((r) => upUpdates.has(r.npm)).map((r) => apiRequest(`/scholarships/applications/${r.id}/administrasi`, { method: 'PATCH', body: { status: upUpdates.get(r.npm).status } }));

      const results = await Promise.allSettled(tasks);
      const ok = results.filter((x) => x.status === 'fulfilled').length;
      const fail = results.length - ok;
      if (fail) toast(`Pembaruan massal: ${ok} berhasil, ${fail} gagal.`, 'warning');
    } catch {
      toast('Pembaruan massal gagal disimpan ke server.', 'error');
    }

    setUpModalOpen(false);
    setUpLoading(false);
    setUpFileName('');
    setUpPreview([]);
    setUpIssues(null);
    setUpUpdates(new Map());
    toast(`Pembaruan massal diterapkan: ${updated} baris.`, 'success');
  };

  const resetUpload = () => {
    setUpLoading(false);
    setUpFileName('');
    setUpPreview([]);
    setUpIssues(null);
    setUpUpdates(new Map());
    toast('Form upload direset.', 'info');
  };

  /* ===================== UI ===================== */
  return (
    <div className="px-6 md:px-10 py-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        {/* ====== Banner status beasiswa + toggle aman ====== */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {regOpen ? (
              <span className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                <Unlock className="h-4 w-4" /> Pendaftaran Beasiswa: <span className="font-semibold">Dibuka</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                <Lock className="h-4 w-4" /> Pendaftaran Beasiswa: <span className="font-semibold">Ditutup</span>
              </span>
            )}
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {pendingCount} peserta menunggu verifikasi
              </span>
            )}
          </div>

          {/* Switch full-guarded */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-700">Ubah status</span>
            <button
              role="switch"
              aria-checked={regOpen}
              onClick={() => requestToggle(!regOpen)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition
                ${regOpen ? 'bg-primary-500' : 'bg-neutral-300'}`}
              title={regOpen ? 'Tutup pendaftaran' : 'Buka pendaftaran'}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition
                  ${regOpen ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Header + Tools */}
        <div className="mb-4 space-y-4">
          {/* Title row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Peserta Pendaftar Beasiswa</h3>

            {/* Search + Filter group */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Filter status */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-700 whitespace-nowrap">Administrasi</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-800 outline-none focus:border-primary-500">
                  <option value="">Semua</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Lolos Administrasi">Lolos Administrasi</option>
                  <option value="Administrasi Ditolak">Administrasi Ditolak</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama/NPM/prodi"
                  className="h-9 w-full sm:w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUpModalOpen(true);
                resetUpload();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Upload className="h-4 w-4" />
              Upload Excel
            </button>

            <button type="button" onClick={onDownloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              <FileDown className="h-4 w-4" />
              Template (.xlsx)
            </button>

            <button type="button" onClick={onDownloadData} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              <Download className="h-4 w-4" />
              Download Data (.xlsx)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-3.5 pr-3 font-medium">Nama</th>
                <th className="px-3 py-3.5 font-medium">NPM</th>
                <th className="px-3 py-3.5 font-medium">Prodi</th>
                <th className="px-3 py-3.5 font-medium">Timestamp</th>
                <th className="px-3 py-3.5 font-medium">Administrasi</th>
                <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rowsLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-500">
                    Memuat data...
                  </td>
                </tr>
              )}

              {filtered.map((row) => {
                const isAccepted = row.administrasi === 'Lolos Administrasi';
                const isRejected = row.administrasi === 'Administrasi Ditolak';
                return (
                  <tr key={row.id} className="border-t border-neutral-200 text-neutral-800">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} src={row.photo} size={32} />
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-neutral-600">{row.npm}</td>
                    <td className="px-3 py-3.5 text-neutral-600">{row.study}</td>
                    <td className="px-3 py-3.5 text-neutral-600">{fmtIDDate(row.submittedAt || row.createdAt)}</td>
                    <td className="px-3 py-3.5">
                      <AdminBadge status={row.administrasi} />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/beasiswa/${row.id}`} className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 hover:underline" title="Detail">
                          <Eye className="h-4 w-4" />
                          Detail
                        </Link>

                        <button
                          type="button"
                          onClick={() => openDecisionModal('approve', row)}
                          disabled={isAccepted}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition
                            ${isAccepted ? 'cursor-not-allowed border border-green-100 bg-green-50 text-green-500' : 'border border-green-600/20 bg-green-600 text-white hover:bg-green-700'}`}
                          title="Terima → Lolos Administrasi"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Terima
                        </button>

                        <button
                          type="button"
                          onClick={() => openDecisionModal('reject', row)}
                          disabled={isRejected}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition
                            ${isRejected ? 'cursor-not-allowed border border-red-100 bg-red-50 text-red-500' : 'border border-red-600/20 bg-red-600 text-white hover:bg-red-700'}`}
                          title="Tolak → Administrasi Ditolak"
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!rowsLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      icon={q.trim() ? 'search' : 'inbox'}
                      title={q.trim() ? 'Tidak ada hasil' : 'Belum ada pendaftar'}
                      description={q.trim() ? 'Coba gunakan kata kunci lain untuk pencarian.' : 'Data pendaftar beasiswa akan muncul di sini setelah ada yang mendaftar.'}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end text-sm text-neutral-500">
          Menampilkan {filtered.length} dari {rows.length} pendaftar
        </div>
      </div>

      {/* ========== MODAL TOGGLE REGISTRATION (required phrase) ========== */}
      {toggleModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h4 className="text-base font-semibold text-neutral-900">{toggleModal.action === 'open' ? 'Buka Pendaftaran Beasiswa' : 'Tutup Pendaftaran Beasiswa'}</h4>
              <button className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50" onClick={() => setToggleModal(null)} aria-label="Tutup">
                Tutup
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 text-sm">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                {toggleModal.action === 'close' ? (
                  <>
                    <div className="mb-1 font-medium text-neutral-900">Anda akan menutup pendaftaran.</div>
                    <ul className="list-disc pl-5 text-neutral-700 space-y-1">
                      <li>Mahasiswa tidak dapat mengirim form baru.</li>
                      <li>
                        Ada <b>{pendingCount}</b> peserta berstatus <i>Menunggu Verifikasi</i>.
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="mb-1 font-medium text-neutral-900">Anda akan membuka pendaftaran.</div>
                    <ul className="list-disc pl-5 text-neutral-700 space-y-1">
                      <li>Formulir dapat diakses publik dan menerima entri baru.</li>
                      <li>Pastikan konfigurasi syarat & tanggal sudah benar.</li>
                    </ul>
                  </>
                )}
              </div>

              {/* Checklist WAJIB */}
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={toggleModal.confirm} onChange={(e) => setToggleModal((m) => ({ ...m, confirm: e.target.checked }))} />
                <span className="text-neutral-800">Saya memahami konsekuensi perubahan status ini.</span>
              </label>

              {/* Frasa WAJIB */}
              {(() => {
                const requiredWord = toggleModal.action === 'open' ? 'BUKA' : 'TUTUP';
                const ok = toggleModal.phrase === requiredWord;
                const touched = toggleModal.phrase.length > 0;
                return (
                  <div>
                    <label className="mb-1 block font-medium text-neutral-800">
                      Ketik <code className="rounded bg-neutral-100 px-1 py-0.5">{requiredWord}</code> untuk melanjutkan
                    </label>
                    <input
                      value={toggleModal.phrase}
                      onChange={(e) => setToggleModal((m) => ({ ...m, phrase: e.target.value.toUpperCase() }))}
                      placeholder={requiredWord}
                      className={`h-9 w-full rounded-lg border px-3 outline-none focus:border-primary-500
                        ${ok ? 'border-green-300' : touched ? 'border-red-300' : 'border-neutral-200'}`}
                      aria-invalid={!ok}
                    />
                    {!ok && touched && <p className="mt-1 text-xs text-red-600">Harus mengetik tepat: {requiredWord}</p>}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setToggleModal(null)}>
                Batal
              </button>
              {(() => {
                const requiredWord = toggleModal.action === 'open' ? 'BUKA' : 'TUTUP';
                const canSubmit = toggleModal.confirm && toggleModal.phrase === requiredWord;
                return (
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${toggleModal.action === 'open' ? 'bg-primary-500 hover:bg-primary-600' : 'bg-red-600 hover:bg-red-700'} ${
                      !canSubmit ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    onClick={confirmToggle}
                    disabled={!canSubmit}
                  >
                    {toggleModal.action === 'open' ? 'Konfirmasi Buka' : 'Konfirmasi Tutup'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL KEPUTUSAN (Terima/Tolak) ========== */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h4 className="text-base font-semibold text-neutral-900">{modal.type === 'approve' ? 'Konfirmasi Penerimaan (Lolos Administrasi)' : 'Konfirmasi Penolakan (Administrasi Ditolak)'}</h4>
              <button className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50" onClick={() => setModal(null)} aria-label="Tutup">
                Tutup
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              <div className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={modal.row.name} size={36} />
                  <div>
                    <div className="font-semibold text-neutral-900">{modal.row.name}</div>
                    <div className="text-neutral-600">
                      NPM {modal.row.npm} • {modal.row.study}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  Status saat ini: <span className="font-medium text-neutral-700">{modal.row.administrasi}</span>
                </div>
              </div>

              {modal.type === 'reject' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-800">Alasan penolakan (opsional)</label>
                  <textarea
                    rows={3}
                    value={modal.note}
                    onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                    placeholder="Contoh: Dokumen tidak lengkap / IPK tidak memenuhi syarat..."
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                <input type="checkbox" checked={modal.confirm} onChange={(e) => setModal((m) => ({ ...m, confirm: e.target.checked }))} />
                <span>Saya sudah memeriksa data dan yakin dengan keputusan ini.</span>
              </label>

              <div className="text-xs text-neutral-500">Keputusan tidak dapat diubah dari halaman ini. (Jika perlu koreksi, lakukan melalui menu administrasi lanjutan.)</div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setModal(null)}>
                Batal
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${modal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${!modal.confirm ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={confirmDecision}
                disabled={!modal.confirm}
              >
                {modal.type === 'approve' ? 'Ya, Tetapkan Lolos Administrasi' : 'Ya, Tetapkan Administrasi Ditolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL UPLOAD (drag & drop + preview + submit) ========== */}
      {upModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h4 className="text-base font-semibold text-neutral-900">Upload Excel Keputusan</h4>
              <button className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50" onClick={() => setUpModalOpen(false)} aria-label="Tutup">
                Tutup
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              {/* Dropzone */}
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`rounded-xl border-2 border-dashed ${upLoading ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400'} p-6 text-center`}
              >
                <p className="text-sm text-neutral-700">
                  Seret & letakkan file Excel ke sini, atau
                  <label className="mx-1 inline-flex cursor-pointer items-center rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={onPickFile} />
                    pilih file
                  </label>
                  (format: .xlsx / .xls)
                </p>
                {upFileName && <p className="mt-2 text-xs text-neutral-500">File: {upFileName}</p>}
              </div>

              {/* Info bantuan */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
                Format kolom wajib: <b>Nama</b> | <b>NPM</b> | <b>Prodi</b> | <b>Status</b>. Status hanya:
                <span className="ml-1 rounded px-1.5 py-0.5 bg-green-50 text-green-700">Lolos Administrasi</span> atau
                <span className="ml-1 rounded px-1.5 py-0.5 bg-red-50 text-red-700">Administrasi Ditolak</span>.
              </div>

              {/* Hasil Validasi & Preview */}
              {upIssues && !upIssues.error && (
                <>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                    <div>
                      Total baris di file: <span className="font-semibold">{upIssues.totalRows}</span>
                    </div>
                    <div>
                      Siap diperbarui: <span className="font-semibold">{upUpdates.size}</span>
                    </div>
                    {upIssues.unknownNPM?.length > 0 && (
                      <div className="text-amber-700">
                        NPM tidak ditemukan: <span className="font-mono text-xs">{upIssues.unknownNPM.join(', ')}</span>
                      </div>
                    )}
                    {upIssues.invalidStatus?.length > 0 && (
                      <div className="text-amber-700">
                        Baris status tidak valid: <span className="font-mono text-xs">{upIssues.invalidStatus.join(', ')}</span>
                      </div>
                    )}
                    {upIssues.invalidRow?.length > 0 && (
                      <div className="text-amber-700">
                        Baris field kosong/format salah: <span className="font-mono text-xs">{upIssues.invalidRow.join(', ')}</span>
                      </div>
                    )}
                    {upIssues.duplicates?.length > 0 && (
                      <div className="text-amber-700">
                        Duplikat NPM di file: <span className="font-mono text-xs">{upIssues.duplicates.join(', ')}</span>
                      </div>
                    )}
                    {upIssues.prodiMismatch?.length > 0 && (
                      <div className="text-amber-700">
                        Prodi berbeda (file vs sistem): <span className="font-mono text-xs">{upIssues.prodiMismatch.map((m) => `${m.npm}[${m.file}≠${m.db}]`).join(', ')}</span>
                      </div>
                    )}
                    {upIssues.nameMismatch?.length > 0 && (
                      <div className="text-amber-700">
                        Nama berbeda (file vs sistem): <span className="font-mono text-xs">{upIssues.nameMismatch.map((m) => `${m.npm}[${m.file}≠${m.db}]`).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview table (max 10) */}
                  <div className="overflow-x-auto rounded-xl border border-neutral-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr className="text-left text-neutral-600">
                          <th className="px-3 py-2 font-medium">#</th>
                          <th className="px-3 py-2 font-medium">Nama</th>
                          <th className="px-3 py-2 font-medium">NPM</th>
                          <th className="px-3 py-2 font-medium">Prodi</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upPreview.slice(0, 10).map((r, i) => (
                          <tr key={`${r.npm}-${i}`} className="border-t border-neutral-200">
                            <td className="px-3 py-2 text-neutral-600">{r.line}</td>
                            <td className="px-3 py-2">{r.nama}</td>
                            <td className="px-3 py-2">{r.npm}</td>
                            <td className="px-3 py-2">{r.prodi}</td>
                            <td className="px-3 py-2">
                              {r.statusNorm ? (
                                <span className={`rounded px-2 py-0.5 text-xs ${r.statusNorm === 'Lolos Administrasi' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.statusNorm}</span>
                              ) : (
                                <span className="text-neutral-500">{r.statusRaw || '-'}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-neutral-600">{r.valid ? 'OK' : r.reason}</td>
                          </tr>
                        ))}
                        {upPreview.length > 10 && (
                          <tr className="border-t border-neutral-200">
                            <td className="px-3 py-2 text-neutral-500" colSpan={6}>
                              dan {upPreview.length - 10} baris lainnya…
                            </td>
                          </tr>
                        )}
                        {upPreview.length === 0 && (
                          <tr>
                            <td className="px-3 py-6 text-center text-neutral-500" colSpan={6}>
                              Belum ada file yang diunggah.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Error upload */}
              {upIssues?.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{upIssues.error}</div>}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={resetUpload} disabled={upLoading}>
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setUpModalOpen(false)} disabled={upLoading}>
                  Batal
                </button>
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${upUpdates.size > 0 ? 'bg-primary-500 hover:bg-primary-600' : 'bg-primary-300 cursor-not-allowed'}`}
                  onClick={submitUpload}
                  disabled={upUpdates.size === 0 || upLoading}
                  title={upUpdates.size === 0 ? 'Tidak ada pembaruan valid' : 'Terapkan pembaruan'}
                >
                  Terapkan Pembaruan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <Toasts items={toasts} onClose={closeToast} />
    </div>
  );
}
