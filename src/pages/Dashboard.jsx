import StatCard from "../components/StatCard";

export default function Dashboard() {
  // data dummy untuk tampilan awal
  const stats = [
    {
      title: "Total Beasiswa",
      value: "128",
      description: "Program aktif yang sedang berjalan.",
      icon: "tabler--award",
      trend: "up",
      trendValue: "+6%",
    },
    {
      title: "Pendaftar Bulan Ini",
      value: "1.247",
      description: "Akumulasi semua program bulan berjalan.",
      icon: "tabler--users",
      trend: "up",
      trendValue: "+12%",
    },
    {
      title: "Aktivitas Aktif",
      value: "23",
      description: "Kegiatan mentoring, webinar, workshop.",
      icon: "tabler--activity",
      trend: "down",
      trendValue: "-3%",
    },
    {
      title: "Artikel Terbit",
      value: "56",
      description: "Publikasi yang tayang di portal.",
      icon: "tabler--news",
      trend: "up",
      trendValue: "+2%",
    },
  ];

  const recentActivities = [
    {
      id: "act-1",
      title: "Webinar: Tips Menulis Esai Beasiswa",
      when: "Hari ini, 15:00",
      status: "Terjadwal",
    },
    {
      id: "act-2",
      title: "Mentoring Batch 7",
      when: "Besok, 10:00",
      status: "Penuh",
    },
    {
      id: "act-3",
      title: "Workshop CV & Portofolio",
      when: "Jum'at, 09:00",
      status: "Sisa 12 kursi",
    },
  ];

  const closingSoon = [
    {
      id: "sch-1",
      name: "Scholarship A - STEM",
      deadline: "3 hari lagi",
    },
    {
      id: "sch-2",
      name: "Scholarship B - Exchange",
      deadline: "5 hari lagi",
    },
    {
      id: "sch-3",
      name: "Scholarship C - Research",
      deadline: "7 hari lagi",
    },
  ];

  const drafts = [
    { id: "art-1", title: "Panduan LPDP 2025", updated: "2 jam lalu" },
    { id: "art-2", title: "Checklist Dokumen Beasiswa", updated: "Kemarin" },
  ];

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-neutral-600">
            Ringkasan cepat statistik dan aktivitas terakhir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-outline-primary">Export</button>
          <button className="btn-primary">Tambah Aktivitas</button>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </section>

      {/* 2 Kolom: Aktivitas & Beasiswa */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h3 className="text-neutral-900">Aktivitas Terbaru</h3>
            <a
              href="/aktivitas"
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              Lihat semua
            </a>
          </div>

          <ul className="divide-y divide-neutral-200">
            {recentActivities.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{a.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">{a.when}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                    <i className="icon-[tabler--clock] text-sm" aria-hidden />
                    {a.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Beasiswa mendekati deadline */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h3 className="text-neutral-900">Mendekati Deadline</h3>
            <a
              href="/beasiswa"
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              Kelola
            </a>
          </div>

          <ul className="divide-y divide-neutral-200">
            {closingSoon.map((s) => (
              <li key={s.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-800">{s.name}</p>
                  <span className="text-sm text-secondary-700">
                    {s.deadline}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Artikel Draft */}
      <section className="mt-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h3 className="text-neutral-900">Draft Artikel</h3>
          <a
            href="/artikel"
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            Lihat semua
          </a>
        </div>

        <ul className="divide-y divide-neutral-200">
          {drafts.map((d) => (
            <li key={d.id} className="px-5 py-3">
              <div className="flex items-center justify-between">
                <p className="text-neutral-800">{d.title}</p>
                <span className="text-sm text-neutral-600">{d.updated}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
