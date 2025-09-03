import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          icon="school"
          title="Jumlah Pendaftar Beasiswa"
          value="671 peserta"
        />
        <StatCard
          icon="id"
          title="Jumlah Pengunjung Proker"
          value="1.243 pengunjung"
        />
        <StatCard
          icon="calendar-event"
          title="Jumlah Pengunjung Event"
          value="1.159 pengunjung"
        />
        <StatCard
          icon="article"
          title="Jumlah Pengunjung Artikel"
          value="987 pengunjung"
        />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Grafik Pengunjung Website</h3>
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <span className="i-tabler-download" />
          </button>
        </div>

        {/* Placeholder chart */}
        <div className="h-64 rounded-lg border border-dashed border-gray-200 grid place-items-center text-sm text-gray-500">
          (Area chart placeholder)
        </div>
      </section>
    </div>
  );
}
