import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Save, Loader2, ArrowLeft, Eye } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

// Preset color options for divisions (tanpa gradient)
const COLOR_PRESETS = [
  { name: 'Violet', swatch: 'bg-violet-500', bgLight: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
  { name: 'Blue', swatch: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { name: 'Amber', swatch: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-800', borderColor: 'border-amber-200' },
  { name: 'Emerald', swatch: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { name: 'Rose', swatch: 'bg-rose-500', bgLight: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  { name: 'Slate', swatch: 'bg-slate-600', bgLight: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
];

// Common emoji icons for divisions
const ICON_OPTIONS = ['👑', '📢', '📚', '🌿', '💼', '🏥', '🎯', '💡', '🎨', '🔧', '📊', '🤝', '👥', '🏆', '⚡', '🌟'];

export default function DivisionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { kind: 'not-found'|'forbidden'|'error', message: string }

  const [form, setForm] = useState({
    key: '',
    name: '',
    description: '',
    icon: '👥',
    // Disimpan untuk kompatibilitas API, tapi tidak ditampilkan sebagai gradient di UI
    gradient: 'from-neutral-400 to-neutral-500',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!isEdit) return;

    async function loadDivision() {
      setLoading(true);
      try {
        const divisionId = Number.parseInt(String(id), 10);
        if (!Number.isInteger(divisionId) || divisionId <= 0) {
          setError({ kind: 'not-found', message: 'Data divisi tidak tersedia.' });
          return;
        }

        // For editing, we need to fetch by ID - but our API uses key for public
        // So we'll fetch all and find by ID
        const response = await apiRequest('/divisions/admin/all');
        const divisions = response?.data || [];
        const division = divisions.find((d) => d.id === divisionId);

        if (!division) {
          setError({ kind: 'not-found', message: 'Data divisi tidak tersedia.' });
          return;
        }

        setForm({
          key: division.key || '',
          name: division.name || '',
          description: division.description || '',
          icon: division.icon || '👥',
          gradient: division.gradient || 'from-neutral-400 to-neutral-500',
          bgLight: division.bgLight || 'bg-slate-50',
          textColor: division.textColor || 'text-slate-600',
          borderColor: division.borderColor || 'border-slate-200',
          sortOrder: division.sortOrder ?? 0,
          isActive: division.isActive ?? true,
        });
      } catch (err) {
        console.error('Failed to load division:', err);
        if (err?.status === 403) {
          setError({ kind: 'forbidden', message: 'Anda tidak memiliki izin untuk mengakses fitur ini.' });
        } else {
          setError({ kind: 'error', message: err?.message || 'Gagal memuat data divisi' });
        }
      } finally {
        setLoading(false);
      }
    }

    loadDivision();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleColorPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      bgLight: preset.bgLight,
      textColor: preset.textColor,
      borderColor: preset.borderColor,
    }));
  };

  const handleIconSelect = (icon) => {
    setForm((prev) => ({ ...prev, icon }));
  };

  const generateKey = () => {
    const key = form.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setForm((prev) => ({ ...prev, key }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await apiRequest(`/divisions/${id}`, { method: 'PUT', body: form });
      } else {
        await apiRequest('/divisions', { method: 'POST', body: form });
      }
      navigate('/divisi');
    } catch (err) {
      console.error('Failed to save division:', err);
      if (err?.status === 403) {
        setError({ kind: 'forbidden', message: 'Anda tidak memiliki izin untuk melakukan aksi ini.' });
      } else {
        setError({ kind: 'error', message: err?.message || 'Gagal menyimpan divisi' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-3 text-neutral-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <Link to="/divisi" className="hover:text-neutral-800 hover:underline">
          Divisi
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">{isEdit ? 'Edit Divisi' : 'Tambah Divisi'}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">{isEdit ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h2>
          <p className="text-sm text-neutral-600">{isEdit ? 'Perbarui informasi divisi.' : 'Buat divisi baru untuk organisasi.'}</p>
        </div>
        <Link to="/divisi" className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </div>

      {error?.kind === 'forbidden' && (
        <div className="mb-6">
          <EmptyState icon="error" title="Akses dibatasi" description={error.message} variant="warning" />
        </div>
      )}

      {error?.kind === 'not-found' && (
        <div className="mb-6">
          <EmptyState icon="inbox" title="Data tidak tersedia" description="Divisi yang Anda cari tidak ditemukan atau sudah dihapus." />
        </div>
      )}

      {error?.kind === 'error' && (
        <div className="mb-6">
          <EmptyState icon="error" title="Terjadi kesalahan" description={error.message} variant="warning" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-disabled={!!error && error.kind !== 'error'}>
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-5">
            <h3 className="text-base font-semibold text-neutral-900">Informasi Dasar</h3>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Divisi *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                placeholder="Contoh: Divisi Komunikasi"
              />
            </div>

            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Key (URL-friendly) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                  placeholder="contoh: divisi-komunikasi"
                />
                <button type="button" onClick={generateKey} className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200">
                  Generate
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Hanya huruf kecil, angka, dan strip (-)</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)] resize-none"
                placeholder="Deskripsi singkat tentang divisi..."
              />
            </div>

            {/* Sort Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Urutan</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleChange}
                  min={0}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
                  Divisi Aktif
                </label>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-5">
            <h3 className="text-base font-semibold text-neutral-900">Tampilan</h3>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Ikon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleIconSelect(icon)}
                    className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-all ${form.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">Atau masukkan emoji kustom:</p>
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                maxLength={4}
                className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-xl outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
              />
            </div>

            {/* Color Preset */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Skema Warna</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleColorPreset(preset)}
                    className={`p-2 rounded-lg border-2 transition-all ${form.bgLight === preset.bgLight ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    <div className={`h-6 rounded ${preset.swatch} mb-1`} />
                    <span className="text-xs text-neutral-600">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Divisi'}
            </button>
          </div>
        </div>

        {/* Preview - Simplified without technical details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </h3>

            {/* Card Preview */}
            <div className={`rounded-xl border ${form.borderColor} overflow-hidden shadow-sm`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${form.bgLight} flex items-center justify-center text-2xl`}>{form.icon}</div>
                  <span className={`px-2 py-1 ${form.bgLight} ${form.textColor} rounded-full text-xs font-semibold`}>0 anggota</span>
                </div>
                <h4 className="text-base font-bold text-neutral-900 mb-1">{form.name || 'Nama Divisi'}</h4>
                <p className="text-xs text-neutral-600 line-clamp-2">{form.description || 'Deskripsi divisi akan muncul di sini...'}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-500 text-center">Tampilan kartu divisi di halaman publik</p>
          </div>
        </div>
      </form>
    </div>
  );
}
