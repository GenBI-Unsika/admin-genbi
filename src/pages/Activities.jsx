import { Link } from "react-router-dom";

export default function Activities() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event dan Proker</h3>
        <div className="flex items-center gap-3">
          <select className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option>All</option>
            <option>Event</option>
            <option>Proker</option>
          </select>
          <Link
            to="/aktivitas/new"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Create
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Cari Aktivitas GenBI Unsika"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 md:w-1/2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-3"
          >
            <div className="aspect-[16/9] rounded-lg bg-gray-200" />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Nama {i % 2 ? "Proker" : "Event"}
                </p>
                <p className="text-sm text-gray-500">05 Maret 2024</p>
              </div>
              <Link
                to={`/aktivitas/${i + 1}/edit`}
                className="i-tabler-chevron-right text-gray-500"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
