import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, ExternalLink, FileX } from 'lucide-react';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

const DEFAULT_DOCS = [
  { key: 'ktmKtp', title: 'Scan KTP & KTM', desc: 'Dalam 1 file format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'transkrip', title: 'Transkrip Nilai', desc: 'Bertandatangan dan cap Koordinator Program Studi, format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'rekomendasi', title: 'Surat Rekomendasi', desc: 'Format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'suratAktif', title: 'Surat Keterangan Aktif', desc: 'Format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'sktmSlip', title: 'SKTM / Surat Keterangan Penghasilan / Slip Gaji', desc: 'Format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'formA1', title: 'Biodata Diri Form A.1', desc: 'Unduh formulir pada link yang tersedia.', kind: 'file' },
  { key: 'suratPernyataan', title: 'Surat Pernyataan Tidak Mendaftar/Menerima Beasiswa Lain', desc: 'Unduh formulir pada link yang tersedia.', kind: 'file' },
  { key: 'portofolio', title: 'Portofolio', desc: 'Dalam 1 file format PDF (Maks 10 MB).', kind: 'file' },
  { key: 'videoUrl', title: 'Link Video Pengenalan Diri dan Motivasi', desc: 'Tag Instagram @genbi.unsika, akun tidak di-private (Maks 2 menit).', kind: 'url' },
  { key: 'instagramUrl', title: 'Link Profil Instagram', desc: 'Akun tidak diprivat selama masa seleksi.', kind: 'url' },
];

function statusLabel(status) {
  if (!status) return 'Menunggu Verifikasi';
  if (status === 'MENUNGGU_VERIFIKASI') return 'Menunggu Verifikasi';
  if (status === 'LOLOS_ADMINISTRASI') return 'Lolos Administrasi';
  if (status === 'ADMINISTRASI_DITOLAK') return 'Administrasi Ditolak';
  return String(status);
}

function interviewStatusLabel(status) {
  if (!status || status === 'MENUNGGU_JADWAL') return 'Belum Dijadwalkan';
  if (status === 'DIJADWALKAN') return 'Dijadwalkan';
  if (status === 'LOLOS_WAWANCARA') return 'Lolos Wawancara';
  if (status === 'GAGAL_WAWANCARA') return 'Tidak Lolos Wawancara';
  return String(status);
}

const Badge = ({ children, intent = 'neutral' }) => {
  const styles = {
    neutral: 'border-neutral-200 bg-neutral-50 text-neutral-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-700',
  }[intent];
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles}`}>{children}</span>;
};

export default function ScholarshipDetail() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [row, setRow] = useState(null);
  const [docConfig, setDocConfig] = useState(DEFAULT_DOCS);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [appPayload, regPayload] = await Promise.all([apiRequest(`/scholarships/applications/${id}`, { method: 'GET' }), apiRequest(`/scholarships/registration`, { method: 'GET' }).catch(() => null)]);
        if (!alive) return;
        setRow(appPayload?.data || null);
        if (Array.isArray(regPayload?.data?.documents) && regPayload.data.documents.length > 0) {
          setDocConfig(regPayload.data.documents);
        }
      } catch (e) {
        if (!alive) return;
        const msg = e?.message || 'Gagal memuat data.';
        toast.error(msg);
        setError(msg);
        setRow(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const DOCS = useMemo(() => {
    if (!row?.files) return docConfig;
    const configKeys = new Set(docConfig.map((d) => d.key));
    const extraDocs = Object.keys(row.files)
      .filter((key) => !configKeys.has(key))
      .map((key) => ({ key, title: key, desc: '', kind: 'file' }));
    return [...docConfig, ...extraDocs];
  }, [docConfig, row]);

  const d = useMemo(() => {
    if (!row) return null;
    const birth = row.birthDate ? new Date(row.birthDate).toISOString().slice(0, 10) : '';
    return {
      ...row,
      birth,
      administrasi: statusLabel(row.administrasiStatus),
      interviewLabel: interviewStatusLabel(row.interviewStatus),
      interviewReviewerName: row.interviewReviewedBy?.profile?.name || row.interviewReviewedBy?.email || '',
      facultyName: row.faculty?.name || '',
      studyProgramName: row.studyProgram?.name || '',
      reviewerName: row.reviewedBy?.profile?.name || row.reviewedBy?.email || '',
    };
  }, [row]);

  const fmtIDDate = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const openFileObject = async (fileObjectId) => {
    try {
      const payload = await apiRequest(`/files/${fileObjectId}/link`, { method: 'GET' });
      const url = payload?.data?.previewUrl || payload?.data?.downloadUrl;
      if (!url) throw new Error('Link file tidak tersedia');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      const msg = e?.message || 'Gagal membuka file.';
      toast.error(msg);
    }
  };

  const renderDocRow = (doc) => {
    const val = d?.files?.[doc.key] ?? '';
    const isLink = doc.kind === 'url';
    const hasFile = Boolean(val);

    const { href, onClick } = (() => {
      if (!hasFile) return { href: '', onClick: undefined };
      if (isLink) return { href: String(val), onClick: undefined };
      const s = String(val);
      if (s.startsWith('http://') || s.startsWith('https://')) return { href: s, onClick: undefined };
      return {
        href: '#',
        onClick: (e) => {
          e.preventDefault();
          openFileObject(s);
        },
      };
    })();

    return (
      <div key={doc.key} className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900">{doc.title}</div>
          {doc.desc && <div className="text-xs text-neutral-500">{doc.desc}</div>}
        </div>
        <div className="mt-2 md:mt-0">
          {hasFile ? (
            isLink ? (
              <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors" title="Buka Tautan">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Buka Tautan</span>
              </a>
            ) : (
              <span
                onClick={
                  onClick ||
                  (() => {
                    if (href && href !== '#') {
                      window.open(href, '_blank', 'noopener,noreferrer');
                    }
                  })
                }
                className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                title="Lihat / Unduh"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Lihat Dokumen</span>
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
              <FileX className="w-4 h-4" />
              <span>Belum Diunggah</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  const adminIntent = d?.administrasi === 'Lolos Administrasi' ? 'success' : d?.administrasi === 'Administrasi Ditolak' ? 'danger' : 'warn';
  const interviewIntent = d?.interviewLabel === 'Lolos Wawancara' ? 'success' : d?.interviewLabel === 'Tidak Lolos Wawancara' ? 'danger' : d?.interviewLabel === 'Dijadwalkan' ? 'neutral' : 'warn';

  return (
    <div className="px-6 md:px-10 py-6">
      <Link to="/beasiswa" className="text-sm text-neutral-600 hover:underline">
        ← Kembali
      </Link>

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
        </div>
      )}
      {!loading && !error && !d && (
        <div className="mt-4">
          <EmptyState
            icon="search"
            title="Data tidak ditemukan"
            description="Pendaftar dengan ID ini tidak ada di sistem."
            action={
              <Link to="/beasiswa" className="btn btn-primary btn-sm">
                Kembali ke Daftar
              </Link>
            }
          />
        </div>
      )}

      {!loading && !error && d && (
        <>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">{d.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Periode:</span>
              <Badge intent="neutral">
                {d.year || new Date().getFullYear()} • Batch {d.batch || 1}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Status Administrasi:</span>
              <Badge intent={adminIntent}>{d.administrasi || 'Menunggu Verifikasi'}</Badge>
            </div>
            {d.administrasiStatus === 'LOLOS_ADMINISTRASI' && (
              <div className="flex items-center gap-2 mt-1 md:mt-0">
                <span className="text-sm text-neutral-500">Status Wawancara:</span>
                <Badge intent={interviewIntent}>{d.interviewLabel}</Badge>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Data Pribadi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" value={d.name} readOnly />
              <Input label="Email" value={d.email} readOnly />

              <Input label="Tanggal Lahir" type="date" value={d.birth} readOnly />
              <Input label="Gender" value={d.gender} readOnly />

              <Input label="NIK" value={d.nik} readOnly />
              <Input label="No Telp" value={d.phone} readOnly />

              <Input label="Fakultas" value={d.facultyName || '-'} readOnly />
              <Input label="Program Studi" value={d.studyProgramName || '-'} readOnly />

              <Input label="NPM" value={d.npm} readOnly />
              <Input label="Semester Saat Ini" value={d.semester} readOnly />

              <Input label="IPK" value={d.gpa} readOnly />
              <Input label="Usia" value={d.age} readOnly />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Pengetahuan GenBI</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Apakah kamu mengetahui komunitas GenBI Unsika?" value={d.knowGenbi || '-'} readOnly />
              <div />
              <Textarea label="Jika kamu mengetahuinya, jelaskan apa yang kamu ketahui mengenai GenBI Unsika?" value={d.knowDesc || ''} readOnly className="md:col-span-2" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Dokumen Pemberkasan</h3>
            <div className="space-y-3">{DOCS.map(renderDocRow)}</div>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Deklarasi</h3>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-800">
                <div className="mb-2 font-medium">Pernyataan Keaslian Data</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!d.agree} readOnly />
                  <span>
                    Saya <span className="font-medium">{d.name}</span> menyatakan data yang diserahkan benar milik saya dan tidak ada unsur kebohongan.
                  </span>
                </div>
                <div className="mt-2 text-xs text-neutral-500">Tanggal pengajuan: {d.submittedAt ? fmtIDDate(d.submittedAt) : '-'}</div>
                {d.reviewerName && (
                  <div className="mt-1 text-xs text-neutral-500">
                    Direview oleh: <span className="font-medium">{d.reviewerName}</span>
                    {d.reviewedAt ? ` pada ${fmtIDDate(d.reviewedAt)}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {d.administrasiStatus === 'LOLOS_ADMINISTRASI' && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Informasi Wawancara</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Status Wawancara" value={d.interviewLabel} readOnly />
                <Input label="Tanggal Wawancara" value={d.interviewDate ? new Date(d.interviewDate).toISOString().slice(0, 10) : '-'} readOnly />
                <Input label="Waktu Wawancara" value={d.interviewTime || '-'} readOnly />
                <Input label="Lokasi / Link" value={d.interviewLocation || '-'} readOnly />
              </div>
              {d.interviewNotes && (
                <div className="mt-4">
                  <Textarea label="Catatan Wawancara" value={d.interviewNotes} readOnly />
                </div>
              )}
              {d.interviewReviewerName && (
                <div className="mt-2 text-xs text-neutral-500">
                  Dikelola oleh: <span className="font-medium">{d.interviewReviewerName}</span>
                  {d.interviewReviewedAt ? ` pada ${fmtIDDate(d.interviewReviewedAt)}` : ''}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
