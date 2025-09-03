import { useNavigate } from "react-router-dom";

export default function ActivityForm({ mode = "create" }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
      >
        <span className="i-tabler-chevron-left" /> Kembali
      </button>

      <h2 className="text-xl font-bold">Event dan Proker</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Kategori</p>
            <select className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3">
              <option>Pilih kategori Aktivitas</option>
              <option>Event</option>
              <option>Proker</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-semibold">Judul</p>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3"
              placeholder="Tuliskan Nama kegiatan"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Tema</p>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3"
              placeholder="Tuliskan Tema kegiatan"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Tanggal Publikasi</p>
            <div className="relative">
              <span className="i-tabler-calendar absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-semibold">Deskripsi</p>
            <textarea
              rows={6}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
              placeholder="Tuliskan Deskripsi kegiatan"
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-semibold">Lampiran</p>
            <div className="relative">
              <span className="i-tabler-paperclip absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-10">
                <option>Tambahkan Lampiran</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 text-gray-500">
            Unggah Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
}
