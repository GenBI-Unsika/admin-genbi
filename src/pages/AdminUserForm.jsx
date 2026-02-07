import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { apiGet, apiPost, apiPatch } from '../utils/api';

const ROLES = ['super_admin', 'admin', 'reviewer', 'advisor', 'student', 'awardee'];
// list prodi/fakultas bisa ditambah jika perlu (misal untuk awardee/student)

const roleLabel = (name) => name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminUserForm({ mode: modeProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';
  const userId = params.id;

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'student', // default
    active: true,
    password: '', // only for create / optional update
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data user saat edit
  useEffect(() => {
    if (isEdit && userId) {
      setLoading(true);
      apiGet(`/users/${userId}`)
        .then((data) => {
          setForm({
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'student',
            active: data.isActive ?? true,
            password: '', // kosongkan password
          });
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          setError(err.message || 'Gagal memuat data user');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, userId]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const ok = await confirm({
      title: isEdit ? 'Simpan perubahan?' : 'Tambah User Baru?',
      description: isEdit ? 'Data user akan diperbarui.' : 'User baru akan ditambahkan ke sistem.',
      confirmText: 'Simpan',
      cancelText: 'Batal',
    });

    if (!ok) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: form.active,
      };

      // Hanya kirim password jika diisi (untuk update) atau wajib (untuk create)
      if (form.password) {
        payload.password = form.password;
      }

      if (isEdit) {
        await apiPatch(`/users/${userId}`, payload);
      } else {
        // Create mode
        if (!form.password) {
          throw new Error('Password wajib diisi untuk user baru.');
        }
        await apiPost('/users', payload);
      }

      navigate('/admin/users', { replace: true });
    } catch (err) {
      console.error('Submit error:', err);
      // Tampilkan error (bisa pakai toast atau alert biasa)
      alert(err.message || 'Gagal menyimpan data.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/admin/users')} className="px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200">
          Kembali
        </button>
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
        <Link to="/admin/users" className="hover:text-neutral-800 hover:underline">
          Kelola User
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">{isEdit ? 'Edit User' : 'Tambah User'}</span>
      </nav>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">{isEdit ? 'Edit User' : 'Tambah User'}</h3>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 md:max-w-full" onSubmit={submit}>
          {/* Nama */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Nama</label>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={isEdit} // Email biasanya tidak boleh diganti sembarangan / key
            />
            {isEdit && <p className="mt-1 text-xs text-neutral-400">Email tidak dapat diubah.</p>}
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Role</label>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Password (Optional for Edit) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">
              {isEdit ? 'Password Baru (Opsional)' : 'Password'}
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500"
              placeholder={isEdit ? 'Biarkan kosong jika tidak ingin mengubah' : 'Masukkan password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!isEdit}
              minLength={6}
            />
          </div>

          {/* Status Akun */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-800">Status Akun</label>
            <div
              role="group"
              aria-label="Status akun"
              className="inline-flex w-full max-w-[280px] overflow-hidden rounded-xl border border-neutral-200"
            >
              <button
                type="button"
                aria-pressed={form.active}
                onClick={() => setForm({ ...form, active: true })}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition
                  ${form.active ? 'bg-green-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                title="Aktifkan akun"
              >
                <CheckCircle2 className={`h-4 w-4 ${form.active ? 'text-white' : 'text-neutral-500'}`} />
                Aktif
              </button>
              <div className="w-px bg-neutral-200" />
              <button
                type="button"
                aria-pressed={!form.active}
                onClick={() => setForm({ ...form, active: false })}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
                  !form.active ? 'bg-neutral-400 text-neutral-50' : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
                title="Nonaktifkan akun"
              >
                <XCircle className={`h-4 w-4 ${!form.active ? 'text-neutral-50' : 'text-neutral-500'}`} />
                Nonaktif
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Nonaktifkan untuk memblokir akses login sementara.</p>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              disabled={saving}
            >
              <X className="h-4 w-4" />
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
