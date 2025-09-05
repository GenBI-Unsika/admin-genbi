import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, X, CheckCircle2, XCircle } from 'lucide-react';

const ROLES = ['super_admin', 'admin', 'reviewer', 'advisor', 'student', 'awardee'];

const roleLabel = (name) => name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminUserForm({ mode: modeProp }) {
  const params = useParams();
  const navigate = useNavigate();

  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';

  // Prefill contoh saat edit
  const initial = useMemo(() => (isEdit ? { name: 'Nama Contoh', email: 'contoh@example.com', role: 'Editor', active: true } : { name: '', email: '', role: 'Viewer', active: true }), [isEdit]);

  const [form, setForm] = useState(initial);

  const submit = (e) => {
    e.preventDefault();
    // TODO: hubungkan ke API
    navigate('/admin/users', { replace: true });
  };

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

        {/* 2 kolom per baris di >= md */}
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 md:max-w-full" onSubmit={submit}>
          {/* Nama */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Nama</label>
            <input className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Email</label>
            <input type="email" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Role</label>
            <select className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-primary-500" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Segmented Toggle Status (lebih tegas warnanya) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-800">Status Akun</label>
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
            <p className="mt-1 text-xs text-neutral-500">Nonaktifkan untuk menonblokir akses login sementara.</p>
          </div>

          {/* Actions (full width, letakkan di baris baru) */}
          <div className="md:col-span-2 mt-2 flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/users')} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              <X className="h-4 w-4" />
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
            >
              <Save className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
