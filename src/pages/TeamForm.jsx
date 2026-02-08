import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Save, Loader2, ArrowLeft, User, GraduationCap, Phone, Mail, Upload, X, Hash, AtSign } from 'lucide-react';
import { apiRequest, apiUpload } from '../utils/api';

const initialFormState = {
  name: '',
  npm: '',
  jabatan: '',
  division: '',
  faculty: '',
  major: '',
  cohort: '',
  phone: '',
  email: '',
  birthDate: '',
  photo: '',
  motivasi: '',
  cerita: '',
  isActive: true,
  sortOrder: 0,
};

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export default function TeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const avatarInputRef = useRef(null);

  const [form, setForm] = useState(initialFormState);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await apiRequest('/divisions');
        setDivisions(response?.data || []);
      } catch (err) {
        console.error('Failed to fetch divisions:', err);
      }
    };
    fetchDivisions();
  }, []);


  const fetchMember = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/teams/admin/all`);
      const member = response?.data?.find((m) => m.id === id);
      if (!member) {
        setError('Anggota tidak ditemukan');
        return;
      }
      setForm({
        ...initialFormState,
        ...member,
        birthDate: formatDateForInput(member.birthDate),
        cohort: member.cohort?.toString() || '',
      });
    } catch (err) {
      console.error('Failed to fetch member:', err);
      setError(err.message || 'Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  const handleNpmChange = (value) => {
    const npm = value.replace(/\D/g, '');
    setForm((prev) => ({
      ...prev,
      npm,
      email: npm ? `${npm}@student.unsika.ac.id` : prev.email,
    }));
  };


  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }


    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiUpload('/upload', formData);
      if (response?.data?.url) {
        setForm((prev) => ({ ...prev, photo: response.data.url }));
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert(err.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setForm((prev) => ({ ...prev, photo: '' }));
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Nama wajib diisi');
      return;
    }
    if (!form.npm.trim()) {
      alert('NPM wajib diisi');
      return;
    }
    if (!form.division) {
      alert('Divisi wajib dipilih');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        npm: form.npm || null,
        jabatan: form.jabatan || null,
        division: form.division,
        faculty: form.faculty || null,
        major: form.major || null,
        cohort: form.cohort ? parseInt(form.cohort, 10) : null,
        phone: form.phone || null,
        email: form.email || null,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        photo: form.photo || null,
        motivasi: form.motivasi || null,
        cerita: form.cerita || null,
        isActive: form.isActive,
        sortOrder: form.sortOrder || 0,
      };

      if (isEdit) {
        await apiRequest(`/teams/${id}`, { method: 'PATCH', body: payload });
      } else {
        await apiRequest('/teams', { method: 'POST', body: payload });
      }

      navigate('/anggota');
    } catch (err) {
      console.error('Failed to save member:', err);
      alert(err.message || 'Gagal menyimpan data anggota');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-3 text-neutral-600">Memuat data...</span>
      </div>
    );
  }

  if (error && isEdit) {
    return (
      <div className="px-6 md:px-10 py-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/anggota" className="text-primary-600 hover:underline">
          Kembali ke daftar anggota
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-6 max-w-4xl">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <Link to="/anggota" className="hover:text-neutral-800 hover:underline">
          Anggota
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">{isEdit ? 'Edit' : 'Tambah'}</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/anggota')} className="p-2 hover:bg-neutral-100 rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">{isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
          <p className="text-sm text-neutral-600">{isEdit ? 'Perbarui data anggota GenBI' : 'Tambahkan anggota baru ke GenBI UNSIKA'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Informasi Dasar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Informasi Dasar
          </h3>

          {/* Upload Avatar */}
          <div className="mb-6 flex items-start gap-5">
            <div className="relative group">
              {form.photo ? (
                <div className="relative">
                  <img src={form.photo} alt="Avatar" className="w-24 h-24 rounded-xl object-cover border-2 border-neutral-200" />
                  <button type="button" onClick={removeAvatar} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md" title="Hapus foto">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-700 mb-2">Foto Profil</p>
              <p className="text-xs text-neutral-500 mb-3">Format: JPG, PNG. Maksimal 2MB.</p>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
              <label htmlFor="avatar-upload" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {form.photo ? 'Ganti Foto' : 'Upload Foto'}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                NPM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.npm}
                onChange={(e) => handleNpmChange(e.target.value)}
                placeholder="Contoh: 2241720001"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Email kampus akan otomatis terisi berdasarkan NPM</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Divisi <span className="text-red-500">*</span>
              </label>
              <select value={form.division} onChange={(e) => handleChange('division', e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200" required>
                <option value="">Pilih Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id || d.key} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Jabatan</label>
              <input
                type="text"
                value={form.jabatan}
                onChange={(e) => handleChange('jabatan', e.target.value)}
                placeholder="Misal: Koordinator, Wakil Koordinator"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Urutan Tampilan</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Informasi Akademik */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Informasi Akademik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Fakultas</label>
              <input
                type="text"
                value={form.faculty}
                onChange={(e) => handleChange('faculty', e.target.value)}
                placeholder="Misal: Fakultas Teknik"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Program Studi</label>
              <input
                type="text"
                value={form.major}
                onChange={(e) => handleChange('major', e.target.value)}
                placeholder="Misal: Informatika"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Angkatan</label>
              <input
                type="text"
                value={form.cohort}
                onChange={(e) => handleChange('cohort', e.target.value)}
                placeholder="Misal: 2022"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Kontak
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5" />
                Email Kampus
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="NPM@student.unsika.ac.id"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200 bg-neutral-50"
                readOnly
              />
              <p className="text-xs text-neutral-500 mt-1">Otomatis dari NPM</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">No. Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Lahir</label>
              <input type="date" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
          </div>
        </div>

        {/* Status Keanggotaan */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
              Anggota Aktif
            </label>
          </div>
        </div>

        {/* Motivasi & Cerita */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">Motivasi & Cerita (Opsional)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Motivasi</label>
              <textarea
                value={form.motivasi}
                onChange={(e) => handleChange('motivasi', e.target.value)}
                placeholder="Motivasi mengikuti GenBI..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cerita</label>
              <textarea
                value={form.cerita}
                onChange={(e) => handleChange('cerita', e.target.value)}
                placeholder="Cerita pengalaman di GenBI..."
                rows={4}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Aksi */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/anggota')} className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors" disabled={saving}>
            Batal
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-all">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
