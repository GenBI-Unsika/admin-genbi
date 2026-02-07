// src/pages/ScholarshipDetail.jsx
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

// === Konfigurasi dokumen (sinkron dengan ScholarshipRegister) ===
const DOCS = [
  { key: 'formA1', title: 'Form A.1 & Surat Pernyataan', desc: 'PDF bertanda tangan.' },
  { key: 'ktmKtp', title: 'KTM & KTP', desc: 'Gabung 1 PDF.' },
  { key: 'transkrip', title: 'Transkrip Nilai', desc: 'Cap & ttd Prodi.' },
  { key: 'motivation', title: 'Motivation Letter', desc: 'Bahasa Indonesia.' },
  { key: 'sktmSlip', title: 'SKTM / Slip Gaji Orang Tua', desc: 'Pilih salah satu.' },
  { key: 'rekomendasi', title: 'Surat Rekomendasi', desc: 'Tokoh akademik/non.' },
  { key: 'videoUrl', title: 'URL Video IG (Reels)', desc: 'Men-tag @genbi.unsika.' },
  { key: 'lainnya1', title: 'Dokumen Tambahan 1' },
  { key: 'lainnya2', title: 'Dokumen Tambahan 2' },
];

function statusLabel(status) {
  if (!status) return 'Menunggu Verifikasi';
  if (status === 'MENUNGGU_VERIFIKASI') return 'Menunggu Verifikasi';
  if (status === 'LOLOS_ADMINISTRASI') return 'Lolos Administrasi';
  if (status === 'ADMINISTRASI_DITOLAK') return 'Administrasi Ditolak';
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

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await apiRequest(`/scholarships/applications/${id}`, { method: 'GET' });
        if (!alive) return;
        setRow(payload?.data || null);
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

  const d = useMemo(() => {
    if (!row) return null;
    const birth = row.birthDate ? new Date(row.birthDate).toISOString().slice(0, 10) : '';
    return {
      ...row,
      birth,
      administrasi: statusLabel(row.administrasiStatus),
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
    const isLink = doc.key === 'videoUrl';
    const hasFile = Boolean(val);

    const { href, onClick } = (() => {
      if (!hasFile) return { href: '', onClick: undefined };
      if (isLink) return { href: String(val), onClick: undefined };
      const s = String(val);
      if (s.startsWith('http://') || s.startsWith('https://')) return { href: s, onClick: undefined };
      // assume FileObject ID
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
              <a href={href} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm">
                Buka Tautan
              </a>
            ) : (
              <a href={href} onClick={onClick} target={onClick ? undefined : '_blank'} rel={onClick ? undefined : 'noreferrer'} className="text-primary-600 hover:underline text-sm">
                Lihat / Unduh
              </a>
            )
          ) : (
            <span className="text-sm text-neutral-500">Belum diunggah</span>
          )}
        </div>
      </div>
    );
  };

  const adminIntent = d?.administrasi === 'Lolos Administrasi' ? 'success' : d?.administrasi === 'Administrasi Ditolak' ? 'danger' : 'warn';

  return (
    <div className="px-6 md:px-10 py-6">
      <Link to="/beasiswa" className="text-sm text-neutral-600 hover:underline">
        ← Kembali
      </Link>

      {loading && <div className="mt-4 text-sm text-neutral-600">Memuat...</div>}
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
            {/* Status Administrasi (opsional, tampilkan ringkas di header) */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Status Administrasi:</span>
              <Badge intent={adminIntent}>{d.administrasi || 'Menunggu Verifikasi'}</Badge>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Data Pribadi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" value={d.name} readOnly />
              <Input label="Email" value={d.email} readOnly />

              <Input label="Tanggal Lahir" type="date" value={d.birth} readOnly />
              <Input label="Gender" value={d.gender} readOnly />

              <Input label="NIK" value={d.nik} readOnly />
              <Input label="No Telp" value={d.phone} readOnly />

              <Input label="Fakultas" value={d.faculty} readOnly />
              <Input label="Program Studi" value={d.study} readOnly />

              <Input label="NPM" value={d.npm} readOnly />
              <Input label="Semester Saat Ini" value={d.semester} readOnly />

              <Input label="IPK" value={d.gpa} readOnly />
              <Input label="Usia" value={d.age} readOnly />
            </div>
          </div>

          {/* Jawaban Pengetahuan GenBI */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Pengetahuan GenBI</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Apakah kamu mengetahui komunitas GenBI Unsika?" value={d.knowGenbi || '-'} readOnly />
              <div />
              <Textarea label="Jika kamu mengetahuinya, jelaskan apa yang kamu ketahui mengenai GenBI Unsika?" value={d.knowDesc || ''} readOnly className="md:col-span-2" />
            </div>
          </div>

          {/* Pemberkasan */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Dokumen Pemberkasan</h3>
            <div className="space-y-3">{DOCS.map(renderDocRow)}</div>
          </div>

          {/* Deklarasi & Metadata */}
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
              </div>
            </div>

            {/* (Opsional) tombol admin—jika ingin edit manual di sini, bisa tambahkan aksi */}
            {/* <div className="mt-4 flex justify-end">
          <button className="btn-primary">Simpan Perubahan</button>
        </div> */}
          </div>
        </>
      )}
    </div>
  );
}
