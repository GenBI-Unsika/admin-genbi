import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Save, Loader2, ArrowLeft } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

const ICON_OPTIONS = ['👑', '📢', '📚', '🌿', '💼', '🏥', '🎯', '💡', '🎨', '🔧', '📊', '🤝', '👥', '🏆', '⚡', '🌟'];

export default function DivisionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '👥',
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

        const response = await apiRequest('/divisions/admin/all');
        const divisions = response?.data || [];
        const division = divisions.find((d) => d.id === divisionId);

        if (!division) {
          setError({ kind: 'not-found', message: 'Data divisi tidak tersedia.' });
          return;
        }

        setForm({
          name: division.name || '',
          description: division.description || '',
          icon: division.icon || '👥',
          isActive: division.isActive ?? true,
        });
      } catch (err) {
        // Error loading division
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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIconSelect = (icon) => {
    setForm((prev) => ({ ...prev, icon }));
  };

  const generateKey = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        key: generateKey(form.name),
        gradient: 'from-neutral-400 to-neutral-500',
        bgLight: 'bg-slate-50',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        sortOrder: 0,
      };

      if (isEdit) {
        await apiRequest(`/divisions/${id}`, { method: 'PUT', body: payload });
      } else {
        await apiRequest('/divisions', { method: 'POST', body: payload });
      }
      navigate('/divisi');
    } catch (err) {
      // Error saving division
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

      <div className="bg-white rounded-xl border border-neutral-200">
        <form onSubmit={handleSubmit} aria-disabled={!!error && error.kind !== 'error'}>
          <div className="p-6 space-y-5">
            <h3 className="text-base font-semibold text-neutral-900">Informasi Divisi</h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Divisi *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                placeholder="Contoh: Divisi Komunikasi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none"
                placeholder="Deskripsi singkat tentang divisi..."
              />
            </div>

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
                className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-xl outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
                Divisi Aktif
              </label>
            </div>
          </div>

          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50 flex justify-end gap-3 rounded-b-xl">
            <Link to="/divisi" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Divisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
