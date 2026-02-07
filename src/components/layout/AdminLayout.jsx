import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, GraduationCap, Users, Newspaper, LayoutGrid, LogOut, ChevronDown, User2, ChartNoAxesGantt, BookOpen, Layers, Wallet, Award, FileText } from 'lucide-react';
import { authLogout, authRefresh, fetchMe } from '../../utils/api';
import { useConfirm } from '../../contexts/ConfirmContext.jsx';
import { fetchMeViaTrpc } from '../../utils/me';
import Avatar from '../Avatar';
import GlobalSearch from '../GlobalSearch';

// Tambah item Kelola User (gunakan User2 biar beda dengan Aktivitas)
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/beasiswa', label: 'Beasiswa', icon: GraduationCap },
  { to: '/aktivitas', label: 'Aktivitas', icon: Users },
  { to: '/artikel', label: 'Artikel', icon: Newspaper },
  { to: '/divisi', label: 'Divisi', icon: Layers },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/kas', label: 'Rekapitulasi Kas', icon: Wallet },
  { to: '/poin', label: 'Poin Kegiatan', icon: Award },
  { to: '/dispensasi', label: 'Dispensasi', icon: FileText },
  { to: '/admin/users', label: 'Kelola User', icon: User2 },
  { to: '/cms', label: 'Kelola Konten Web', icon: ChartNoAxesGantt },
  { to: '/pusat-informasi', label: 'Pusat Informasi', icon: BookOpen },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const profileMenuRef = useRef(null);
  const [collapsed, setCollapsed] = useState(() => {
    const s = localStorage.getItem('sidebar-collapsed');
    return s ? JSON.parse(s) : false;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const firstTwoWords = (text) => {
    const words = String(text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return words.slice(0, 2).join(' ');
  };

  const normalizeMe = (raw) => {
    // Support different response shapes (TRPC vs REST)
    const base = raw?.data ?? raw;
    const maybeUser = base?.user ?? base;
    const profile = maybeUser?.profile ?? base?.profile ?? null;

    const name = maybeUser?.name || profile?.name || maybeUser?.email?.split?.('@')?.[0] || '';
    const avatar = maybeUser?.avatar || maybeUser?.photo || maybeUser?.picture || maybeUser?.image || profile?.avatar || '';
    const role = maybeUser?.role || '';
    const email = maybeUser?.email || '';

    return {
      ...maybeUser,
      profile,
      name,
      avatar,
      role,
      email,
    };
  };

  const loadUser = async () => {
    let me;

    try {
      me = await fetchMeViaTrpc();
    } catch {
      try {
        await authRefresh();
        me = await fetchMeViaTrpc();
      } catch {
        me = await fetchMe();
      }
    }

    return normalizeMe(me);
  };

  // Fetch user data and refresh on profile updates
  useEffect(() => {
    let alive = true;

    const safeLoad = async () => {
      try {
        const nextUser = await loadUser();
        if (!alive) return;
        setUser(nextUser);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        if (alive) setUser(null);
      }
    };

    const onMeUpdated = () => {
      safeLoad();
    };

    safeLoad();
    window.addEventListener('me:updated', onMeUpdated);

    return () => {
      alive = false;
      window.removeEventListener('me:updated', onMeUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Tutup dropdown saat route berubah
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (e) => {
      const el = profileMenuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setProfileOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [profileOpen]);

  const activeMatcher = (path) => location.pathname.startsWith(path);

  const Brand = useMemo(
    () => (
      <div className="flex items-center gap-3 px-3 py-3">
        <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 p-1 rounded-md border border-neutral-200 object-cover" />
        {!collapsed && <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>}
      </div>
    ),
    [collapsed],
  );

  const doLogout = async () => {
    const ok = await confirm({
      title: 'Logout?',
      description: 'Anda akan keluar dari akun admin.',
      confirmText: 'Ya, logout',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    try {
      await authLogout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`sticky top-0 flex h-screen flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ${collapsed ? 'w-[84px]' : 'w-[260px]'}`}>
          {/* Top row */}
          <div className="flex items-center justify-between border-b border-neutral-200">
            {Brand}
            <button
              type="button"
              aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition"
            >
              {collapsed ? <ChevronRight className="h-4 w-4 text-neutral-700" /> : <ChevronLeft className="h-4 w-4 text-neutral-700" />}
            </button>
          </div>
          {/* Nav */}
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {navItems.map(
                // eslint-disable-next-line no-unused-vars
                ({ to, label, icon: Icon }) => {
                  const active = activeMatcher(to);
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={() => setProfileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition
                      ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-neutral-50'}`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-neutral-600'}`} />
                        {!collapsed && <span className={`${active ? 'text-primary-700' : 'text-neutral-700'}`}>{label}</span>}
                      </NavLink>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
          {/* Logout di sidebar */}
          <div className="mt-auto px-2 pb-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl scale-100 hover:scale-101 bg-red-500 hover:bg-red-600 border border-red-600 px-3 py-2.5 text-sm font-medium text-white transition"
              onClick={doLogout}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* NAVBAR */}
          <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              {/* Mobile toggle */}
              <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 md:hidden" onClick={() => setCollapsed((s) => !s)} aria-label="Toggle sidebar">
                <Menu className="h-5 w-5 text-neutral-700" />
              </button>
              <h2 className="hidden md:block text-base font-semibold text-neutral-900">Hi, {firstTwoWords(user?.name) || 'Admin'} 👋</h2>
              <div className="ml-auto w-full max-w-md">
                <GlobalSearch />
              </div>
              <div className="relative ml-2" ref={profileMenuRef}>
                <button type="button" onClick={() => setProfileOpen((s) => !s)} className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50 transition">
                  <Avatar name={user?.name || 'Admin'} src={user?.avatar || ''} size={36} />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-neutral-900">{user?.name || 'Admin'}</div>
                    <div className="text-xs text-neutral-500 capitalize">{(user?.role ? String(user.role).replace(/_/g, ' ') : 'Loading...') || 'Loading...'}</div>
                  </div>
                  <ChevronDown className="hidden md:block h-4 w-4 text-neutral-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg" role="menu">
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary-700 hover:bg-neutral-50"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/profile');
                      }}
                      role="menuitem"
                    >
                      <User2 className="h-4 w-4" />
                      Profil
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary-700 hover:bg-neutral-50" onClick={doLogout} role="menuitem">
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
