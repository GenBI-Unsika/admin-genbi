// AdminUsers.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { Search, Plus, Pencil, Trash2, UserCheck, UserX, ChevronRight, Download } from 'lucide-react';

/* ---------- Konstanta ---------- */
const ROLE_DEFS = [
  { role_name: 'super_admin', label: 'Super Admin' },
  { role_name: 'admin', label: 'Admin' },
  { role_name: 'reviewer', label: 'Reviewer' },
  { role_name: 'advisor', label: 'Advisor' },
  { role_name: 'student', label: 'Student' },
  { role_name: 'awardee', label: 'Awardee' },
];
const roleLabel = (name) => ROLE_DEFS.find((r) => r.role_name === name)?.label || name;

const PER_PAGE = 10;

/** 10.1 Akun Website — data dummy */
const DUMMY_ACCOUNTS = [
  { id: 1, name: 'Raina Putri', email: 'raina@example.com', role: 'super_admin', createdAt: '2024-03-07', active: true, verify: 'Terverifikasi' },
  { id: 2, name: 'Dimas Arya', email: 'dimas@example.com', role: 'reviewer', createdAt: '2024-03-08', active: true, verify: 'Terverifikasi' },
  { id: 3, name: 'Sari Lestari', email: 'sari@example.com', role: 'student', createdAt: '2024-03-08', active: false, verify: 'Menunggu Verifikasi' },
  { id: 4, name: 'Devi Maulana', email: 'devi@example.com', role: 'admin', createdAt: '2024-03-09', active: true, verify: 'Terverifikasi' },
  { id: 5, name: 'Reno Pratama', email: 'reno@example.com', role: 'advisor', createdAt: '2024-03-10', active: true, verify: 'Terverifikasi' },
  { id: 6, name: 'Laras Wulandari', email: 'laras@example.com', role: 'awardee', createdAt: '2024-03-11', active: true, verify: 'Terverifikasi' },
  { id: 7, name: 'Bagas Saputra', email: 'bagas@example.com', role: 'reviewer', createdAt: '2024-03-11', active: false, verify: 'Menunggu Verifikasi' },
  { id: 8, name: 'Nadia Salsabila', email: 'nadia@example.com', role: 'student', createdAt: '2024-03-12', active: true, verify: 'Terverifikasi' },
  { id: 9, name: 'Fikri Rahman', email: 'fikri@example.com', role: 'admin', createdAt: '2024-03-12', active: true, verify: 'Terverifikasi' },
  { id: 10, name: 'Rizki Amelia', email: 'rizki@example.com', role: 'awardee', createdAt: '2024-03-13', active: false, verify: 'Menunggu Verifikasi' },
  { id: 11, name: 'Aulia Shafira', email: 'aulia@example.com', role: 'advisor', createdAt: '2024-03-13', active: true, verify: 'Terverifikasi' },
  { id: 12, name: 'Yoga Firmansyah', email: 'yoga@example.com', role: 'student', createdAt: '2024-03-14', active: true, verify: 'Terverifikasi' },
  { id: 13, name: 'Putri Anindya', email: 'putri@example.com', role: 'reviewer', createdAt: '2024-03-14', active: true, verify: 'Terverifikasi' },
  { id: 14, name: 'Bima Aditya', email: 'bima@example.com', role: 'admin', createdAt: '2024-03-15', active: false, verify: 'Menunggu Verifikasi' },
  { id: 15, name: 'Maya Kartika', email: 'maya@example.com', role: 'awardee', createdAt: '2024-03-15', active: true, verify: 'Terverifikasi' },
];

/** 10.3 Subscriber — data dummy */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const DUMMY_SUBSCRIBERS = [
  { id: 'S-01', email: 'ana@mail.com', subscribedAt: daysAgo(5) },
  { id: 'S-02', email: 'budi@mail.com', subscribedAt: daysAgo(25) },
  { id: 'S-03', email: 'chandra@mail.com', subscribedAt: daysAgo(45) },
  { id: 'S-04', email: 'dina@mail.com', subscribedAt: daysAgo(65) },
  { id: 'S-05', email: 'eko@mail.com', subscribedAt: daysAgo(95) },
];

