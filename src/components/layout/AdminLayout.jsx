import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, FileText, Edit } from 'lucide-react';
import {
  HomeIcon, AcademicIcon, FileIcon, CalendarIcon, ProfileIcon, LogoutIcon,
  ArticleIcon, ActivityIcon, DivisionIcon, WebContentIcon, MembersIcon, InfoCenterIcon, PortalIcon, PointIcon, MasterDataIcon, TreasuryIcon
} from '../icons/CustomIcons.jsx';
import { authLogout, authRefresh, fetchMe } from '../../utils/api';
import { Toaster } from 'react-hot-toast';
import { useConfirm } from '../../contexts/ConfirmContext.jsx';
import { fetchMeViaTrpc } from '../../utils/me';
import Avatar from '../Avatar';
import GlobalSearch from '../GlobalSearch';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  {
    label: 'Beasiswa',
    icon: AcademicIcon,
    children: [
      { to: '/beasiswa', label: 'Pendaftar Beasiswa', icon: AcademicIcon },
      { to: '/beasiswa/wawancara', label: 'Kelola Wawancara', icon: FileIcon },
      { to: '/beasiswa/dokumen', label: 'Kelola Berkas', icon: FileIcon },
    ],
  },
  { to: '/aktivitas', label: 'Aktivitas', icon: ActivityIcon },
  { to: '/artikel', label: 'Artikel', icon: ArticleIcon },
  { to: '/divisi', label: 'Divisi', icon: DivisionIcon },
  { to: '/anggota', label: 'Anggota', icon: MembersIcon },
  { to: '/admin/users', label: 'Kelola User', icon: MembersIcon },
  { to: '/master-data', label: 'Master Data', icon: MasterDataIcon },
  { to: '/cms', label: 'Kelola Konten Web', icon: WebContentIcon },
  {
    label: 'Menu Portal GenBI',
    icon: PortalIcon, // Ikon menu induk
    children: [
      { to: '/kas', label: 'Rekapitulasi Kas', icon: TreasuryIcon },
      { to: '/poin', label: 'Poin Kegiatan', icon: PointIcon },
      { to: '/dispensasi', label: 'Dispensasi', icon: FileIcon },
    ],
  },
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

  useEffect(() => {
    let alive = true;

    const safeLoad = async () => {
      try {
        const nextUser = await loadUser();
        if (!alive) return;
        setUser(nextUser);
      } catch (err) {
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

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

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
    () =>
      !collapsed && (
        <div className="flex items-center gap-3">
          <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 rounded-md border border-neutral-200 object-cover" />
          <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
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
        <aside className={`sticky top-0 hidden md:flex shrink-0 h-screen flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ${collapsed ? 'w-[88px]' : 'w-[264px]'}`}>
          <div className={`flex items-center border-b border-neutral-200 ${collapsed ? 'justify-center py-3' : 'justify-between px-3 py-3'}`}>
            {Brand}
            <button
              type="button"
              aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 focus-ring"
            >
              <Menu className="h-5 w-5 text-neutral-700" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1.5">
              {navItems.map((item, idx) => {
                if (item.children) {
                  const isActiveParent = item.children.some((child) => activeMatcher(child.to));
                  return (
                    <li key={idx} className="mb-1">
                      <details className="group/details" open={isActiveParent || undefined}>
                        <summary
                          className={`flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition hover:bg-neutral-50
                          ${isActiveParent ? 'text-primary-700 bg-primary-50/50' : 'text-neutral-700'}
                          ${collapsed ? 'justify-center px-0' : ''}`}
                          title={collapsed ? item.label : ''}
                        >
                          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                            <item.icon className={`h-5 w-5 ${isActiveParent ? 'text-primary-600' : 'text-neutral-600'}`} />
                            {!collapsed && <span>{item.label}</span>}
                          </div>
                          {!collapsed && <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 group-open/details:rotate-180`} />}
                        </summary>
                        <ul className={`mt-1 space-y-1 ${collapsed ? 'hidden' : 'pl-3'}`}>
                          {item.children.map((child) => {
                            const isChildActive =
                              child.to === '/beasiswa' ? location.pathname.startsWith('/beasiswa') && !location.pathname.startsWith('/beasiswa/wawancara') && !location.pathname.startsWith('/beasiswa/dokumen') : activeMatcher(child.to);
                            return (
                              <li key={child.to}>
                                <NavLink
                                  to={child.to}
                                  onClick={() => setProfileOpen(false)}
                                  className={`flex items-center rounded-lg border px-3 py-2 text-sm transition
                                  ${isChildActive ? 'bg-primary-50 text-priority-700 border-primary-200 text-primary-700' : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                                  gap-3`}
                                >
                                  <child.icon className={`h-4 w-4 ${isChildActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                                  <span>{child.label}</span>
                                </NavLink>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </li>
                  );
                }

                const active = activeMatcher(item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className={`group flex items-center rounded-xl border text-sm transition
                      ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}
                      ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'border-transparent hover:bg-neutral-50'}`}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-neutral-600'}`} />
                      {!collapsed && <span className={`${active ? 'text-primary-700' : 'text-neutral-700'}`}>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto px-2 pb-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl scale-100 hover:scale-101 bg-red-500 hover:bg-red-600 border border-red-600 px-3 py-2.5 text-sm font-medium text-white transition"
              onClick={doLogout}
            >
              <LogoutIcon className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
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
                      <ProfileIcon className="h-4 w-4" />
                      Profil
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary-700 hover:bg-neutral-50" onClick={doLogout} role="menuitem">
                      <LogoutIcon className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
