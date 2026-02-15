import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, X, CheckCircle2, XCircle, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { apiGet, apiPost, apiPatch } from '../utils/api';
import CoverUpload from '../components/ui/CoverUpload';

const ROLES = ['super_admin', 'admin', 'awardee', 'alumni'];
const roleLabel = (name) => {
  const map = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    awardee: 'Awardee',
    alumni: 'Alumni',
  };
  return map[name] || name;
};

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
    role: 'awardee',
    active: true,
    password: '',
    phone: '',
    npm: '',
    gender: '',
    birthDate: '',
    semester: '',
    studyProgramId: '',
    divisionId: '',
    facultyId: '', // To filter study programs

    jabatan: '',
    avatar: '',
    instagram: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  const [faculties, setFaculties] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch faculties and divisions on mount
  useEffect(() => {
    Promise.all([apiGet('/master-data/faculties'), apiGet('/divisions/admin/all')])
      .then(([facultiesRes, divisionsRes]) => {
        const facultiesData = facultiesRes.data || facultiesRes || [];
        const divisionsData = divisionsRes.data || divisionsRes || [];
        setFaculties(facultiesData);
        setDivisions(divisionsData);
      })
      .catch((err) => { /* Error fetching initial data */ });
  }, []);

  // Update study programs when faculty changes
  useEffect(() => {
    if (form.facultyId && faculties.length > 0) {
      const faculty = faculties.find((f) => f.id === parseInt(form.facultyId));
      setStudyPrograms(faculty?.studyPrograms || []);
    } else {
      setStudyPrograms([]);
    }
  }, [form.facultyId, faculties]);

  // Fetch user data when editing
  useEffect(() => {
    if (isEdit && userId) {
      setLoading(true);
      apiGet(`/users/${userId}`)
        .then((data) => {
          const socials = data.socials || {};

          setForm(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'awardee',
            active: data.isActive ?? true,
            password: '', // Always empty on edit
            phone: data.phone || '',
            npm: data.npm || '',
            gender: data.gender || '',
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
            semester: data.semester || '',
            studyProgramId: data.studyProgramId || '',
            divisionId: data.divisionId || '',
            facultyId: data.facultyId ? String(data.facultyId) : '',
            jabatan: data.jabatan || '',
            avatar: data.avatar || '',
            instagram: socials.instagram || '',
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankAccountName: data.bankAccountName || '',
          }));
        })
        .catch((err) => {
          // Error fetching user
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
      const socials = {
        instagram: form.instagram,
      };

      const payload = {
        name: form.name?.trim(),
        email: form.email?.trim(),
        role: form.role,
        isActive: form.active,
        phone: form.phone?.trim() || null,
        npm: form.npm?.trim() || null,
        gender: form.gender || null,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        semester: form.semester ? parseInt(form.semester) : null,
        studyProgramId: form.studyProgramId ? parseInt(form.studyProgramId) : null,
        divisionId: form.divisionId ? parseInt(form.divisionId) : null,
        jabatan: form.jabatan?.trim() || null,
        socials: socials,
        avatarTempId: form.avatar?.tempId || undefined,
        avatar: typeof form.avatar === 'string' ? form.avatar : (form.avatar?.url || null),
        bankName: form.bankName?.trim() || null,
        bankAccountNumber: form.bankAccountNumber?.trim() || null,
        bankAccountName: form.bankAccountName?.trim() || null,
      };

      // Hanya kirim password jika diisi
      if (form.password) {
        payload.password = form.password;
      }

      if (isEdit) {
        await apiPatch(`/users/${userId}`, payload);
      } else {
        // Mode Buat
        if (!form.password) {
          throw new Error('Password wajib diisi untuk user baru.');
        }
        await apiPost('/users', payload);
      }

      toast.success(isEdit ? 'Data user berhasil diperbarui' : 'User baru berhasil ditambahkan');
      navigate('/admin/users', { replace: true });
    } catch (err) {
      // Submit error
      const message = err.payload?.message || err.message || 'Gagal menyimpan data.';
      toast.error(message);
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
    <div className="px-6 md:px-10 py-6 mb-10">
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

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
        <h3 className="mb-6 text-xl font-semibold text-neutral-900 border-b border-neutral-200 pb-4">{isEdit ? 'Edit User' : 'Tambah User'}</h3>

        <form onSubmit={submit} className="space-y-8">

          {/* Account Info */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Informasi Akun</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Nama *</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Email *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100 disabled:text-neutral-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={isEdit}
                  autoComplete="off"
                />
                {isEdit && <p className="mt-1 text-xs text-neutral-400">Email tidak dapat diubah.</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">No. Telepon</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Jenis Kelamin</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Tanggal Lahir</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Foto Profil</label>
                <CoverUpload
                  value={form.avatar}
                  onChange={(val) => setForm({ ...form, avatar: val })}
                  folder="profiles/avatars"
                  useStaging
                  aspectRatio="square"
                  placeholder="Klik untuk upload foto profil"
                />
                <p className="mt-1 text-xs text-neutral-400">Gunakan foto dengan rasio 1:1.</p>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Data Akademik</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">NPM</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.npm}
                  onChange={(e) => setForm({ ...form, npm: e.target.value })}
                  placeholder="NPM Mahasiswa"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Semester</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  >
                    <option value="">Pilih Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Fakultas</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.facultyId}
                    onChange={(e) => {
                      setForm({ ...form, facultyId: e.target.value, studyProgramId: '' });
                    }}
                  >
                    <option value="">Pilih Fakultas</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Program Studi</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100"
                    value={form.studyProgramId}
                    onChange={(e) => setForm({ ...form, studyProgramId: e.target.value })}
                    disabled={!form.facultyId}
                  >
                    <option value="">Pilih Program Studi</option>
                    {studyPrograms.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
                {!form.facultyId && <p className="mt-1 text-xs text-neutral-400">Pilih fakultas terlebih dahulu</p>}
              </div>
            </div>
          </div>

          {/* Organization & Bio */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Keorganisasian & Bio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Divisi</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.divisionId}
                    onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Jabatan</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                  >
                    <option value="">Pilih Jabatan</option>
                    {[
                      'Ketua Umum',
                      'Sekretaris Umum 1',
                      'Sekretaris Umum 2',
                      'Bendahara Umum 1',
                      'Bendahara Umum 2',
                      'Koordinator',
                      'Sekretaris',
                      'Bendahara',
                      'Staff'
                    ].map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Media Sosial</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Instagram</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Data Bank</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Nama Bank</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="Nama Bank"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">No. Rekening</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                  placeholder="Nomor Rekening"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Atas Nama</label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  value={form.bankAccountName}
                  onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                  placeholder="Pemilik Rekening"
                />
              </div>
            </div>
          </div>

          {/* Role & Security */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Role & Keamanan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Role */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Role *</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">{isEdit ? 'Password Baru (Opsional)' : 'Password *'}</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder={isEdit ? 'Biarkan kosong jika tidak ingin mengubah' : 'Masukkan password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!isEdit}
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-xs text-neutral-400">Minimal 8 karakter</p>
              </div>

              {/* Status Akun */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Status Akun</label>
                <div role="group" aria-label="Status akun" className="inline-flex w-full max-w-[280px] overflow-hidden rounded-xl border border-neutral-200">
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
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${!form.active ? 'bg-neutral-400 text-neutral-50' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                    title="Nonaktifkan akun"
                  >
                    <XCircle className={`h-4 w-4 ${!form.active ? 'text-neutral-50' : 'text-neutral-500'}`} />
                    Nonaktif
                  </button>
                </div>
                <p className="mt-1 text-xs text-neutral-500">Nonaktifkan untuk memblokir akses login sementara.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 mt-4 flex items-center gap-3 border-t border-neutral-200 pt-4">
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
