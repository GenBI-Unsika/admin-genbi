import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { Search, Plus, Pencil, Trash2, UserCheck, UserX, ChevronRight } from 'lucide-react';

/** ===== Definisi Role (sinkron dgn JSON-mu) ===== */
const ROLE_DEFS = [
  { role_name: 'super_admin', label: 'Super Admin' },
  { role_name: 'admin', label: 'Admin' },
  { role_name: 'reviewer', label: 'Reviewer' },
  { role_name: 'advisor', label: 'Advisor' },
  { role_name: 'student', label: 'Student' },
  { role_name: 'awardee', label: 'Awardee' },
];
const roleLabel = (name) => ROLE_DEFS.find((r) => r.role_name === name)?.label || name;

/** 15 data dummy (ganti dgn data API mu) */
const DUMMY_15 = [
  { id: 1, name: 'Raina Putri', email: 'raina@example.com', role: 'super_admin', createdAt: '2024-03-07', active: true },
  { id: 2, name: 'Dimas Arya', email: 'dimas@example.com', role: 'reviewer', createdAt: '2024-03-08', active: true },
  { id: 3, name: 'Sari Lestari', email: 'sari@example.com', role: 'student', createdAt: '2024-03-08', active: false },
  { id: 4, name: 'Devi Maulana', email: 'devi@example.com', role: 'admin', createdAt: '2024-03-09', active: true },
  { id: 5, name: 'Reno Pratama', email: 'reno@example.com', role: 'advisor', createdAt: '2024-03-10', active: true },
  { id: 6, name: 'Laras Wulandari', email: 'laras@example.com', role: 'awardee', createdAt: '2024-03-11', active: true },
  { id: 7, name: 'Bagas Saputra', email: 'bagas@example.com', role: 'reviewer', createdAt: '2024-03-11', active: false },
  { id: 8, name: 'Nadia Salsabila', email: 'nadia@example.com', role: 'student', createdAt: '2024-03-12', active: true },
  { id: 9, name: 'Fikri Rahman', email: 'fikri@example.com', role: 'admin', createdAt: '2024-03-12', active: true },
  { id: 10, name: 'Rizki Amelia', email: 'rizki@example.com', role: 'awardee', createdAt: '2024-03-13', active: false },
  { id: 11, name: 'Aulia Shafira', email: 'aulia@example.com', role: 'advisor', createdAt: '2024-03-13', active: true },
  { id: 12, name: 'Yoga Firmansyah', email: 'yoga@example.com', role: 'student', createdAt: '2024-03-14', active: true },
  { id: 13, name: 'Putri Anindya', email: 'putri@example.com', role: 'reviewer', createdAt: '2024-03-14', active: true },
  { id: 14, name: 'Bima Aditya', email: 'bima@example.com', role: 'admin', createdAt: '2024-03-15', active: false },
  { id: 15, name: 'Maya Kartika', email: 'maya@example.com', role: 'awardee', createdAt: '2024-03-15', active: true },
];

const PER_PAGE = 10;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // "" = semua
  const [users, setUsers] = useState(DUMMY_15);
  const [page, setPage] = useState(1);

  // reset page saat filter/search berubah
  useEffect(() => {
    setPage(1);
  }, [q, roleFilter]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = users;
    if (s) {
      list = list.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || roleLabel(u.role).toLowerCase().includes(s));
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [q, users, roleFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageItems = filtered.slice(start, end);

  const onDelete = (id) => {
    if (confirm('Hapus user ini?')) setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const setActive = (id, active) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));
  };

  return (
    <div className="px-6 md:px-10 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">Kelola User</span>
      </nav>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Kelola User</h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter role */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-700">Role</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-800 outline-none focus:border-primary-500">
                <option value="">Semua Role</option>
                {ROLE_DEFS.map((r) => (
                  <option key={r.role_name} value={r.role_name}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Temukan"
                className="h-9 w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-500"
              />
            </div>

            {/* Tambah user */}
            <button
              type="button"
              onClick={() => navigate('/admin/users/new')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
            >
              <Plus className="h-4 w-4" />
              Tambah User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-3.5 pr-3 font-medium">Nama</th>
                <th className="px-3 py-3.5 font-medium">Email</th>
                <th className="px-3 py-3.5 font-medium">Role</th>
                <th className="px-3 py-3.5 font-medium">Dibuat</th>
                <th className="px-3 py-3.5 font-medium">Status</th>
                <th className="px-3 py-3.5 font-medium">Akun</th>
                <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((u) => (
                <tr key={u.id} className="border-t border-neutral-200 text-neutral-800">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.photo || ''} size={32} />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{u.email}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700">{roleLabel(u.role)}</span>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={u.active ? 'Aktif' : 'Nonaktif'} />
                  </td>
                  <td className="px-3 py-3.5">
                    {/* Segmented toggle: Aktif (primary), Nonaktif (NEUTRAL < 500) */}
                    <div role="group" aria-label={`Status akun ${u.name}`} className="inline-flex overflow-hidden rounded-lg border border-neutral-200">
                      {/* Aktif */}
                      <button
                        type="button"
                        aria-pressed={u.active}
                        onClick={() => setActive(u.id, true)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition
                          ${u.active ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                        title="Aktifkan"
                      >
                        <UserCheck className={`h-3.5 w-3.5 ${u.active ? 'text-white' : 'text-neutral-500'}`} />
                        Aktif
                      </button>

                      <div className="w-px bg-neutral-200" />

                      {/* Nonaktif (pakai neutral 400/50/200—TIDAK pakai secondary) */}
                      <button
                        type="button"
                        aria-pressed={!u.active}
                        onClick={() => setActive(u.id, false)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition
                          ${!u.active ? 'bg-neutral-400 text-neutral-50' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                        title="Nonaktifkan"
                      >
                        <UserX className={`h-3.5 w-3.5 ${!u.active ? 'text-neutral-50' : 'text-neutral-500'}`} />
                        Nonaktif
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => navigate(`/admin/users/${u.id}/edit`)} className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 hover:underline" title="Edit">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(u.id)} className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-secondary-700 hover:underline" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-500">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (fungsi beneran) */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <div className="text-neutral-600">
            Menampilkan <span className="text-neutral-800">{total === 0 ? 0 : start + 1}</span>–<span className="text-neutral-800">{Math.min(end, total)}</span> dari <span className="text-neutral-800">{total}</span> data
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}>
              ‹ Prev
            </button>
            <span className="text-neutral-600">
              Hal {current} / {totalPages}
            </span>
            <button className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages}>
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