const fmtDateID = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export default function AdminUsers() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- Tabs via slug (hanya 10.1 & 10.3) ---------- */
  const ALLOWED_TABS = ['accounts', 'subscribers'];
  const initialTab = ALLOWED_TABS.includes(tabParam) ? tabParam : 'accounts';
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (ALLOWED_TABS.includes(tabParam) && tabParam !== tab) setTab(tabParam);
    if (!ALLOWED_TABS.includes(tabParam)) navigate('/admin/users/accounts', { replace: true });
  }, [tabParam]); // eslint-disable-line

  const switchTab = (key) => {
    if (key !== tab) {
      setTab(key);
      navigate(`/admin/users/${key}`);
    }
  };

  /* ---------- Query helpers ---------- */
  const getParam = (k, def = '') => searchParams.get(k) ?? def;
  const getIntParam = (k, def = 1) => {
    const n = parseInt(searchParams.get(k) || '', 10);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const patchParams = (patch) => {
    const sp = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) sp.delete(k);
      else sp.set(k, String(v));
    });
    setSearchParams(sp, { replace: true });
  };

  /* ========== 10.1 Akun Website ========== */
  const [accounts, setAccounts] = useState(DUMMY_ACCOUNTS);
  const [qAcc, setQAcc] = useState(getParam('acc_q', ''));
  const [roleFilter, setRoleFilter] = useState(getParam('acc_role', ''));
  const [pageAcc, setPageAcc] = useState(getIntParam('acc_page', 1));

  useEffect(() => {
    setQAcc(getParam('acc_q', ''));
    setRoleFilter(getParam('acc_role', ''));
    setPageAcc(getIntParam('acc_page', 1));
  }, [searchParams]); // eslint-disable-line

  const filteredAcc = useMemo(() => {
    const s = qAcc.trim().toLowerCase();
    let list = accounts;
    if (s) {
      list = list.filter((u) => [u.name, u.email, roleLabel(u.role), u.verify || ''].join(' | ').toLowerCase().includes(s));
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [qAcc, roleFilter, accounts]);

  const totalAcc = filteredAcc.length;
  const totalPagesAcc = Math.max(1, Math.ceil(totalAcc / PER_PAGE));
  const currentAcc = Math.min(pageAcc, totalPagesAcc);
  const startAcc = (currentAcc - 1) * PER_PAGE;
  const pageItemsAcc = filteredAcc.slice(startAcc, startAcc + PER_PAGE);

  const onDeleteAccount = (id) => {
    if (confirm('Hapus user ini?')) {
      setAccounts((prev) => prev.filter((u) => u.id !== id));
      setTimeout(() => {
        const newTotal = Math.max(0, totalAcc - 1);
        const lastPage = Math.max(1, Math.ceil(newTotal / PER_PAGE));
        if (currentAcc > lastPage) {
          setPageAcc(lastPage);
          patchParams({ acc_page: lastPage });
        }
      }, 0);
    }
  };
  const setActive = (id, active) => setAccounts((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));

  /* ========== 10.3 Subscriber ========== */
  const [subs, setSubs] = useState(DUMMY_SUBSCRIBERS);
  const [qSub, setQSub] = useState(getParam('sub_q', ''));
  const [pageSub, setPageSub] = useState(getIntParam('sub_page', 1));

  useEffect(() => {
    setQSub(getParam('sub_q', ''));
    setPageSub(getIntParam('sub_page', 1));
  }, [searchParams]); // eslint-disable-line

  const filteredSub = useMemo(() => {
    const s = qSub.trim().toLowerCase();
    return s ? subs.filter((x) => x.email.toLowerCase().includes(s)) : subs;
  }, [qSub, subs]);

  const totalSub = filteredSub.length;
  const totalPagesSub = Math.max(1, Math.ceil(totalSub / PER_PAGE));
  const currentSub = Math.min(pageSub, totalPagesSub);
  const startSub = (currentSub - 1) * PER_PAGE;
  const pageItemsSub = filteredSub.slice(startSub, startSub + PER_PAGE);

  const sinceDays = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);
  const statsSub = useMemo(() => {
    const total = subs.length;
    const in30 = subs.filter((s) => sinceDays(s.subscribedAt) <= 30).length;
    const in60 = subs.filter((s) => sinceDays(s.subscribedAt) <= 60).length;
    const in90 = subs.filter((s) => sinceDays(s.subscribedAt) <= 90).length;
    return { total, in30, in60, in90 };
  }, [subs]);

  const onDeleteSub = (id) => {
    if (confirm('Hapus subscriber ini?')) {
      setSubs((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => {
        const newTotal = Math.max(0, totalSub - 1);
        const lastPage = Math.max(1, Math.ceil(newTotal / PER_PAGE));
        if (currentSub > lastPage) {
          setPageSub(lastPage);
          patchParams({ sub_page: lastPage });
        }
      }, 0);
    }
  };

  const exportCSV = () => {
    const header = ['email', 'tanggal_subscribe'];
    const rows = subs.map((s) => [s.email, new Date(s.subscribedAt).toISOString()]);
    const csv = [header.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ---------- UI ---------- */
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

      <div className="rounded-2xl border border-neutral-200 bg-white">
        {/* Sub-tabs full-width, underline biru */}
        <div role="tablist" aria-label="Kelola User tabs" className="grid grid-cols-2 border-b border-neutral-200">
          {[
            { key: 'accounts', label: 'Akun Website' },
            { key: 'subscribers', label: 'Subscriber' },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t.key)}
                className={[
                  'w-full px-4 py-3 text-sm font-medium transition-colors -mb-[1px] border-b-2',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                  active ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300',
                ].join(' ')}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panels */}
        <div className="p-4 md:p-6">
          {/* ========== TAB: AKUN WEBSITE ========== */}
          {tab === 'accounts' && (
            <>
              {/* Header tools */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Akun Website</h3>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter role */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-700">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPageAcc(1);
                        patchParams({ acc_role: e.target.value || undefined, acc_page: 1 });
                      }}
                      className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-800 outline-none focus:border-primary-500"
                    >
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
                      value={qAcc}
                      onChange={(e) => {
                        setQAcc(e.target.value);
                        setPageAcc(1);
                        patchParams({ acc_q: e.target.value || undefined, acc_page: 1 });
                      }}
                      placeholder="Cari nama/email/role"
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

              {/* Table Akun */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500">
                      <th className="py-3.5 pr-3 font-medium">Nama</th>
                      <th className="px-3 py-3.5 font-medium">Email</th>
                      <th className="px-3 py-3.5 font-medium">Role</th>
                      <th className="px-3 py-3.5 font-medium">Verifikasi</th>
                      <th className="px-3 py-3.5 font-medium">Dibuat</th>
                      <th className="px-3 py-3.5 font-medium">Status</th>
                      <th className="px-3 py-3.5 font-medium">Akun</th>
                      <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItemsAcc.map((u) => (
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
                        <td className="px-3 py-3.5">
                          <StatusBadge status={u.verify} />
                        </td>
                        <td className="px-3 py-3.5 text-neutral-600">{fmtDateID(u.createdAt)}</td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={u.active ? 'Aktif' : 'Nonaktif'} />
                        </td>
                        <td className="px-3 py-3.5">
                          <div role="group" aria-label={`Status akun ${u.name}`} className="inline-flex overflow-hidden rounded-lg border border-neutral-200">
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
                            <button type="button" onClick={() => onDeleteAccount(u.id)} className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-secondary-700 hover:underline" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pageItemsAcc.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-neutral-500">
                          Tidak ada data yang cocok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Akun */}
              <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
                <div className="text-neutral-600">
                  Menampilkan <span className="text-neutral-800">{totalAcc === 0 ? 0 : startAcc + 1}</span>–<span className="text-neutral-800">{Math.min(startAcc + PER_PAGE, totalAcc)}</span> dari{' '}
                  <span className="text-neutral-800">{totalAcc}</span> data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    onClick={() => {
                      const v = Math.max(1, currentAcc - 1);
                      setPageAcc(v);
                      patchParams({ acc_page: v });
                    }}
                    disabled={currentAcc === 1}
                  >
                    ‹ Prev
                  </button>
                  <span className="text-neutral-600">
                    Hal {currentAcc} / {totalPagesAcc}
                  </span>
                  <button
                    className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    onClick={() => {
                      const v = Math.min(totalPagesAcc, currentAcc + 1);
                      setPageAcc(v);
                      patchParams({ acc_page: v });
                    }}
                    disabled={currentAcc === totalPagesAcc}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========== TAB: SUBSCRIBER ========== */}
          {tab === 'subscribers' && (
            <>
              {/* Header + search/export */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Subscriber</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      value={qSub}
                      onChange={(e) => {
                        setQSub(e.target.value);
                        setPageSub(1);
                        patchParams({ sub_q: e.target.value || undefined, sub_page: 1 });
                      }}
                      placeholder="Cari email"
                      className="h-9 w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-500"
                    />
                  </div>
                  <button type="button" onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" title="Export CSV">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* All-time stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">Total</div>
                  <div className="text-lg font-semibold text-neutral-900">{statsSub.total}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">30 hari terakhir</div>
                  <div className="text-lg font-semibold text-neutral-900">{statsSub.in30}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">60 hari terakhir</div>
                  <div className="text-lg font-semibold text-neutral-900">{statsSub.in60}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">90 hari terakhir</div>
                  <div className="text-lg font-semibold text-neutral-900">{statsSub.in90}</div>
                </div>
              </div>

              {/* Table Subscriber */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500">
                      <th className="py-3.5 pr-3 font-medium">Email</th>
                      <th className="px-3 py-3.5 font-medium">Tanggal Subscribe</th>
                      <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItemsSub.map((s) => (
                      <tr key={s.id} className="border-t border-neutral-200 text-neutral-800">
                        <td className="py-3.5 pr-3">{s.email}</td>
                        <td className="px-3 py-3.5 text-neutral-600">{fmtDateID(s.subscribedAt)}</td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-end">
                            <button type="button" onClick={() => onDeleteSub(s.id)} className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-secondary-700 hover:underline" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pageItemsSub.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-10 text-center text-neutral-500">
                          Tidak ada subscriber yang cocok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Subscriber */}
              <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
                <div className="text-neutral-600">
                  Menampilkan <span className="text-neutral-800">{totalSub === 0 ? 0 : startSub + 1}</span>–<span className="text-neutral-800">{Math.min(startSub + PER_PAGE, totalSub)}</span> dari{' '}
                  <span className="text-neutral-800">{totalSub}</span> data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    onClick={() => {
                      const v = Math.max(1, currentSub - 1);
                      setPageSub(v);
                      patchParams({ sub_page: v });
                    }}
                    disabled={currentSub === 1}
                  >
                    ‹ Prev
                  </button>
                  <span className="text-neutral-600">
                    Hal {currentSub} / {totalPagesSub}
                  </span>
                  <button
                    className="h-8 rounded-md border border-neutral-200 px-3 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    onClick={() => {
                      const v = Math.min(totalPagesSub, currentSub + 1);
                      setPageSub(v);
                      patchParams({ sub_page: v });
                    }}
                    disabled={currentSub === totalPagesSub}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
