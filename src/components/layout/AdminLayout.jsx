import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, GraduationCap, Users, Newspaper, LayoutGrid, LogOut, Search, ChevronDown, User2 } from 'lucide-react';

// Tambah item Kelola User (gunakan User2 biar beda dengan Aktivitas)
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/beasiswa', label: 'Beasiswa', icon: GraduationCap },
  { to: '/aktivitas', label: 'Aktivitas', icon: Users },
  { to: '/artikel', label: 'Artikel', icon: Newspaper },
  { to: '/admin/users', label: 'Kelola User', icon: User2 },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const s = localStorage.getItem('sidebar-collapsed');
    return s ? JSON.parse(s) : false;
  });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Tutup dropdown saat route berubah
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const activeMatcher = (path) => location.pathname.startsWith(path);

  const Brand = useMemo(
    () => (
      <div className="flex items-center gap-3 px-3 py-3">
        <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 rounded-md border border-neutral-200 object-cover" />
        {!collapsed && <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>}
      </div>
    ),
    [collapsed]
  );

  const doLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login', { replace: true });
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
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = activeMatcher(to);
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={`group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition
                      ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-neutral-50'}`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-neutral-600'}`} />
                      {!collapsed && <span className={`${active ? 'text-primary-700' : 'text-neutral-700'}`}>{label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout di sidebar */}
          <div className="mt-auto px-2 pb-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.99] transition"
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

              <h2 className="text-base font-semibold text-neutral-900">Hi, Admin Selamat Datang</h2>

              <div className="ml-auto w-full max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400" placeholder="Telusuri…" />
                </div>
              </div>

              {/* Profile dropdown */}
              <div className="relative ml-2">
                <button type="button" onClick={() => setProfileOpen((s) => !s)} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:bg-neutral-50">
                  <div className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 bg-primary-50 text-primary-700">
                    <User2 className="h-4 w-4" />
                  </div>
                  <span className="hidden text-sm font-medium text-neutral-800 md:block">Admin</span>
                  <ChevronDown className="hidden h-4 w-4 text-neutral-500 md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg" role="menu">
                    <button className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50" onClick={() => setProfileOpen(false)} role="menuitem">
                      Profil
                    </button>
                    <div className="my-1 h-px bg-neutral-200" />
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
