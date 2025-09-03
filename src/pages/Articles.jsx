import { Link } from "react-router-dom";

export default function Articles() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Artikel</h3>
        <Link
          to="/artikel/new"
          className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Create
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Cari Artikel GenBI Unsika"
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
            <div className="aspect-[4/3] rounded-lg bg-gray-200" />
            <div className="mt-3">
              <p className="font-semibold">Judul Artikel</p>
              <p className="line-clamp-2 text-sm text-gray-600">
                Lorem ipsum dolor sit amet consectetur. Hac et phare…
              </p>
              <p className="mt-1 text-xs text-gray-500">05 Maret 2024</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
