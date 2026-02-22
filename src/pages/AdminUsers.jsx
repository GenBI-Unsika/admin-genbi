import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { Search, Plus, Pencil, Trash2, ChevronRight, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { apiRequest, apiDelete } from '../utils/api';
import EmptyState from '../components/EmptyState';

const ROLE_DEFS = [
  { role_name: 'super_admin', label: 'Super Admin' },
  { role_name: 'admin', label: 'Admin' },
  { role_name: 'awardee', label: 'Awardee' },
  { role_name: 'alumni', label: 'Alumni' },
  { role_name: 'user', label: 'User' },
];
const roleLabel = (name) => ROLE_DEFS.find((r) => r.role_name === name)?.label || name;

const PER_PAGE = 10;

const fmtDateID = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminUsers() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm } = useConfirm();

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

  const [accounts, setAccounts] = useState([]);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [errorAcc, setErrorAcc] = useState(null);
  const [totalAcc, setTotalAcc] = useState(0);
  const [qAcc, setQAcc] = useState(getParam('acc_q', ''));
  const [roleFilter, setRoleFilter] = useState(getParam('acc_role', ''));
  const [pageAcc, setPageAcc] = useState(getIntParam('acc_page', 1));

  const [subscribers, setSubscribers] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [errorSub, setErrorSub] = useState(null);
  const [totalSub, setTotalSub] = useState(0);
  const [pageSub, setPageSub] = useState(getIntParam('sub_page', 1));

  const fetchAccounts = useCallback(async () => {
    setLoadingAcc(true);
    setErrorAcc(null);
    try {
      const params = new URLSearchParams({
        page: String(pageAcc),
        limit: String(PER_PAGE),
      });
      if (qAcc.trim()) params.set('search', qAcc.trim());
      if (roleFilter) params.set('role', roleFilter);

      const result = await apiRequest(`/users?${params.toString()}`);
      const mapped = (result.data || result || []).map((u) => ({
        id: u.id,
        name: u.name || u.email.split('@')[0],
        email: u.email,
        role: u.role,
        prodi: u.studyProgram?.name || null,
        createdAt: u.createdAt,
        active: u.isActive,
        verify: u.emailVerified ? 'Terverifikasi' : 'Menunggu Verifikasi',
        photo: u.avatar,
      }));
      setAccounts(mapped);
      const total = result.meta?.total ?? mapped.length;
      setTotalAcc(total);
    } catch (err) {
      setErrorAcc({ status: err?.status, message: err?.message || 'Gagal memuat data user' });
    } finally {
      setLoadingAcc(false);
    }
  }, [pageAcc, qAcc, roleFilter]);

  useEffect(() => {
    if (tab === 'accounts') {
      const timer = setTimeout(() => {
        fetchAccounts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchAccounts, tab]);

  const fetchSubscribers = useCallback(async () => {
    setLoadingSub(true);
    setErrorSub(null);
    try {
      const params = new URLSearchParams({
        page: String(pageSub),
        limit: String(PER_PAGE),
      });
      const result = await apiRequest(`/subscribers?${params.toString()}`);
      const data = result?.data || [];
      setSubscribers(
        data.map((s) => ({
          id: s.id,
          email: s.email,
          name: s.name,
          isActive: s.isActive,
          subscribedAt: s.subscribedAt,
        })),
      );
      setTotalSub(result?.meta?.total ?? data.length);
    } catch (err) {
      setErrorSub({ status: err?.status, message: err?.message || 'Gagal memuat data subscriber' });
    } finally {
      setLoadingSub(false);
    }
  }, [pageSub]);

  useEffect(() => {
    if (tab === 'subscribers') {
      fetchSubscribers();
    }
  }, [fetchSubscribers, tab]);

  useEffect(() => {
    setQAcc(getParam('acc_q', ''));
    setRoleFilter(getParam('acc_role', ''));
    setPageAcc(getIntParam('acc_page', 1));
    setPageSub(getIntParam('sub_page', 1));
  }, [searchParams]); // eslint-disable-line

  const totalPagesAcc = Math.max(1, Math.ceil(totalAcc / PER_PAGE));
  const currentAcc = Math.min(pageAcc, totalPagesAcc);
  const startAcc = (currentAcc - 1) * PER_PAGE;

  const totalPagesSub = Math.max(1, Math.ceil(totalSub / PER_PAGE));
  const currentSub = Math.min(pageSub, totalPagesSub);
  const startSub = (currentSub - 1) * PER_PAGE;

  const onDeleteAccount = async (id) => {
    const ok = await confirm({
      title: 'Hapus akun user ini?',
      description: 'Data user akan dihapus permanen. Gunakan fitur "Edit > Nonaktif" jika hanya ingin mencabut akses sementera tanpa menghapus data.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    try {
      await apiDelete(`/users/${id}`);
      fetchAccounts(); // Refresh list
    } catch (err) {
      alert(err.message || 'Gagal menghapus user');
    }
  };

  const onDeleteSubscriber = async (id) => {
    const ok = await confirm({
      title: 'Hapus subscriber ini? ',
      description: 'Subscriber akan dihapus dari sistem.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await apiDelete(`/subscribers/${id}`);
      fetchSubscribers();
    } catch (err) {
      alert(err.message || 'Gagal menghapus subscriber');
    }
  };

  return (
    <div className="px-6 md:px-10 py-6">
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
          {tab === 'accounts' && (
            <>
              {/* Header tools */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Akun Website</h3>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {/* Filter role */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-neutral-700">Role</label>
                    <div className="relative">
                      <select
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value);
                          setPageAcc(1);
                          patchParams({ acc_role: e.target.value || undefined, acc_page: 1 });
                        }}
                        className="h-9 w-40 appearance-none rounded-lg border border-neutral-200 bg-white pl-3 pr-9 text-sm text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 cursor-pointer"
                      >
                        <option value="">Semua Role</option>
                        {ROLE_DEFS.map((r) => (
                          <option key={r.role_name} value={r.role_name}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    </div>
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

              {loadingAcc && accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <p className="text-neutral-600">Memuat data user...</p>
                </div>
              ) : errorAcc && accounts.length === 0 ? (
                errorAcc?.status === 403 ? (
                  <EmptyState icon="error" title="Akses dibatasi" description="Fitur Kelola User hanya dapat diakses oleh Super Admin." variant="warning" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <p className="text-red-600">{errorAcc?.message || 'Gagal memuat data user'}</p>
                    <button onClick={fetchAccounts} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
                      <RefreshCw className="h-4 w-4" />
                      Coba Lagi
                    </button>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500">
                        <th className="py-3.5 pr-3 font-medium">Nama</th>
                        <th className="px-3 py-3.5 font-medium">Email</th>
                        <th className="px-3 py-3.5 font-medium">Prodi</th>
                        <th className="px-3 py-3.5 font-medium">Role</th>
                        <th className="px-3 py-3.5 font-medium">Dibuat</th>
                        <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((u) => (
                        <tr key={u.id} className="border-t border-neutral-200 text-neutral-800">
                          <td className="py-4 pr-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} src={u.photo || ''} size={32} />
                              <div>
                                <span className="font-medium block">{u.name}</span>
                                <span className={`text-xs ${u.active ? 'text-green-600' : 'text-neutral-400'}`}>{u.active ? 'Aktif' : 'Nonaktif'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-neutral-600">{u.email}</td>
                          <td className="px-3 py-4 text-neutral-600">{u.prodi || '-'}</td>
                          <td className="px-3 py-4">
                            <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-700">{roleLabel(u.role)}</span>
                          </td>
                          <td className="px-3 py-4 text-neutral-500 text-xs">{fmtDateID(u.createdAt)}</td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => navigate(`/admin/users/${u.id}/edit`)} className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => onDeleteAccount(u.id)} className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {accounts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-neutral-500">
                            Tidak ada data yang cocok.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

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

          {tab === 'subscribers' && (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-neutral-900">Subscriber</h3>
                <button type="button" onClick={fetchSubscribers} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {loadingSub && subscribers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <p className="text-neutral-600">Memuat data subscriber...</p>
                </div>
              ) : errorSub && subscribers.length === 0 ? (
                errorSub?.status === 403 ? (
                  <EmptyState icon="error" title="Akses dibatasi" description="Fitur Subscriber hanya dapat diakses oleh Admin." variant="warning" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <p className="text-red-600">{errorSub?.message || 'Gagal memuat data subscriber'}</p>
                    <button onClick={fetchSubscribers} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
                      <RefreshCw className="h-4 w-4" />
                      Coba Lagi
                    </button>
                  </div>
                )
              ) : subscribers.length === 0 ? (
                <EmptyState icon="inbox" title="Belum Ada Subscriber" description="Belum ada data subscriber yang terdaftar di sistem." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500">
                        <th className="py-3.5 pr-3 font-medium">Nama</th>
                        <th className="px-3 py-3.5 font-medium">Email</th>
                        <th className="px-3 py-3.5 font-medium">Status</th>
                        <th className="px-3 py-3.5 font-medium">Subscribe</th>
                        <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s) => (
                        <tr key={s.id} className="border-t border-neutral-200 text-neutral-800">
                          <td className="py-4 pr-3 font-medium">{s.name || '-'}</td>
                          <td className="px-3 py-4 text-neutral-600">{s.email}</td>
                          <td className="px-3 py-4">
                            <StatusBadge status={s.isActive ? 'active' : 'inactive'} />
                          </td>
                          <td className="px-3 py-4 text-neutral-500 text-xs">{s.subscribedAt ? fmtDateID(s.subscribedAt) : '-'}</td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => onDeleteSubscriber(s.id)} className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {subscribers.length > 0 && (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
