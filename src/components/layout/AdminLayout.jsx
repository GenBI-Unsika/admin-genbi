import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 transition ${
        isActive ? "bg-primary-50 text-primary-700" : "hover:bg-gray-100"
      }`
    }
  >
    <span className={`i-tabler-${icon} text-xl`} />
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="size-8 rounded-full bg-primary-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">GenBI Unsika</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          <NavItem to="/dashboard" icon="layout-dashboard" label="Dashboard" />
          <NavItem to="/beasiswa" icon="school" label="Beasiswa" />
          <NavItem to="/aktivitas" icon="calendar-event" label="Aktivitas" />
          <NavItem to="/artikel" icon="article" label="Artikel" />
          <NavItem to="/cms" icon="settings" label="CMS Landing" />
        </nav>

        <div className="mt-auto px-2 pt-6">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-500 px-3 py-2 text-white hover:bg-gray-600"
          >
            <span className="i-tabler-logout" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold">Hi, Admin Selamat Datang</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <span className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Telusuri…"
                className="h-10 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="size-8 rounded-full bg-gray-300" />
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
