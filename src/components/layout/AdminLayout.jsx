// src/components/layout/AdminLayout.jsx
import { useState, useMemo } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

const sections = [
  {
    title: "Main",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "tabler-layout-dashboard" },
    ],
  },
  {
    title: "Konten",
    items: [
      { to: "/beasiswa", label: "Beasiswa", icon: "tabler-school" },
      { to: "/aktivitas", label: "Aktivitas", icon: "tabler-calendar-event" },
      { to: "/artikel", label: "Artikel", icon: "tabler-article" },
    ],
  },
  {
    title: "Pengaturan",
    items: [{ to: "/cms", label: "CMS", icon: "tabler-settings" }],
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const flat = sections.flatMap((s) => s.items);
    return flat.find((i) => location.pathname.startsWith(i.to))?.label || "";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Layout shell */}
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={cx(
            "hidden md:flex md:flex-col bg-white border-r border-neutral-200 transition-all duration-200 ease-out",
            collapsed ? "w-20" : "w-72"
          )}
        >
          {/* Brand */}
          <div className="h-16 flex items-center px-4 gap-3 border-b border-neutral-200">
            <div className="size-9 rounded-lg bg-primary-500 flex items-center justify-center text-white">
              <i className="icon-[tabler-star] text-white text-[18px]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900">
                  Admin Portal
                </span>
                <span className="text-xs text-neutral-500">v1.0</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3">
            {sections.map((section) => (
              <div key={section.title} className="px-2">
                {!collapsed && (
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    {section.title}
                  </div>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cx(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                            "text-neutral-700 hover:bg-neutral-50",
                            isActive &&
                              "bg-primary-50 text-primary-700 hover:bg-primary-50"
                          )
                        }
                      >
                        <i
                          className={cx(
                            `icon-[${item.icon}] text-[18px]`,
                            "shrink-0"
                          )}
                        />
                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Collapse control */}
          <div className="border-t border-neutral-200 p-2">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <i
                className={cx(
                  "text-[18px]",
                  collapsed
                    ? "icon-[tabler-chevron-right]"
                    : "icon-[tabler-chevron-left]"
                )}
              />
              {!collapsed && <span>Ciutkan</span>}
            </button>
          </div>
        </aside>

        {/* Mobile sidebar (overlay) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-72 bg-white border-r border-neutral-200">
              <div className="h-16 flex items-center px-4 gap-3 border-b border-neutral-200">
                <div className="size-9 rounded-lg bg-primary-500 flex items-center justify-center text-white">
                  <i className="icon-[tabler-star] text-white text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-900">
                    Admin Portal
                  </span>
                  <span className="text-xs text-neutral-500">v1.0</span>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto py-3">
                {sections.map((section) => (
                  <div key={section.title} className="px-2">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      {section.title}
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              cx(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                                "text-neutral-700 hover:bg-neutral-50",
                                isActive &&
                                  "bg-primary-50 text-primary-700 hover:bg-primary-50"
                              )
                            }
                          >
                            <i
                              className={`icon-[${item.icon}] text-[18px] shrink-0`}
                            />
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 flex min-w-0 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
            <div className="h-16 flex items-center gap-3 px-4">
              {/* Mobile menu btn */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-50"
              >
                <i className="icon-[tabler-menu-2] text-[18px]" />
              </button>

              <h1 className="text-base md:text-lg font-semibold text-neutral-900">
                {pageTitle}
              </h1>

              <div className="ml-auto flex items-center gap-2">
                <button className="btn-outline-primary px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <i className="icon-[tabler-plus] text-[18px]" />
                    <span className="hidden sm:inline">Aksi Cepat</span>
                  </span>
                </button>

                <button className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50">
                  <i className="icon-[tabler-bell] text-[18px] text-neutral-700" />
                </button>

                <div className="h-8 w-px bg-neutral-200 mx-1" />

                <button className="rounded-full border border-neutral-200 p-1 hover:bg-neutral-50">
                  <img
                    alt="avatar"
                    src="https://api.dicebear.com/9.x/thumbs/svg?seed=admin"
                    className="size-8 rounded-full"
                  />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
